import pandas as pd
from ortools.sat.python import cp_model
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), 'prescriptive_office_dataset.csv')
REQ_FILE = os.path.join(os.path.dirname(__file__), 'office_shift_requirements_tomorrow.csv')
OUT_FILE = os.path.join(os.path.dirname(__file__), 'tomorrow_assignments.csv')

def main():
    df = pd.read_csv(DATA_FILE)
    req = pd.read_csv(REQ_FILE)

    available = df[df["available_tomorrow"]==1].copy()
    shifts = req["shift"].unique().tolist()

    model = cp_model.CpModel()
    assign = {}
    for _, r in available.iterrows():
        emp = int(r["employee_id"])
        for shift in shifts:
            assign[(emp, shift)] = model.NewBoolVar(f"e{emp}_{shift}")

    # each employee at most one shift
    for emp in available["employee_id"].unique():
        model.Add(sum(assign[(int(emp), s)] for s in shifts) <= 1)

    # meet required counts per role+shift
    for _, row in req.iterrows():
        shift = row["shift"]
        role = row["role"]
        needed = int(row["required_count"])
        role_emps = [e for e in available[available["role"]==role]["employee_id"].tolist()]
        if len(role_emps) == 0:
            print(f"Warning: no available employees for role {role} shift {shift}. Required {needed}.")
            continue
        model.Add(sum(assign[(int(emp), shift)] for emp in role_emps) >= needed)

    # objective: prefer preferred_shift, prefer low-risk employees, minimize salary
    objective_terms = []
    for _, r in available.iterrows():
        emp = int(r["employee_id"])
        pref = r.get("preferred_shift", None)
        risk = int(r.get("risk_low_productivity", 0))
        salary = float(r.get("salary_rate", 0))
        for shift in shifts:
            var = assign[(emp, shift)]
            pref_bonus = 20 if pref == shift else 0
            risk_penalty = 50 if risk == 1 else 0
            salary_cost = salary / 10.0
            weight = - (pref_bonus - risk_penalty + salary_cost)
            objective_terms.append((var, int(weight)))

    model.Minimize(sum(coef * var for var, coef in objective_terms))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30
    solver.parameters.num_search_workers = 8
    res = solver.Solve(model)
    print("Solver status:", solver.StatusName(res))

    assignments = []
    for (emp, shift), var in assign.items():
        if solver.Value(var) == 1:
            assignments.append({"employee_id": emp, "shift": shift})
    assign_df = pd.DataFrame(assignments)
    assign_df.to_csv(OUT_FILE, index=False)
    print("Saved ->", OUT_FILE)
    print(assign_df.head(20).to_string(index=False))

if __name__ == '__main__':
    main()
