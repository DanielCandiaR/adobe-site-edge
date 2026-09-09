# Rework del Bloque `text-list` — Todas las Variantes del Original

## Diagnóstico: por qué no coincide hoy

El componente original NO es una lista con un estilo fijo: es un **motor de listas 100% configurable por props**. El SCSS solo define *defaults* (círculo rojo relleno + check blanco), pero **cada página los sobreescribe con props inline**. Yo construí el bloque tomando los defaults del SCSS, no los valores reales de uso — por eso no se parece.

Ejemplo real (`QuienesSomos`, lista `practicesListItems`):
```js
typeVineta: "icon", vineta: <CheckOutlined />,
colorVineta: '#ef4444',          // check ROJO
backgroundVineta: 'transparent', // SIN círculo
borderVineta: 'none',            // SIN borde
sizeVineta: 16,
// + itemsGap={0}, iconGap={5}   // espaciado muy compacto
```
→ El aspecto real ahí es **check rojo sobre fondo transparente, sin círculo, apretado**. El círculo relleno que hice es solo *uno* de los muchos looks posibles.

**Conclusión:** para "tener absolutamente todas las variantes", el bloque EDS debe exponer **toda la superficie de props** como combinación de clases de variante + variables CSS, de modo que cualquier combinación usada en el sitio (o futura) sea reproducible por el autor.

## Superficie COMPLETA de props → variantes/variables EDS

### Nivel raíz (`TextListComponentProps`)
| Prop original | Variante/variable EDS |
|---|---|
| `heading` | variante `with-heading` (primera fila = encabezado) |
| `headingColor` | `--heading-color` |
| `headingSize` | `--heading-size` |
| `headingAlign` (`left/center/right`) | `--heading-align` (o clases `heading-left/center/right`) |
| `headingMargin` | `--heading-margin` |
| `itemsGap` | `--items-gap` |
| `iconGap` | `--icon-gap` |
| `contentGap` | `--content-gap` |
| `className` / `style` | clases de variante + overrides por sección |

### Nivel ítem (`TextListItem`) — TODAS las props
| Prop original | Variante/variable EDS |
|---|---|
| `typeItem: 'card' \| 'default'` | variante `card` |
| `backgroundItem` | `--item-bg` |
| `paddingItem` | `--item-padding` |
| `borderItem` | `--item-border` |
| `linkItem` / `linkTarget` | `<a>` en la fila → `item-clickable` (target según href) |
| `typeVineta: 'icon' \| 'text'` | familias de viñeta (ver catálogo) |
| `vineta` (SVG / URL / texto) | icono por defecto, `<img>` autorado, o texto |
| `colorVineta` | `--vineta-color` |
| `sizeVineta` | `--vineta-size` (glifo interno) |
| `containerVineta` | `--vineta-container` (contenedor) |
| `paddingVineta` | `--vineta-padding` |
| `backgroundVineta` | `--vineta-bg` |
| `borderVineta` | `--vineta-border` |
| `borderColorVineta` | `--vineta-border-color` |
| `borderRadiusVineta` | `--vineta-radius` |
| `title` | 1ª celda |
| `colorTitle` | `--title-color` |
| `sizeTitle` | `--title-size` |
| `text` | 2ª celda (opcional) |
| `colorText` | `--text-color` |
| `sizeText` | `--text-size` |
| `hoverEffect` | variante `hover` |
| `hoverBg` | `--item-hover-bg` |
| `hoverBorder` | `--item-hover-border` |
| `hoverShadow` | `--item-hover-shadow` |
| `colorTitleHover` | `--item-hover-title-color` |
| `colorTextHover` | `--item-hover-text-color` |

### Defaults calculados del original (a replicar exactos)
- `isTextVineta = typeVineta !== 'icon'` → **default = viñeta de TEXTO**: contenedor **28px**, glifo ≈ **10.6px** (0.38×), contenido `·`.
- `typeVineta:'icon'` → contenedor **22px**, glifo **11px** (0.5×), contenido = icono.
- CSS base viñeta: círculo, fondo rojo, borde rojo, glifo blanco — **todo sobreescribible**.

## Catálogo COMPLETO de variantes a entregar

**Familia de viñeta** (una por bloque):
- `check-circle` → círculo rojo relleno + check blanco (default del SCSS; heros/beneficios).
- `check` → check rojo transparente, sin círculo (aspecto QuienesSomos).
- `check-outline` → check rojo con borde circular rojo, relleno transparente.
- `dot` → viñeta de texto `·` en contenedor 28px (default `typeVineta:'text'`).
- `number` → viñetas numeradas autoincrementales (contador CSS) en contenedor de texto.
- `icon` → icono/imagen provisto por el autor (SVG inline o `<img>` en la fila).
- `text-vineta` → viñeta con texto/carácter arbitrario (ej. inicial, símbolo).

