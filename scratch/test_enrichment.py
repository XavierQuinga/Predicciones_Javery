import joblib
import pandas as pd
import re

model = joblib.load(r"d:\proyectos antigraviti\proyecto_jimmy\03_MODELO\mejor_modelo_diagnostico_fallas.joblib")

# Diccionario de enriquecimiento de dominio técnico (Español -> English repair domain)
DICTIONARY = [
    # Energía y batería
    (r"\b(bater[ií]a|cargador|carga|no enciende|no prende|apaga|corriente|alimentaci[oó]n|centro de carga|power|battery)\b", "power battery charging charger no power will not turn on"),
    # Video y pantalla
    (r"\b(pantalla|video|monitor|display|imagen|negro|negra|parpadea|rayas|l[ií]neas|lcd|screen|glitch)\b", "screen display video monitor blank black screen flickering lcd"),
    # Pitidos y placa madre
    (r"\b(pitido|pitidos|beep|beeps|motherboard|placa|tarjeta madre|corto|chispas|ram|memoria)\b", "system board motherboard beep codes ram memory short circuit"),
    # Disco y almacenamiento / Boot
    (r"\b(disco|disco duro|ssd|hdd|arranque|boot|reboot|no arranca|no inicia|no detecta disco|proper boot device)\b", "internal storage boot hdd ssd hard drive reboot select proper boot device"),
    # Sistema operativo / congelamiento
    (r"\b(sistema operativo|windows|pantalla azul|bsod|pantallazo|congelad[oa]|lent[oa]|lentitud)\b", "operating system windows blue screen bsod freezing slow performance"),
    # Sobrecalentamiento
    (r"\b(calienta|sobrecalienta|caliente|temperatura|ventilador|cooler|fan|ruido fuerte|se apaga solo)\b", "overheating temperature thermal fan cooler loud noise shuts down"),
    # Teclado / Periféricos
    (r"\b(teclado|teclas|keyboard|touchpad|mouse|rat[oó]n|cursor|puerto|usb)\b", "integrated keyboard keys touchpad mouse ports usb"),
    # Virus / malware
    (r"\b(virus|malware|troyano|publicidad|popups|infectado|hackeado)\b", "virus malware infection adware popups"),
    # Daño físico / caídas
    (r"\b(ca[ií]da|golpe|derrame|agua|l[ií]quido|roto|quebrado|bisagra)\b", "internal damage liquid spill drop broken hinge chassis physical damage")
]

def enrich_symptom(text: str) -> str:
    cleaned = text.lower()
    additions = []
    for pattern, eng_terms in DICTIONARY:
        if re.search(pattern, cleaned, re.IGNORECASE):
            additions.append(eng_terms)
    
    if additions:
        return f"{text} {' '.join(additions)}"
    return text

casos = [
    ("laptop", "HP", 2.0, "no se enciende, pero sus bateria da buena corriente."),
    ("desktop", "Dell", 7.0, "enciende pero no da video, el monitor se queda en negro y emite tres pitidos"),
    ("laptop", "Lenovo", 3.0, "se calienta demasiado y el ventilador suena fuertisimo antes de apagarse"),
    ("desktop", "HP", 4.0, "sale pantalla azul con codigo memory management al abrir programas"),
    ("laptop", "Asus", 1.0, "el teclado tiene varias teclas que no funcionan y el touchpad no hace clic"),
    ("desktop", "Sin marca", 6.0, "no arranca el sistema operativo, muestra mensaje reboot and select proper boot device")
]

print("=== COMPARACIÓN CRUDA VS ENRIQUECIDA ===")
for tipo, marca, edad, sintoma in casos:
    df_raw = pd.DataFrame([{"tipo_equipo": tipo, "marca": marca, "antiguedad_anios": edad, "sintoma": sintoma}])
    p_raw = model.predict(df_raw)[0]
    c_raw = max(model.predict_proba(df_raw)[0]) * 100

    sintoma_enr = enrich_symptom(sintoma)
    df_enr = pd.DataFrame([{"tipo_equipo": tipo, "marca": marca, "antiguedad_anios": edad, "sintoma": sintoma_enr}])
    p_enr = model.predict(df_enr)[0]
    c_enr = max(model.predict_proba(df_enr)[0]) * 100

    print(f"\nSíntoma: '{sintoma}'")
    print(f"  -> CRUDA:       {p_raw:<22} ({c_raw:.1f}%)")
    print(f"  -> ENRIQUECIDA: {p_enr:<22} ({c_enr:.1f}%)")
