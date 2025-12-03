import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, roc_auc_score
import joblib
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), 'prescriptive_office_dataset.csv')
MODEL_FILE = os.path.join(os.path.dirname(__file__), 'ml', 'risk_productivity_model.pkl')
os.makedirs(os.path.join(os.path.dirname(__file__), 'ml'), exist_ok=True)

def main():
    df = pd.read_csv(DATA_FILE)

    features = [
        "department","role","contract_type","days_since_hired","max_weekly_hours",
        "days_present_last_30","days_absent_last_30","days_late_last_30","avg_late_minutes",
        "missed_deadlines","overtime_hours_last_30","meetings_hours_last_30","tasks_completed_last_30",
        "weekend_work","training_completed","scheduled_last_week","available_tomorrow",
        "performance_issue_flag"
    ]

    X = df[features]
    y = df["risk_low_productivity"]

    categorical = ["department","role","contract_type"]
    numeric = [c for c in features if c not in categorical]

    # Use `sparse_output=False` for modern scikit-learn versions
    preprocessor = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical),
        ("num", "passthrough", numeric)
    ])

    model = XGBClassifier(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=5,
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42
    )

    pipe = Pipeline([("preproc", preprocessor), ("model", model)])

    X_train, X_test, y_train, y_test = train_test_split(X, y, stratify=y, test_size=0.2, random_state=42)
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    y_proba = pipe.predict_proba(X_test)[:,1]

    print(classification_report(y_test, y_pred))
    try:
        print("ROC AUC:", roc_auc_score(y_test, y_proba))
    except Exception:
        pass

    joblib.dump(pipe, MODEL_FILE)
    print("Saved model ->", MODEL_FILE)

if __name__ == '__main__':
    main()
