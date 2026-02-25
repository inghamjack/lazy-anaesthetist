export const CREATININE_UMOL_PER_MG_DL = 88.4;

export const CATEGORY_META = {
  elective: { label: "Elective", color: "#1f7a8c" },
  emergency: { label: "Emergency", color: "#c0392b" },
  both: { label: "Both", color: "#2d6a4f" },
};

export const SCORE_CATEGORY = {
  wilson: "elective",
  stop_bang: "elective",
  apfel_ponv: "elective",
  subjective_mets: "both",
  rcri: "both",
  sort: "both",
  gupta_mica: "both",
  ariscat: "both",
  acs_nsqip_manual: "both",
  news2: "emergency",
  qsofa: "emergency",
  sofa_basic: "emergency",
  nela_manual: "emergency",
};

export const SCORE_DEFINITIONS = [
  {
    key: "wilson",
    name: "Wilson Score",
    description: "Airway difficulty prediction score.",
    required_fields: [
      "mouth_opening_cm",
      "thyromental_distance_cm",
      "mallampati_class",
      "neck_mobility_limited",
      "jaw_protrusion_limited",
    ],
  },
  {
    key: "stop_bang",
    name: "STOP-BANG",
    description: "Obstructive sleep apnea screening score.",
    required_fields: [
      "snoring",
      "tiredness",
      "observed_apnea",
      "high_blood_pressure",
      "bmi",
      "age",
      "neck_circumference_cm",
      "male",
    ],
  },
  {
    key: "rcri",
    name: "RCRI",
    description: "Revised Cardiac Risk Index.",
    required_fields: [
      "high_risk_surgery",
      "ischemic_heart_disease",
      "congestive_heart_failure",
      "cerebrovascular_disease",
      "insulin_therapy_diabetes",
      "creatinine_gt_2",
    ],
  },
  {
    key: "news2",
    name: "NEWS2",
    description: "National Early Warning Score 2.",
    required_fields: [
      "respiratory_rate",
      "oxygen_saturation",
      "systolic_bp",
      "heart_rate",
      "temperature_c",
      "alert",
      "on_supplemental_oxygen",
    ],
  },
  {
    key: "qsofa",
    name: "qSOFA",
    description: "Quick Sequential Organ Failure Assessment.",
    required_fields: ["respiratory_rate", "systolic_bp", "altered_mental_status"],
  },
  {
    key: "sofa_basic",
    name: "SOFA (Basic)",
    description: "Basic SOFA using common bedside variables.",
    required_fields: [
      "pao2_fio2",
      "platelets",
      "bilirubin_mg_dl",
      "map_mm_hg",
      "on_vasopressors",
      "gcs",
      "creatinine_umol_l",
      "urine_output_ml_day",
    ],
  },
  {
    key: "apfel_ponv",
    name: "Apfel PONV",
    description: "Postoperative nausea and vomiting risk score.",
    required_fields: ["female", "non_smoker", "history_ponv_motion_sickness", "postoperative_opioids"],
  },
  {
    key: "subjective_mets",
    name: "Subjective METs",
    description: "Self-reported functional capacity estimate (METs).",
    required_fields: ["subjective_mets"],
  },
  {
    key: "ariscat",
    name: "ARISCAT",
    description: "Postoperative pulmonary complication risk score.",
    required_fields: [
      "age",
      "oxygen_saturation",
      "respiratory_infection_last_month",
      "hemoglobin_g_dl",
      "ariscat_incision",
      "surgery_duration_hours",
      "emergency_surgery",
    ],
  },
  {
    key: "sort",
    name: "SORT",
    description: "Surgical Outcome Risk Tool for 30-day mortality.",
    required_fields: [
      "age",
      "asa_ps_class",
      "sort_urgency",
      "sort_high_risk_specialty",
      "sort_xmajor_complex",
      "sort_cancer",
    ],
  },
  {
    key: "gupta_mica",
    name: "Gupta MICA",
    description: "Gupta perioperative MI/cardiac arrest risk model.",
    required_fields: ["age", "asa_ps_class", "creatinine_umol_l", "mica_functional_status", "mica_surgery_type"],
  },
  {
    key: "nela_manual",
    name: "NELA (Manual)",
    description: "Manual entry of NELA 30-day mortality from official calculator.",
    required_fields: ["nela_30_day_mortality_percent"],
  },
  {
    key: "acs_nsqip_manual",
    name: "ACS NSQIP (Manual)",
    description: "Manual entry of ACS NSQIP predicted risks from official calculator.",
    required_fields: ["nsqip_mortality_percent", "nsqip_serious_complication_percent"],
  },
];

export const SCORE_MAP = Object.fromEntries(SCORE_DEFINITIONS.map((item) => [item.key, item]));

export const SCORE_EVIDENCE = {
  wilson: [{ label: "Wilson et al. difficult intubation predictor", url: "https://pubmed.ncbi.nlm.nih.gov/1888865/" }],
  stop_bang: [{ label: "Chung et al. STOP-BANG validation", url: "https://pubmed.ncbi.nlm.nih.gov/27507128/" }],
  rcri: [{ label: "Lee et al. RCRI derivation", url: "https://pubmed.ncbi.nlm.nih.gov/10477528/" }],
  news2: [{ label: "RCP NEWS2 overview", url: "https://www.rcp.ac.uk/improving-care/resources/national-early-warning-score-news-2/" }],
  qsofa: [
    { label: "Freund et al. qSOFA in ED patients", url: "https://pubmed.ncbi.nlm.nih.gov/28724125/" },
    { label: "Sepsis-3 definitions", url: "https://pubmed.ncbi.nlm.nih.gov/26903338/" },
  ],
  sofa_basic: [{ label: "Sepsis-3 / SOFA context", url: "https://pubmed.ncbi.nlm.nih.gov/26903338/" }],
  apfel_ponv: [{ label: "Apfel et al. simplified PONV risk score", url: "https://pubmed.ncbi.nlm.nih.gov/14739823/" }],
  subjective_mets: [{ label: "METS study: subjective vs objective functional capacity", url: "https://pubmed.ncbi.nlm.nih.gov/30070222/" }],
  ariscat: [{ label: "ARISCAT derivation", url: "https://pubmed.ncbi.nlm.nih.gov/21045639/" }],
  sort: [
    { label: "SORT derivation", url: "https://pubmed.ncbi.nlm.nih.gov/25388883/" },
    { label: "SORT external validation", url: "https://pubmed.ncbi.nlm.nih.gov/37588588/" },
  ],
  gupta_mica: [{ label: "Gupta MICA derivation", url: "https://pubmed.ncbi.nlm.nih.gov/21730309/" }],
  nela_manual: [{ label: "NELA parsimonious risk calculator", url: "https://data.nela.org.uk/Risk/" }],
  acs_nsqip_manual: [{ label: "ACS NSQIP Surgical Risk Calculator", url: "https://riskcalculator.facs.org/RiskCalculator/" }],
};

export const MANUAL_CALCULATOR_LINKS = {
  nela_manual: { label: "Open NELA Risk Calculator", url: "https://data.nela.org.uk/Risk/" },
  acs_nsqip_manual: { label: "Open ACS NSQIP Risk Calculator", url: "https://riskcalculator.facs.org/RiskCalculator/" },
};

export const CASE_RISK_SCORE_BUNDLE = [
  "gupta_mica",
  "ariscat",
  "sort",
  "nela_manual",
  "acs_nsqip_manual",
];

