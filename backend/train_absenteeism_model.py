import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from xgboost import XGBClassifier
import joblib


DATA_PATH = os.path.join(os.path.dirname(__file__), 'synthetic_absenteeism_dataset.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'ml')
os.makedirs(MODEL_DIR, exist_ok=True)


def load_and_prepare(path=DATA_PATH):
    df = pd.read_csv(path)
    # Keep only required features
    features = ['employee_id', 'minutes_late', 'absent', 'overtime_hours', 'shift_type', 'day_of_week']
    target = 'will_be_absent_tomorrow'
    df = df[features + [target]].copy()

    # Basic missing value handling: fill numeric with 0, categorical with 'Unknown'
    for c in ['employee_id', 'minutes_late', 'absent', 'overtime_hours']:
        if df[c].isnull().any():
            df[c] = df[c].fillna(0)
    for c in ['shift_type', 'day_of_week']:
        if df[c].isnull().any():
            df[c] = df[c].fillna('Unknown')

    # Encode categorical features using LabelEncoder (safe and simple for demo)
    encoders = {}
    for c in ['shift_type', 'day_of_week']:
        le = LabelEncoder()
        df[c] = le.fit_transform(df[c].astype(str))
        encoders[c] = le

    X = df[features]
    y = df[target]
    return X, y, encoders


def train_and_save():
    print('Loading dataset...')
    X, y, encoders = load_and_prepare()
    print('Splitting data...')
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y if len(np.unique(y))>1 else None)

    print('Training XGBoostClassifier...')
    model = XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
    model.fit(X_train, y_train)

    print('Evaluating...')
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    print('Train accuracy:', accuracy_score(y_train, y_train_pred))
    print('Test accuracy:', accuracy_score(y_test, y_test_pred))
    print('\nClassification report (test):')
    print(classification_report(y_test, y_test_pred))
    print('\nConfusion matrix (test):')
    print(confusion_matrix(y_test, y_test_pred))

    model_path = os.path.join(MODEL_DIR, 'absenteeism_model.pkl')
    enc_path = os.path.join(MODEL_DIR, 'encoders.joblib')
    joblib.dump(model, model_path)
    joblib.dump(encoders, enc_path)
    print('Model saved to:', model_path)
    print('Encoders saved to:', enc_path)


if __name__ == '__main__':
    train_and_save()
