# Handoff: Catálogo Digital S&S Collection

## Overview
Catálogo web privado para un negocio de ropa/accesorios (S&S Collection). Los clientes ven las prendas organizadas por categoría; el dueño del negocio entra a un modo edición protegido por clave para agregar/quitar prendas. Cada prenda muestra foto y precio; al tocarla se amplía la foto y aparece un botón para pedir por WhatsApp.

## About the Design Files
Los archivos de este paquete son **referencias de diseño hechas en HTML** — prototipos que muestran el look final y el comportamiento esperado, no código de producción para copiar tal cual. La tarea es **recrear este diseño en el stack que se use para construir la app** (React, Vue, HTML/JS simple, etc.), aplicando las convenciones de ese proyecto.

## Fidelity
**Alta fidelidad (hifi)** para estilo visual: colores, tipografía, espaciados y layout son finales. Las fotos son marcadores rayados (placeholders) — el negocio subirá fotos reales de cada prenda.

## Dirección elegida: "Etiqueta" (opción 1b) + efecto de luz en la cabecera
Tarjetas con esquinas redondeadas y una etiqueta de precio en forma de tag colgando sobre la foto, imitando una etiqueta de ropa física. Cabecera con logo centrado y fila de categorías con íconos. Sobre esa base se agregó el resplandor dorado y las líneas diagonales tomadas de la esquina del logo original (ver sección "Efecto de luz de marca" más abajo) — es la cabecera que debe implementarse.

## Screens / Views

### 1. Catálogo (vista cliente) — móvil, ancho de referencia 390px
**Propósito:** navegar y ver las prendas disponibles por categoría.

**Layout (de arriba hacia abajo, todo dentro de un contenedor de fondo `#0B0B0C`):**
- **Cabecera de marca**: padding `20px 18px 16px`, texto centrado, borde inferior `1px solid #262119`.
  - Logo (imagen `assets/logo.png`), alto 62px, centrado.
  - Tagline debajo, 6px de margen: "Tu estilo, nuestra pasión", `italic 500 12.5px 'Playfair Display', serif`, color `#E8C468`.
- **Fila de categorías**: `display:grid; grid-template-columns: repeat(4, 1fr)`, borde inferior `1px solid #262119`. Cuatro celdas (Dama, Caballero, Zapatos, Bolsos), cada una:
  - padding `12px 4px 10px`, texto centrado, borde derecho `1px solid #201B15` (la última celda sin borde).
  - Ícono (`assets/ic-*.png`), alto 26px, centrado, 6px de margen inferior.
  - Nombre de categoría debajo: `400 8.5px Jost, sans-serif`, `letter-spacing: .12em`, mayúsculas, color `#F3EAD8`.
- **Cuadrícula de prendas**: `display:grid; grid-template-columns: 1fr 1fr; gap: 26px 14px; padding: 22px 18px`. Cada tarjeta de prenda:
  - Contenedor `position:relative`, cursor pointer (clic abre la foto ampliada).
  - Foto: `aspect-ratio: 3/4`, `border-radius: 12px`, `overflow:hidden`, fondo `#151311` con borde `1px solid #2A241B` (placeholder rayado en el prototipo — reemplazar por `<img>` real con `object-fit: cover`).
  - **Etiqueta de precio**: posicionada `absolute; left:-5px; bottom:12px`, fondo degradado `linear-gradient(135deg, #E8C468, #C9A227)`, texto color `#141110`, `font: 600 14px 'Playfair Display', serif`, padding `6px 12px 6px 15px`. Forma de banderín con `clip-path: polygon(11px 0, 100% 0, 100% 100%, 11px 100%, 0 50%)` (la punta izquierda es el "agujero" de la etiqueta). Sombra `drop-shadow(0 3px 6px rgba(0,0,0,.5))`.

**Interacción:** tocar/click en la tarjeta abre el lightbox (ver abajo).

### 2. Lightbox — foto ampliada
Overlay a pantalla completa, fondo `rgba(6,6,7,.94)`, `z-index` alto, flex centrado, click en cualquier parte para cerrar.
- Foto ampliada centrada, `width: min(70vh, 420px)`, `aspect-ratio: 3/4`.
- Debajo: precio en grande (`font: 600 26px 'Playfair Display', serif`, color `#E8C468`) junto a un botón "Pedir por WhatsApp" (píldora, fondo `#C9A227`, texto `#0B0B0C`, `font: 600 13px Jost`, `border-radius: 24px`, padding `11px 20px`).
- El botón de WhatsApp debe abrir `https://wa.me/<numero>?text=...` con un mensaje prellenado mencionando la prenda/precio.
- Texto de ayuda abajo: "Toca para cerrar".

### 3. Escritorio (adaptar el mismo lenguaje visual)
Mismo sistema (cabecera con logo + tagline centrados, fila de categorías con íconos, tarjetas con etiqueta de precio), pero:
- Ancho de referencia 1080px+, layout fluido con `max-width` mayor, no fijo.
- Cuadrícula de 4 columnas en vez de 2 (`grid-template-columns: repeat(4, 1fr)`), con `gap: 34px 26px`.
- Logo más grande (~96–120px de alto), padding de cabecera generoso (`34–56px` verticales).
- Categorías en fila horizontal centrada en vez de grid de 4 columnas fijas (mismo ícono + label, `padding: 16px 34px`, separadas por `border-right: 1px solid #201B15`).

