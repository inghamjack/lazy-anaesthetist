import csv
import io
import json
from typing import Any, Dict, List, Set

import httpx
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="The Lazy Anaethetist", layout="wide")


CATEGORY_META: Dict[str, Dict[str, str]] = {
    "elective": {"label": "Elective", "color": "#1f7a8c"},
    "emergency": {"label": "Emergency", "color": "#c0392b"},
    "both": {"label": "Both", "color": "#2d6a4f"},
}

SCORE_CATEGORY: Dict[str, str] = {
    "wilson": "elective",
    "stop_bang": "elective",
    "apfel_ponv": "elective",
    "subjective_mets": "both",
    "rcri": "both",
    "sort": "both",
    "gupta_mica": "both",
    "ariscat": "both",
    "acs_nsqip_manual": "both",
    "news2": "emergency",
    "qsofa": "emergency",
    "sofa_basic": "emergency",
    "nela_manual": "emergency",
}

SCORE_EXPLANATIONS: Dict[str, str] = {
    "wilson": "Helps anticipate difficult laryngoscopy/intubation from airway exam findings.",
    "stop_bang": "Screens for obstructive sleep apnea risk preoperatively.",
    "rcri": "Estimates perioperative cardiac complication risk for non-cardiac surgery.",
    "news2": "Tracks acute illness severity and identifies patients needing escalation.",
    "qsofa": "Simple sepsis severity prompt using RR, BP, and mental status.",
    "sofa_basic": "Estimates multi-organ dysfunction severity from respiratory, renal, liver, CNS, and circulatory markers.",
    "apfel_ponv": "Predicts postoperative nausea/vomiting risk to support antiemetic planning.",
    "subjective_mets": "Captures self-reported functional capacity (exercise tolerance) before surgery.",
    "ariscat": "Predicts postoperative pulmonary complication risk using pre-op and procedural variables.",
    "sort": "Predicts 30-day postoperative mortality for non-cardiac surgery.",
    "gupta_mica": "Predicts 30-day myocardial infarction or cardiac arrest risk after surgery.",
    "nela_manual": "Stores official NELA risk output for unified display/export (manual entry).",
    "acs_nsqip_manual": "Stores official ACS NSQIP risk output for unified display/export (manual entry).",
}

SCORE_EVIDENCE: Dict[str, List[Dict[str, str]]] = {
    "wilson": [
        {"label": "Wilson et al. difficult intubation predictor", "url": "https://pubmed.ncbi.nlm.nih.gov/1888865/"},
    ],
    "stop_bang": [
        {"label": "Chung et al. STOP-BANG validation", "url": "https://pubmed.ncbi.nlm.nih.gov/27507128/"},
    ],
    "rcri": [
        {"label": "Lee et al. RCRI derivation", "url": "https://pubmed.ncbi.nlm.nih.gov/10477528/"},
    ],
    "news2": [
        {"label": "RCP NEWS2 overview", "url": "https://www.rcp.ac.uk/improving-care/resources/national-early-warning-score-news-2/"},
    ],
    "qsofa": [
        {"label": "Freund et al. qSOFA in ED patients", "url": "https://pubmed.ncbi.nlm.nih.gov/28724125/"},
        {"label": "Sepsis-3 definitions", "url": "https://pubmed.ncbi.nlm.nih.gov/26903338/"},
    ],
    "sofa_basic": [
        {"label": "Sepsis-3 / SOFA context", "url": "https://pubmed.ncbi.nlm.nih.gov/26903338/"},
    ],
    "apfel_ponv": [
        {"label": "Apfel et al. simplified PONV risk score", "url": "https://pubmed.ncbi.nlm.nih.gov/14739823/"},
    ],
    "subjective_mets": [
        {"label": "METS study: subjective vs objective functional capacity", "url": "https://pubmed.ncbi.nlm.nih.gov/30070222/"},
    ],
    "ariscat": [
        {"label": "ARISCAT derivation", "url": "https://pubmed.ncbi.nlm.nih.gov/21045639/"},
    ],
    "sort": [
        {"label": "SORT derivation", "url": "https://pubmed.ncbi.nlm.nih.gov/25388883/"},
        {"label": "SORT external validation", "url": "https://pubmed.ncbi.nlm.nih.gov/37588588/"},
    ],
    "gupta_mica": [
        {"label": "Gupta MICA derivation", "url": "https://pubmed.ncbi.nlm.nih.gov/21730309/"},
    ],
    "nela_manual": [
        {"label": "NELA parsimonious risk calculator", "url": "https://data.nela.org.uk/Risk/"},
    ],
    "acs_nsqip_manual": [
        {"label": "ACS NSQIP Surgical Risk Calculator", "url": "https://riskcalculator.facs.org/RiskCalculator/"},
    ],
}

