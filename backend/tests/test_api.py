from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_scores_lists_available_scores() -> None:
    response = client.get("/scores")
    assert response.status_code == 200
    payload = response.json()
    keys = {item["key"] for item in payload}
    assert {
        "wilson",
        "stop_bang",
        "rcri",
        "news2",
        "qsofa",
        "sofa_basic",
        "apfel_ponv",
        "subjective_mets",
        "ariscat",
        "sort",
        "gupta_mica",
        "nela_manual",
        "acs_nsqip_manual",
    }.issubset(keys)


def test_compute_qsofa_success() -> None:
    response = client.post(
        "/compute",
        json={
            "selected_scores": ["qsofa"],
            "inputs": {
                "respiratory_rate": 24,
                "systolic_bp": 95,
                "altered_mental_status": True,
            },
        },
    )
    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["score"] == "qsofa"
    assert result["value"] == 3.0


def test_compute_wilson_success() -> None:
    response = client.post(
        "/compute",
        json={
            "selected_scores": ["wilson"],
            "inputs": {
                "mouth_opening_cm": 2.8,
                "thyromental_distance_cm": 5.8,
                "mallampati_class": 4,
                "neck_mobility_limited": True,
                "jaw_protrusion_limited": True,
            },
        },
    )
    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["score"] == "wilson"
    assert result["value"] == 9.0


def test_compute_stop_bang_success() -> None:
    response = client.post(
        "/compute",
        json={
            "selected_scores": ["stop_bang"],
            "inputs": {
                "snoring": True,
                "tiredness": True,
                "observed_apnea": True,
                "high_blood_pressure": True,
                "bmi": 38,
                "age": 62,
                "neck_circumference_cm": 43,
                "male": True,
            },
        },
    )
    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["score"] == "stop_bang"
    assert result["value"] == 8.0


def test_compute_rcri_success() -> None:
    response = client.post(
        "/compute",
        json={
            "selected_scores": ["rcri"],
            "inputs": {
                "high_risk_surgery": True,
                "ischemic_heart_disease": True,
                "congestive_heart_failure": False,
                "cerebrovascular_disease": True,
                "insulin_therapy_diabetes": False,
                "creatinine_gt_2": False,
            },
        },
    )
    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["score"] == "rcri"
    assert result["value"] == 3.0


def test_compute_news2_success() -> None:
    response = client.post(
        "/compute",
        json={
            "selected_scores": ["news2"],
            "inputs": {
                "respiratory_rate": 30,
                "oxygen_saturation": 90,
                "systolic_bp": 85,
                "heart_rate": 132,
                "temperature_c": 34.8,
                "alert": False,
                "on_supplemental_oxygen": True,
            },
        },
    )
    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["score"] == "news2"
    assert result["value"] == 20.0


def test_compute_sofa_basic_success() -> None:
    response = client.post(
        "/compute",
        json={
            "selected_scores": ["sofa_basic"],
            "inputs": {
                "pao2_fio2": 180,
                "platelets": 40,
                "bilirubin_mg_dl": 7.2,
                "map_mm_hg": 62,
                "on_vasopressors": True,
                "gcs": 9,
                "creatinine_umol_l": 336.0,
                "urine_output_ml_day": 450,
            },
        },
    )
    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["score"] == "sofa_basic"
    assert result["value"] == 18.0


def test_compute_apfel_ponv_success() -> None:
    response = client.post(
        "/compute",
        json={
            "selected_scores": ["apfel_ponv"],
            "inputs": {
                "female": True,
                "non_smoker": True,
                "history_ponv_motion_sickness": True,
                "postoperative_opioids": False,
            },
        },
    )
    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["score"] == "apfel_ponv"
    assert result["value"] == 3.0
    assert "61%" in result["interpretation"]


def test_compute_subjective_mets_success() -> None:
    response = client.post(
        "/compute",
        json={
            "selected_scores": ["subjective_mets"],
            "inputs": {
                "subjective_mets": 3.5,
            },
        },
    )
    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["score"] == "subjective_mets"
    assert result["value"] == 3.5


def test_compute_ariscat_success() -> None:
    response = client.post(
        "/compute",
        json={
            "selected_scores": ["ariscat"],
            "inputs": {
                "age": 78,
                "oxygen_saturation": 92,
                "respiratory_infection_last_month": True,
                "hemoglobin_g_dl": 9.6,
                "ariscat_incision": "upper_abdominal",
                "surgery_duration_hours": 3.4,
                "emergency_surgery": True,
            },
        },
    )
    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["score"] == "ariscat"
    assert result["value"] == 85.0


def test_compute_sort_success() -> None:
    response = client.post(
        "/compute",
        json={
            "selected_scores": ["sort"],
            "inputs": {
                "age": 72,
                "asa_ps_class": 3,
                "sort_urgency": "urgent",
                "sort_high_risk_specialty": True,
                "sort_xmajor_complex": True,
                "sort_cancer": False,
            },
        },
    )
    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["score"] == "sort"
    assert result["value"] > 0


def test_compute_gupta_mica_success() -> None:
    response = client.post(
        "/compute",
        json={
            "selected_scores": ["gupta_mica"],
            "inputs": {
                "age": 68,
                "asa_ps_class": 3,
                "creatinine_umol_l": 168.0,
                "mica_functional_status": "partially_dependent",
                "mica_surgery_type": "intestinal",
            },
        },
    )
    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["score"] == "gupta_mica"
    assert result["value"] > 0


def test_compute_nela_manual_success() -> None:
    response = client.post(
        "/compute",
        json={
            "selected_scores": ["nela_manual"],
            "inputs": {
                "nela_30_day_mortality_percent": 14.2,
            },
        },
    )
    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["score"] == "nela_manual"
    assert result["value"] == 14.2


def test_compute_acs_nsqip_manual_success() -> None:
    response = client.post(
        "/compute",
        json={
            "selected_scores": ["acs_nsqip_manual"],
            "inputs": {
                "nsqip_mortality_percent": 2.3,
                "nsqip_serious_complication_percent": 16.8,
            },
        },
    )
    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["score"] == "acs_nsqip_manual"
    assert result["value"] == 2.3


def test_compute_multiple_scores_in_one_request() -> None:
    response = client.post(
        "/compute",
        json={
            "selected_scores": ["qsofa", "apfel_ponv"],
            "inputs": {
                "respiratory_rate": 24,
                "systolic_bp": 95,
                "altered_mental_status": True,
                "female": True,
                "non_smoker": False,
                "history_ponv_motion_sickness": True,
                "postoperative_opioids": True,
            },
        },
    )
    assert response.status_code == 200
    payload = response.json()["results"]
    assert [item["score"] for item in payload] == ["qsofa", "apfel_ponv"]


def test_compute_requires_required_input_fields() -> None:
    response = client.post(
        "/compute",
        json={
            "selected_scores": ["news2"],
            "inputs": {
                "respiratory_rate": 18,
            },
        },
    )
    assert response.status_code == 400
    payload = response.json()
    assert payload["detail"] == "Invalid inputs for news2"
    assert any(err["field"] == "temperature_c" for err in payload["errors"])


def test_openapi_includes_compute_examples() -> None:
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    request_example = schema["components"]["schemas"]["ComputeRequest"]["example"]
    response_example = schema["components"]["schemas"]["ComputeResponse"]["example"]
    assert request_example["selected_scores"]
    assert request_example["inputs"]
    assert response_example["results"]