export const REGIONAL_SUGGESTIONS = [
  {
    key: "shoulder",
    label: "Shoulder",
    primary: ["Interscalene block"],
    alternatives: ["Supraclavicular block"],
    caution: "Phrenic nerve palsy risk is relevant for interscalene techniques.",
  },
  {
    key: "clavicle",
    label: "Clavicle",
    primary: ["Interscalene or superior trunk block + superficial cervical plexus"],
    alternatives: ["Clavipectoral fascial plane block (adjunct)"],
    caution: "Coverage can be mixed; surgical infiltration is often still required.",
  },
  {
    key: "upper_arm_humerus",
    label: "Upper Arm / Humerus",
    primary: ["Supraclavicular block"],
    alternatives: ["Infraclavicular block"],
    caution: "Proximal humeral work may need supplemental shoulder-region coverage.",
  },
  {
    key: "elbow_forearm",
    label: "Elbow / Forearm",
    primary: ["Supraclavicular block"],
    alternatives: ["Infraclavicular block", "Axillary block"],
    caution: "Tourniquet pain may need supplementation.",
  },
  {
    key: "wrist_hand",
    label: "Wrist / Hand",
    primary: ["Axillary block", "Distal forearm nerve blocks"],
    alternatives: ["Infraclavicular block"],
    caution: "Selective distal blocks can preserve proximal motor function.",
  },
  {
    key: "breast_axilla",
    label: "Breast / Axilla",
    primary: ["PECS II block", "Paravertebral block"],
    alternatives: ["Erector spinae plane (ESP) block"],
    caution: "Axillary procedures may require additional intercostobrachial coverage.",
  },
  {
    key: "chest_wall",
    label: "Chest Wall",
    primary: ["Thoracic epidural", "Paravertebral block"],
    alternatives: ["Serratus anterior plane block", "ESP block"],
    caution: "Choose unilateral vs bilateral approach based on incision pattern.",
  },
  {
    key: "thoracic_abdomen",
    label: "Thoracic Abdomen",
    primary: ["Thoracic epidural"],
    alternatives: ["Subcostal TAP block", "Quadratus lumborum block", "ESP block"],
    caution: "Extent of spread can be variable with fascial plane techniques.",
  },
  {
    key: "lower_abdomen",
    label: "Lower Abdomen",
    primary: ["Spinal anaesthesia", "TAP block"],
    alternatives: ["Ilioinguinal/iliohypogastric block", "Quadratus lumborum block"],
    caution: "Visceral pain may not be fully covered by abdominal wall blocks alone.",
  },
  {
    key: "inguinal_groin",
    label: "Inguinal / Groin",
    primary: ["Ilioinguinal/iliohypogastric block"],
    alternatives: ["Transversalis fascia plane block", "Spinal anaesthesia"],
    caution: "Variable genital branch involvement may require local infiltration.",
  },
  {
    key: "hip",
    label: "Hip",
    primary: ["Spinal anaesthesia", "Fascia iliaca block (analgesic)"],
    alternatives: ["PENG block (analgesic)", "Lumbar plexus block (selected cases)"],
    caution: "Hip surgery often needs neuraxial or general anaesthesia plus analgesic blocks.",
  },
  {
    key: "knee",
    label: "Knee",
    primary: ["Adductor canal block + IPACK"],
    alternatives: ["Femoral nerve block", "Sciatic block for posterior work"],
    caution: "Motor-sparing approaches are often preferred for early mobilisation.",
  },
  {
    key: "lower_leg",
    label: "Lower Leg",
    primary: ["Popliteal sciatic + saphenous block"],
    alternatives: ["Adductor canal + sciatic variants"],
    caution: "Confirm saphenous territory coverage for medial incisions.",
  },
  {
    key: "ankle_foot",
    label: "Ankle / Foot",
    primary: ["Ankle block", "Popliteal sciatic + saphenous block"],
    alternatives: ["Selective distal nerve blocks"],
    caution: "Ankle blocks are useful when proximal motor block is undesirable.",
  },
  {
    key: "spine_surgery",
    label: "Spine Surgery",
    primary: ["ESP block (thoracic/lumbar levels)", "Wound infiltration catheters"],
    alternatives: ["Paravertebral techniques in selected thoracic cases"],
    caution: "Usually adjunct analgesia rather than sole anaesthetic technique.",
  },
];

export const ANTICOAG_GUIDANCE_LINKS = {
  summary_page:
    "https://anaesthetists.org/Guidelines-and-publications/Guidelines/Regional-anaesthesia-and-patients-with-abnormalities-of-coagulation",
  pdf_mirror:
    "https://www.anaesthetists.org/Portals/0/PDFs/Guidelines%20PDFs/Guideline_regional_anaesthesia_patients_abnormalities_coagulation_2013_final.pdf",
};

export const ANTICOAG_PROCEDURE_OPTIONS = [
  { value: "neuraxial", label: "Spinal / epidural (neuraxial)" },
  { value: "deep", label: "Deep peripheral / non-compressible block" },
  { value: "superficial", label: "Superficial / compressible peripheral block" },
];

