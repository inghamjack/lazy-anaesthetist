import math
from typing import Callable, Dict, List, Type

from pydantic import BaseModel, ValidationError

from .models import (
    ACSNSQIPManualInput,
    ARISCATInput,
    ApfelPONVInput,
    ComputeRequest,
    ComputeResponse,
    GuptaMICAInput,
    NELAManualInput,
    NEWS2Input,
    QSOFAInput,
    RCRIInput,
    SORTInput,
    SOFABasicInput,
    ScoreDescriptor,
    ScoreKey,
    ScoreResult,
    StopBangInput,
    SubjectiveMETsInput,
    WilsonInput,
)

CREATININE_UMOL_PER_MG_DL = 88.4

SCORE_DEFINITIONS: List[ScoreDescriptor] = [
    ScoreDescriptor(
        key=ScoreKey.wilson,
        name="Wilson Score",
        description="Airway difficulty prediction score.",
        required_fields=[
            "mouth_opening_cm",
            "thyromental_distance_cm",
            "mallampati_class",
            "neck_mobility_limited",
            "jaw_protrusion_limited",
        ],
    ),
    ScoreDescriptor(
        key=ScoreKey.stop_bang,
        name="STOP-BANG",
        description="Obstructive sleep apnea screening score.",
        required_fields=[
            "snoring",
            "tiredness",
            "observed_apnea",
            "high_blood_pressure",
            "bmi",
            "age",
            "neck_circumference_cm",
            "male",
        ],
    ),
    ScoreDescriptor(
        key=ScoreKey.rcri,
        name="RCRI",
        description="Revised Cardiac Risk Index.",
        required_fields=[
            "high_risk_surgery",
            "ischemic_heart_disease",
            "congestive_heart_failure",
            "cerebrovascular_disease",
            "insulin_therapy_diabetes",
            "creatinine_gt_2",
        ],
    ),
    ScoreDescriptor(
        key=ScoreKey.news2,
        name="NEWS2",
        description="National Early Warning Score 2.",
        required_fields=[
            "respiratory_rate",
            "oxygen_saturation",
            "systolic_bp",
            "heart_rate",
            "temperature_c",
            "alert",
            "on_supplemental_oxygen",
        ],
    ),
    ScoreDescriptor(
        key=ScoreKey.qsofa,
        name="qSOFA",
        description="Quick Sequential Organ Failure Assessment.",
        required_fields=[
            "respiratory_rate",
            "systolic_bp",
            "altered_mental_status",
        ],
    ),
    ScoreDescriptor(
        key=ScoreKey.sofa_basic,
        name="SOFA (Basic)",
        description="Basic SOFA using common bedside variables.",
        required_fields=[
            "pao2_fio2",
            "platelets",
            "bilirubin_mg_dl",
            "map_mm_hg",
            "on_vasopressors",
            "gcs",
            "creatinine_umol_l",
            "urine_output_ml_day",
        ],
    ),
    ScoreDescriptor(
        key=ScoreKey.apfel_ponv,
        name="Apfel PONV",
        description="Postoperative nausea and vomiting risk score.",
        required_fields=[
            "female",
            "non_smoker",
            "history_ponv_motion_sickness",
            "postoperative_opioids",
        ],
    ),
    ScoreDescriptor(
        key=ScoreKey.subjective_mets,
        name="Subjective METs",
        description="Self-reported functional capacity estimate (METs).",
        required_fields=[
            "subjective_mets",
        ],
    ),
    ScoreDescriptor(
        key=ScoreKey.ariscat,
        name="ARISCAT",
        description="Postoperative pulmonary complication risk score.",
        required_fields=[
            "age",
            "oxygen_saturation",
            "respiratory_infection_last_month",
            "hemoglobin_g_dl",
            "ariscat_incision",
            "surgery_duration_hours",
            "emergency_surgery",
        ],
    ),
    ScoreDescriptor(
        key=ScoreKey.sort,
        name="SORT",
        description="Surgical Outcome Risk Tool for 30-day mortality.",
        required_fields=[
            "age",
            "asa_ps_class",
            "sort_urgency",
            "sort_high_risk_specialty",
            "sort_xmajor_complex",
            "sort_cancer",
        ],
    ),
    ScoreDescriptor(
        key=ScoreKey.gupta_mica,
        name="Gupta MICA",
        description="Gupta perioperative MI/cardiac arrest risk model.",
        required_fields=[
            "age",
            "asa_ps_class",
            "creatinine_umol_l",
            "mica_functional_status",
            "mica_surgery_type",
        ],
    ),
    ScoreDescriptor(
        key=ScoreKey.nela_manual,
        name="NELA (Manual)",
        description="Manual entry of NELA 30-day mortality from official calculator.",
        required_fields=[
            "nela_30_day_mortality_percent",
        ],
    ),
    ScoreDescriptor(
        key=ScoreKey.acs_nsqip_manual,
        name="ACS NSQIP (Manual)",
        description="Manual entry of ACS NSQIP predicted risks from official calculator.",
        required_fields=[
            "nsqip_mortality_percent",
            "nsqip_serious_complication_percent",
        ],
    ),
]