**Layout / comportamiento** (combinables entre sí y con cualquier familia):
- `card` → cada ítem tarjeta (fondo white-5, padding 20px, borde suave).
- `hover` → efecto hover (bg/borde/sombra + cambio de color título/texto).
- `compact` → `--items-gap:0; --icon-gap:5px` (QuienesSomos).
- `align-center` / `align-start` → alineación vertical viñeta↔contenido (el original usa `center`).
- `item-clickable` → automático cuando la fila trae `<a>`.

**Contenido:**
- Solo título · título + descripción · encabezado de lista opcional (`with-heading`).

**Configurabilidad total:** cada color/tamaño/gap/borde de la tabla anterior expuesto como variable CSS, sobreescribible en la sección o en el bloque (recolorear viñeta, cambiar tamaños, etc.).

## Modelo de contenido EDS (contrato autor↔bloque)

- Bloque `text-list` + clases de variante, p. ej. `text-list (check, compact)` o `text-list (card, hover)`.
- **Una fila por ítem**: 1ª celda = título; 2ª celda opcional = descripción.
- Imagen en la fila → viñeta personalizada (fuerza familia `icon`).
- Enlace en la fila → ítem navegable (`item-clickable`).
- Variante `with-heading` → primera fila del bloque = encabezado de la lista.
- Variante `number` → numeración automática, sin que el autor escriba números.

## Reconciliación con listas embebidas (`.pn-list`)

`.pn-list` (en `styles.css`) hoy usa círculo rojo relleno. Se **parametriza con las mismas variables** que el bloque y se le da el default que confirme la Fase 0, para que las listas embebidas en `columns-media` / `cards-benefits` / heros coincidan con el origen y compartan un solo sistema de viñeta.

## Checklist

### Fase 0 — Verificación del origen (imprescindible)
- [ ] Localizar **todas** las instancias de `TextListComponent` en el sitio origen: QuienesSomos (`practicesListItems`), CMSDAM "why" (tecnología/experiencia), listas de features de heros, y cada landing `/adobe-partner/*`
- [ ] Con Playwright, capturar estilos computados reales por instancia: `background`, `border`, `color`, tamaño glifo/contenedor de viñeta, `gap` de ítems e icono, padding de ítem, hover
- [ ] Tabular la combinación de props de cada página → mapear a variante EDS y **fijar el default correcto** de cada familia

### Fase 1 — Rediseño del bloque `text-list`
- [ ] Implementar el sistema completo de **variables CSS** (toda la tabla de props: viñeta, título, texto, hover, gaps, tarjeta, heading)
- [ ] Implementar TODAS las familias de viñeta: `check-circle`, `check`, `check-outline`, `dot`, `number`, `icon`, `text-vineta`
- [ ] Implementar variantes de layout/comportamiento: `card`, `hover`, `compact`, `align-center/align-start`, `item-clickable`
- [ ] Implementar `with-heading` y soporte título + descripción
- [ ] Replicar los defaults calculados del original (contenedor 28/22px, glifo 0.38×/0.5×, contenido `·`/icono)
- [ ] Ajustar el JS de decoración al nuevo modelo (imagen→viñeta, enlace→clickable, celdas→título/desc, numeración automática)

### Fase 2 — Reconciliar listas embebidas
- [ ] Parametrizar `.pn-list` con las mismas variables del bloque
- [ ] Fijar su default según Fase 0 y verificar coincidencia en `columns-media`, `cards-benefits`, heros

### Fase 3 — Verificación visual (todas las variantes)
- [ ] Crear un draft que ejercite **cada variante y combinación** en una sola página de muestra
- [ ] Levantar el preview y comparar cada variante contra su instancia original (viñeta, colores, espaciados, hover)
- [ ] Iterar CSS hasta igualar; verificar responsive (768px) y accesibilidad (contraste, foco en ítems clickeables)

### Fase 4 — Cierre
- [ ] `npm run lint` (ESLint + Stylelint) sin errores
- [ ] Documentar en un comentario del bloque el catálogo de variantes y variables CSS disponibles
- [ ] Commit en la rama `feature/heador-footer-ia` y push

---

> **Nota:** Plan en modo planificación. La ejecución (Playwright sobre el origen, reescritura de `text-list.js` / `text-list.css` y `styles.css`, y validación en preview) requiere **modo de ejecución**. La Fase 0 es la clave para no volver a fijar un default equivocado y garantizar que **todas** las variantes coincidan con el sitio real.