export const ANTICOAG_DRUG_OPTIONS = [
  {
    id: "ufh_sc_prophylaxis",
    group: "Heparins",
    label: "UFH SC prophylaxis",
    minBeforeHours: 4,
    minBeforeText: "4 h or normal APTT ratio",
    requiresNormalAptt: true,
    catheterPolicy: "caution",
    nextDoseText: "1 h after block performance or catheter removal",
  },
  {
    id: "ufh_iv_treatment",
    group: "Heparins",
    label: "UFH IV treatment",
    minBeforeHours: 4,
    minBeforeText: "4 h or normal APTT ratio",
    requiresNormalAptt: true,
    catheterPolicy: "caution",
    nextDoseText: "4 h after block performance or catheter removal",
  },
  {
    id: "lmwh_sc_prophylaxis",
    group: "Heparins",
    label: "LMWH SC prophylaxis",
    minBeforeHours: 12,
    minBeforeText: "12 h",
    catheterPolicy: "caution",
    nextDoseText: "4 h after block performance or catheter removal",
  },
  {
    id: "lmwh_sc_treatment",
    group: "Heparins",
    label: "LMWH SC treatment",
    minBeforeHours: 24,
    minBeforeText: "24 h",
    catheterPolicy: "not_recommended",
    nextDoseText: "4 h after block/catheter removal (consider 24 h if traumatic puncture)",
  },
  {
    id: "fondaparinux_prophylaxis",
    group: "Heparin alternatives",
    label: "Fondaparinux prophylaxis",
    minBeforeHours: 42,
    minBeforeText: "36-42 h (consider anti-Xa)",
    catheterPolicy: "not_recommended",
    nextDoseText: "6-12 h after block/catheter removal",
  },
  {
    id: "fondaparinux_treatment",
    group: "Heparin alternatives",
    label: "Fondaparinux treatment",
    avoidNeuraxialDeep: true,
    minBeforeText: "Avoid for neuraxial/deep blocks (consider anti-Xa)",
    catheterPolicy: "not_recommended",
    nextDoseText: "12 h after block/catheter removal",
  },
  {
    id: "argatroban",
    group: "Heparin alternatives",
    label: "Argatroban",
    minBeforeHours: 4,
    minBeforeText: "4 h or normal APTT ratio",
    requiresNormalAptt: true,
    catheterPolicy: "not_recommended",
    nextDoseText: "6 h after block/catheter removal",
  },
  {
    id: "bivalirudin",
    group: "Heparin alternatives",
    label: "Bivalirudin",
    minBeforeHours: 10,
    minBeforeText: "10 h or normal APTT ratio",
    requiresNormalAptt: true,
    catheterPolicy: "not_recommended",
    nextDoseText: "6 h after block/catheter removal",
  },
  {
    id: "aspirin",
    group: "Antiplatelets",
    label: "Aspirin",
    noAdditionalPrecautions: true,
    minBeforeText: "No additional precautions",
    catheterPolicy: "no_additional_precautions",
    nextDoseText: "No additional precautions",
  },
  {
    id: "nsaids",
    group: "Antiplatelets",
    label: "NSAIDs",
    noAdditionalPrecautions: true,
    minBeforeText: "No additional precautions",
    catheterPolicy: "no_additional_precautions",
    nextDoseText: "No additional precautions",
  },
  {
    id: "clopidogrel",
    group: "Antiplatelets",
    label: "Clopidogrel",
    minBeforeHours: 168,
    minBeforeText: "7 days",
    catheterPolicy: "not_recommended",
    nextDoseText: "6 h after block/catheter removal",
  },
  {
    id: "prasugrel",
    group: "Antiplatelets",
    label: "Prasugrel",
    minBeforeHours: 168,
    minBeforeText: "7 days",
    catheterPolicy: "not_recommended",
    nextDoseText: "6 h after block/catheter removal",
  },
  {
    id: "ticagrelor",
    group: "Antiplatelets",
    label: "Ticagrelor",
    minBeforeHours: 120,
    minBeforeText: "5 days",
    catheterPolicy: "not_recommended",
    nextDoseText: "6 h after block/catheter removal",
  },
  {
    id: "warfarin",
    group: "Oral anticoagulants",
    label: "Warfarin",
    requiresInrLe: 1.4,
    minBeforeText: "INR <= 1.4 (typically 3-5 days after stopping)",
    catheterPolicy: "not_recommended",
    nextDoseText: "After catheter removal",
  },
  {
    id: "rivaroxaban_prophylaxis",
    group: "Oral anticoagulants",
    label: "Rivaroxaban prophylaxis (CrCl > 30)",
    minBeforeHours: 18,
    minBeforeText: "18 h",
    catheterPolicy: "not_recommended",
    nextDoseText: "6 h after block/catheter removal",
  },
  {
    id: "rivaroxaban_treatment",
    group: "Oral anticoagulants",
    label: "Rivaroxaban treatment (CrCl > 30)",
    minBeforeHours: 48,
    minBeforeText: "48 h",
    catheterPolicy: "not_recommended",
    nextDoseText: "6 h after block/catheter removal",
  },
  {
    id: "dabigatran_crcl_gt_80",
    group: "Oral anticoagulants",
    label: "Dabigatran (CrCl > 80)",
    minBeforeHours: 48,
    minBeforeText: "48 h",
    catheterPolicy: "not_recommended",
    nextDoseText: "6 h after block/catheter removal",
  },
  {
    id: "dabigatran_crcl_50_80",
    group: "Oral anticoagulants",
    label: "Dabigatran (CrCl 50-80)",
    minBeforeHours: 72,
    minBeforeText: "72 h",
    catheterPolicy: "not_recommended",
    nextDoseText: "6 h after block/catheter removal",
  },
  {
    id: "dabigatran_crcl_30_50",
    group: "Oral anticoagulants",
    label: "Dabigatran (CrCl 30-50)",
    minBeforeHours: 96,
    minBeforeText: "96 h",
    catheterPolicy: "not_recommended",
    nextDoseText: "6 h after block/catheter removal",
  },
  {
    id: "apixaban_prophylaxis",
    group: "Oral anticoagulants",
    label: "Apixaban prophylaxis",
    minBeforeHours: 48,
    minBeforeText: "24-48 h",
    catheterPolicy: "not_recommended",
    nextDoseText: "6 h after block/catheter removal",
  },
  {
    id: "thrombolytics",
    group: "Thrombolytics",
    label: "Thrombolytics (alteplase/anistreplase/reteplase/streptokinase)",
    minBeforeHours: 240,
    minBeforeText: "10 days",
    catheterPolicy: "not_recommended",
    nextDoseText: "10 days after block/catheter removal",
  },
];

export const DIABETES_GUIDANCE_LINKS = {
  page: "https://cpoc.org.uk/guidelines-and-resources/guidelines/guideline-diabetes",
  pdf: "https://www.cpoc.org.uk/sites/cpoc/files/documents/2024-03/CPOC-DiabetesGuideline2023.pdf",
};

export const DIABETES_SURGERY_TIMING_OPTIONS = [
  { value: "am", label: "AM surgery list" },
  { value: "pm", label: "PM surgery list" },
];

export const DIABETES_MEDICATION_RULES = [
  {
    key: "metformin",
    label: "Metformin",
    dayBefore: "Take as normal.",
    dayOfAm: "If once or twice daily, take as normal. If three times daily, omit lunchtime dose.",
    dayOfPm: "If once or twice daily, take as normal. If three times daily, omit lunchtime dose.",
    extra:
      "If contrast is planned and eGFR <60 mL/min/1.73m2, omit on procedure day and withhold for 48 h after.",
  },
  {
    key: "sulphonylurea",
    label: "Sulphonylurea (e.g. gliclazide)",
    dayBefore: "Take as normal.",
    dayOfAm: "Omit morning dose. If normally twice daily, evening dose can be given if eating.",
    dayOfPm: "Do not take on day of surgery.",
    extra: "Higher hypoglycaemia risk in fasting patients.",
  },
  {
    key: "pioglitazone",
    label: "Pioglitazone",
    dayBefore: "Take as normal.",
    dayOfAm: "Take as normal.",
    dayOfPm: "Take as normal.",
    extra: "",
  },
  {
    key: "dpp4",
    label: "DPP-4 inhibitor (e.g. sitagliptin)",
    dayBefore: "Take as normal.",
    dayOfAm: "Take as normal.",
    dayOfPm: "Take as normal.",
    extra: "",
  },
  {
    key: "glp1",
    label: "GLP-1 receptor agonist (daily/weekly)",
    dayBefore: "Take as normal.",
    dayOfAm: "Take as normal.",
    dayOfPm: "Take as normal.",
    extra:
      "CPOC committee advice is to continue; consider aspiration precautions per local airway policy.",
  },
  {
    key: "sglt2",
    label: "SGLT2 inhibitor (e.g. dapagliflozin/empagliflozin)",
    dayBefore: "Omit on day before surgery.",
    dayOfAm: "Omit on day of surgery.",
    dayOfPm: "Omit on day of surgery.",
    extra: "Check ketones daily while omitted and restart when clinically stable and eating.",
  },
];

export const LOCAL_ANAESTHETIC_GUIDANCE_LINKS = {
  bupivacaine: "https://www.medicines.org.uk/emc/product/11611/smpc",
  levobupivacaine: "https://www.medicines.org.uk/emc/product/13642/smpc",
  supporting_weight_table:
    "https://rightdecisions.scot.nhs.uk/tam-treatments-and-medicines-nhs-highland/adult-therapeutic-guidelines/anaesthesia/local-anaesthesia/",
};

export const LOCAL_ANAESTHETIC_WEIGHT_MODES = [
  { value: "actual", label: "Actual body weight" },
  { value: "ibw", label: "Ideal body weight (IBW)" },
  { value: "lbw", label: "Lean body weight (LBW)" },
  { value: "custom", label: "Custom weight" },
];

export const LOCAL_ANAESTHETIC_LIMITS = [
  {
    key: "lidocaine_plain",
    label: "Lidocaine (plain)",
    mgPerKg: 3,
    maxMg: 300,
    commonConcentrationMgMl: 10,
    concentrationLabel: "1% (10 mg/mL)",
    note: "Local institutional rule: 3 mg/kg up to 300 mg without vasoconstrictor.",
  },
  {
    key: "lidocaine_adrenaline",
    label: "Lidocaine + adrenaline",
    mgPerKg: 7,
    maxMg: 500,
    commonConcentrationMgMl: 10,
    concentrationLabel: "1% (10 mg/mL)",
    note: "From SmPC: 7 mg/kg up to 500 mg with vasoconstrictor.",
  },
  {
    key: "bupivacaine",
    label: "Bupivacaine",
    mgPerKg: 2,
    maxMg: 150,
    commonConcentrationMgMl: 5,
    concentrationLabel: "0.5% (5 mg/mL)",
    note: "From SmPC: do not exceed 2 mg/kg in any 4-hour period; single dose usually up to 150 mg.",
  },
  {
    key: "levobupivacaine",
    label: "Levobupivacaine",
    mgPerKg: 2,
    maxMg: 150,
    commonConcentrationMgMl: 5,
    concentrationLabel: "0.5% (5 mg/mL)",
    note: "Common UK practice uses about 2 mg/kg; SmPC also caps single dose at 150 mg.",
  },
  {
    key: "prilocaine",
    label: "Prilocaine",
    mgPerKg: 5,
    maxMg: 400,
    commonConcentrationMgMl: 10,
    concentrationLabel: "1% (10 mg/mL)",
    note: "Adult SmPC cap is 400 mg. Weight-based 5 mg/kg is a conservative practical rule.",
  },
];