MANUAL_CALCULATOR_LINKS: Dict[str, Dict[str, str]] = {
    "nela_manual": {"label": "Open NELA Risk Calculator", "url": "https://data.nela.org.uk/Risk/"},
    "acs_nsqip_manual": {"label": "Open ACS NSQIP Risk Calculator", "url": "https://riskcalculator.facs.org/RiskCalculator/"},
}

NUMERIC_INPUTS: Dict[str, Dict[str, Any]] = {
    "respiratory_rate": {"label": "Respiratory rate", "kind": "int", "min": 0, "max": 80, "default": 18, "step": 1},
    "oxygen_saturation": {"label": "Oxygen saturation (%)", "kind": "int", "min": 0, "max": 100, "default": 98, "step": 1},
    "systolic_bp": {"label": "Systolic BP (mmHg)", "kind": "int", "min": 0, "max": 400, "default": 120, "step": 1},
    "heart_rate": {"label": "Heart rate", "kind": "int", "min": 0, "max": 300, "default": 80, "step": 1},
    "temperature_c": {"label": "Temperature (C)", "kind": "float", "min": 25.0, "max": 45.0, "default": 36.8, "step": 0.1},
    "mouth_opening_cm": {"label": "Mouth opening (cm)", "kind": "float", "min": 0.0, "max": 10.0, "default": 4.0, "step": 0.1},
    "thyromental_distance_cm": {
        "label": "Thyromental distance (cm)",
        "kind": "float",
        "min": 0.0,
        "max": 20.0,
        "default": 7.0,
        "step": 0.1,
    },
    "mallampati_class": {"label": "Mallampati class", "kind": "int", "min": 1, "max": 4, "default": 2, "step": 1},
    "bmi": {"label": "BMI", "kind": "float", "min": 0.0, "max": 100.0, "default": 27.0, "step": 0.1},
    "age": {"label": "Age", "kind": "int", "min": 0, "max": 130, "default": 45, "step": 1},
    "subjective_mets": {"label": "Subjective METs", "kind": "float", "min": 0.0, "max": 20.0, "default": 4.0, "step": 0.5},
    "neck_circumference_cm": {
        "label": "Neck circumference (cm)",
        "kind": "float",
        "min": 0.0,
        "max": 100.0,
        "default": 38.0,
        "step": 0.1,
    },
    "pao2_fio2": {"label": "PaO2/FiO2", "kind": "float", "min": 0.0, "max": 1000.0, "default": 380.0, "step": 1.0},
    "platelets": {"label": "Platelets", "kind": "int", "min": 0, "max": 1500, "default": 220, "step": 1},
    "hemoglobin_g_dl": {"label": "Haemoglobin (g/dL)", "kind": "float", "min": 3.0, "max": 25.0, "default": 13.2, "step": 0.1},
    "bilirubin_mg_dl": {
        "label": "Bilirubin (mg/dL)",
        "kind": "float",
        "min": 0.0,
        "max": 80.0,
        "default": 0.8,
        "step": 0.1,
    },
    "map_mm_hg": {"label": "MAP (mmHg)", "kind": "float", "min": 0.0, "max": 250.0, "default": 82.0, "step": 1.0},
    "gcs": {"label": "GCS", "kind": "int", "min": 3, "max": 15, "default": 15, "step": 1},
    "creatinine_umol_l": {
        "label": "Creatinine (umol/L)",
        "kind": "float",
        "min": 0.0,
        "max": 2000.0,
        "default": 80.0,
        "step": 1.0,
    },
    "urine_output_ml_day": {
        "label": "Urine output (ml/day)",
        "kind": "int",
        "min": 0,
        "max": 10000,
        "default": 1400,
        "step": 10,
    },
    "surgery_duration_hours": {
        "label": "Surgery duration (hours)",
        "kind": "float",
        "min": 0.0,
        "max": 24.0,
        "default": 2.0,
        "step": 0.1,
    },
    "nela_30_day_mortality_percent": {
        "label": "NELA 30-day mortality (%)",
        "kind": "float",
        "min": 0.0,
        "max": 100.0,
        "default": 5.0,
        "step": 0.1,
    },
    "nsqip_mortality_percent": {
        "label": "NSQIP mortality risk (%)",
        "kind": "float",
        "min": 0.0,
        "max": 100.0,
        "default": 1.0,
        "step": 0.1,
    },
    "nsqip_serious_complication_percent": {
        "label": "NSQIP serious complication risk (%)",
        "kind": "float",
        "min": 0.0,
        "max": 100.0,
        "default": 8.0,
        "step": 0.1,
    },
}

