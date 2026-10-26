# JAVERY Executive Live — Power BI DirectQuery

Esta carpeta es una **copia independiente** del dashboard original. No reemplaza `JAVERY_PBIP_DIRECTQUERY_RAILWAY` ni el informe que ya está publicado en Power BI Service.

## Objetivo

- Abrir el informe real en Power BI Desktop y publicarlo como un informe **NUEVO** en Power BI Service.
- Consultar `public.predicciones` directamente desde PostgreSQL Railway mediante el conector nativo `PostgreSQL.Database`.
- Usar `DirectQuery` para que los visuales consulten los datos actuales de la base cuando el usuario interactúa o actualiza el informe.
- Mantener un diseño ejecutivo limpio, claro y optimizado para navegador 1920x1080.

## Conexión

- Servidor: `crossover.proxy.rlwy.net:42473`
- Base de datos: `railway`
- Tabla: `public.predicciones`
- Conector: PostgreSQL nativo
- Modo: DirectQuery
- Credenciales: **NO** se guardan en GitHub.

## Diseño V2

### Página 1 — Centro de Diagnóstico en Vivo
- 4 KPI: total de diagnósticos, confianza promedio, diagnósticos de la app y última consulta.
- Distribución de fallas.
- Distribución por tipo de equipo.
- Tabla operativa reciente.

### Página 2 — Detalle y Monitoreo
- Filtros compactos por tipo de equipo, marca y falla.
- KPI de volumen y confianza.
- Tabla detallada de diagnósticos.
- Evolución temporal de la confianza.

## Primer uso en Power BI Desktop

1. Abre `JAVERY_Executive_Live.pbip`.
2. Cuando Power BI solicite credenciales para PostgreSQL, selecciona autenticación de Base de datos.
3. Usa el usuario y `PGPASSWORD` del servicio PostgreSQL en Railway.
4. Mantén la conexión cifrada habilitada.
5. Comprueba que `Predicciones` indique modo DirectQuery.
6. Guarda sin cambiar el nombre del proyecto.

## Publicación segura

Publica este proyecto como un informe **NUEVO** llamado `JAVERY Executive Live`. No reemplaces el informe `JAVERY_Dashboard` actual.

Después de publicar, abre la configuración del modelo semántico en Power BI Service y configura las credenciales/conexión de PostgreSQL. Para fuentes PostgreSQL en DirectQuery, Power BI Service puede requerir una conexión de gateway; si el tenant no permite una conexión cloud directa al endpoint público de Railway, registra PostgreSQL en un On-premises Data Gateway y asocia el modelo semántico a esa conexión.

Una vez configurada la fuente, el informe se abre en navegador desde `app.powerbi.com` y los visuales DirectQuery consultan los datos actuales de PostgreSQL sin depender de una importación manual del dataset.