def list_scores() -> List[ScoreDescriptor]:
    return SCORE_DEFINITIONS


def _compute_wilson(inp: WilsonInput) -> ScoreResult:
    points = 0

    if inp.mouth_opening_cm < 3.0:
        points += 2
    elif inp.mouth_opening_cm < 4.0:
        points += 1

    if inp.thyromental_distance_cm < 6.0:
        points += 2
    elif inp.thyromental_distance_cm < 6.5:
        points += 1

    points += max(inp.mallampati_class - 1, 0)
    points += 1 if inp.neck_mobility_limited else 0
    points += 1 if inp.jaw_protrusion_limited else 0

    interpretation = "high risk airway" if points >= 4 else "moderate risk airway" if points >= 2 else "low risk airway"
    return ScoreResult(
        score=ScoreKey.wilson,
        value=float(points),
        interpretation=interpretation,
        risk_estimate="No universally calibrated % difficult-intubation risk is available for each Wilson score point.",
        clinical_note="Use this as an airway planning prompt; combine with full airway assessment and context.",
    )


def _compute_stop_bang(inp: StopBangInput) -> ScoreResult:
    points = 0
    points += 1 if inp.snoring else 0
    points += 1 if inp.tiredness else 0
    points += 1 if inp.observed_apnea else 0
    points += 1 if inp.high_blood_pressure else 0
    points += 1 if inp.bmi > 35 else 0
    points += 1 if inp.age > 50 else 0
    points += 1 if inp.neck_circumference_cm > 40 else 0
    points += 1 if inp.male else 0

    interpretation = "high OSA risk" if points >= 5 else "intermediate OSA risk" if points >= 3 else "low OSA risk"
    if points <= 2:
        risk_estimate = "Low STOP-BANG range is linked to about 18% moderate-to-severe OSA probability (and about 4% severe OSA) in surgical cohorts."
    elif points <= 4:
        risk_estimate = "Intermediate STOP-BANG range is linked to rising moderate-to-severe OSA probability, starting around 36% as scores increase."
    else:
        risk_estimate = "High STOP-BANG range is linked to roughly 51-60% moderate-to-severe OSA probability; severe OSA probability can approach about 38%."
    return ScoreResult(
        score=ScoreKey.stop_bang,
        value=float(points),
        interpretation=interpretation,
        risk_estimate=risk_estimate,
        clinical_note="Risk rises with score; confirm diagnosis with formal sleep testing when appropriate.",
    )


def _compute_rcri(inp: RCRIInput) -> ScoreResult:
    points = 0
    points += 1 if inp.high_risk_surgery else 0
    points += 1 if inp.ischemic_heart_disease else 0
    points += 1 if inp.congestive_heart_failure else 0
    points += 1 if inp.cerebrovascular_disease else 0
    points += 1 if inp.insulin_therapy_diabetes else 0
    points += 1 if inp.creatinine_gt_2 else 0

    interpretation = "high cardiac risk" if points >= 3 else "elevated cardiac risk" if points >= 1 else "low cardiac risk"
    if points == 0:
        risk_estimate = "RCRI class I corresponds to about 0.4% major cardiac complication risk."
    elif points == 1:
        risk_estimate = "RCRI class II corresponds to about 0.9% major cardiac complication risk."
    elif points == 2:
        risk_estimate = "RCRI class III corresponds to about 6.6% major cardiac complication risk."
    else:
        risk_estimate = "RCRI class IV corresponds to at least about 11% major cardiac complication risk."
    return ScoreResult(
        score=ScoreKey.rcri,
        value=float(points),
        interpretation=interpretation,
        risk_estimate=risk_estimate,
        clinical_note="Use alongside clinical judgment and guideline-based perioperative cardiac assessment.",
    )