BOOLEAN_INPUTS: Dict[str, Dict[str, Any]] = {
    "alert": {"label": "Alert", "default": True},
    "altered_mental_status": {"label": "Altered mental status", "default": False},
    "on_supplemental_oxygen": {"label": "Supplemental oxygen", "default": False},
    "neck_mobility_limited": {"label": "Neck mobility limited", "default": False},
    "jaw_protrusion_limited": {"label": "Jaw protrusion limited", "default": False},
    "snoring": {"label": "Snoring", "default": False},
    "tiredness": {"label": "Tiredness", "default": False},
    "observed_apnea": {"label": "Observed apnea", "default": False},
    "high_blood_pressure": {"label": "High blood pressure", "default": False},
    "respiratory_infection_last_month": {"label": "Respiratory infection in last month", "default": False},
    "emergency_surgery": {"label": "Emergency surgery", "default": False},
    "male": {"label": "Male", "default": True},
    "high_risk_surgery": {"label": "High-risk surgery", "default": False},
    "sort_high_risk_specialty": {"label": "SORT high-risk specialty", "default": False},
    "sort_xmajor_complex": {"label": "SORT Xmajor/complex surgery", "default": False},
    "sort_cancer": {"label": "SORT active cancer", "default": False},
    "ischemic_heart_disease": {"label": "Ischemic heart disease", "default": False},
    "congestive_heart_failure": {"label": "Congestive heart failure", "default": False},
    "cerebrovascular_disease": {"label": "Cerebrovascular disease", "default": False},
    "insulin_therapy_diabetes": {"label": "Insulin therapy diabetes", "default": False},
    "creatinine_gt_2": {"label": "Creatinine > 176.8 umol/L", "default": False},
    "on_vasopressors": {"label": "On vasopressors", "default": False},
    "female": {"label": "Female", "default": False},
    "non_smoker": {"label": "Non-smoker", "default": True},
    "history_ponv_motion_sickness": {"label": "Hx PONV/motion sickness", "default": False},
    "postoperative_opioids": {"label": "Postop opioids", "default": False},
}