export const NUMERIC_INPUTS = {
  respiratory_rate: { label: "Respiratory rate", min: 0, max: 80, default: 18, step: 1, kind: "int" },
  oxygen_saturation: { label: "Oxygen saturation (%)", min: 0, max: 100, default: 98, step: 1, kind: "int" },
  systolic_bp: { label: "Systolic BP (mmHg)", min: 0, max: 400, default: 120, step: 1, kind: "int" },
  heart_rate: { label: "Heart rate", min: 0, max: 300, default: 80, step: 1, kind: "int" },
  temperature_c: { label: "Temperature (C)", min: 25, max: 45, default: 36.8, step: 0.1, kind: "float" },
  mouth_opening_cm: { label: "Mouth opening (cm)", min: 0, max: 10, default: 4, step: 0.1, kind: "float" },
  thyromental_distance_cm: { label: "Thyromental distance (cm)", min: 0, max: 20, default: 7, step: 0.1, kind: "float" },
  mallampati_class: { label: "Mallampati class", min: 1, max: 4, default: 2, step: 1, kind: "int" },
  bmi: { label: "BMI", min: 0, max: 100, default: 27, step: 0.1, kind: "float" },
  age: { label: "Age", min: 0, max: 130, default: 45, step: 1, kind: "int" },
  subjective_mets: { label: "Subjective METs", min: 0, max: 20, default: 4, step: 0.5, kind: "float" },
  neck_circumference_cm: { label: "Neck circumference (cm)", min: 0, max: 100, default: 38, step: 0.1, kind: "float" },
  pao2_fio2: { label: "PaO2/FiO2", min: 0, max: 1000, default: 380, step: 1, kind: "float" },
  platelets: { label: "Platelets", min: 0, max: 1500, default: 220, step: 1, kind: "int" },
  hemoglobin_g_dl: { label: "Haemoglobin (g/dL)", min: 3, max: 25, default: 13.2, step: 0.1, kind: "float" },
  bilirubin_mg_dl: { label: "Bilirubin (mg/dL)", min: 0, max: 80, default: 0.8, step: 0.1, kind: "float" },
  map_mm_hg: { label: "MAP (mmHg)", min: 0, max: 250, default: 82, step: 1, kind: "float" },
  gcs: { label: "GCS", min: 3, max: 15, default: 15, step: 1, kind: "int" },
  creatinine_umol_l: { label: "Creatinine (umol/L)", min: 0, max: 2000, default: 80, step: 1, kind: "float" },
  urine_output_ml_day: { label: "Urine output (ml/day)", min: 0, max: 10000, default: 1400, step: 10, kind: "int" },
  surgery_duration_hours: { label: "Surgery duration (hours)", min: 0, max: 24, default: 2, step: 0.1, kind: "float" },
  nela_30_day_mortality_percent: { label: "NELA 30-day mortality (%)", min: 0, max: 100, default: 5, step: 0.1, kind: "float" },
  nsqip_mortality_percent: { label: "NSQIP mortality risk (%)", min: 0, max: 100, default: 1, step: 0.1, kind: "float" },
  nsqip_serious_complication_percent: { label: "NSQIP serious complication risk (%)", min: 0, max: 100, default: 8, step: 0.1, kind: "float" },
};

export const BOOLEAN_INPUTS = {
  alert: { label: "Alert", default: true },
  altered_mental_status: { label: "Altered mental status", default: false },
  on_supplemental_oxygen: { label: "Supplemental oxygen", default: false },
  neck_mobility_limited: { label: "Neck mobility limited", default: false },
  jaw_protrusion_limited: { label: "Jaw protrusion limited", default: false },
  snoring: { label: "Snoring", default: false },
  tiredness: { label: "Tiredness", default: false },
  observed_apnea: { label: "Observed apnea", default: false },
  high_blood_pressure: { label: "High blood pressure", default: false },
  respiratory_infection_last_month: { label: "Respiratory infection in last month", default: false },
  emergency_surgery: { label: "Emergency surgery", default: false },
  male: { label: "Male", default: true },
  high_risk_surgery: { label: "High-risk surgery", default: false },
  sort_high_risk_specialty: { label: "SORT high-risk specialty", default: false },
  sort_xmajor_complex: { label: "SORT Xmajor/complex surgery", default: false },
  sort_cancer: { label: "SORT active cancer", default: false },
  ischemic_heart_disease: { label: "Ischemic heart disease", default: false },
  congestive_heart_failure: { label: "Congestive heart failure", default: false },
  cerebrovascular_disease: { label: "Cerebrovascular disease", default: false },
  insulin_therapy_diabetes: { label: "Insulin therapy diabetes", default: false },
  creatinine_gt_2: { label: "Creatinine > 176.8 umol/L", default: false },
  on_vasopressors: { label: "On vasopressors", default: false },
  female: { label: "Female", default: false },
  non_smoker: { label: "Non-smoker", default: true },
  history_ponv_motion_sickness: { label: "Hx PONV/motion sickness", default: false },
  postoperative_opioids: { label: "Postop opioids", default: false },
};

export const CHOICE_INPUTS = {
  asa_ps_class: {
    label: "ASA-PS class",
    default: 2,
    options: [
      { value: 1, label: "ASA I" },
      { value: 2, label: "ASA II" },
      { value: 3, label: "ASA III" },
      { value: 4, label: "ASA IV" },
      { value: 5, label: "ASA V" },
    ],
  },
  sort_urgency: {
    label: "SORT urgency",
    default: "elective",
    options: [
      { value: "elective", label: "Elective" },
      { value: "expedited", label: "Expedited" },
      { value: "urgent", label: "Urgent" },
      { value: "immediate", label: "Immediate" },
    ],
  },
  ariscat_incision: {
    label: "ARISCAT incision type",
    default: "peripheral",
    options: [
      { value: "peripheral", label: "Peripheral" },
      { value: "upper_abdominal", label: "Upper abdominal" },
      { value: "intrathoracic", label: "Intrathoracic" },
    ],
  },
  mica_functional_status: {
    label: "Gupta functional status",
    default: "independent",
    options: [
      { value: "independent", label: "Independent" },
      { value: "partially_dependent", label: "Partially dependent" },
      { value: "totally_dependent", label: "Totally dependent" },
    ],
  },
  mica_surgery_type: {
    label: "Gupta surgery type",
    default: "hernia",
    options: [
      { value: "hernia", label: "Hernia" },
      { value: "anorectal", label: "Anorectal" },
      { value: "aortic", label: "Aortic" },
      { value: "bariatric", label: "Bariatric / oesophageal / adrenal / splenic" },
      { value: "brain", label: "Brain" },
      { value: "breast", label: "Breast" },
      { value: "cardiac", label: "Cardiac" },
      { value: "ent", label: "ENT" },
      { value: "foregut_hpb", label: "Foregut / hepato-pancreato-biliary" },
      { value: "gallbladder_appendix_adrenal_spleen", label: "Gallbladder / appendix / adrenal / spleen" },
      { value: "intestinal", label: "Intestinal" },
      { value: "neck", label: "Neck" },
      { value: "obgyn", label: "Obstetric / gynaecologic" },
      { value: "orthopedic", label: "Orthopedic" },
      { value: "other_abdominal", label: "Other abdominal" },
      { value: "peripheral_vascular", label: "Peripheral vascular" },
      { value: "skin", label: "Skin" },
      { value: "spine", label: "Spine" },
      { value: "thoracic_non_esophageal_non_cardiac", label: "Thoracic (non-cardiac, non-oesophageal)" },
      { value: "vein", label: "Vein" },
      { value: "urology", label: "Urology" },
    ],
  },
};

