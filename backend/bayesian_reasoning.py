import pandas as pd
from pgmpy.models import BayesianNetwork
from pgmpy.estimators import HillClimbSearch, BicScore, BayesianEstimator
from pgmpy.inference import VariableElimination
import json
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), 'prescriptive_office_dataset.csv')
OUT_FILE = os.path.join(os.path.dirname(__file__), 'bayesian_structure.json')

def main():
    df = pd.read_csv(DATA_FILE)

    bn_df = pd.DataFrame({
        "absent_high": (df["days_absent_last_30"] > 3).astype(int),
        "late_high": (df["days_late_last_30"] > 2).astype(int),
        "missed_deadline": (df["missed_deadlines"] > 0).astype(int),
        "overtime_high": (df["overtime_hours_last_30"] > 15).astype(int),
        "training_completed": df["training_completed"].astype(int),
        "performance_issue": df["performance_issue_flag"].astype(int),
        "low_productivity": df["risk_low_productivity"].astype(int)
    })

    hc = HillClimbSearch(bn_df, scoring_method=BicScore(bn_df))
    best_model = hc.estimate()
    print("Learned edges:", best_model.edges())

    best_model.fit(bn_df, estimator=BayesianEstimator, prior_type="BDeu")
    infer = VariableElimination(best_model)

    # example query
    try:
        q = infer.query(variables=["low_productivity"], evidence={"absent_high":1, "training_completed":0})
        print(q)
    except Exception:
        pass

    edges = list(best_model.edges())
    with open(OUT_FILE, "w") as f:
        json.dump(edges, f)
    print("Saved", OUT_FILE)

if __name__ == '__main__':
    main()
