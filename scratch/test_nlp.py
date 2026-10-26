import joblib
import pandas as pd

model = joblib.load(r"d:\proyectos antigraviti\proyecto_jimmy\03_MODELO\mejor_modelo_diagnostico_fallas.joblib")

test_cases = [
    {
        "nombre": "Caso 1 (Español crudo): No enciende, batería buena",
        "tipo_equipo": "laptop", "marca": "HP", "antiguedad_anios": 2.0,
        "sintoma": "no se enciende, pero sus bateria da buena corriente"
    },
    {
        "nombre": "Caso 1 (Enriquecido / Técnico): No enciende, Power/battery laptop power on",
        "tipo_equipo": "laptop", "marca": "HP", "antiguedad_anios": 2.0,
        "sintoma": "no enciende, no turn on, will not boot, power battery charging failure"
    },
    {
        "nombre": "Caso 2 (Español crudo): Pantalla negra 3 pitidos",
        "tipo_equipo": "desktop", "marca": "Dell", "antiguedad_anios": 7.0,
        "sintoma": "enciende pero no da video, el monitor se queda en negro y emite tres pitidos"
    },
    {
        "nombre": "Caso 2 (Enriquecido / Técnico): Beep codes, no video display screen",
        "tipo_equipo": "desktop", "marca": "Dell", "antiguedad_anios": 7.0,
        "sintoma": "enciende pero no da video pantalla negra tres pitidos beep codes screen display memory system board ram"
    },
    {
        "nombre": "Caso 3: Boot / Reboot device",
        "tipo_equipo": "desktop", "marca": "Sin marca", "antiguedad_anios": 6.0,
        "sintoma": "no arranca el sistema operativo, muestra mensaje reboot and select proper boot device"
    }
]

for tc in test_cases:
    df = pd.DataFrame([{
        "tipo_equipo": tc["tipo_equipo"],
        "marca": tc["marca"],
        "antiguedad_anios": tc["antiguedad_anios"],
        "sintoma": tc["sintoma"]
    }])
    pred = model.predict(df)[0]
    probs = model.predict_proba(df)[0]
    top3_idx = probs.argsort()[-3:][::-1]
    top3 = [(model.classes_[i], round(probs[i] * 100, 1)) for i in top3_idx]
    print(f"\n--- {tc['nombre']} ---")
    print(f"Predicción: {pred} ({top3[0][1]}%)")
    print(f"Top 3: {top3}")