export function fieldLabel(field) {
  if (NUMERIC_INPUTS[field]) return NUMERIC_INPUTS[field].label;
  if (BOOLEAN_INPUTS[field]) return BOOLEAN_INPUTS[field].label;
  if (CHOICE_INPUTS[field]) return CHOICE_INPUTS[field].label;
  return field.replaceAll("_", " ");
}

export function buildInitialValues() {
  const values = {};
  Object.entries(NUMERIC_INPUTS).forEach(([k, cfg]) => {
    values[k] = cfg.default;
  });
  Object.entries(BOOLEAN_INPUTS).forEach(([k, cfg]) => {
    values[k] = cfg.default;
  });
  Object.entries(CHOICE_INPUTS).forEach(([k, cfg]) => {
    values[k] = cfg.default;
  });
  return values;
}

export function buildInitialUnavailable() {
  const unavailable = {};
  Object.keys(NUMERIC_INPUTS).forEach((k) => {
    unavailable[k] = false;
  });
  return unavailable;
}

function roundTo(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function computeCaseBasics({
  age,
  height_cm,
  weight_kg,
  sex_at_birth,
  pregnant,
  gestation_weeks,
}) {
  const safeAge = Number.isFinite(age) ? age : 0;
  const safeHeightCm = Number.isFinite(height_cm) ? height_cm : 170;
  const safeWeightKg = Number.isFinite(weight_kg) ? weight_kg : 75;
  const safeGestationWeeks = Number.isFinite(gestation_weeks) ? gestation_weeks : 0;
  const isPregnant = Boolean(pregnant);
  const height_m = Math.max(safeHeightCm, 1) / 100;
  const bmi = safeWeightKg / (height_m ** 2);

  const isMale = sex_at_birth === "male";
  const ibw = isMale
    ? 50 + 0.9 * (safeHeightCm - 152)
    : 45.5 + 0.9 * (safeHeightCm - 152);

  const lbw = isMale
    ? (9270 * safeWeightKg) / (6680 + 216 * bmi)
    : (9270 * safeWeightKg) / (8780 + 244 * bmi);

  const tidal6 = 6 * ibw;
  const tidal7 = 7 * ibw;
  const tidal8 = 8 * ibw;

  const bloodVolumeLiters = isMale
    ? 0.3669 * (height_m ** 3) + 0.03219 * safeWeightKg + 0.6041
    : 0.3561 * (height_m ** 3) + 0.03308 * safeWeightKg + 0.1833;
  const bloodVolumeMl = bloodVolumeLiters * 1000;

  const bmiAdjustedMlPerKg = isMale
    ? bmi >= 40 ? 55 : bmi >= 30 ? 60 : bmi >= 25 ? 65 : 70
    : bmi >= 40 ? 50 : bmi >= 30 ? 55 : bmi >= 25 ? 60 : 65;
  const bmiAdjustedBloodVolumeMl = bmiAdjustedMlPerKg * safeWeightKg;

  let pregnancyMultiplier = 1.0;
  if (isPregnant && !isMale) {
    if (safeGestationWeeks >= 35) pregnancyMultiplier = 1.5;
    else if (safeGestationWeeks >= 29) pregnancyMultiplier = 1.45;
    else if (safeGestationWeeks >= 21) pregnancyMultiplier = 1.35;
    else if (safeGestationWeeks >= 13) pregnancyMultiplier = 1.2;
    else if (safeGestationWeeks >= 6) pregnancyMultiplier = 1.1;
  }
  const pregnancyAdjustedBloodVolumeMl = bloodVolumeMl * pregnancyMultiplier;

  return {
    demographics: {
      age: Number.parseInt(safeAge, 10),
      height_cm: roundTo(safeHeightCm, 1),
      weight_kg: roundTo(safeWeightKg, 1),
      sex_at_birth,
      pregnant: isPregnant,
      gestation_weeks: roundTo(safeGestationWeeks, 1),
    },
    bmi: roundTo(bmi, 1),
    ideal_body_weight_kg: roundTo(ibw, 1),
    lean_body_weight_kg: roundTo(lbw, 1),
    ideal_tidal_volume_ml: {
      low_6_ml_per_kg: roundTo(tidal6, 0),
      target_7_ml_per_kg: roundTo(tidal7, 0),
      high_8_ml_per_kg: roundTo(tidal8, 0),
    },
    estimated_blood_volume_ml: roundTo(bloodVolumeMl, 0),
    estimated_blood_volume_l: roundTo(bloodVolumeLiters, 2),
    bmi_adjusted_blood_volume_ml: roundTo(bmiAdjustedBloodVolumeMl, 0),
    bmi_adjusted_blood_volume_l: roundTo(bmiAdjustedBloodVolumeMl / 1000, 2),
    bmi_adjusted_ml_per_kg: roundTo(bmiAdjustedMlPerKg, 1),
    pregnancy_adjusted_blood_volume_ml: roundTo(pregnancyAdjustedBloodVolumeMl, 0),
    pregnancy_adjusted_blood_volume_l: roundTo(pregnancyAdjustedBloodVolumeMl / 1000, 2),
    pregnancy_multiplier: roundTo(pregnancyMultiplier, 2),
  };
}

const ANTICOAG_OPTION_MAP = Object.fromEntries(ANTICOAG_DRUG_OPTIONS.map((item) => [item.id, item]));
const ANTICOAG_PROCEDURE_LABELS = Object.fromEntries(ANTICOAG_PROCEDURE_OPTIONS.map((item) => [item.value, item.label]));

export function computeAnticoagSafety({
  entryId,
  procedureRisk,
  hoursSinceLastDose,
  inr,
  apttNormal,
  catheterInSitu,
  traumaticPuncture,
}) {
  const entry = ANTICOAG_OPTION_MAP[entryId] ?? null;
  if (!entry) {
    return {
      status: "caution",
      headline: "Select an anticoagulant regimen to assess timing.",
      beforeBlockMessage: "",
      catheterMessage: "",
      nextDoseMessage: "",
      procedureMessage: "",
      chartNote: "",
    };
  }

  const safeHours = Number.isFinite(hoursSinceLastDose) ? hoursSinceLastDose : 0;
  const safeInr = Number.isFinite(inr) ? inr : null;
  const highRiskProcedure = procedureRisk !== "superficial";

  let readyForBlock = true;
  if (entry.avoidNeuraxialDeep && highRiskProcedure) {
    readyForBlock = false;
  } else if (entry.noAdditionalPrecautions) {
    readyForBlock = true;
  } else if (typeof entry.requiresInrLe === "number") {
    readyForBlock = safeInr !== null && safeInr <= entry.requiresInrLe;
  } else if (entry.requiresNormalAptt) {
    readyForBlock = safeHours >= (entry.minBeforeHours ?? 0) || Boolean(apttNormal);
  } else if (typeof entry.minBeforeHours === "number") {
    readyForBlock = safeHours >= entry.minBeforeHours;
  }

  let status = "ready";
  let headline = "Timing appears compatible with guidance.";
  if (entry.avoidNeuraxialDeep && highRiskProcedure) {
    status = "avoid";
    headline = "Guidance advises avoiding neuraxial/deep block with this regimen.";
  } else if (highRiskProcedure && !readyForBlock) {
    status = "wait";
    headline = "Not yet within suggested timing for neuraxial/deep block.";
  } else if (!highRiskProcedure) {
    status = "caution";
    headline = "Superficial/compressible block context: lower relative bleeding risk.";
  }

  let beforeBlockMessage = `Minimum pre-block interval: ${entry.minBeforeText}.`;
  if (entry.noAdditionalPrecautions) {
    beforeBlockMessage = "No additional pre-block delay is listed for this drug.";
  } else if (typeof entry.requiresInrLe === "number") {
    beforeBlockMessage = `INR requirement: <= ${entry.requiresInrLe}. Current INR: ${
      safeInr === null ? "not entered" : safeInr
    }.`;
  } else if (entry.requiresNormalAptt) {
    const apttText = apttNormal ? "APTT marked normal." : "APTT not marked normal.";
    beforeBlockMessage = `${entry.minBeforeText}. Time since dose: ${roundTo(safeHours, 1)} h. ${apttText}`;
  } else if (typeof entry.minBeforeHours === "number") {
    const remaining = Math.max(entry.minBeforeHours - safeHours, 0);
    beforeBlockMessage = `${entry.minBeforeText}. Time since dose: ${roundTo(safeHours, 1)} h${
      remaining > 0 ? ` (about ${roundTo(remaining, 1)} h remaining)` : ""
    }.`;
  }

  const catheterTextMap = {
    no_additional_precautions: "No additional catheter precautions listed.",
    caution: "Use caution with neuraxial catheter in situ.",
    not_recommended: "Not recommended while neuraxial catheter is in situ.",
    avoid: "Avoid with neuraxial catheter techniques.",
  };
  const catheterMessage = catheterInSitu
    ? `Catheter in situ: ${catheterTextMap[entry.catheterPolicy] ?? "Check full guidance."}`
    : `If catheter is in situ: ${catheterTextMap[entry.catheterPolicy] ?? "Check full guidance."}`;

  let nextDoseMessage = `Next dose guidance: ${entry.nextDoseText}.`;
  if (entry.id === "lmwh_sc_treatment" && traumaticPuncture) {
    nextDoseMessage =
      "Next dose guidance: 24 h delay after traumatic puncture is advised (instead of the standard 4 h).";
  }

  const procedureMessageMap = {
    neuraxial: "Neuraxial blocks are high consequence for bleeding complications.",
    deep: "Deep/non-compressible peripheral blocks are in the higher-risk category in UK guidance.",
    superficial:
      "Superficial/compressible blocks are lower relative risk in UK guidance; use individual judgement and document rationale.",
  };
  const procedureMessage = procedureMessageMap[procedureRisk] ?? "";
  const chartNote = [
    `Anticoagulation check: ${entry.label}.`,
    `Procedure: ${ANTICOAG_PROCEDURE_LABELS[procedureRisk] ?? procedureRisk}.`,
    beforeBlockMessage,
    catheterMessage,
    nextDoseMessage,
  ].join(" ");

  return {
    status,
    headline,
    beforeBlockMessage,
    catheterMessage,
    nextDoseMessage,
    procedureMessage,
    chartNote,
  };
}

const DIABETES_RULE_MAP = Object.fromEntries(DIABETES_MEDICATION_RULES.map((item) => [item.key, item]));

export function computeDiabetesMedicationAdvice({
  medicationKey,
  surgeryTiming,
  contrastPlanned,
  egfrMlMin,
  eatingByEvening,
}) {
  const rule = DIABETES_RULE_MAP[medicationKey] ?? null;
  if (!rule) {
    return {
      headline: "Select a diabetes medication class.",
      action: "",
      dayBefore: "",
      notes: [],
      chartNote: "",
    };
  }

  const timing = surgeryTiming === "pm" ? "pm" : "am";
  const action = timing === "pm" ? rule.dayOfPm : rule.dayOfAm;
  const safeEgfr = Number.isFinite(egfrMlMin) ? egfrMlMin : null;
  const notes = [];

  if (rule.extra) notes.push(rule.extra);
  if (rule.key === "metformin" && contrastPlanned && safeEgfr !== null && safeEgfr < 60) {
    notes.push("Contrast + eGFR <60: withhold metformin on day of procedure and for 48 h afterwards.");
  }
  if (rule.key === "sulphonylurea" && timing === "am" && eatingByEvening) {
    notes.push("If eating by evening, usual evening sulphonylurea dose can be resumed.");
  }
  if (rule.key === "sglt2") {
    notes.push("Document perioperative ketosis surveillance while SGLT2 inhibitor is withheld.");
  }

  const chartNote = [
    `Diabetes medication plan (${rule.label}).`,
    `Day before: ${rule.dayBefore}`,
    `Day of surgery (${timing.toUpperCase()} list): ${action}`,
    ...notes,
  ].join(" ");

  return {
    headline: `${rule.label} recommendation`,
    action,
    dayBefore: rule.dayBefore,
    notes,
    chartNote,
  };
}

export function computeLocalAnaestheticMaximums(weightKg) {
  const safeWeight = Number.isFinite(weightKg) ? Math.max(weightKg, 1) : 1;
  return LOCAL_ANAESTHETIC_LIMITS.map((drug) => {
    const weightBasedMg = safeWeight * drug.mgPerKg;
    const maxRecommendedMg = Math.min(weightBasedMg, drug.maxMg);
    const maxVolumeMl = maxRecommendedMg / drug.commonConcentrationMgMl;
    return {
      ...drug,
      weightKg: roundTo(safeWeight, 1),
      weightBasedMg: roundTo(weightBasedMg, 1),
      maxRecommendedMg: roundTo(maxRecommendedMg, 1),
      maxVolumeMlAtCommonConcentration: roundTo(maxVolumeMl, 1),
    };
  });
}

function computeWilson(i) {
  let points = 0;
  if (i.mouth_opening_cm < 3.0) points += 2;
  else if (i.mouth_opening_cm < 4.0) points += 1;
  if (i.thyromental_distance_cm < 6.0) points += 2;
  else if (i.thyromental_distance_cm < 6.5) points += 1;
  points += Math.max(i.mallampati_class - 1, 0);
  points += i.neck_mobility_limited ? 1 : 0;
  points += i.jaw_protrusion_limited ? 1 : 0;
  const interpretation = points >= 4 ? "high risk airway" : points >= 2 ? "moderate risk airway" : "low risk airway";
  return {
    score: "wilson",
    value: points,
    interpretation,
    risk_estimate: "No universally calibrated % difficult-intubation risk is available for each Wilson score point.",
    clinical_note: "Use this as an airway planning prompt; combine with full airway assessment and context.",
  };
}

function computeStopBang(i) {
  let points = 0;
  points += i.snoring ? 1 : 0;
  points += i.tiredness ? 1 : 0;
  points += i.observed_apnea ? 1 : 0;
  points += i.high_blood_pressure ? 1 : 0;
  points += i.bmi > 35 ? 1 : 0;
  points += i.age > 50 ? 1 : 0;
  points += i.neck_circumference_cm > 40 ? 1 : 0;
  points += i.male ? 1 : 0;
  const interpretation = points >= 5 ? "high OSA risk" : points >= 3 ? "intermediate OSA risk" : "low OSA risk";
  let risk_estimate = "";
  if (points <= 2) risk_estimate = "Low STOP-BANG range is linked to about 18% moderate-to-severe OSA probability (and about 4% severe OSA) in surgical cohorts.";
  else if (points <= 4) risk_estimate = "Intermediate STOP-BANG range is linked to rising moderate-to-severe OSA probability, starting around 36% as scores increase.";
  else risk_estimate = "High STOP-BANG range is linked to roughly 51-60% moderate-to-severe OSA probability; severe OSA probability can approach about 38%.";
  return {
    score: "stop_bang",
    value: points,
    interpretation,
    risk_estimate,
    clinical_note: "Risk rises with score; confirm diagnosis with formal sleep testing when appropriate.",
  };
}

function computeRcri(i) {
  let points = 0;
  points += i.high_risk_surgery ? 1 : 0;
  points += i.ischemic_heart_disease ? 1 : 0;
  points += i.congestive_heart_failure ? 1 : 0;
  points += i.cerebrovascular_disease ? 1 : 0;
  points += i.insulin_therapy_diabetes ? 1 : 0;
  points += i.creatinine_gt_2 ? 1 : 0;
  const interpretation = points >= 3 ? "high cardiac risk" : points >= 1 ? "elevated cardiac risk" : "low cardiac risk";
  const risk_map = {
    0: "RCRI class I corresponds to about 0.4% major cardiac complication risk.",
    1: "RCRI class II corresponds to about 0.9% major cardiac complication risk.",
    2: "RCRI class III corresponds to about 6.6% major cardiac complication risk.",
    3: "RCRI class IV corresponds to at least about 11% major cardiac complication risk.",
    4: "RCRI class IV corresponds to at least about 11% major cardiac complication risk.",
    5: "RCRI class IV corresponds to at least about 11% major cardiac complication risk.",
    6: "RCRI class IV corresponds to at least about 11% major cardiac complication risk.",
  };
  return {
    score: "rcri",
    value: points,
    interpretation,
    risk_estimate: risk_map[points],
    clinical_note: "Use alongside clinical judgment and guideline-based perioperative cardiac assessment.",
  };
}

function computeNews2(i) {
  let points = 0;
  let severe_single = false;
  const add = (p) => {
    points += p;
    if (p === 3) severe_single = true;
  };
  if (i.respiratory_rate <= 8) add(3);
  else if (i.respiratory_rate <= 11) add(1);
  else if (i.respiratory_rate <= 20) add(0);
  else if (i.respiratory_rate <= 24) add(2);
  else add(3);

  if (i.oxygen_saturation <= 91) add(3);
  else if (i.oxygen_saturation <= 93) add(2);
  else if (i.oxygen_saturation <= 95) add(1);

  if (i.systolic_bp <= 90) add(3);
  else if (i.systolic_bp <= 100) add(2);
  else if (i.systolic_bp <= 110) add(1);
  else if (i.systolic_bp <= 219) add(0);
  else add(3);

  if (i.heart_rate <= 40) add(3);
  else if (i.heart_rate <= 50) add(1);
  else if (i.heart_rate <= 90) add(0);
  else if (i.heart_rate <= 110) add(1);
  else if (i.heart_rate <= 130) add(2);
  else add(3);

  if (i.temperature_c <= 35.0) add(3);
  else if (i.temperature_c <= 36.0) add(1);
  else if (i.temperature_c <= 38.0) add(0);
  else if (i.temperature_c <= 39.0) add(1);
  else add(2);

  if (i.on_supplemental_oxygen) points += 2;
  if (!i.alert) {
    points += 3;
    severe_single = true;
  }
  const interpretation = points >= 7 ? "high clinical risk" : points >= 5 || severe_single ? "medium clinical risk" : "low clinical risk";
  return {
    score: "news2",
    value: points,
    interpretation,
    risk_estimate: "NEWS2 is primarily an escalation score; absolute % mortality varies by patient population and setting.",
    clinical_note: "Typical response thresholds are 0-4 (ward-level monitoring), 5-6 (urgent review), and >=7 (emergency response).",
  };
}

function computeQsofa(i) {
  let points = 0;
  if (i.respiratory_rate >= 22) points += 1;
  if (i.systolic_bp <= 100) points += 1;
  if (i.altered_mental_status) points += 1;
  return {
    score: "qsofa",
    value: points,
    interpretation: points >= 2 ? "high risk" : "lower risk",
    risk_estimate:
      points >= 2
        ? "qSOFA >=2 has been associated with about 24% in-hospital mortality in infected ED cohorts."
        : "qSOFA <2 has been associated with about 3% in-hospital mortality in infected ED cohorts.",
    clinical_note: "Designed as a bedside prompt for sepsis severity and escalation, not a stand-alone diagnosis.",
  };
}

function computeSofaBasic(i) {
  let respiration = 0;
  if (i.pao2_fio2 < 100) respiration = 4;
  else if (i.pao2_fio2 < 200) respiration = 3;
  else if (i.pao2_fio2 < 300) respiration = 2;
  else if (i.pao2_fio2 < 400) respiration = 1;

  let coagulation = 0;
  if (i.platelets < 20) coagulation = 4;
  else if (i.platelets < 50) coagulation = 3;
  else if (i.platelets < 100) coagulation = 2;
  else if (i.platelets < 150) coagulation = 1;

  let liver = 0;
  if (i.bilirubin_mg_dl >= 12) liver = 4;
  else if (i.bilirubin_mg_dl >= 6) liver = 3;
  else if (i.bilirubin_mg_dl >= 2) liver = 2;
  else if (i.bilirubin_mg_dl >= 1.2) liver = 1;

  let cardiovascular = 0;
  if (i.on_vasopressors) cardiovascular = 3;
  else if (i.map_mm_hg < 70) cardiovascular = 1;

  let cns = 0;
  if (i.gcs < 6) cns = 4;
  else if (i.gcs < 10) cns = 3;
  else if (i.gcs < 13) cns = 2;
  else if (i.gcs < 15) cns = 1;

  const creatinine_mg_dl = i.creatinine_umol_l / CREATININE_UMOL_PER_MG_DL;
  let renal = 0;
  if (creatinine_mg_dl >= 5 || i.urine_output_ml_day < 200) renal = 4;
  else if (creatinine_mg_dl >= 3.5 || i.urine_output_ml_day < 500) renal = 3;
  else if (creatinine_mg_dl >= 2) renal = 2;
  else if (creatinine_mg_dl >= 1.2) renal = 1;

  const points = respiration + coagulation + liver + cardiovascular + cns + renal;
  let risk_estimate = "";
  if (points >= 10) risk_estimate = "Higher SOFA values are linked to substantially increased mortality; exact % varies by diagnosis and ICU mix.";
  else if (points >= 5) risk_estimate = "Moderate SOFA values suggest meaningful organ dysfunction and elevated mortality risk.";
  else if (points >= 2) risk_estimate = "A SOFA increase/score >=2 is often used as a marker of significant organ dysfunction (~10% mortality in sepsis cohorts).";
  else risk_estimate = "Very low SOFA values generally indicate lower short-term organ-failure mortality risk.";
  return {
    score: "sofa_basic",
    value: points,
    interpretation: points >= 10 ? "high organ dysfunction risk" : points >= 5 ? "moderate organ dysfunction risk" : "low organ dysfunction risk",
    risk_estimate,
    clinical_note: "Trend over time is often more informative than a single value.",
  };
}

function computeApfel(i) {
  const points =
    (i.female ? 1 : 0) +
    (i.non_smoker ? 1 : 0) +
    (i.history_ponv_motion_sickness ? 1 : 0) +
    (i.postoperative_opioids ? 1 : 0);
  const interpretationMap = { 0: "about 10% risk", 1: "about 21% risk", 2: "about 39% risk", 3: "about 61% risk", 4: "about 79% risk" };
  const detailMap = {
    0: "Low PONV risk: approximately 10%.",
    1: "Mildly elevated PONV risk: approximately 21%.",
    2: "Moderate PONV risk: approximately 39%.",
    3: "High PONV risk: approximately 61%.",
    4: "Very high PONV risk: approximately 79%.",
  };
  return {
    score: "apfel_ponv",
    value: points,
    interpretation: interpretationMap[points],
    risk_estimate: detailMap[points],
    clinical_note: "Consider prophylaxis intensity based on both Apfel score and local protocol.",
  };
}

function computeSubjectiveMets(i) {
  const mets = i.subjective_mets;
  let interpretation = "";
  let risk_estimate = "";
  if (mets < 4) {
    interpretation = "poor functional capacity";
    risk_estimate = "Subjective capacity <4 METs is generally treated as increased perioperative risk in guideline workflows.";
  } else if (mets < 7) {
    interpretation = "moderate functional capacity";
    risk_estimate = "Subjective 4-6 METs suggests intermediate reserve; combine with clinical/surgical risk.";
  } else {
    interpretation = "good functional capacity";
    risk_estimate = "Subjective >=7 METs generally suggests lower functional-risk concern.";
  }
  return {
    score: "subjective_mets",
    value: mets,
    interpretation,
    risk_estimate,
    clinical_note: "Subjective METs are less accurate than objective exercise testing and should not be used in isolation.",
  };
}

function computeAriscat(i) {
  let points = 0;
  if (i.age > 80) points += 16;
  else if (i.age >= 51) points += 3;
  if (i.oxygen_saturation <= 90) points += 24;
  else if (i.oxygen_saturation <= 95) points += 8;
  if (i.respiratory_infection_last_month) points += 17;
  if (i.hemoglobin_g_dl <= 10) points += 11;
  if (i.ariscat_incision === "upper_abdominal") points += 15;
  if (i.ariscat_incision === "intrathoracic") points += 24;
  if (i.surgery_duration_hours > 3) points += 23;
  else if (i.surgery_duration_hours >= 2) points += 16;
  if (i.emergency_surgery) points += 8;
  return {
    score: "ariscat",
    value: points,
    interpretation:
      points >= 45 ? "high pulmonary complication risk" : points >= 26 ? "intermediate pulmonary complication risk" : "low pulmonary complication risk",
    risk_estimate:
      points >= 45
        ? "Estimated postoperative pulmonary complication risk is about 42.1%."
        : points >= 26
          ? "Estimated postoperative pulmonary complication risk is about 13.3%."
          : "Estimated postoperative pulmonary complication risk is about 1.6%.",
    clinical_note: "Use to guide perioperative pulmonary optimization and postoperative monitoring strategy.",
  };
}

function computeSort(i) {
  let logit = -7.366;
  if (i.asa_ps_class === 3) logit += 1.411;
  else if (i.asa_ps_class === 4) logit += 2.388;
  else if (i.asa_ps_class >= 5) logit += 4.081;
  const urgencyCoeff = { elective: 0, expedited: 1.236, urgent: 1.657, immediate: 2.452 };
  logit += urgencyCoeff[i.sort_urgency];
  if (i.sort_high_risk_specialty) logit += 0.712;
  if (i.sort_xmajor_complex) logit += 0.381;
  if (i.sort_cancer) logit += 0.667;
  if (i.age >= 80) logit += 1.591;
  else if (i.age >= 65) logit += 0.777;
  const risk_percent = 100 / (1 + Math.exp(-logit));
  return {
    score: "sort",
    value: Number(risk_percent.toFixed(2)),
    interpretation:
      risk_percent >= 5 ? "high 30-day mortality risk" : risk_percent >= 1 ? "elevated 30-day mortality risk" : "lower 30-day mortality risk",
    risk_estimate: `Estimated 30-day mortality is ${risk_percent.toFixed(2)}%.`,
    clinical_note: "SORT performance can vary across health systems, so local calibration is recommended.",
  };
}

function computeGuptaMica(i) {
  let logit = -5.25;
  logit += 0.02 * i.age;
  if (i.mica_functional_status !== "independent") logit += 0.65;
  if (i.asa_ps_class === 3) logit += 0.61;
  else if (i.asa_ps_class === 4) logit += 1.14;
  else if (i.asa_ps_class >= 5) logit += 1.61;
  const creatinine_mg_dl = i.creatinine_umol_l / CREATININE_UMOL_PER_MG_DL;
  if (creatinine_mg_dl > 1.5) logit += 0.61;
  const coeff = {
    hernia: 0.0,
    anorectal: 0.0,
    aortic: 1.6,
    bariatric: 0.9,
    brain: 0.71,
    breast: 0.0,
    cardiac: 0.7,
    ent: 0.0,
    foregut_hpb: 1.39,
    gallbladder_appendix_adrenal_spleen: 0.9,
    intestinal: 1.14,
    neck: 0.76,
    obgyn: 0.76,
    orthopedic: 0.8,
    other_abdominal: 1.3,
    peripheral_vascular: 1.61,
    skin: 0.47,
    spine: 0.0,
    thoracic_non_esophageal_non_cardiac: 0.4,
    vein: 0.0,
    urology: 0.72,
  };
  logit += coeff[i.mica_surgery_type];
  const risk_percent = 100 / (1 + Math.exp(-logit));
  return {
    score: "gupta_mica",
    value: Number(risk_percent.toFixed(2)),
    interpretation:
      risk_percent >= 5 ? "high MI/cardiac arrest risk" : risk_percent >= 1 ? "elevated MI/cardiac arrest risk" : "lower MI/cardiac arrest risk",
    risk_estimate: `Estimated 30-day MI/cardiac arrest risk is ${risk_percent.toFixed(2)}%.`,
    clinical_note: "This implementation follows published Gupta MICA structure; verify surgery-category mapping against your local practice.",
  };
}

function computeNelaManual(i) {
  const risk = i.nela_30_day_mortality_percent;
  return {
    score: "nela_manual",
    value: Number(risk.toFixed(2)),
    interpretation: risk >= 10 ? "high 30-day mortality risk" : risk >= 5 ? "elevated 30-day mortality risk" : "lower 30-day mortality risk",
    risk_estimate: `Entered NELA 30-day mortality estimate is ${risk.toFixed(2)}%.`,
    clinical_note: "Use the official NELA calculator/model for derivation, then record the result here for unified reporting.",
  };
}

function computeNsqipManual(i) {
  const m = i.nsqip_mortality_percent;
  const c = i.nsqip_serious_complication_percent;
  return {
    score: "acs_nsqip_manual",
    value: Number(m.toFixed(2)),
    interpretation: m >= 5 ? "high mortality risk" : m >= 1 ? "elevated mortality risk" : "lower mortality risk",
    risk_estimate: `Entered ACS NSQIP estimates: mortality ${m.toFixed(2)}%, serious complications ${c.toFixed(2)}%.`,
    clinical_note: "Generate these values from the official ACS NSQIP calculator, then capture them here for summary/export.",
  };
}

const COMPUTERS = {
  wilson: computeWilson,
  stop_bang: computeStopBang,
  rcri: computeRcri,
  news2: computeNews2,
  qsofa: computeQsofa,
  sofa_basic: computeSofaBasic,
  apfel_ponv: computeApfel,
  subjective_mets: computeSubjectiveMets,
  ariscat: computeAriscat,
  sort: computeSort,
  gupta_mica: computeGuptaMica,
  nela_manual: computeNelaManual,
  acs_nsqip_manual: computeNsqipManual,
};

export function computeScores(selectedScores, inputs) {
  return selectedScores.map((key) => COMPUTERS[key](inputs));
}

export function summaryText(results) {
  const lines = ["Score Summary"];
  for (const item of results) {
    const name = SCORE_MAP[item.score]?.name ?? item.score;
    let line = `- ${name}: ${item.value} (${item.interpretation})`;
    if (item.risk_estimate) line += ` Risk estimate: ${item.risk_estimate}`;
    if (item.clinical_note) line += ` Clinical meaning: ${item.clinical_note}`;
    lines.push(line);
  }
  return lines.join("\n");
}