def _compute_news2(inp: NEWS2Input) -> ScoreResult:
    points = 0
    severe_single = False

    rr_points = 0
    if inp.respiratory_rate <= 8:
        rr_points = 3
    elif inp.respiratory_rate <= 11:
        rr_points = 1
    elif inp.respiratory_rate <= 20:
        rr_points = 0
    elif inp.respiratory_rate <= 24:
        rr_points = 2
    else:
        rr_points = 3
    points += rr_points
    severe_single = severe_single or rr_points == 3

    spo2_points = 0
    if inp.oxygen_saturation <= 91:
        spo2_points = 3
    elif inp.oxygen_saturation <= 93:
        spo2_points = 2
    elif inp.oxygen_saturation <= 95:
        spo2_points = 1
    points += spo2_points
    severe_single = severe_single or spo2_points == 3

    sbp_points = 0
    if inp.systolic_bp <= 90:
        sbp_points = 3
    elif inp.systolic_bp <= 100:
        sbp_points = 2
    elif inp.systolic_bp <= 110:
        sbp_points = 1
    elif inp.systolic_bp <= 219:
        sbp_points = 0
    else:
        sbp_points = 3
    points += sbp_points
    severe_single = severe_single or sbp_points == 3

    hr_points = 0
    if inp.heart_rate <= 40:
        hr_points = 3
    elif inp.heart_rate <= 50:
        hr_points = 1
    elif inp.heart_rate <= 90:
        hr_points = 0
    elif inp.heart_rate <= 110:
        hr_points = 1
    elif inp.heart_rate <= 130:
        hr_points = 2
    else:
        hr_points = 3
    points += hr_points
    severe_single = severe_single or hr_points == 3

    temp_points = 0
    if inp.temperature_c <= 35.0:
        temp_points = 3
    elif inp.temperature_c <= 36.0:
        temp_points = 1
    elif inp.temperature_c <= 38.0:
        temp_points = 0
    elif inp.temperature_c <= 39.0:
        temp_points = 1
    else:
        temp_points = 2
    points += temp_points
    severe_single = severe_single or temp_points == 3

    if inp.on_supplemental_oxygen:
        points += 2
    if not inp.alert:
        points += 3
        severe_single = True

    if points >= 7:
        interpretation = "high clinical risk"
    elif points >= 5 or severe_single:
        interpretation = "medium clinical risk"
    else:
        interpretation = "low clinical risk"
    return ScoreResult(
        score=ScoreKey.news2,
        value=float(points),
        interpretation=interpretation,
        risk_estimate="NEWS2 is primarily an escalation score; absolute % mortality varies by patient population and setting.",
        clinical_note="Typical response thresholds are 0-4 (ward-level monitoring), 5-6 (urgent review), and >=7 (emergency response).",
    )


def _compute_qsofa(inp: QSOFAInput) -> ScoreResult:
    points = 0
    if inp.respiratory_rate >= 22:
        points += 1
    if inp.systolic_bp <= 100:
        points += 1
    if inp.altered_mental_status:
        points += 1

    interpretation = "high risk" if points >= 2 else "lower risk"
    if points >= 2:
        risk_estimate = "qSOFA >=2 has been associated with about 24% in-hospital mortality in infected ED cohorts."
    else:
        risk_estimate = "qSOFA <2 has been associated with about 3% in-hospital mortality in infected ED cohorts."
    return ScoreResult(
        score=ScoreKey.qsofa,
        value=float(points),
        interpretation=interpretation,
        risk_estimate=risk_estimate,
        clinical_note="Designed as a bedside prompt for sepsis severity and escalation, not a stand-alone diagnosis.",
    )


