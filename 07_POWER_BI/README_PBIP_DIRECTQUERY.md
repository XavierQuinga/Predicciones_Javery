# JAVERY Power BI real — PBIP + DirectQuery

Se generó un proyecto real de Microsoft Power BI Desktop en formato **PBIP/PBIR/TMDL** y se empaquetó en `JAVERY_PowerBI_PBIP.zip`.

## Qué contiene

- `JAVERY_Dashboard.pbip`
- Modelo semántico TMDL
- Reporte PBIR con 3 páginas
- Conexión PostgreSQL preparada en modo **DirectQuery**
- Medidas DAX para KPIs
- Comparación de algoritmos
- Curva de aprendizaje
- F1 por clase
- Validación JAVERY

## Conexión a Railway

El proyecto no guarda claves. El parámetro `PowerBI_Server` está intencionalmente en `TU_HOST_PUBLICO_RAILWAY:PUERTO` porque el PostgreSQL desplegado actualmente solo expone en la configuración consultada el endpoint privado `postgres` dentro de Railway.

Para usar DirectQuery desde Power BI Desktop:

1. Habilitar Public Networking / TCP Proxy del servicio PostgreSQL en el proyecto Railway `diagnostico-javery-ia`.
2. Descomprimir `JAVERY_PowerBI_PBIP.zip`.
3. Abrir `JAVERY_Dashboard.pbip` con Power BI Desktop.
4. Cambiar `PowerBI_Server` al host:puerto público de Railway.
5. Mantener `PowerBI_Database` en `diagnostico_ti` salvo que Railway muestre otro nombre real.
6. Introducir las credenciales PostgreSQL cuando Power BI las solicite.
7. Publicar el informe en Power BI Service.
8. Configurar la conexión/gateway del modelo semántico en Power BI Service si Microsoft lo solicita para DirectQuery PostgreSQL.

Después de publicar, el enlace real `app.powerbi.com` se puede insertar en la aplicación web para sustituir la previsualización HTML.
