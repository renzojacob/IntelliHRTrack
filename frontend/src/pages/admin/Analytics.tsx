import React, { useState } from 'react';

type Prediction = {
  probability_absent: number;
  predicted_class: number;
};

const PrescriptivePanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [atRisk, setAtRisk] = useState<any[]>([]);
  const [coaching, setCoaching] = useState<any[]>([]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    setAssignments([]);
    setAtRisk([]);
    setCoaching([]);
    try {
      const resp = await fetch('http://127.0.0.1:8001/api/v1/prescriptive/recommendations');
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Failed to fetch recommendations');
      }
      const data = await resp.json();
      setAssignments(data.assignments_preview || []);
      setAtRisk(data.at_risk_top50 || []);
      setCoaching(data.coaching_recommendations || []);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6, maxWidth: 1000 }}>
      <div style={{ marginBottom: 12 }}>
        <button type="button" onClick={fetchRecommendations} disabled={loading}>{loading ? 'Loading…' : 'Fetch Recommendations'}</button>
      </div>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h4>Assignments Preview</h4>
          {assignments.length === 0 ? <div>No assignments</div> : (
            <ul>
              {assignments.slice(0, 20).map((a, i) => (
                <li key={i}>{`Employee ${a.employee_id} -> ${a.shift}`}</li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h4>At-Risk Top50</h4>
          {atRisk.length === 0 ? <div>No data</div> : (
            <ol>
              {atRisk.map((r: any, i: number) => (
                <li key={i}>{`#${r.employee_id} ${r.role} (${r.department}) — risk ${(r.pred_risk_proba*100).toFixed(1)}%`}</li>
              ))}
            </ol>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h4>Coaching Recommendations</h4>
          {coaching.length === 0 ? <div>No recommendations</div> : (
            <ol>
              {coaching.map((c: any, i: number) => (
                <li key={i}>{`#${c.employee_id} ${c.role} (${c.department}) — risk ${(c.pred_risk_proba*100).toFixed(1)}%`}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
};

const Analytics: React.FC = () => {
  const [employeeId, setEmployeeId] = useState<number>(1);
  const [minutesLate, setMinutesLate] = useState<number>(0);
  const [absent, setAbsent] = useState<number>(0);
  const [overtime, setOvertime] = useState<number>(0);
  const [shiftType, setShiftType] = useState<string>('Morning');
  const [dayOfWeek, setDayOfWeek] = useState<string>('Mon');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await fetch('http://127.0.0.1:8001/api/v1/predict_absence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeId,
          minutes_late: minutesLate,
          absent: absent,
          overtime_hours: overtime,
          shift_type: shiftType,
          day_of_week: dayOfWeek,
        }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Prediction request failed');
      }

      const data = await resp.json();
      setResult(data as Prediction);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Absenteeism Prediction (XGBoost)</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div>
          <label>Employee ID</label>
          <input type="number" value={employeeId} onChange={e => setEmployeeId(Number(e.target.value))} />
        </div>
        <div>
          <label>Minutes Late</label>
          <input type="number" value={minutesLate} onChange={e => setMinutesLate(Number(e.target.value))} />
        </div>
        <div>
          <label>Absent (0/1)</label>
          <input type="number" value={absent} onChange={e => setAbsent(Number(e.target.value))} />
        </div>
        <div>
          <label>Overtime Hours</label>
          <input type="number" step="0.1" value={overtime} onChange={e => setOvertime(Number(e.target.value))} />
        </div>
        <div>
          <label>Shift Type</label>
          <select value={shiftType} onChange={e => setShiftType(e.target.value)}>
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Night</option>
            <option>Unknown</option>
          </select>
        </div>
        <div>
          <label>Day Of Week</label>
          <select value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)}>
            <option>Mon</option>
            <option>Tue</option>
            <option>Wed</option>
            <option>Thu</option>
            <option>Fri</option>
            <option>Sat</option>
            <option>Sun</option>
            <option>Unknown</option>
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? 'Predicting…' : 'Predict'}</button>
        </div>
      </form>

      <div style={{ marginTop: 20 }}>
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
        {result && (
          <div>
            <h3>Result</h3>
            <div>Probability absent tomorrow: {(result.probability_absent * 100).toFixed(1)}%</div>
            <div>Predicted class: {result.predicted_class === 1 ? 'Will be absent' : 'Will NOT be absent'}</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 40 }}>
        <h2>Prescriptive Recommendations</h2>
        <PrescriptivePanel />
      </div>
    </div>
  );
};

export default Analytics;
