import { useMemo, useState } from "react";
import {
  ANTICOAG_DRUG_OPTIONS,
  ANTICOAG_GUIDANCE_LINKS,
  ANTICOAG_PROCEDURE_OPTIONS,
  BOOLEAN_INPUTS,
  CASE_RISK_SCORE_BUNDLE,
  CATEGORY_META,
  CHOICE_INPUTS,
  MANUAL_CALCULATOR_LINKS,
  NUMERIC_INPUTS,
  REGIONAL_SUGGESTIONS,
  SCORE_CATEGORY,
  SCORE_DEFINITIONS,
  SCORE_EVIDENCE,
  buildInitialUnavailable,
  buildInitialValues,
  computeAnticoagSafety,
  computeCaseBasics,
  computeScores,
  fieldLabel,
  summaryText,
} from "./calculators";

const AUTO_POPULATED_FIELDS = new Set(["age", "bmi", "male", "female"]);

function App() {
  const [form, setForm] = useState(buildInitialValues);
  const [unavailable, setUnavailable] = useState(buildInitialUnavailable);
  const [demographics, setDemographics] = useState({
    age: 45,
    sex_at_birth: "male",
    height_cm: 170,
    weight_kg: 75,
    pregnant: false,
    gestation_weeks: 20,
  });
  const [selectedMap, setSelectedMap] = useState(() => {
    const initial = {};
    for (const score of SCORE_DEFINITIONS) initial[score.key] = false;
    return initial;
  });
  const [results, setResults] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState("");
  const [regionalSearch, setRegionalSearch] = useState("");
  const [selectedRegionalSite, setSelectedRegionalSite] = useState("");
  const [anticoag, setAnticoag] = useState({
    entryId: "apixaban_prophylaxis",
    procedureRisk: "neuraxial",
    hoursSinceLastDose: 24,
    inr: 1.1,
    apttNormal: false,
    catheterInSitu: false,
    traumaticPuncture: false,
  });

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

  const requiredUserInputFields = useMemo(
    () => [...requiredFields].filter((field) => !AUTO_POPULATED_FIELDS.has(field)),
    [requiredFields]
  );

  const caseBasics = useMemo(() => computeCaseBasics(demographics), [demographics]);

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
    for (const [field, cfg] of Object.entries(CHOICE_INPUTS)) {
      const isNumericChoice = typeof cfg.options[0]?.value === "number";
      parsed[field] = isNumericChoice ? Number.parseInt(form[field], 10) : form[field];
    }
    return parsed;
  }, [form]);

  const mergedInputValues = useMemo(
    () => ({
      ...inputValues,
      age: Number.parseInt(demographics.age, 10),
      bmi: caseBasics.bmi,
      male: demographics.sex_at_birth === "male",
      female: demographics.sex_at_birth === "female",
    }),
    [caseBasics.bmi, demographics.age, demographics.sex_at_birth, inputValues]
  );

  const selectedCount = selectedScores.length;
  const filteredRegionalSites = useMemo(() => {
    const query = regionalSearch.trim().toLowerCase();
    if (!query) return REGIONAL_SUGGESTIONS;
    return REGIONAL_SUGGESTIONS.filter((item) => item.label.toLowerCase().includes(query));
  }, [regionalSearch]);
  const regionalSuggestion = useMemo(
    () => REGIONAL_SUGGESTIONS.find((item) => item.key === selectedRegionalSite),
    [selectedRegionalSite]
  );
  const anticoagGroups = useMemo(() => {
    const groups = {};
    for (const item of ANTICOAG_DRUG_OPTIONS) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    }
    return groups;
  }, []);
  const selectedAnticoagEntry = useMemo(
    () => ANTICOAG_DRUG_OPTIONS.find((item) => item.id === anticoag.entryId) ?? null,
    [anticoag.entryId]
  );
  const anticoagAssessment = useMemo(() => computeAnticoagSafety(anticoag), [anticoag]);

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

  const onSelectRiskBundle = () => {
    const selected = {};
    for (const score of SCORE_DEFINITIONS) {
      selected[score.key] = CASE_RISK_SCORE_BUNDLE.includes(score.key);
    }
    setSelectedMap(selected);
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

  const onDemographicChange = (name, value) => {
    setDemographics((prev) => {
      if (name === "sex_at_birth") {
        return {
          ...prev,
          sex_at_birth: value,
          pregnant: value === "female" ? prev.pregnant : false,
        };
      }
      return {
        ...prev,
        [name]: Number.isFinite(Number.parseFloat(value)) ? Number.parseFloat(value) : prev[name],
      };
    });
    setResults([]);
    setWarnings([]);
    setError("");
  };

  const onAnticoagChange = (name, value, type = "text") => {
    setAnticoag((prev) => {
      if (type === "checkbox") return { ...prev, [name]: Boolean(value) };
      if (type === "number") {
        const parsed = Number.parseFloat(value);
        return { ...prev, [name]: Number.isFinite(parsed) ? parsed : prev[name] };
      }
      return { ...prev, [name]: value };
    });
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
      const computed = computeScores(computable, mergedInputValues);
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

        <h2>Case Basics</h2>
        <p className="hint">Enter demographics once to generate core case metrics and auto-fill age/sex/BMI for relevant scores.</p>
        <div className="grid four">
          <label>
            Age
            <input
              type="number"
              min={0}
              max={130}
              step={1}
              value={demographics.age}
              onChange={(e) => onDemographicChange("age", e.target.value)}
            />
          </label>
          <label>
            Sex at birth
            <select
              value={demographics.sex_at_birth}
              onChange={(e) => onDemographicChange("sex_at_birth", e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label>
            Height (cm)
            <input
              type="number"
              min={80}
              max={250}
              step={0.1}
              value={demographics.height_cm}
              onChange={(e) => onDemographicChange("height_cm", e.target.value)}
            />
          </label>
          <label>
            Weight (kg)
            <input
              type="number"
              min={1}
              max={400}
              step={0.1}
              value={demographics.weight_kg}
              onChange={(e) => onDemographicChange("weight_kg", e.target.value)}
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={demographics.pregnant}
              onChange={(e) => {
                setDemographics((prev) => ({ ...prev, pregnant: e.target.checked }));
                setResults([]);
                setWarnings([]);
                setError("");
              }}
              disabled={demographics.sex_at_birth !== "female"}
            />
            <span>Pregnant</span>
          </label>
          <label>
            Gestation (weeks)
            <input
              type="number"
              min={0}
              max={45}
              step={1}
              value={demographics.gestation_weeks}
              onChange={(e) => onDemographicChange("gestation_weeks", e.target.value)}
              disabled={!demographics.pregnant || demographics.sex_at_birth !== "female"}
            />
          </label>
        </div>
        <div className="metric-grid">
          <article className="metric-card">
            <h3>Body Weight Targets</h3>
            <p><strong>IBW:</strong> {caseBasics.ideal_body_weight_kg} kg</p>
            <p><strong>LBW (Janmahasatian):</strong> {caseBasics.lean_body_weight_kg} kg</p>
            <p><strong>BMI:</strong> {caseBasics.bmi} kg/m2</p>
          </article>
          <article className="metric-card">
            <h3>Ideal Tidal Volume (IBW)</h3>
            <p><strong>6 ml/kg:</strong> {caseBasics.ideal_tidal_volume_ml.low_6_ml_per_kg} ml</p>
            <p><strong>7 ml/kg target:</strong> {caseBasics.ideal_tidal_volume_ml.target_7_ml_per_kg} ml</p>
            <p><strong>8 ml/kg:</strong> {caseBasics.ideal_tidal_volume_ml.high_8_ml_per_kg} ml</p>
          </article>
          <article className="metric-card">
            <h3>Estimated Blood Volume</h3>
            <p><strong>Nadler:</strong> {caseBasics.estimated_blood_volume_ml} ml ({caseBasics.estimated_blood_volume_l} L)</p>
            <p><strong>BMI-adjusted:</strong> {caseBasics.bmi_adjusted_blood_volume_ml} ml ({caseBasics.bmi_adjusted_blood_volume_l} L)</p>
            <p className="hint">BMI-adjusted rate: {caseBasics.bmi_adjusted_ml_per_kg} ml/kg.</p>
            <p><strong>Pregnancy-adjusted:</strong> {caseBasics.pregnancy_adjusted_blood_volume_ml} ml ({caseBasics.pregnancy_adjusted_blood_volume_l} L)</p>
            <p className="hint">
              Multiplier: x{caseBasics.pregnancy_multiplier} {demographics.pregnant && demographics.sex_at_birth === "female"
                ? `(gestation ${Math.round(demographics.gestation_weeks)} weeks)`
                : "(not applied)"}.
            </p>
            <p className="hint">Nadler formula (height + weight + sex-specific constants).</p>
          </article>
        </div>

        <h2>Regional Anaesthesia Suggestions</h2>
        <p className="hint">Simple site-based options only. No dosing or protocol logic.</p>
        <div className="grid two">
          <label>
            Search surgery site
            <input
              type="text"
              value={regionalSearch}
              onChange={(e) => setRegionalSearch(e.target.value)}
              placeholder="e.g. shoulder, chest, lower abdomen, spine"
            />
          </label>
          <label>
            Surgery site
            <select
              value={selectedRegionalSite}
              onChange={(e) => setSelectedRegionalSite(e.target.value)}
            >
              <option value="">Select a site...</option>
              {filteredRegionalSites.map((item) => (
                <option key={item.key} value={item.key}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>
        {regionalSuggestion ? (
          <article className="metric-card">
            <h3>{regionalSuggestion.label}</h3>
            <p><strong>Primary options:</strong> {regionalSuggestion.primary.join("; ")}.</p>
            <p><strong>Alternatives:</strong> {regionalSuggestion.alternatives.join("; ")}.</p>
            <p className="hint"><strong>Caution:</strong> {regionalSuggestion.caution}</p>
          </article>
        ) : null}

        <h2>Anticoagulant & Regional Safety</h2>
        <p className="hint">
          UK Association guidance-based timing prompt (2013 table values; guidance page states it is under review).
          Confirm against current local policy before proceeding.
        </p>
        <div className="actions two">
          <a className="button-link" href={ANTICOAG_GUIDANCE_LINKS.summary_page} target="_blank" rel="noreferrer">
            Open UK guidance page
          </a>
          <a className="button-link" href={ANTICOAG_GUIDANCE_LINKS.pdf_mirror} target="_blank" rel="noreferrer">
            Open UK guidance PDF
          </a>
        </div>
        <div className="grid three">
          <label>
            Procedure type
            <select
              value={anticoag.procedureRisk}
              onChange={(e) => onAnticoagChange("procedureRisk", e.target.value)}
            >
              {ANTICOAG_PROCEDURE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            Anticoagulant / antiplatelet
            <select
              value={anticoag.entryId}
              onChange={(e) => onAnticoagChange("entryId", e.target.value)}
            >
              {Object.entries(anticoagGroups).map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label>
            Hours since last dose
            <input
              type="number"
              min={0}
              max={400}
              step={0.1}
              value={anticoag.hoursSinceLastDose}
              onChange={(e) => onAnticoagChange("hoursSinceLastDose", e.target.value, "number")}
            />
          </label>
        </div>
        <div className="grid three checks">
          {selectedAnticoagEntry?.requiresInrLe ? (
            <label>
              INR
              <input
                type="number"
                min={0.8}
                max={10}
                step={0.1}
                value={anticoag.inr}
                onChange={(e) => onAnticoagChange("inr", e.target.value, "number")}
              />
            </label>
          ) : null}
          {selectedAnticoagEntry?.requiresNormalAptt ? (
            <label className="checkbox">
              <input
                type="checkbox"
                checked={Boolean(anticoag.apttNormal)}
                onChange={(e) => onAnticoagChange("apttNormal", e.target.checked, "checkbox")}
              />
              <span>APTT ratio currently normal</span>
            </label>
          ) : null}
          <label className="checkbox">
            <input
              type="checkbox"
              checked={Boolean(anticoag.catheterInSitu)}
              onChange={(e) => onAnticoagChange("catheterInSitu", e.target.checked, "checkbox")}
            />
            <span>Neuraxial catheter in situ</span>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={Boolean(anticoag.traumaticPuncture)}
              onChange={(e) => onAnticoagChange("traumaticPuncture", e.target.checked, "checkbox")}
            />
            <span>Traumatic / bloody puncture</span>
          </label>
        </div>
        <article className={`anticoag-box ${anticoagAssessment.status}`}>
          <h3>{anticoagAssessment.headline}</h3>
          <p><strong>Pre-block timing:</strong> {anticoagAssessment.beforeBlockMessage}</p>
          <p><strong>Catheter guidance:</strong> {anticoagAssessment.catheterMessage}</p>
          <p><strong>After block:</strong> {anticoagAssessment.nextDoseMessage}</p>
          <p className="hint">{anticoagAssessment.procedureMessage}</p>
          <p className="hint"><strong>Chart note draft:</strong> {anticoagAssessment.chartNote}</p>
        </article>

        <h2>1) Select Scores</h2>
        <p className="hint">Choose scores first. Required inputs are then shown automatically.</p>

        <div className="legend">
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <span className="pill" key={key} style={{ background: meta.color }}>
              {meta.label}
            </span>
          ))}
        </div>

        <div className="actions three">
          <button type="button" onClick={onSelectAll}>Select all scores</button>
          <button type="button" onClick={onSelectRiskBundle}>Mortality/morbidity bundle</button>
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
            {[...requiredFields].some((field) => AUTO_POPULATED_FIELDS.has(field)) ? (
              <p className="hint">
                Auto-filled from demographics: {[...requiredFields]
                  .filter((field) => AUTO_POPULATED_FIELDS.has(field))
                  .map((field) => fieldLabel(field))
                  .join(", ")}.
              </p>
            ) : null}

            {requiredUserInputFields.some((f) => NUMERIC_INPUTS[f]) ? (
              <>
                <h3>Patient Inputs</h3>
                <div className="grid three">
                  {requiredUserInputFields
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

            {requiredUserInputFields.some((f) => CHOICE_INPUTS[f]) ? (
              <>
                <h3>Selections</h3>
                <div className="grid two">
                  {requiredUserInputFields
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

            {requiredUserInputFields.some((f) => BOOLEAN_INPUTS[f]) ? (
              <>
                <h3>Boolean Flags</h3>
                <div className="grid three checks">
                  {requiredUserInputFields
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
