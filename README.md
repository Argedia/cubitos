# Cubitos · consulta de cartas

Herramienta en español para elegir uno de los diez presets del reglamento (p. 8) o una selección personalizada. Los presets cargan sus ocho cartas y la pista sugerida. Solo en Personalizada se eligen cartas individuales; «Personalizar estas cartas» convierte un preset en una selección editable. Ofrece resúmenes breves y el texto completo al tocar. No registra jugadores ni el progreso de la partida.

## Uso local

Con Node.js 22 o posterior: `npm run dev`, abrir http://localhost:5174. Los cambios en código y recursos recargan automáticamente la página y conservan la selección del enlace. La aplicación no requiere instalar dependencias para ejecutarse.

`npm start` sirve la aplicación sin recarga automática. `npm run build` prepara `dist` para alojamiento estático. Para compartir con otros equipos, publicar esa carpeta y copiar el enlace desde la dirección pública; localhost solo funciona en el equipo que ejecuta el servidor.

## Selecciones compartidas

Los presets usan enlaces como `#p1=race-2`, que conservan también el nombre de la carrera y la pista sugerida. Sin fragmento se muestra la elección inicial entre los presets y Personalizada. Los enlaces personalizados existentes siguen funcionando.

El fragmento `#c1=00000000` representa la primera partida recomendada. Cada dígito identifica una carta estable del color rojo, naranja, amarillo, verde, azul, morado, café y blanco, en ese orden. `_` indica una elección pendiente. No cambiar los códigos existentes ni el orden: rompería enlaces guardados. No se necesitan cuentas, almacenamiento local ni servidor de datos.

## Fuentes

Las 56 cartas proceden de `Cubitos_Traduccion_cartas.pdf`. El reglamento original aporta la primera partida (p. 6), los momentos de activación (p. 9) y aclaraciones (pp. 14–17). Se mantienen los nombres originales para reconocer las cartas físicas.

Dos correcciones del reglamento se señalan en el detalle: Shimmy Shimmy Dino cuenta blancos y grises; Up to 11 se usa antes de tirar. `providedText` conserva la transcripción suministrada. Los resúmenes son orientativos; el detalle presenta el texto completo y sus aclaraciones.

Los recursos originales están organizados en `assets/branding` y `assets/dice`. El manifiesto registra PDF, página y recorte. Las ilustraciones representan el dado del color, no una reproducción de cada carta. Para regenerar el contenido: instalar PyMuPDF y ejecutar `python scripts/extract_content.py` con ambos PDF en la raíz. Revisar cualquier cambio antes de modificar códigos publicados.

## Validación

`npm test` comprueba selección, códigos y enlaces. Para pruebas de navegador: `npm install`, instalar Chrome y ejecutar `npm run test:e2e`. La aplicación utiliza módulos pequeños y un registro de acciones en lugar de cadenas de condiciones para despachar eventos.
