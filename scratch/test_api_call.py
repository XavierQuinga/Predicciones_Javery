import urllib.request
import json

payload = {
    "tipo_equipo": "laptop",
    "marca": "HP",
    "antiguedad_anios": 2.0,
    "sintoma": "no se enciende, pero sus bateria da buena corriente."
}

req = urllib.request.Request(
    "http://127.0.0.1:8000/api/predict",
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode("utf-8"))
    print("STATUS:", resp.status)
    print("Falla:", data.get("falla_predicha"))
    print("Falla ES:", data.get("falla_predicha_es"))
    print("Confianza %:", data.get("porcentaje_confianza"))
    print("Mensaje:", data.get("mensaje_confianza"))
    print("Top 3:", json.dumps(data.get("top3"), indent=2, ensure_ascii=False))
