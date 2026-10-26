import os
import sys
import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, backend_dir)

from app.main import app
from app.services.model_service import model_service

client = TestClient(app)

def test_model_loading():
    model_service.load_model()
    assert model_service.is_loaded is True
    assert len(model_service.classes) == 19
    assert "System board" in model_service.classes
    assert "Power/battery" in model_service.classes
    assert "Operating system" in model_service.classes

def test_model_inference_laptop():
    resultado = model_service.predict(
        tipo_equipo="laptop",
        marca="HP",
        antiguedad_anios=5.0,
        sintoma="blue screen on boot, laptop restarts continuously"
    )
    assert "falla_predicha" in resultado
    assert "confianza" in resultado
    assert resultado["confianza"] > 0.0
    assert len(resultado["top3"]) == 3
    assert resultado["top3"][0]["falla"] == resultado["falla_predicha"]

def test_model_inference_missing_age_imputation():
    resultado = model_service.predict(
        tipo_equipo="desktop",
        marca="Sin marca",
        antiguedad_anios=None,
        sintoma="No enciende tras corte de energía"
    )
    assert "falla_predicha" in resultado
    assert resultado["confianza"] > 0.0
    assert len(resultado["top3"]) == 3

def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert data["model"]["loaded"] is True
    assert data["model"]["classes_count"] == 19

def test_api_features():
    response = client.get("/api/model/features")
    assert response.status_code == 200
    data = response.json()
    assert "desktop" in data["tipos_equipo"]
    assert "laptop" in data["tipos_equipo"]
    assert len(data["marcas"]) > 10
    assert len(data["ejemplos_sintomas"]) > 0

def test_api_model_info():
    response = client.get("/api/model/info")
    assert response.status_code == 200
    data = response.json()
    assert data["nombre_modelo"] == "Random_Forest"
    assert data["num_clases"] == 19
    assert "test_accuracy" in data["metricas_mejor_modelo"]

def test_api_predict_flow_persists_record():
    payload = {
        "tipo_equipo": "laptop",
        "marca": "Dell",
        "antiguedad_anios": 3.0,
        "sintoma": "Sobrecalentamiento excesivo y ventilador muy ruidoso antes de apagarse"
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["prediction_id"], int)
    assert data["prediction_id"] > 0
    assert "falla_predicha" in data
    assert "confianza" in data
    assert data["detalles_equipo"]["marca"] == "Dell"
    assert len(data["top3"]) == 3

    detail = client.get(f"/api/predictions/{data['prediction_id']}")
    assert detail.status_code == 200
    stored = detail.json()
    assert stored["id"] == data["prediction_id"]
    assert stored["marca"] == "Dell"
    assert stored["sintoma"] == payload["sintoma"]
    assert stored["falla_predicha"] == data["falla_predicha"]

def test_api_predict_validation_error():
    payload = {
        "tipo_equipo": "tablet",
        "marca": "Apple",
        "antiguedad_anios": 2.0,
        "sintoma": "ok"
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422

def test_api_predictions_list():
    response = client.get("/api/predictions?page=1&page_size=5")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert isinstance(data["items"], list)

def test_api_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_predicciones" in data
    assert "distribucion_tipo_equipo" in data