def _compute_sofa_basic(inp: SOFABasicInput) -> ScoreResult:
    respiration = 0
    if inp.pao2_fio2 < 100:
        respiration = 4
    elif inp.pao2_fio2 < 200:
        respiration = 3
    elif inp.pao2_fio2 < 300:
        respiration = 2
    elif inp.pao2_fio2 < 400:
        respiration = 1

    coagulation = 0
    if inp.platelets < 20:
        coagulation = 4
    elif inp.platelets < 50:
        coagulation = 3
    elif inp.platelets < 100:
        coagulation = 2
    elif inp.platelets < 150:
        coagulation = 1

    liver = 0
    if inp.bilirubin_mg_dl >= 12:
        liver = 4
    elif inp.bilirubin_mg_dl >= 6:
        liver = 3
    elif inp.bilirubin_mg_dl >= 2:
        liver = 2
    elif inp.bilirubin_mg_dl >= 1.2:
        liver = 1

    cardiovascular = 0
    if inp.on_vasopressors:
        cardiovascular = 3
    elif inp.map_mm_hg < 70:
        cardiovascular = 1

    cns = 0
    if inp.gcs < 6:
        cns = 4
    elif inp.gcs < 10:
        cns = 3
    elif inp.gcs < 13:
        cns = 2
    elif inp.gcs < 15:
        cns = 1

    creatinine_mg_dl = inp.creatinine_umol_l / CREATININE_UMOL_PER_MG_DL

    renal = 0
    if creatinine_mg_dl >= 5.0 or inp.urine_output_ml_day < 200:
        renal = 4
    elif creatinine_mg_dl >= 3.5 or inp.urine_output_ml_day < 500:
        renal = 3
    elif creatinine_mg_dl >= 2.0:
        renal = 2
    elif creatinine_mg_dl >= 1.2:
        renal = 1

    points = respiration + coagulation + liver + cardiovascular + cns + renal
    interpretation = "high organ dysfunction risk" if points >= 10 else "moderate organ dysfunction risk" if points >= 5 else "low organ dysfunction risk"
    if points >= 10:
        risk_estimate = "Higher SOFA values are linked to substantially increased mortality; exact % varies by diagnosis and ICU mix."
    elif points >= 5:
        risk_estimate = "Moderate SOFA values suggest meaningful organ dysfunction and elevated mortality risk."
    elif points >= 2:
        risk_estimate = "A SOFA increase/score >=2 is often used as a marker of significant organ dysfunction (~10% mortality in sepsis cohorts)."
    else:
        risk_estimate = "Very low SOFA values generally indicate lower short-term organ-failure mortality risk."
    return ScoreResult(
        score=ScoreKey.sofa_basic,
        value=float(points),
        interpretation=interpretation,
        risk_estimate=risk_estimate,
        clinical_note="Trend over time is often more informative than a single value.",
    )


def _compute_apfel_ponv(inp: ApfelPONVInput) -> ScoreResult:
    points = 0
    points += 1 if inp.female else 0
    points += 1 if inp.non_smoker else 0
    points += 1 if inp.history_ponv_motion_sickness else 0
    points += 1 if inp.postoperative_opioids else 0

    risk_map = {0: "about 10% risk", 1: "about 21% risk", 2: "about 39% risk", 3: "about 61% risk", 4: "about 79% risk"}
    detailed_risk_map = {
        0: "Low PONV risk: approximately 10%.",
        1: "Mildly elevated PONV risk: approximately 21%.",
        2: "Moderate PONV risk: approximately 39%.",
        3: "High PONV risk: approximately 61%.",
        4: "Very high PONV risk: approximately 79%.",
    }
    return ScoreResult(
        score=ScoreKey.apfel_ponv,
        value=float(points),
        interpretation=risk_map[points],
        risk_estimate=detailed_risk_map[points],
        clinical_note="Consider prophylaxis intensity based on both Apfel score and local protocol.",
    )


def _compute_subjective_mets(inp: SubjectiveMETsInput) -> ScoreResult:
    mets = float(inp.subjective_mets)
    if mets < 4.0:
        interpretation = "poor functional capacity"
        risk_estimate = "Subjective capacity <4 METs is generally treated as increased perioperative risk in guideline workflows."
    elif mets < 7.0:
        interpretation = "moderate functional capacity"
        risk_estimate = "Subjective 4-6 METs suggests intermediate reserve; combine with clinical/surgical risk."
    else:
        interpretation = "good functional capacity"
        risk_estimate = "Subjective >=7 METs generally suggests lower functional-risk concern."
    return ScoreResult(
        score=ScoreKey.subjective_mets,
        value=mets,
        interpretation=interpretation,
        risk_estimate=risk_estimate,
        clinical_note="Subjective METs are less accurate than objective exercise testing and should not be used in isolation.",
    )