CHOICE_INPUTS: Dict[str, Dict[str, Any]] = {
    "asa_ps_class": {
        "label": "ASA-PS class",
        "options": [
            {"value": 1, "label": "ASA I"},
            {"value": 2, "label": "ASA II"},
            {"value": 3, "label": "ASA III"},
            {"value": 4, "label": "ASA IV"},
            {"value": 5, "label": "ASA V"},
        ],
        "default": 2,
    },
    "sort_urgency": {
        "label": "SORT urgency",
        "options": [
            {"value": "elective", "label": "Elective"},
            {"value": "expedited", "label": "Expedited"},
            {"value": "urgent", "label": "Urgent"},
            {"value": "immediate", "label": "Immediate"},
        ],
        "default": "elective",
    },
    "ariscat_incision": {
        "label": "ARISCAT incision type",
        "options": [
            {"value": "peripheral", "label": "Peripheral"},
            {"value": "upper_abdominal", "label": "Upper abdominal"},
            {"value": "intrathoracic", "label": "Intrathoracic"},
        ],
        "default": "peripheral",
    },
    "mica_functional_status": {
        "label": "Gupta functional status",
        "options": [
            {"value": "independent", "label": "Independent"},
            {"value": "partially_dependent", "label": "Partially dependent"},
            {"value": "totally_dependent", "label": "Totally dependent"},
        ],
        "default": "independent",
    },
    "mica_surgery_type": {
        "label": "Gupta surgery type",
        "options": [
            {"value": "hernia", "label": "Hernia"},
            {"value": "anorectal", "label": "Anorectal"},
            {"value": "aortic", "label": "Aortic"},
            {"value": "bariatric", "label": "Bariatric / oesophageal / adrenal / splenic"},
            {"value": "brain", "label": "Brain"},
            {"value": "breast", "label": "Breast"},
            {"value": "cardiac", "label": "Cardiac"},
            {"value": "ent", "label": "ENT"},
            {"value": "foregut_hpb", "label": "Foregut / hepato-pancreato-biliary"},
            {"value": "gallbladder_appendix_adrenal_spleen", "label": "Gallbladder / appendix / adrenal / spleen"},
            {"value": "intestinal", "label": "Intestinal"},
            {"value": "neck", "label": "Neck"},
            {"value": "obgyn", "label": "Obstetric / gynaecologic"},
            {"value": "orthopedic", "label": "Orthopedic"},
            {"value": "other_abdominal", "label": "Other abdominal"},
            {"value": "peripheral_vascular", "label": "Peripheral vascular"},
            {"value": "skin", "label": "Skin"},
            {"value": "spine", "label": "Spine"},
            {"value": "thoracic_non_esophageal_non_cardiac", "label": "Thoracic (non-cardiac, non-oesophageal)"},
            {"value": "vein", "label": "Vein"},
            {"value": "urology", "label": "Urology"},
        ],
        "default": "hernia",
    },
}


def _field_label(field: str) -> str:
    if field in NUMERIC_INPUTS:
        return NUMERIC_INPUTS[field]["label"]
    if field in BOOLEAN_INPUTS:
        return BOOLEAN_INPUTS[field]["label"]
    if field in CHOICE_INPUTS:
        return CHOICE_INPUTS[field]["label"]
    return field.replace("_", " ")


