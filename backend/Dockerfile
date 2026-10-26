# Imagen base oficial de Python 3.11 optimizada
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# El contexto de build es la raíz del repositorio (docker-compose.yml / Railway).
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Copiar código, artefactos del modelo y dashboard interactivo.
COPY backend/app/ /app/app/
COPY backend/ml/ /app/backend/ml/
COPY 03_MODELO/ /app/03_MODELO/
COPY 07_POWER_BI/DASHBOARD_PREVISUALIZACION_JAVERY.html /app/07_POWER_BI/DASHBOARD_PREVISUALIZACION_JAVERY.html

# Fallar el build si el dashboard no quedó incluido en la imagen.
RUN test -f /app/07_POWER_BI/DASHBOARD_PREVISUALIZACION_JAVERY.html

RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Un worker evita duplicar innecesariamente en memoria el modelo serializado de ~60 MB.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