def _compute_ariscat(inp: ARISCATInput) -> ScoreResult:
    points = 0

    if inp.age > 80:
        points += 16
    elif inp.age >= 51:
        points += 3

    if inp.oxygen_saturation <= 90:
        points += 24
    elif inp.oxygen_saturation <= 95:
        points += 8

    if inp.respiratory_infection_last_month:
        points += 17

    if inp.hemoglobin_g_dl <= 10:
        points += 11

    incision_points = {
        "peripheral": 0,
        "upper_abdominal": 15,
        "intrathoracic": 24,
    }
    points += incision_points[inp.ariscat_incision]

    if inp.surgery_duration_hours > 3:
        points += 23
    elif inp.surgery_duration_hours >= 2:
        points += 16

    if inp.emergency_surgery:
        points += 8

    if points >= 45:
        interpretation = "high pulmonary complication risk"
        risk_estimate = "Estimated postoperative pulmonary complication risk is about 42.1%."
    elif points >= 26:
        interpretation = "intermediate pulmonary complication risk"
        risk_estimate = "Estimated postoperative pulmonary complication risk is about 13.3%."
    else:
        interpretation = "low pulmonary complication risk"
        risk_estimate = "Estimated postoperative pulmonary complication risk is about 1.6%."

    return ScoreResult(
        score=ScoreKey.ariscat,
        value=float(points),
        interpretation=interpretation,
        risk_estimate=risk_estimate,
        clinical_note="Use to guide perioperative pulmonary optimization and postoperative monitoring strategy.",
    )


def _compute_sort(inp: SORTInput) -> ScoreResult:
    logit = -7.366

    if inp.asa_ps_class == 3:
        logit += 1.411
    elif inp.asa_ps_class == 4:
        logit += 2.388
    elif inp.asa_ps_class >= 5:
        logit += 4.081

    urgency_coeff = {
        "elective": 0.0,
        "expedited": 1.236,
        "urgent": 1.657,
        "immediate": 2.452,
    }
    logit += urgency_coeff[inp.sort_urgency]

    if inp.sort_high_risk_specialty:
        logit += 0.712
    if inp.sort_xmajor_complex:
        logit += 0.381
    if inp.sort_cancer:
        logit += 0.667

    if inp.age >= 80:
        logit += 1.591
    elif inp.age >= 65:
        logit += 0.777

    risk_percent = 100.0 / (1.0 + math.exp(-logit))
    if risk_percent >= 5:
        interpretation = "high 30-day mortality risk"
    elif risk_percent >= 1:
        interpretation = "elevated 30-day mortality risk"
    else:
        interpretation = "lower 30-day mortality risk"

    return ScoreResult(
        score=ScoreKey.sort,
        value=round(risk_percent, 2),
        interpretation=interpretation,
        risk_estimate=f"Estimated 30-day mortality is {risk_percent:.2f}%.",
        clinical_note="SORT performance can vary across health systems, so local calibration is recommended.",
    )


def _compute_gupta_mica(inp: GuptaMICAInput) -> ScoreResult:
    logit = -5.25
    logit += 0.02 * inp.age

    functional_coeff = {
        "independent": 0.0,
        "partially_dependent": 0.65,
        "totally_dependent": 0.65,
    }
    logit += functional_coeff[inp.mica_functional_status]

    if inp.asa_ps_class == 3:
        logit += 0.61
    elif inp.asa_ps_class == 4:
        logit += 1.14
    elif inp.asa_ps_class >= 5:
        logit += 1.61

    creatinine_mg_dl = inp.creatinine_umol_l / CREATININE_UMOL_PER_MG_DL
    if creatinine_mg_dl > 1.5:
        logit += 0.61

    surgery_coeff = {
        "hernia": 0.0,
        "anorectal": 0.0,
        "aortic": 1.60,
        "bariatric": 0.90,
        "brain": 0.71,
        "breast": 0.0,
        "cardiac": 0.70,
        "ent": 0.0,
        "foregut_hpb": 1.39,
        "gallbladder_appendix_adrenal_spleen": 0.90,
        "intestinal": 1.14,
        "neck": 0.76,
        "obgyn": 0.76,
        "orthopedic": 0.80,
        "other_abdominal": 1.30,
        "peripheral_vascular": 1.61,
        "skin": 0.47,
        "spine": 0.0,
        "thoracic_non_esophageal_non_cardiac": 0.40,
        "vein": 0.0,
        "urology": 0.72,
    }
    logit += surgery_coeff[inp.mica_surgery_type]

    risk_percent = 100.0 / (1.0 + math.exp(-logit))
    if risk_percent >= 5:
        interpretation = "high MI/cardiac arrest risk"
    elif risk_percent >= 1:
        interpretation = "elevated MI/cardiac arrest risk"
    else:
        interpretation = "lower MI/cardiac arrest risk"

    return ScoreResult(
        score=ScoreKey.gupta_mica,
        value=round(risk_percent, 2),
        interpretation=interpretation,
        risk_estimate=f"Estimated 30-day MI/cardiac arrest risk is {risk_percent:.2f}%.",
        clinical_note="This implementation follows published Gupta MICA structure; verify surgery-category mapping against your local practice.",
    )


