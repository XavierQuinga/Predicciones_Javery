import os
import json
import logging
from typing import Dict, Any, List, Optional
import joblib
import pandas as pd
import numpy as np
from app.config.settings import settings

logger = logging.getLogger("diagnostico_ti.model")

# Mapeo y traducción técnica al español de las 19 clases de falla de CompCat
TRADUCCION_CLASES = {
    "Power/battery": "Alimentación, Batería o Circuito de Carga",
    "System board": "Placa Base / Tarjeta Madre / Chipset",
    "Integrated screen": "Pantalla Integrada / Flex de Video / Panel LCD",
    "Internal storage": "Unidad de Almacenamiento (Disco HDD / SSD)",
    "Boot": "Secuencia de Arranque / Master Boot Record / UEFI",
    "Operating system": "Sistema Operativo (Windows / Controladores / Archivos del Sistema)",
    "Performance": "Rendimiento Lento, Congelamiento o Saturación de Memoria/CPU",
    "Overheating": "Sobrecalentamiento Térmico / Disipador o Ventilador",
    "Integrated keyboard": "Teclado Integrado / Teclas Dañadas",
    "Integrated pointing device": "Touchpad / Dispositivo Puntero",
    "Ports/slots/connectors": "Puertos, Ranuras o Conectores (USB, HDMI, Jack)",
    "Virus/malware": "Infección por Virus / Malware / Publicidad Invasiva",
    "Configuration": "Configuración de Sistema, BIOS o Controladores",
    "Internal damage": "Daño Físico Interno / Golpe o Derrame de Líquido",
    "Case/chassis": "Carcasa, Chasis o Bisagras",
    "Integrated media component": "Componente Multimedia (Cámara, Micrófono, Parlantes)",
    "Integrated optical drive": "Unidad Óptica / Lectora CD/DVD",
    "Multiple": "Múltiples Fallas Combinadas de Hardware/Software",
    "Other": "Otro / Falla Atípica No Clasificada"
}

# Diccionario técnico bilingüe para mitigar el desfase translingüístico (Cross-Lingual Shift)
# Alimenta el extractor TF-IDF con los términos técnicos que los 200 árboles de decisión aprendieron.
DICCIONARIO_ENRIQUECIMIENTO = [
    # Alimentación y Batería
    (r"\b(bater[ií]a|cargador|carga|no enciende|no prende|apaga al desconectar|corriente|alimentaci[oó]n|centro de carga|jack de carga|power|battery)\b", "power battery charging charger no power will not turn on ac dc adapter power supply"),
    # Pantalla y Video
    (r"\b(pantalla|video|monitor|display|imagen|negro|negra|parpadea|rayas|l[ií]neas|lcd|screen|glitch|bsod|azul|flex)\b", "integrated screen display video monitor blank black screen flickering lcd panel backlight flex cable"),
    # Placa Base / Motherboard / RAM
    (r"\b(pitido|pitidos|beep|beeps|motherboard|placa|tarjeta madre|corto|chispas|ram|memoria|chipset)\b", "system board motherboard mainboard beep codes ram memory short circuit chipset"),
    # Almacenamiento Interno (Disco / SSD / HDD) - Separado de Boot para evitar dilución
    (r"\b(disco|disco duro|ssd|hdd|m\.?2|nvme|sata|almacenamiento|sectores|no detecta disco|hard drive|disk drive|smart error)\b", "internal storage hdd ssd hard drive disk drive storage failure sectors read write"),
    # Secuencia de Arranque / Boot / UEFI - Separado de Almacenamiento
    (r"\b(arranque|boot|reboot|no arranca|no inicia|no bootea|proper boot device|uefi|bios|mbr|secuencia de arranque|loop de reinicio)\b", "boot sequence startup uefi bios bootable reboot error select proper boot device"),
    # Sistema Operativo y Controladores
    (r"\b(sistema operativo|windows|actualizaci[oó]n|controlador|driver|pantallazo azul|error de detenci[oó]n)\b", "operating system windows driver update system files crash stop code"),
    # Rendimiento y Saturación
    (r"\b(congelad[oa]|lent[oa]|lentitud|se cuelga|se pega|demora|100% disco|100% cpu)\b", "performance slow lag freezing unresponsive slow system high cpu usage"),
    # Sobrecalentamiento Térmico
    (r"\b(calienta|sobrecalienta|caliente|temperatura|ventilador|cooler|fan|ruido fuerte|se apaga solo|pasta t[eé]rmica|hirviendo)\b", "overheating temperature thermal fan cooler loud noise shuts down heat thermal paste"),
    # Teclado y Dispositivos de Entrada
    (r"\b(teclado|teclas|keyboard|touchpad|mouse|rat[oó]n|cursor)\b", "integrated keyboard keys touchpad pointer input device"),
    # Puertos y Conectores
    (r"\b(puerto|puertos|usb|hdmi|jack|conector|ranura|lector de tarjetas)\b", "ports slots connectors usb hdmi audio jack connector"),
    # Infección por Virus / Malware
    (r"\b(virus|malware|troyano|publicidad|popups|infectado|hackeado|spyware|ransomware)\b", "virus malware infection adware popups trojan ransomware"),
    # Daño Físico Interno / Derrame de Líquido
    (r"\b(ca[ií]da|golpe|derrame|agua|l[ií]quido|roto|quebrado|bisagra|chasis|carcasa)\b", "internal damage liquid spill drop broken hinge chassis physical damage casing")
]

