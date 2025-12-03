from fastapi import APIRouter, HTTPException
import os
import joblib
import pandas as pd

router = APIRouter()

MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'ml', 'risk_productivity_model.pkl'))
DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'prescriptive_office_dataset.csv'))
ASSIGN_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'tomorrow_assignments.csv'))

FEATURES = [
    "department","role","contract_type","days_since_hired","max_weekly_hours",
    "days_present_last_30","days_absent_last_30","days_late_last_30","avg_late_minutes",
    "missed_deadlines","overtime_hours_last_30","meetings_hours_last_30","tasks_completed_last_30",
    "weekend_work","training_completed","scheduled_last_week","available_tomorrow",
    "performance_issue_flag"
]


def _load_model():
    if not os.path.exists(MODEL_PATH):
        return None
    try:
        return joblib.load(MODEL_PATH)
    except Exception:
        return None


@router.get('/api/v1/prescriptive/recommendations')
def get_recommendations():
    model = _load_model()
    if model is None:
        raise HTTPException(status_code=503, detail='Prescriptive model not available. Run training script backend/train_risk_productivity.py')

    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=500, detail='Prescriptive dataset missing on server')

    df = pd.read_csv(DATA_PATH)
    X = df[FEATURES]
    try:
        probas = model.predict_proba(X)[:,1]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Model prediction failed: {e}')

    df_copy = df.copy()
    df_copy['pred_risk_proba'] = probas
    df_copy['pred_risk_label'] = (df_copy['pred_risk_proba'] > 0.5).astype(int)

    # assignments
    try:
        assign = pd.read_csv(ASSIGN_PATH)
    except Exception:
        assign = pd.DataFrame([])

    at_risk = df_copy.sort_values('pred_risk_proba', ascending=False)[['employee_id','role','department','pred_risk_proba','productivity_score']].head(50)
    coaching = df_copy[(df_copy['coaching_needed_flag']==1) | (df_copy['pred_risk_proba'] > 0.6)]
    coaching_list = coaching[['employee_id','role','department','coaching_needed_flag','pred_risk_proba']].sort_values('pred_risk_proba', ascending=False).head(50)

    return {
        'assignments_preview': assign.to_dict(orient='records')[:200],
        'at_risk_top50': at_risk.to_dict(orient='records'),
        'coaching_recommendations': coaching_list.to_dict(orient='records')
    }