def _compute_nela_manual(inp: NELAManualInput) -> ScoreResult:
    risk_percent = float(inp.nela_30_day_mortality_percent)
    if risk_percent >= 10:
        interpretation = "high 30-day mortality risk"
    elif risk_percent >= 5:
        interpretation = "elevated 30-day mortality risk"
    else:
        interpretation = "lower 30-day mortality risk"

    return ScoreResult(
        score=ScoreKey.nela_manual,
        value=round(risk_percent, 2),
        interpretation=interpretation,
        risk_estimate=f"Entered NELA 30-day mortality estimate is {risk_percent:.2f}%.",
        clinical_note="Use the official NELA calculator/model for derivation, then record the result here for unified reporting.",
    )


def _compute_acs_nsqip_manual(inp: ACSNSQIPManualInput) -> ScoreResult:
    mortality_risk = float(inp.nsqip_mortality_percent)
    serious_complication_risk = float(inp.nsqip_serious_complication_percent)

    if mortality_risk >= 5:
        interpretation = "high mortality risk"
    elif mortality_risk >= 1:
        interpretation = "elevated mortality risk"
    else:
        interpretation = "lower mortality risk"

    return ScoreResult(
        score=ScoreKey.acs_nsqip_manual,
        value=round(mortality_risk, 2),
        interpretation=interpretation,
        risk_estimate=(
            f"Entered ACS NSQIP estimates: mortality {mortality_risk:.2f}%, "
            f"serious complications {serious_complication_risk:.2f}%."
        ),
        clinical_note="Generate these values from the official ACS NSQIP calculator, then capture them here for summary/export.",
    )


SCORE_INPUT_MODELS: Dict[ScoreKey, Type[BaseModel]] = {
    ScoreKey.wilson: WilsonInput,
    ScoreKey.stop_bang: StopBangInput,
    ScoreKey.rcri: RCRIInput,
    ScoreKey.news2: NEWS2Input,
    ScoreKey.qsofa: QSOFAInput,
    ScoreKey.sofa_basic: SOFABasicInput,
    ScoreKey.apfel_ponv: ApfelPONVInput,
    ScoreKey.subjective_mets: SubjectiveMETsInput,
    ScoreKey.ariscat: ARISCATInput,
    ScoreKey.sort: SORTInput,
    ScoreKey.gupta_mica: GuptaMICAInput,
    ScoreKey.nela_manual: NELAManualInput,
    ScoreKey.acs_nsqip_manual: ACSNSQIPManualInput,
}

SCORE_COMPUTERS: Dict[ScoreKey, Callable[[BaseModel], ScoreResult]] = {
    ScoreKey.wilson: _compute_wilson,
    ScoreKey.stop_bang: _compute_stop_bang,
    ScoreKey.rcri: _compute_rcri,
    ScoreKey.news2: _compute_news2,
    ScoreKey.qsofa: _compute_qsofa,
    ScoreKey.sofa_basic: _compute_sofa_basic,
    ScoreKey.apfel_ponv: _compute_apfel_ponv,
    ScoreKey.subjective_mets: _compute_subjective_mets,
    ScoreKey.ariscat: _compute_ariscat,
    ScoreKey.sort: _compute_sort,
    ScoreKey.gupta_mica: _compute_gupta_mica,
    ScoreKey.nela_manual: _compute_nela_manual,
    ScoreKey.acs_nsqip_manual: _compute_acs_nsqip_manual,
}


def compute_scores(request: ComputeRequest) -> ComputeResponse:
    results: List[ScoreResult] = []
    inputs = request.inputs

    for score_key in request.selected_scores:
        input_model = SCORE_INPUT_MODELS[score_key]
        computer = SCORE_COMPUTERS[score_key]
        try:
            parsed_input = input_model(**inputs)
        except ValidationError as exc:
            details = []
            for err in exc.errors():
                location = ".".join(str(loc) for loc in err.get("loc", []))
                message = err.get("msg", "Invalid value")
                details.append({"field": location, "message": message})
            raise ValueError({"detail": f"Invalid inputs for {score_key.value}", "errors": details}) from exc
        results.append(computer(parsed_input))

    return ComputeResponse(results=results)