import re

def enrich_symptom_text(text: str) -> str:
    cleaned = text.lower()
    additions = []
    for pattern, terms in DICCIONARIO_ENRIQUECIMIENTO:
        if re.search(pattern, cleaned, re.IGNORECASE):
            additions.append(terms)
    if additions:
        return f"{text} {' '.join(additions)}"
    return text

class ModelService:
    _instance = None

    def __init__(self):
        self.pipeline = None
        self.metadata: Dict[str, Any] = {}
        self.classes: List[str] = []
        self.is_loaded = False

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_model(self):
        """Carga en memoria el pipeline de Scikit-Learn y los metadatos JSON."""
        if self.is_loaded:
            return

        model_path = settings.MODEL_PATH
        if not os.path.exists(model_path):
            # Intentar resolver ruta relativa al proyecto
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
            alt_path = os.path.join(base_dir, model_path)
            if os.path.exists(alt_path):
                model_path = alt_path
            else:
                raise FileNotFoundError(f"No se encontró el archivo del modelo en: {model_path} ni en {alt_path}")

        logger.info("Cargando pipeline serializado desde: %s ...", model_path)
        self.pipeline = joblib.load(model_path)
        self.classes = list(self.pipeline.classes_)
        logger.info("✓ Modelo cargado exitosamente. Clases diagnósticas disponibles: %d", len(self.classes))

        # Cargar metadatos
        meta_path = settings.METADATA_PATH
        if not os.path.exists(meta_path):
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
            alt_meta = os.path.join(base_dir, meta_path)
            if os.path.exists(alt_meta):
                meta_path = alt_meta

        if os.path.exists(meta_path):
            with open(meta_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)
            logger.info("✓ Metadatos del modelo cargados desde: %s", meta_path)
        else:
            logger.warning("No se encontró metadata.json en %s. Usando valores básicos inferidos.", meta_path)
            self.metadata = {
                "nombre_modelo": "Random_Forest",
                "tipo_algoritmo": "RandomForestClassifier",
                "version": "1.0.0",
                "clases": self.classes
            }

        self.is_loaded = True

    def predict(
        self,
        tipo_equipo: str,
        marca: str,
        antiguedad_anios: Optional[float],
        sintoma: str
    ) -> Dict[str, Any]:
        """
        Ejecuta la inferencia respetando exactamente las columnas, tipos
        y orden con los que se entrenó en Google Colab, mitigando el desfase
        léxico español-inglés mediante enriquecimiento semántico técnico.
        """
        if not self.is_loaded or self.pipeline is None:
            self.load_model()

        # Enriquecer síntoma para conectar el lenguaje coloquial en español con los n-gramas del modelo
        sintoma_procesado = enrich_symptom_text(sintoma)

        # Construir el DataFrame exactamente como espera el preprocesador
        input_df = pd.DataFrame([{
            "tipo_equipo": tipo_equipo,
            "marca": marca,
            "antiguedad_anios": antiguedad_anios if antiguedad_anios is not None else np.nan,
            "sintoma": sintoma_procesado
        }])

        # Inferencia de la clase ganadora
        pred_class = self.pipeline.predict(input_df)[0]

        # Inferencia de probabilidades si el estimador lo soporta
        has_proba = hasattr(self.pipeline, "predict_proba")
        top3_list = []
        full_probabilities = {}
        confidence = 1.0

        if has_proba:
            proba_matrix = self.pipeline.predict_proba(input_df)[0]
            confidence = float(proba_matrix.max())
            
            # Mapear todas las clases a sus probabilidades
            for idx, cls_name in enumerate(self.classes):
                full_probabilities[cls_name] = round(float(proba_matrix[idx]), 4)

            # Extraer las 3 clases con mayor certeza
            top3_indices = proba_matrix.argsort()[::-1][:3]
            for idx in top3_indices:
                cls_name = self.classes[idx]
                prob = float(proba_matrix[idx])
                top3_list.append({
                    "falla": cls_name,
                    "falla_es": TRADUCCION_CLASES.get(cls_name, cls_name),
                    "confianza": round(prob, 4),
                    "porcentaje": round(prob * 100, 2)
                })
        else:
            top3_list.append({
                "falla": pred_class,
                "falla_es": TRADUCCION_CLASES.get(pred_class, pred_class),
                "confianza": 1.0,
                "porcentaje": 100.0
            })

        # Generar mensaje contextual sobre la certeza diagnóstica
        # En un problema multiclase con 19 opciones, el azar teórico es 1/19 = 5.26%
        base_chance = (1.0 / len(self.classes)) if len(self.classes) > 0 else 0.0526
        dominance_ratio = round(confidence / base_chance, 1)
        top2_cum = round(sum(t["porcentaje"] for t in top3_list[:2]), 1) if len(top3_list) >= 2 else round(confidence * 100, 1)

        if confidence >= 0.50:
            msg = f"Alta certeza diagnóstica ({dominance_ratio}x superior al azar de 19 clases: {round(base_chance*100, 1)}%). Patrón de hardware dominante."
        elif confidence >= 0.32:
            msg = f"Certeza diagnóstica sólida ({dominance_ratio}x superior al azar base). Las 2 opciones principales acumulan el {top2_cum}% de probabilidad."
        else:
            msg = f"Diagnóstico distribuido entre subsistemas afines. Las 2 opciones principales concentran el {top2_cum}% de la probabilidad."

        return {
            "falla_predicha": pred_class,
            "falla_predicha_es": TRADUCCION_CLASES.get(pred_class, pred_class),
            "confianza": round(confidence, 4),
            "porcentaje_confianza": round(confidence * 100, 2),
            "top3": top3_list,
            "mensaje_confianza": msg,
            "dominance_ratio": dominance_ratio,
            "top2_acumulada": top2_cum,
            "probabilidades_completas": full_probabilities,
            "modelo_utilizado": self.metadata.get("nombre_modelo", "Random_Forest"),
            "version_modelo": self.metadata.get("version", "1.0.0"),
            "total_clases_evaluadas": len(self.classes),
            "azar_base_porcentaje": round(base_chance * 100, 2)
        }

    def get_info(self) -> Dict[str, Any]:
        if not self.is_loaded:
            self.load_model()
        return self.metadata

    def get_allowed_features(self) -> Dict[str, Any]:
        if not self.is_loaded:
            self.load_model()
        
        ejemplos = [
            {
                "titulo": "Falla de encendido y alimentación (Laptop)",
                "sintoma": "no enciende, la luz del cargador parpadea y huele a quemado",
                "tipo_equipo": "laptop",
                "marca": "HP",
                "antiguedad_anios": 5.0
            },
            {
                "titulo": "Sin señal de video (Desktop)",
                "sintoma": "enciende pero no da video, el monitor se queda en negro y emite tres pitidos",
                "tipo_equipo": "desktop",
                "marca": "Dell",
                "antiguedad_anios": 7.0
            },
            {
                "titulo": "Sobrecalentamiento y apagado repentino",
                "sintoma": "ventilador suena muy fuerte y la laptop se apaga sola a los 10 minutos de trabajo",
                "tipo_equipo": "laptop",
                "marca": "Lenovo",
                "antiguedad_anios": 4.0
            },
            {
                "titulo": "Fallo en arranque y disco duro",
                "sintoma": "no arranca el sistema operativo, muestra mensaje reboot and select proper boot device",
                "tipo_equipo": "desktop",
                "marca": "Sin marca",
                "antiguedad_anios": 6.0
            }
        ]

        return {
            "tipos_equipo": self.metadata.get("tipo_equipo_categorias", ["desktop", "laptop"]),
            "marcas": self.metadata.get("marcas_categorias", ["HP", "Lenovo", "Dell", "Asus", "Acer", "Apple", "Sin marca"]),
            "marcas_destacadas": self.metadata.get("marcas_destacadas", ["HP", "Lenovo", "Dell", "Asus", "Acer", "Apple", "Toshiba", "Samsung", "Sin marca"]),
            "antiguedad_anios_default": self.metadata.get("antiguedad_anios_stats", {}).get("mediana_imputacion", 6.0),
            "antiguedad_anios_min": self.metadata.get("antiguedad_anios_stats", {}).get("min_escala", 0.0),
            "antiguedad_anios_max": self.metadata.get("antiguedad_anios_stats", {}).get("max_escala", 39.0),
            "ejemplos_sintomas": ejemplos
        }

model_service = ModelService.get_instance()
