import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const initialForm = {
  respiratory_rate: "",
  oxygen_saturation: "",
  systolic_bp: "",
  heart_rate: "",
  temperature_c: "",
  alert: true,
  altered_mental_status: false,
};

function App() {
  const [selected, setSelected] = useState({ ews: true, qsofa: false });
  const [form, setForm] = useState(initialForm);
  const [scores, setScores] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadScores() {
      try {
        const response = await fetch(`${API_BASE_URL}/scores`);
        if (!response.ok) {
          throw new Error(`Failed to load scores (${response.status})`);
        }
        const payload = await response.json();
        setScores(payload);
      } catch (err) {
        setError(err.message);
      }
    }
    loadScores();
  }, []);

  const selectedScores = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  const onInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onScoreToggle = (event) => {
    const { name, checked } = event.target;
    setSelected((prev) => ({ ...prev, [name]: checked }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResults([]);

    if (selectedScores.length === 0) {
      setError("Select at least one score.");
      return;
    }

    const payload = {
      selected_scores: selectedScores,
      inputs: {
        respiratory_rate: Number(form.respiratory_rate),
        oxygen_saturation: Number(form.oxygen_saturation),
        systolic_bp: Number(form.systolic_bp),
        heart_rate: Number(form.heart_rate),
        temperature_c: Number(form.temperature_c),
        alert: Boolean(form.alert),
        altered_mental_status: Boolean(form.altered_mental_status),
      },
    };

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/compute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.detail || `Request failed (${response.status})`);
      }
      setResults(body.results ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="layout">
      <section className="panel">
        <h1>Score Calculator</h1>
        <p className="hint">Submit shared vitals and compute selected scores.</p>

        <form className="form" onSubmit={onSubmit}>
          <div className="grid two">
            <label>
              Respiratory rate
              <input name="respiratory_rate" type="number" min="0" value={form.respiratory_rate} onChange={onInputChange} required />
            </label>
            <label>
              Systolic BP
              <input name="systolic_bp" type="number" min="0" value={form.systolic_bp} onChange={onInputChange} required />
            </label>
            <label>
              Oxygen saturation
              <input name="oxygen_saturation" type="number" min="0" max="100" value={form.oxygen_saturation} onChange={onInputChange} required />
            </label>
            <label>
              Heart rate
              <input name="heart_rate" type="number" min="0" value={form.heart_rate} onChange={onInputChange} required />
            </label>
            <label>
              Temperature (C)
              <input name="temperature_c" type="number" min="25" max="45" step="0.1" value={form.temperature_c} onChange={onInputChange} required />
            </label>
          </div>

          <div className="grid two checks">
            <label className="checkbox">
              <input name="alert" type="checkbox" checked={form.alert} onChange={onInputChange} />
              Alert
            </label>
            <label className="checkbox">
              <input name="altered_mental_status" type="checkbox" checked={form.altered_mental_status} onChange={onInputChange} />
              Altered mental status
            </label>
          </div>

          <div className="score-picks">
            <p>Scores to compute</p>
            <label className="checkbox">
              <input name="ews" type="checkbox" checked={selected.ews} onChange={onScoreToggle} />
              EWS
            </label>
            <label className="checkbox">
              <input name="qsofa" type="checkbox" checked={selected.qsofa} onChange={onScoreToggle} />
              qSOFA
            </label>
          </div>

          <button type="submit" disabled={loading}>{loading ? "Computing..." : "Compute scores"}</button>
        </form>

        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="panel">
        <h2>Available Scores</h2>
        <div className="cards">
          {scores.map((score) => (
            <article className="card" key={score.key}>
              <h3>{score.name}</h3>
              <p>{score.description}</p>
              <p><strong>Key:</strong> {score.key}</p>
            </article>
          ))}
        </div>

        <h2>Results</h2>
        <div className="cards">
          {results.length === 0 ? (
            <p className="hint">No computed results yet.</p>
          ) : (
            results.map((result) => (
              <article className="card" key={result.score}>
                <h3>{result.score.toUpperCase()}</h3>
                <p><strong>Value:</strong> {result.value}</p>
                <p><strong>Interpretation:</strong> {result.interpretation}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default App;