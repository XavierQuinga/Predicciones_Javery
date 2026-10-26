# JAVERY — Power BI Project con PostgreSQL Railway

Este proyecto PBIP consume la tabla `public.predicciones` de PostgreSQL Railway.

## Conexión configurada

- Servidor: `crossover.proxy.rlwy.net`
- Puerto: `42473`
- Base de datos: `railway`
- SSL: `require`
- Tabla: `public.predicciones`
- Modo actual del modelo: **Importación (Import)**

> Importante: en modo Import Power BI conserva una copia de los datos dentro del modelo semántico. Las predicciones nuevas de PostgreSQL no aparecen hasta ejecutar una actualización del modelo semántico.

## Primer uso en Power BI Desktop

1. Abre `JAVERY_Dashboard.pbip` en Power BI Desktop.
2. Cuando se soliciten credenciales, usa autenticación de base de datos.
3. Ingresa el usuario de PostgreSQL y el `PGPASSWORD` de Railway.
4. Conserva SSL/cifrado habilitado.
5. Ejecuta **Actualizar** para comprobar que se cargan las filas nuevas de `public.predicciones`.

Las contraseñas no se guardan en los archivos PBIP.

## Power BI Service — mantener datos actualizados

El informe publicado conserva el diseño visual existente. Para actualizar los datos sin volver a publicar el PBIP:

1. En el workspace de Power BI Service localiza el modelo semántico `JAVERY_Dashboard`.
2. Abre **Actualizar > Actualizar ahora** y verifica que el total de diagnósticos aumente hasta coincidir con PostgreSQL.
3. Si Power BI solicita una puerta de enlace por utilizar ODBC, configura una **On-premises data gateway** en un equipo que permanezca encendido y que tenga instalado el controlador PostgreSQL Unicode x64.
4. En la conexión ODBC de la puerta de enlace usa:

   `Driver={PostgreSQL Unicode(x64)};Server=crossover.proxy.rlwy.net;Port=42473;Database=railway;SSLmode=require;`

5. Usa autenticación básica con el usuario y contraseña PostgreSQL de Railway.
6. Vincula esa conexión al modelo semántico y activa **Actualización programada**.

### Frecuencia recomendada

- Power BI Pro: hasta 8 actualizaciones programadas al día.
- PPU / Premium / Fabric: hasta 48 actualizaciones programadas al día.

## Sobre DirectQuery

El archivo actual **no está en DirectQuery**. Si en el futuro se requiere consulta casi en tiempo real, conviene migrar el origen a **PostgreSQL nativo (`PostgreSQL.Database`) + DirectQuery** en una copia controlada del modelo, validar el resultado y solo entonces reemplazar el modelo publicado. No se debe publicar una versión antigua del PBIP encima del informe que ya tiene cambios visuales guardados en Power BI Service.
