import { useMemo, useState } from "react";
import {
  BOOLEAN_INPUTS,
  CATEGORY_META,
  CHOICE_INPUTS,
  MANUAL_CALCULATOR_LINKS,
  NUMERIC_INPUTS,
  SCORE_CATEGORY,
  SCORE_DEFINITIONS,
  SCORE_EVIDENCE,
  buildInitialUnavailable,
  buildInitialValues,
  computeScores,
  fieldLabel,
  summaryText,
} from "./calculators";

function App() {
  const [form, setForm] = useState(buildInitialValues);
  const [unavailable, setUnavailable] = useState(buildInitialUnavailable);
  const [selectedMap, setSelectedMap] = useState(() => {
    const initial = {};
    for (const score of SCORE_DEFINITIONS) initial[score.key] = false;
    return initial;
  });
  const [results, setResults] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState("");

  const scoreMap = useMemo(
    () => Object.fromEntries(SCORE_DEFINITIONS.map((item) => [item.key, item])),
    []
  );

  const selectedScores = useMemo(
    () => Object.entries(selectedMap).filter(([, checked]) => checked).map(([key]) => key),
    [selectedMap]
  );

  const requiredFields = useMemo(() => {
    const fields = new Set();
    for (const key of selectedScores) {
      for (const field of scoreMap[key].required_fields) fields.add(field);
    }
    return fields;
  }, [scoreMap, selectedScores]);

  const groupedScores = useMemo(() => {
    const grouped = { elective: [], emergency: [], both: [] };
    for (const score of SCORE_DEFINITIONS) {
      const category = SCORE_CATEGORY[score.key] ?? "both";
      grouped[category].push(score);
    }
    for (const category of Object.keys(grouped)) {
      grouped[category].sort((a, b) => a.name.localeCompare(b.name));
    }
    return grouped;
  }, []);

  const inputValues = useMemo(() => {
    const parsed = {};
    for (const [field, cfg] of Object.entries(NUMERIC_INPUTS)) {
      parsed[field] = cfg.kind === "int" ? Number.parseInt(form[field], 10) : Number.parseFloat(form[field]);
    }
    for (const field of Object.keys(BOOLEAN_INPUTS)) parsed[field] = Boolean(form[field]);
    for (const field of Object.keys(CHOICE_INPUTS)) parsed[field] = form[field];
    return parsed;
  }, [form]);

  const selectedCount = selectedScores.length;

  const onSelectAll = () => {
    const all = {};
    for (const score of SCORE_DEFINITIONS) all[score.key] = true;
    setSelectedMap(all);
    setResults([]);
    setWarnings([]);
    setError("");
  };

  const onClearSelection = () => {
    const none = {};
    for (const score of SCORE_DEFINITIONS) none[score.key] = false;
    setSelectedMap(none);
    setResults([]);
    setWarnings([]);
    setError("");
  };

  const onToggleScore = (key, checked) => {
    setSelectedMap((prev) => ({ ...prev, [key]: checked }));
    setResults([]);
    setWarnings([]);
    setError("");
  };

  const onInputChange = (name, value, type) => {
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? Boolean(value) : value,
    }));
  };

  const onUnavailableChange = (field, checked) => {
    setUnavailable((prev) => ({ ...prev, [field]: checked }));
  };

  const onCompute = () => {
    setError("");
    setWarnings([]);
    setResults([]);

    if (selectedScores.length === 0) {
      setError("Select at least one score to compute.");
      return;
    }

    const missing = [];
    const computable = [];

    for (const key of selectedScores) {
      const req = scoreMap[key].required_fields;
      const missingNumeric = req.filter((field) => NUMERIC_INPUTS[field] && unavailable[field]);
      if (missingNumeric.length > 0) {
        const labels = missingNumeric.map((f) => fieldLabel(f));
        const detail = labels.length === 1 ? `missing ${labels[0]} value.` : `missing values: ${labels.join(", ")}.`;
        missing.push(`Unable to calculate ${scoreMap[key].name} - ${detail}`);
      } else {
        computable.push(key);
      }
    }

    setWarnings(missing);

    if (computable.length === 0) {
      return;
    }

    try {
      const computed = computeScores(computable, inputValues);
      setResults(computed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compute scores.");
    }
  };

  const summary = useMemo(() => summaryText(results), [results]);

  const onCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      setError("Could not copy summary to clipboard.");
    }
  };

  const csvData = useMemo(() => {
    const headers = ["score", "value", "interpretation", "risk_estimate", "clinical_note"];
    const rows = results.map((item) =>
      [
        item.score,
        item.value,
        item.interpretation,
        item.risk_estimate ?? "",
        item.clinical_note ?? "",
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  }, [results]);
  const csvHref = useMemo(
    () => `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`,
    [csvData]
  );

  return (
    <main className="layout">
      <section className="panel">
        <h1>The Lazy Anaethetist - A Compilation of Scores in Elective & Emergency Anaesthesia</h1>

        <h2>1) Select Scores</h2>
        <p className="hint">Choose scores first. Required inputs are then shown automatically.</p>

        <div className="legend">
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <span className="pill" key={key} style={{ background: meta.color }}>
              {meta.label}
            </span>
          ))}
        </div>

        <div className="actions two">
          <button type="button" onClick={onSelectAll}>Select all scores</button>
          <button type="button" onClick={onClearSelection} className="ghost">Clear score selection</button>
        </div>

        {(["elective", "emergency", "both"]).map((category) => {
          const list = groupedScores[category];
          if (!list.length) return null;
          return (
            <div key={category} className="score-group">
              <span className="pill" style={{ background: CATEGORY_META[category].color }}>
                {CATEGORY_META[category].label} Scores
              </span>
              <div className="grid two checks">
                {list.map((score) => (
                  <label className="checkbox" key={score.key}>
                    <input
                      type="checkbox"
                      checked={selectedMap[score.key]}
                      onChange={(e) => onToggleScore(score.key, e.target.checked)}
                    />
                    <span>{score.name}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}

        <p className="hint"><strong>{selectedCount}</strong> score(s) selected.</p>

        {selectedCount > 0 ? (
          <details className="details" open>
            <summary>? What do these scores represent?</summary>
            {selectedScores.map((key) => {
              const score = scoreMap[key];
              const evidence = SCORE_EVIDENCE[key] ?? [];
              return (
                <article className="detail-card" key={key}>
                  <h3>{score.name}</h3>
                  <p>{score.description}</p>
                  <p className="hint">Required inputs: {score.required_fields.map((f) => fieldLabel(f)).join(", ")}</p>
                  {MANUAL_CALCULATOR_LINKS[key] ? (
                    <p className="hint">Manual workflow: run official calculator, then enter percentages below.</p>
                  ) : (
                    <ul>
                      {evidence.map((ref) => (
                        <li key={ref.url}>
                          <a href={ref.url} target="_blank" rel="noreferrer">{ref.label}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </details>
        ) : null}

        {selectedScores.some((key) => MANUAL_CALCULATOR_LINKS[key]) ? (
          <div>
            <h3>Manual Calculator Links</h3>
            <div className="actions two">
              {selectedScores
                .filter((key) => MANUAL_CALCULATOR_LINKS[key])
                .map((key) => {
                  const item = MANUAL_CALCULATOR_LINKS[key];
                  return (
                    <a key={key} className="button-link" href={item.url} target="_blank" rel="noreferrer">
                      {item.label}
                    </a>
                  );
                })}
            </div>
          </div>
        ) : null}

        {selectedCount > 0 ? (
          <>
            <h2>2) Enter Required Inputs</h2>

            {[...requiredFields].some((f) => NUMERIC_INPUTS[f]) ? (
              <>
                <h3>Patient Inputs</h3>
                <div className="grid three">
                  {[...requiredFields]
                    .filter((f) => NUMERIC_INPUTS[f])
                    .map((field) => {
                      const cfg = NUMERIC_INPUTS[field];
                      return (
                        <label key={field}>
                          {cfg.label}
                          <input
                            name={field}
                            type="number"
                            value={form[field]}
                            min={cfg.min}
                            max={cfg.max}
                            step={cfg.step}
                            onChange={(e) => onInputChange(field, e.target.value, "number")}
                            disabled={unavailable[field]}
                          />
                          <span className="checkbox-inline">
                            <input
                              type="checkbox"
                              checked={unavailable[field]}
                              onChange={(e) => onUnavailableChange(field, e.target.checked)}
                            />
                            Not available
                          </span>
                          {field === "subjective_mets" ? (
                            <details className="details small">
                              <summary>Subjective METs examples</summary>
                              <ul>
                                <li><strong>1 MET:</strong> Sitting quietly, basic self-care.</li>
                                <li><strong>2-3 METs:</strong> Walking indoors, light housework.</li>
                                <li><strong>4 METs:</strong> Climbing one flight of stairs or walking uphill.</li>
                                <li><strong>5-6 METs:</strong> Brisk walk, moderate cycling.</li>
                                <li><strong>&gt;=7 METs:</strong> Jogging, singles tennis, vigorous activity.</li>
                              </ul>
                            </details>
                          ) : null}
                        </label>
                      );
                    })}
                </div>
              </>
            ) : null}

            {[...requiredFields].some((f) => CHOICE_INPUTS[f]) ? (
              <>
                <h3>Selections</h3>
                <div className="grid two">
                  {[...requiredFields]
                    .filter((f) => CHOICE_INPUTS[f])
                    .map((field) => {
                      const cfg = CHOICE_INPUTS[field];
                      return (
                        <label key={field}>
                          {cfg.label}
                          <select value={form[field]} onChange={(e) => onInputChange(field, e.target.value, "select") }>
                            {cfg.options.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </label>
                      );
                    })}
                </div>
              </>
            ) : null}

            {[...requiredFields].some((f) => BOOLEAN_INPUTS[f]) ? (
              <>
                <h3>Boolean Flags</h3>
                <div className="grid three checks">
                  {[...requiredFields]
                    .filter((f) => BOOLEAN_INPUTS[f])
                    .map((field) => (
                      <label className="checkbox" key={field}>
                        <input
                          type="checkbox"
                          checked={Boolean(form[field])}
                          onChange={(e) => onInputChange(field, e.target.checked, "checkbox")}
                        />
                        <span>{BOOLEAN_INPUTS[field].label}</span>
                      </label>
                    ))}
                </div>
              </>
            ) : null}

            <div className="actions">
              <button type="button" onClick={onCompute}>Compute</button>
            </div>
          </>
        ) : null}

        {error ? <p className="error">{error}</p> : null}
        {warnings.length ? (
          <div className="warnings">
            {warnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
            {results.length > 0 ? <p className="hint">Computed available scores only.</p> : null}
          </div>
        ) : null}
      </section>

      <section className="panel">
        <h2>3) Review Results</h2>
        <div className="cards">
          {results.length === 0 ? (
            <p className="hint">No computed results yet.</p>
          ) : (
            results.map((result) => {
              const score = scoreMap[result.score];
              const evidence = SCORE_EVIDENCE[result.score] ?? [];
              return (
                <article className="card" key={result.score}>
                  <h3>{score?.name ?? result.score}</h3>
                  <p><strong>Value:</strong> {result.value}</p>
                  <p><strong>Interpretation:</strong> {result.interpretation}</p>
                  {result.risk_estimate ? <p><strong>Risk estimate:</strong> {result.risk_estimate}</p> : null}
                  {result.clinical_note ? <p className="hint">Clinical meaning: {result.clinical_note}</p> : null}
                  {evidence.length ? (
                    <p>
                      <a href={evidence[0].url} target="_blank" rel="noreferrer">Evidence</a>
                    </p>
                  ) : null}
                </article>
              );
            })
          )}
        </div>

        {results.length > 0 ? (
          <>
            <h3>Summary</h3>
            <textarea value={summary} readOnly rows={8} />
            <div className="actions two">
              <button type="button" onClick={onCopySummary}>Copy summary</button>
              <a
                className="button-link"
                href={csvHref}
                download="scores.csv"
              >
                Export CSV
              </a>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

export default App;
