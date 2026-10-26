# Guía de Preparación y Despliegue en Microsoft Azure

**Proyecto:** Sistema Predictivo de Diagnóstico de Fallas en Equipos Informáticos  
**Caso de Estudio:** JAVERY – Quito, Ecuador  

---

## 1. Arquitectura en la Nube (Azure Cloud)

```
┌──────────────────────────────────────────────────────────────┐
│                    MICROSOFT AZURE CLOUD                     │
│                                                              │
│   ┌────────────────────────┐      ┌──────────────────────┐  │
│   │ Azure Static Web Apps  │ ───► │  Azure App Service   │  │
│   │ (Frontend React / Vite)│ HTTP │  (Backend FastAPI)   │  │
│   └────────────────────────┘      └──────────┬───────────┘  │
│                                              │ SQL / SSL    │
│                                              ▼              │
│                           ┌──────────────────────────────┐  │
│                           │ Azure Database for PostgreSQL│  │
│                           │ Flexible Server (B1ms / D2s) │  │
│                           └──────────────┬───────────────┘  │
│                                          │ DirectQuery      │
│                                          ▼                  │
│                               ┌──────────────────────┐      │
│                               │   Power BI Service   │      │
│                               │  (Dashboard Online)  │      │
│                               └──────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Componentes y Servicios de Azure Sugeridos

1. **Base de Datos:** **Azure Database for PostgreSQL Flexible Server**
   - Nivel de cómputo: Burstable `B1ms` (1 vCore, 2 GB RAM, 32 GB almacenamiento) para pruebas académicas económicas.
   - Seguridad: Reglas de firewall para permitir servicios de Azure y la IP del taller.
2. **Backend API:** **Azure App Service (Linux Container)**
   - Plan de App Service: `B1` (Basic) o `F1` (Free) con contenedor Docker.
   - Imagen construida a partir de [`backend/Dockerfile`](file:///d:/proyectos%20antigraviti/proyecto_jimmy/backend/Dockerfile).
3. **Frontend:** **Azure Static Web Apps**
   - Plan Free con CDN global y certificado SSL automático.
4. **Registro de Imágenes:** **Azure Container Registry (ACR)** (Basic).

---

## 3. Despliegue Paso a Paso mediante Azure CLI

### Paso 1: Inicio de Sesión y Grupo de Recursos
```bash
# Iniciar sesión en la suscripción de Azure
az login

# Definir variables
RESOURCE_GROUP="rg-diagnostico-ti"
LOCATION="eastus"
ACR_NAME="acrdiagnosticoti$RANDOM"
POSTGRES_SERVER="psql-javery-diagnostico"

# Crear el grupo de recursos
az group create --name $RESOURCE_GROUP --location $LOCATION
```

### Paso 2: Crear Servidor PostgreSQL Flexible en Azure
```bash
# Crear el servidor PostgreSQL
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER \
  --location $LOCATION \
  --admin-user adminjavery \
  --admin-password "TuPasswordSeguro123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 16

# Permitir conexiones desde servicios de Azure
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER \
  --rule-name AllowAllAzureIPs \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Crear la base de datos operativa
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $POSTGRES_SERVER \
  --database-name diagnostico_ti
```

### Paso 3: Inicializar Tablas y Vistas
Conectarse al servidor mediante `psql` o Azure Cloud Shell y ejecutar los scripts:
```bash
psql "host=$POSTGRES_SERVER.postgres.database.azure.com port=5432 dbname=diagnostico_ti user=adminjavery password=TuPasswordSeguro123! sslmode=require" -f database/schema.sql
psql "host=$POSTGRES_SERVER.postgres.database.azure.com port=5432 dbname=diagnostico_ti user=adminjavery password=TuPasswordSeguro123! sslmode=require" -f database/views_powerbi.sql
```

### Paso 4: Desplegar Backend FastAPI en Azure App Service
```bash
# Crear Azure Container Registry
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

# Construir y subir la imagen Docker del backend
az acr build --registry $ACR_NAME --image diagnostico-backend:v1 -f backend/Dockerfile .

# Crear Plan de App Service en Linux
az appservice plan create --name plan-diagnostico --resource-group $RESOURCE_GROUP --sku B1 --is-linux

# Crear la aplicación Web App para Contenedores
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan plan-diagnostico \
  --name app-diagnostico-backend \
  --deployment-container-image-name "$ACR_NAME.azurecr.io/diagnostico-backend:v1"

# Configurar variables de entorno en el App Service
az webapp config appsettings set --resource-group $RESOURCE_GROUP --name app-diagnostico-backend --settings \
  DB_HOST="$POSTGRES_SERVER.postgres.database.azure.com" \
  DB_PORT=5432 \
  DB_NAME="diagnostico_ti" \
  DB_USER="adminjavery" \
  DB_PASSWORD="TuPasswordSeguro123!" \
  DB_SSLMODE="require" \
  ALLOW_SQLITE_FALLBACK="false" \
  WEBSITES_PORT=8000
```

### Paso 5: Desplegar Frontend en Azure Static Web Apps
```bash
# Compilar el bundle estático en local
cd frontend
npm ci
npm run build

# Desplegar en Azure Static Web Apps
az staticwebapp create \
  --name app-diagnostico-frontend \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --source dist
```

---

## 4. Verificación Post-Despliegue

1. Comprobar salud del servicio en línea: `https://app-diagnostico-backend.azurewebsites.net/api/health`.
2. Verificar respuesta con `status: "healthy"` y motor `PostgreSQL`.
3. Abrir la URL del frontend estático y realizar una predicción de prueba.
4. Conectar Power BI Desktop a `$POSTGRES_SERVER.postgres.database.azure.com` y verificar la actualización del reporte.