### 4. Modo edición (dueño del negocio)
Acceso: clave numérica de 4 dígitos (definir flujo de entrada de PIN — no incluido en el prototipo visual, pero debe protegerse antes de mostrar cualquier control de edición).
- Barra superior fija reemplaza la cabecera normal: fondo degradado `linear-gradient(135deg, #E8C468, #C9A227)`, texto `#141110`, `padding: 11px 18px`, muestra "MODO EDICIÓN · N seleccionadas" a la izquierda y "Listo" (subrayado) a la derecha para salir del modo.
- Cada tarjeta gana un círculo de selección arriba a la izquierda (`22×22px`, borde `1.5px solid #E8C468`, `border-radius: 50%`); al seleccionar, fondo `#E8C468` con check `✓` en `#141110`, y la foto baja a `opacity: 0.5`.
- Barra de acciones al fondo: botón "Eliminar (N)" (borde `1px solid #7A2230`, texto `#E0857B`) y botón "+ Agregar prenda" (degradado dorado, texto `#141110`), ambos `flex:1`, `border-radius: 10px`, `padding: 12px`.
- **Agregar prenda — flujo en 2 pasos:**
  - Paso 1: selector de foto (dropzone punteada `1.5px dashed #40382A`, ícono "+", texto "Elegir foto de la galería") + selección de categoría (grid 2×2 de chips con ícono, la categoría activa con borde `#C9A227` y fondo `rgba(201,162,39,.12)`). Botón "Continuar" (degradado dorado, full width).
  - Paso 2: preview de la foto elegida (96px de ancho, `aspect-ratio: 3/4`) junto a un input de precio con formato `$120.000` (borde dorado activo, fuente `Playfair Display`), texto de ayuda "Se muestra como $120.000". Botones "Atrás" (outline) y "Publicar" (degradado dorado, más ancho).
  - Indicador de paso arriba: "PASO 1 DE 2" / "PASO 2 DE 2" en dorado, con barra de progreso (`2px` alto, mitad dorada mitad `#332E24` en paso 1, completa en paso 2).

## Efecto de luz de marca (cabecera)
Tomado de la esquina superior izquierda del logo original: un resplandor cálido más dos líneas doradas diagonales. Se aplica solo en el fondo de la cabecera (logo + tagline), nunca detrás de las fotos de producto.
- Resplandor: `radial-gradient(120% 95% at 6% -10%, rgba(232,196,104,.20), rgba(201,162,39,.05) 42%, transparent 68%)` sobre fondo `#0B0B0C` (versión escritorio: `radial-gradient(90% 130% at 4% -20%, rgba(232,196,104,.22), rgba(201,162,39,.06) 38%, transparent 62%)`).
- Dos líneas diagonales en la esquina superior izquierda (`transform: rotate(-45deg)`, `height: 1–1.5px`, degradado que va de transparente a dorado (`#C9A227`/`#E8C468`) y de vuelta a transparente), y su eco más tenue en la esquina inferior derecha.
- El logo lleva `filter: drop-shadow(0 6px 22px rgba(201,162,39,.28))` para que parezca iluminado por ese resplandor.
- En la cuadrícula de escritorio, cada foto tiene una pequeña esquina biselada dorada (`border-top` + `border-left`, `1px solid rgba(201,162,39,.55)`, 34×34px) como eco sutil del mismo gesto — opcional, se puede omitir en móvil para no recargar.

## Design Tokens

**Colores**
- Fondo principal: `#0B0B0C` (negro cálido)
- Fondo secundario/tarjetas internas: `#151311`, `#141210`, `#1D1A16`
- Bordes sutiles: `#262119`, `#2A241B`, `#332E24`, `#201B15`
- Dorado claro (acento primario): `#E8C468`
- Dorado oscuro (acento secundario / degradados): `#C9A227`
- Texto claro principal: `#F3EAD8`
- Texto claro secundario/atenuado: `rgba(243,234,216,.4–.75)`
- Error/eliminar: borde `#7A2230`, texto `#E0857B`
- Texto sobre dorado: `#141110` / `#0B0B0C`

**Tipografía**
- Encabezados, precios, tagline: `Playfair Display` (Google Fonts), pesos 500/600/700, itálica 500 para el tagline.
- UI, labels, botones, categorías: `Jost` (Google Fonts), pesos 300/400/500/600.
- Tamaños base: precios 14–26px, labels de categoría 8.5–11px con `letter-spacing` amplio (.12–.18em) en mayúsculas, botones 12–14px.

**Espaciado / radios**
- Radio de tarjetas de foto: `12px`. Radio de botones: `10px` (rectangulares), `24px` (píldora).
- Gap de cuadrícula móvil: `26px 14px`. Gap de cuadrícula escritorio: `34px 26px`.
- Padding de cabecera: `20px 18px 16px` (móvil), `34–56px` verticales (escritorio).

## Assets
Carpeta `assets/`: `logo.png` (isotipo S&S Collection recortado del logo original, fondo transparente), `ic-dama.png`, `ic-caballero.png`, `ic-zapatos.png`, `ic-bolsos.png` (íconos de categoría recortados del mismo logo, fondo transparente). Son recortes del logo original del negocio — mantenerlos como están, no regenerar.

## Files
- `reference.html`: prototipo visual final — cabecera móvil y escritorio con el efecto de luz, cuadrícula de prendas estilo "etiqueta" y el lightbox de foto ampliada. Ábrelo en un navegador para ver el diseño.
- `assets/`: logo e íconos de categoría recortados del logo original, listos para usar.
