from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any
import os
import joblib
import numpy as np

router = APIRouter()


class AbsenceRequest(BaseModel):
    employee_id: int
    minutes_late: int
    absent: int
    overtime_hours: float
    shift_type: str
    day_of_week: str


class AbsenceResponse(BaseModel):
    probability_absent: float
    predicted_class: int


# Paths relative to project (backend/ml)
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'ml'))
MODEL_PATH = os.path.join(MODEL_DIR, 'absenteeism_model.pkl')
ENC_PATH = os.path.join(MODEL_DIR, 'encoders.joblib')


def _load_model_and_encoders():
    if not os.path.exists(MODEL_PATH):
        return None, None
    model = joblib.load(MODEL_PATH)
    encoders = None
    if os.path.exists(ENC_PATH):
        try:
            encoders = joblib.load(ENC_PATH)
        except Exception:
            encoders = None
    return model, encoders


@router.on_event('startup')
def load_model_on_startup():
    # Attempt to load early so endpoint returns clear error if missing
    model, enc = _load_model_and_encoders()
    if model is None:
        print('[absence_prediction] Model not found at', MODEL_PATH)
    else:
        print('[absence_prediction] Model loaded')


@router.post('/api/v1/predict_absence', response_model=AbsenceResponse)
def predict_absence(payload: AbsenceRequest):
    model, encoders = _load_model_and_encoders()
    if model is None:
        raise HTTPException(status_code=503, detail='Model not available. Please run training script to create model at backend/ml/absenteeism_model.pkl')

    # Prepare features in the same order used for training
    feat_names = ['employee_id', 'minutes_late', 'absent', 'overtime_hours', 'shift_type', 'day_of_week']
    values = [payload.employee_id, payload.minutes_late, payload.absent, payload.overtime_hours, payload.shift_type, payload.day_of_week]

    # Encode categorical features if encoders are available
    if encoders and isinstance(encoders, dict):
        try:
            # copy values because we will modify
            v = list(values)
            # shift_type at index 4, day_of_week at index 5
            v[4] = int(encoders['shift_type'].transform([str(v[4])])[0])
            v[5] = int(encoders['day_of_week'].transform([str(v[5])])[0])
            arr = np.array([v], dtype=float)
        except Exception:
            # fallback: try to use raw string values (model may handle ints only)
            arr = np.array([values], dtype=object)
    else:
        # No encoders saved: attempt simple mapping by casting known values
        try:
            v = list(values)
            v[4] = str(v[4])
            v[5] = str(v[5])
            arr = np.array([v], dtype=object)
        except Exception:
            arr = np.array([values], dtype=object)

    # Ensure numeric types for model features
    try:
        # Convert columns to float where possible
        X = np.array(arr, dtype=float)
    except Exception:
        # Last resort: try to coerce individual entries
        X = np.zeros((1, 6), dtype=float)
        try:
            X[0, 0] = float(values[0])
            X[0, 1] = float(values[1])
            X[0, 2] = float(values[2])
            X[0, 3] = float(values[3])
            # for categorical if not numeric, map to 0
            X[0, 4] = float(encoders['shift_type'].transform([str(values[4])])[0]) if encoders else 0.0
            X[0, 5] = float(encoders['day_of_week'].transform([str(values[5])])[0]) if encoders else 0.0
        except Exception:
            raise HTTPException(status_code=400, detail='Invalid input values; cannot coerce to numeric features')

    # Predict probability and class
    try:
        proba = float(model.predict_proba(X)[0][1]) if hasattr(model, 'predict_proba') else float(model.predict(X)[0])
        pred = int(model.predict(X)[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Model prediction failed: {e}')

    return {'probability_absent': proba, 'predicted_class': pred}