def _inject_ui_styles() -> None:
    st.markdown(
        """
        <style>
        .block-container {
            padding-top: 1.4rem;
            padding-bottom: 2rem;
        }
        div[data-testid="stCheckbox"] label p {
            font-weight: 500;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def _render_subjective_mets_examples() -> None:
    if hasattr(st, "popover"):
        container = st.popover("Subjective METs examples")
    else:
        container = st.expander("Subjective METs examples")

    with container:
        st.markdown(
            "\n".join(
                [
                    "- **1 MET**: Sitting quietly, basic self-care.",
                    "- **2-3 METs**: Walking indoors, light housework.",
                    "- **4 METs**: Climbing one flight of stairs or walking uphill.",
                    "- **5-6 METs**: Brisk walk, moderate cycling.",
                    "- **>=7 METs**: Jogging, singles tennis, vigorous activity.",
                ]
            )
        )
        st.caption("Rule of thumb: inability to achieve 4 METs suggests reduced functional reserve.")


def _get_scores(api_base_url: str) -> List[Dict[str, Any]]:
    response = httpx.get(f"{api_base_url}/scores", timeout=10.0)
    response.raise_for_status()
    return response.json()


def _compute(api_base_url: str, selected_scores: List[str], inputs: Dict[str, Any]) -> Dict[str, Any]:
    payload = {"selected_scores": selected_scores, "inputs": inputs}
    response = httpx.post(f"{api_base_url}/compute", json=payload, timeout=15.0)
    if response.status_code >= 400:
        try:
            body = response.json()
        except Exception:
            body = {"detail": response.text}
        detail = body.get("detail", "Request failed")
        errors = body.get("errors", [])
        if errors:
            detail = f"{detail}: " + "; ".join(f"{item['field']}: {item['message']}" for item in errors)
        raise RuntimeError(detail)
    return response.json()


def _summary(results: List[Dict[str, Any]], score_names: Dict[str, str]) -> str:
    lines = ["Score Summary"]
    for item in results:
        score_key = item["score"]
        score_name = score_names.get(score_key, score_key.upper())
        base = f"- {score_name}: {item['value']} ({item['interpretation']})"
        risk_estimate = item.get("risk_estimate")
        clinical_note = item.get("clinical_note")
        if risk_estimate:
            base += f" Risk estimate: {risk_estimate}"
        if clinical_note:
            base += f" Clinical meaning: {clinical_note}"
        lines.append(base)
    return "\n".join(lines)


def _results_csv(results: List[Dict[str, Any]]) -> str:
    output = io.StringIO()
    fieldnames = ["score", "value", "interpretation", "risk_estimate", "clinical_note"]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(results)
    return output.getvalue()


def _missing_value_message(score_name: str, missing_fields: List[str]) -> str:
    labels = [_field_label(field) for field in missing_fields]
    if not labels:
        return f"Unable to calculate {score_name} - missing required values."
    if len(labels) == 1:
        return f"Unable to calculate {score_name} - missing {labels[0]} value."
    return f"Unable to calculate {score_name} - missing values: {', '.join(labels)}."


def _render_evidence_links(score_key: str, compact: bool = False) -> None:
    references = SCORE_EVIDENCE.get(score_key, [])
    if not references:
        st.caption("Evidence: no single canonical external paper is mapped for this implementation.")
        return

    if compact and hasattr(st, "link_button") and len(references) == 1:
        reference = references[0]
        st.link_button("Evidence", reference["url"], use_container_width=True)
        return

    st.caption("Evidence:")
    for reference in references:
        st.markdown(f"- [{reference['label']}]({reference['url']})")


def _render_manual_calculator_links(selected_scores: List[str]) -> None:
    manual_entries = [MANUAL_CALCULATOR_LINKS[score_key] for score_key in selected_scores if score_key in MANUAL_CALCULATOR_LINKS]
    if not manual_entries:
        return

    st.subheader("Manual Calculator Links")
    st.caption("Use these official calculators, then enter the resulting percentages in this app.")
    cols = st.columns(len(manual_entries))
    for idx, entry in enumerate(manual_entries):
        with cols[idx]:
            if hasattr(st, "link_button"):
                st.link_button(entry["label"], entry["url"], use_container_width=True)
            else:
                st.markdown(f"[{entry['label']}]({entry['url']})")


def _render_score_details(score_map: Dict[str, Dict[str, Any]], selected_scores: List[str]) -> None:
    label = "? What do these scores represent?"
    if hasattr(st, "popover"):
        details_container = st.popover(label)
    else:
        details_container = st.expander(label)

    with details_container:
        for idx, score_key in enumerate(selected_scores):
            score = score_map[score_key]
            st.markdown(f"**{score['name']}** (`{score_key}`)")
            short_description = SCORE_EXPLANATIONS.get(score_key) or score.get("description", "No description provided.")
            st.write(short_description)

            required_fields = score.get("required_fields", [])
            if required_fields:
                friendly_fields = ", ".join(_field_label(field) for field in required_fields)
                st.caption(f"Required inputs: {friendly_fields}")

            if score_key in MANUAL_CALCULATOR_LINKS:
                st.caption("Manual workflow: run official calculator, then enter the percentages below.")
            else:
                _render_evidence_links(score_key)

            if idx < len(selected_scores) - 1:
                st.markdown("---")


def _render_inputs(required_fields: Set[str]) -> tuple[Dict[str, Any], Set[str]]:
    inputs: Dict[str, Any] = {}
    missing_numeric_fields: Set[str] = set()

    numeric_fields = [field for field in NUMERIC_INPUTS if field in required_fields]
    if numeric_fields:
        st.subheader("Patient Inputs")
        cols = st.columns(3)
        for idx, field in enumerate(numeric_fields):
            config = NUMERIC_INPUTS[field]
            with cols[idx % len(cols)]:
                not_available = st.checkbox("Not available", value=False, key=f"na_{field}")
                value = st.number_input(
                    config["label"],
                    min_value=config["min"],
                    max_value=config["max"],
                    value=config["default"],
                    step=config["step"],
                    key=f"input_{field}",
                    disabled=not_available,
                )
                if field == "subjective_mets":
                    _render_subjective_mets_examples()
            if not_available:
                missing_numeric_fields.add(field)
            else:
                if config["kind"] == "int":
                    inputs[field] = int(value)
                else:
                    inputs[field] = float(value)

    choice_fields = [field for field in CHOICE_INPUTS if field in required_fields]
    if choice_fields:
        st.subheader("Selections")
        cols = st.columns(2)
        for idx, field in enumerate(choice_fields):
            config = CHOICE_INPUTS[field]
            options = config["options"]
            option_values = [item["value"] for item in options]
            labels = {item["value"]: item["label"] for item in options}
            default_value = config["default"]
            default_idx = option_values.index(default_value) if default_value in option_values else 0
            with cols[idx % len(cols)]:
                selected_value = st.selectbox(
                    config["label"],
                    options=option_values,
                    index=default_idx,
                    format_func=lambda value, lookup=labels: lookup[value],
                    key=f"input_{field}",
                )
            inputs[field] = selected_value

    boolean_fields = [field for field in BOOLEAN_INPUTS if field in required_fields]
    if boolean_fields:
        st.subheader("Boolean Flags")
        cols = st.columns(3)
        for idx, field in enumerate(boolean_fields):
            config = BOOLEAN_INPUTS[field]
            with cols[idx % len(cols)]:
                value = st.checkbox(config["label"], value=config["default"], key=f"input_{field}")
            inputs[field] = bool(value)

    return inputs, missing_numeric_fields


def _render_category_legend() -> None:
    st.caption("Score category key")
    legend_cols = st.columns(3)
    for idx, category in enumerate(["elective", "emergency", "both"]):
        meta = CATEGORY_META[category]
        legend_cols[idx].markdown(
            f"<span style='display:inline-block;padding:0.2rem 0.7rem;border-radius:999px;background:{meta['color']};color:white;font-weight:600;'>{meta['label']}</span>",
            unsafe_allow_html=True,
        )


def _render_score_selector(score_map: Dict[str, Dict[str, Any]]) -> List[str]:
    st.subheader("1) Select Scores")
    st.write("Choose the scores you want first. The form will then show only required inputs.")
    _render_category_legend()

    available_scores = list(score_map.keys())
    grouped_scores: Dict[str, List[str]] = {"elective": [], "emergency": [], "both": []}
    for score_key in available_scores:
        category = SCORE_CATEGORY.get(score_key, "both")
        grouped_scores.setdefault(category, []).append(score_key)

    for category in grouped_scores:
        grouped_scores[category] = sorted(grouped_scores[category], key=lambda key: score_map[key]["name"].lower())

    all_ordered_scores: List[str] = grouped_scores["elective"] + grouped_scores["emergency"] + grouped_scores["both"]

    action_cols = st.columns(2)
    with action_cols[0]:
        if st.button("Select all scores", use_container_width=True, type="primary"):
            for score_key in all_ordered_scores:
                st.session_state[f"pick_{score_key}"] = True
            st.session_state.pop("results", None)
            st.rerun()
    with action_cols[1]:
        if st.button("Clear score selection", use_container_width=True):
            for score_key in all_ordered_scores:
                st.session_state[f"pick_{score_key}"] = False
            st.session_state.pop("results", None)
            st.rerun()

    selected_scores: List[str] = []
    for category in ["elective", "emergency", "both"]:
        score_keys = grouped_scores.get(category, [])
        if not score_keys:
            continue
        meta = CATEGORY_META.get(category, CATEGORY_META["both"])
        st.markdown(
            f"<div style='margin:0.75rem 0 0.35rem;'><span style='display:inline-block;padding:0.2rem 0.65rem;border-radius:999px;background:{meta['color']};color:white;font-size:0.82rem;font-weight:600;'>{meta['label']} Scores</span></div>",
            unsafe_allow_html=True,
        )
        cols = st.columns(2)
        for idx, score_key in enumerate(score_keys):
            with cols[idx % len(cols)]:
                checked = st.checkbox(
                    score_map[score_key]["name"],
                    key=f"pick_{score_key}",
                    help=score_map[score_key].get("description", ""),
                )
                if checked:
                    selected_scores.append(score_key)
    return selected_scores


def _render_calculator() -> None:
    _inject_ui_styles()
    st.title("The Lazy Anaethetist - A Compilation of Scores in Elective & Emergency Anaesthesia")

    with st.sidebar:
        st.subheader("Settings")
        api_base_default = st.session_state.get("api_base_url", "http://127.0.0.1:8000")
        api_base_url = st.text_input("API base URL", value=api_base_default).rstrip("/")
        st.session_state["api_base_url"] = api_base_url
        st.caption("Adjust only if your backend API runs on a different host or port.")

    try:
        score_definitions = _get_scores(api_base_url)
    except Exception as exc:
        st.error(f"Could not load /scores: {exc}")
        st.stop()

    score_map = {item["key"]: item for item in score_definitions}
    selected_scores = _render_score_selector(score_map)
    selected_signature = tuple(sorted(selected_scores))
    if st.session_state.get("last_selected_scores") != selected_signature:
        st.session_state["last_selected_scores"] = selected_signature
        st.session_state.pop("results", None)

    if not selected_scores:
        st.info("Select at least one score to display required inputs.")
        return

    st.caption(f"{len(selected_scores)} score(s) selected.")
    _render_score_details(score_map, selected_scores)
    _render_manual_calculator_links(selected_scores)

    required_fields: Set[str] = set()
    for score_key in selected_scores:
        required_fields.update(score_map[score_key].get("required_fields", []))

    st.subheader("2) Enter Required Inputs")
    inputs, missing_numeric_fields = _render_inputs(required_fields)

    if st.button("Compute", type="primary"):
        st.session_state["results"] = []
        missing_by_score: Dict[str, List[str]] = {}
        for score_key in selected_scores:
            score_required_fields = score_map[score_key].get("required_fields", [])
            missing_fields = [field for field in score_required_fields if field in missing_numeric_fields]
            if missing_fields:
                missing_by_score[score_key] = missing_fields

        computable_scores = [score_key for score_key in selected_scores if score_key not in missing_by_score]
        for score_key, missing_fields in missing_by_score.items():
            st.warning(_missing_value_message(score_map[score_key]["name"], missing_fields))

        if missing_by_score and computable_scores:
            st.info("Computed available scores only.")

        if not computable_scores:
            return

        try:
            response = _compute(api_base_url, computable_scores, inputs)
            st.session_state["results"] = response.get("results", [])
        except Exception as exc:
            st.error(str(exc))

    results = st.session_state.get("results", [])
    if results:
        st.subheader("3) Review Results")
        score_names = {item["key"]: item["name"] for item in score_definitions}
        cols = st.columns(min(3, len(results)))
        for idx, result in enumerate(results):
            with cols[idx % len(cols)]:
                score_name = score_names.get(result["score"], result["score"].upper())
                st.markdown(
                    "\n".join(
                        [
                            "### " + score_name,
                            f"**Value:** {result['value']}",
                            f"**Interpretation:** {result['interpretation']}",
                        ]
                    )
                )
                risk_estimate = result.get("risk_estimate")
                clinical_note = result.get("clinical_note")
                if risk_estimate:
                    st.write(f"**Risk estimate:** {risk_estimate}")
                if clinical_note:
                    st.caption(f"Clinical meaning: {clinical_note}")
                _render_evidence_links(result["score"], compact=True)

        summary_text = _summary(results, score_names)
        st.text_area("Summary", summary_text, height=140)

        result_action_cols = st.columns(2)
        with result_action_cols[0]:
            if st.button("Copy summary", use_container_width=True):
                safe_summary = json.dumps(summary_text)
                components.html(
                    f"""
                    <script>
                    navigator.clipboard.writeText({safe_summary});
                    </script>
                    <p>Summary copied to clipboard.</p>
                    """,
                    height=40,
                )
        with result_action_cols[1]:
            st.download_button(
                "Export CSV",
                data=_results_csv(results),
                file_name="scores.csv",
                mime="text/csv",
                use_container_width=True,
            )


_render_calculator()
