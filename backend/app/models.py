from enum import Enum
from typing import Any, Dict, List, Literal

from pydantic import BaseModel, ConfigDict, Field


class ScoreKey(str, Enum):
    wilson = "wilson"
    stop_bang = "stop_bang"
    rcri = "rcri"
    news2 = "news2"
    qsofa = "qsofa"
    sofa_basic = "sofa_basic"
    apfel_ponv = "apfel_ponv"
    subjective_mets = "subjective_mets"
    ariscat = "ariscat"
    sort = "sort"
    gupta_mica = "gupta_mica"
    nela_manual = "nela_manual"
    acs_nsqip_manual = "acs_nsqip_manual"


class ScoreDescriptor(BaseModel):
    key: ScoreKey
    name: str
    description: str
    required_fields: List[str]

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "key": "qsofa",
                "name": "qSOFA",
                "description": "Quick Sequential Organ Failure Assessment.",
                "required_fields": ["respiratory_rate", "systolic_bp", "altered_mental_status"],
            }
        }
    )


class ComputeRequest(BaseModel):
    selected_scores: List[ScoreKey] = Field(..., min_length=1, description="Scores to compute in one request.")
    inputs: Dict[str, Any] = Field(..., description="Flat input dictionary used by selected score calculators.")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "selected_scores": ["qsofa", "apfel_ponv"],
                "inputs": {
                    "respiratory_rate": 24,
                    "systolic_bp": 95,
                    "altered_mental_status": True,
                    "female": True,
                    "non_smoker": True,
                    "history_ponv_motion_sickness": False,
                    "postoperative_opioids": True,
                },
            }
        }
    )


class ScoreResult(BaseModel):
    score: ScoreKey
    value: float
    interpretation: str
    risk_estimate: str | None = None
    clinical_note: str | None = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "score": "qsofa",
                "value": 2.0,
                "interpretation": "high risk",
                "risk_estimate": "In infected ED cohorts, qSOFA >=2 was associated with about 24% in-hospital mortality.",
                "clinical_note": "Use as a bedside prompt for escalation; risk depends on diagnosis and setting.",
            }
        }
    )


class ComputeResponse(BaseModel):
    results: List[ScoreResult]

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "results": [
                    {
                        "score": "qsofa",
                        "value": 2.0,
                        "interpretation": "high risk",
                        "risk_estimate": "In infected ED cohorts, qSOFA >=2 was associated with about 24% in-hospital mortality.",
                        "clinical_note": "Use as a bedside prompt for escalation; risk depends on diagnosis and setting.",
                    },
                    {
                        "score": "apfel_ponv",
                        "value": 3.0,
                        "interpretation": "about 61% risk",
                        "risk_estimate": "Approximate PONV probability is 61%.",
                        "clinical_note": "Consider multimodal antiemetic prophylaxis when risk is moderate or high.",
                    },
                ]
            }
        }
    )


class ValidationIssue(BaseModel):
    field: str
    message: str


class ErrorResponse(BaseModel):
    detail: str
    errors: List[ValidationIssue] = Field(default_factory=list)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "detail": "Invalid inputs for news2",
                "errors": [{"field": "temperature_c", "message": "Field required"}],
            }
        }
    )


class QSOFAInput(BaseModel):
    respiratory_rate: int = Field(..., ge=0, le=80)
    systolic_bp: int = Field(..., ge=0, le=400)
    altered_mental_status: bool


class WilsonInput(BaseModel):
    mouth_opening_cm: float = Field(..., ge=0, le=10)
    thyromental_distance_cm: float = Field(..., ge=0, le=20)
    mallampati_class: int = Field(..., ge=1, le=4)
    neck_mobility_limited: bool
    jaw_protrusion_limited: bool


class StopBangInput(BaseModel):
    snoring: bool
    tiredness: bool
    observed_apnea: bool
    high_blood_pressure: bool
    bmi: float = Field(..., ge=0, le=100)
    age: int = Field(..., ge=0, le=130)
    neck_circumference_cm: float = Field(..., ge=0, le=100)
    male: bool


class RCRIInput(BaseModel):
    high_risk_surgery: bool
    ischemic_heart_disease: bool
    congestive_heart_failure: bool
    cerebrovascular_disease: bool
    insulin_therapy_diabetes: bool
    creatinine_gt_2: bool


class NEWS2Input(BaseModel):
    respiratory_rate: int = Field(..., ge=0, le=80)
    oxygen_saturation: int = Field(..., ge=0, le=100)
    systolic_bp: int = Field(..., ge=0, le=400)
    heart_rate: int = Field(..., ge=0, le=300)
    temperature_c: float = Field(..., ge=25, le=45)
    alert: bool
    on_supplemental_oxygen: bool


class SOFABasicInput(BaseModel):
    pao2_fio2: float = Field(..., ge=0, le=1000)
    platelets: int = Field(..., ge=0, le=1500)
    bilirubin_mg_dl: float = Field(..., ge=0, le=80)
    map_mm_hg: float = Field(..., ge=0, le=250)
    on_vasopressors: bool
    gcs: int = Field(..., ge=3, le=15)
    creatinine_umol_l: float = Field(..., ge=0, le=2000)
    urine_output_ml_day: int = Field(..., ge=0, le=10000)


class ApfelPONVInput(BaseModel):
    female: bool
    non_smoker: bool
    history_ponv_motion_sickness: bool
    postoperative_opioids: bool


class SubjectiveMETsInput(BaseModel):
    subjective_mets: float = Field(..., ge=0, le=20)


class ARISCATInput(BaseModel):
    age: int = Field(..., ge=0, le=130)
    oxygen_saturation: int = Field(..., ge=0, le=100)
    respiratory_infection_last_month: bool
    hemoglobin_g_dl: float = Field(..., ge=3, le=25)
    ariscat_incision: Literal["peripheral", "upper_abdominal", "intrathoracic"]
    surgery_duration_hours: float = Field(..., ge=0, le=24)
    emergency_surgery: bool


class SORTInput(BaseModel):
    age: int = Field(..., ge=0, le=130)
    asa_ps_class: int = Field(..., ge=1, le=5)
    sort_urgency: Literal["elective", "expedited", "urgent", "immediate"]
    sort_high_risk_specialty: bool
    sort_xmajor_complex: bool
    sort_cancer: bool


class GuptaMICAInput(BaseModel):
    age: int = Field(..., ge=0, le=130)
    asa_ps_class: int = Field(..., ge=1, le=5)
    creatinine_umol_l: float = Field(..., ge=0, le=2000)
    mica_functional_status: Literal["independent", "partially_dependent", "totally_dependent"]
    mica_surgery_type: Literal[
        "hernia",
        "anorectal",
        "aortic",
        "bariatric",
        "brain",
        "breast",
        "cardiac",
        "ent",
        "foregut_hpb",
        "gallbladder_appendix_adrenal_spleen",
        "intestinal",
        "neck",
        "obgyn",
        "orthopedic",
        "other_abdominal",
        "peripheral_vascular",
        "skin",
        "spine",
        "thoracic_non_esophageal_non_cardiac",
        "vein",
        "urology",
    ]


class NELAManualInput(BaseModel):
    nela_30_day_mortality_percent: float = Field(..., ge=0, le=100)


class ACSNSQIPManualInput(BaseModel):
    nsqip_mortality_percent: float = Field(..., ge=0, le=100)
    nsqip_serious_complication_percent: float = Field(..., ge=0, le=100)
