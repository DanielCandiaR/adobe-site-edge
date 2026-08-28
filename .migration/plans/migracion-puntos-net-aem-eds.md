# Plan de Migración — Sitio "Ecosistema Adobe / Puntos.net" a AEM Edge Delivery Services

## Resumen del análisis del sitio origen

- **Idioma:** Español (es)
- **Naturaleza técnica:** SPA renderizado en cliente (JavaScript) servido desde S3. El HTML inicial llega vacío y se hidrata con JS. Esto implica que el scraping debe hacerse sobre el **DOM renderizado** (Playwright), no sobre el HTML crudo.
- **Título global:** "Ecosistema Adobe dentro de Puntos.net"
- **Cabecera y pie comunes** en todas las páginas (nav con menús desplegables + footer con 3 columnas).

### Inventario de páginas (tipos / plantillas detectadas)

| # | URL | Tipo de plantilla | Contenido clave |
|---|-----|-------------------|-----------------|
| 1 | `/` (Inicio) | **Home** | Hero con texto + lista de checks + badge "Adobe Platinum", contadores animados (Clientes, Años), grid de 6 productos Adobe |
| 2 | `/blog` | **Blog Listing** | Buscador, tabs de filtro por tag (Todos/RESOURCES/adobe/analytics/test/nueva), grid de cards, paginación |
| 3 | `/blog/{articulo}` | **Blog Detail** | (a confirmar) detalle de artículo — 5 posts existentes |
| 4 | `/contacto` | **Contacto** | Formulario (Nombre, Email, Empresa, Teléfono, Asunto (select), Comentario) |
| 5–10 | `/adobe-partner/*` | **Landing de Solución** | 6 páginas: `cms-dam`, `personalizacion`, `datos-accionables`, `arquitectura-headless`, `mail-marketing`, `automatizacion-omnicanal`. Hero + secciones de features + grid de cards de productos |
| 11 | `/nosotros/quienes-somos` | **Página Institucional** | Secciones alternadas texto/imagen |
| 12 | `/nosotros/storytelling` | **Página Institucional** | (a confirmar, misma familia que Quiénes Somos) |

**Total: ~12 páginas en 5–6 plantillas reutilizables.**

### Bloques / componentes EDS candidatos

- **Header/Nav** — logo, menú con 2 desplegables ("Adobe Partner" con 6 ítems, "Nosotros" con 2), selector de idioma (ES), botón calendario/CTA.
- **Footer** — descripción + redes sociales, columnas "Experiencia" y "Empresa", badge Adobe + copyright.
- **Hero** (2 variantes: home con lista+badge; landing con imagen de fondo + subtítulos).
- **Stats / Counters** — contadores numéricos animados.
- **Cards** (variantes: productos Adobe con icono+título+texto; blog con imagen+tag+autor+fecha).
- **Blog listing** — buscador + filtro por tabs + paginación (funcionalidad dinámica a evaluar).
- **Form** — formulario de contacto (candidato a AEM Forms si se habilita el plugin).
- **Content sections** alternadas texto/imagen (default content de EDS).
- **Feature list** — listas con ícono de check (default content con lista).

## Decisiones pendientes (a confirmar contigo)

1. **Tipo de proyecto EDS**: documento (Google Docs/SharePoint), Document Authoring (`da.live`), o Crosswalk/Universal Editor (`xwalk`). Determina el formato de salida del contenido.
2. **Alcance inicial**: ¿migrar las 12 páginas o empezar por un subconjunto (p.ej. Home + 1 landing + Blog) como prueba de concepto?
3. **Blog dinámico**: el buscador, filtros y paginación son funcionalidad JS. Decidir si se replica como bloque interactivo o se simplifica a listado indexado por EDS.
4. **Formulario de contacto**: bloque simple vs. AEM Forms (requiere habilitar el plugin de Forms).

## Checklist

### Fase 0 — Preparación y decisiones
- [ ] Confirmar tipo de proyecto EDS (doc / da / xwalk)
- [ ] Confirmar alcance de la primera iteración (subconjunto vs. sitio completo)
- [ ] Confirmar tratamiento del blog dinámico y del formulario
- [ ] Verificar `npm install` y arrancar servidor local (`aem up`) en background

### Fase 1 — Descubrimiento y catálogo del sitio
- [ ] Ejecutar descubrimiento de URLs (sitemap/crawl) para confirmar el listado completo de páginas
- [ ] Revisar páginas aún no inspeccionadas: `/nosotros/storytelling`, detalle de artículo de blog, y las 5 landings restantes de `/adobe-partner/*`
- [ ] Catalogar plantillas y agrupar URLs por tipo (site catalog → `page-templates.json`)
- [ ] Inventariar bloques EDS disponibles en el proyecto y en la Block Collection

### Fase 2 — Análisis por plantilla
- [ ] Analizar la estructura de cada plantilla representativa (secciones, secuencias, decisiones de autoría)
- [ ] Definir el modelo de contenido de cada bloque (contrato autor↔desarrollador)
- [ ] Mapear selectores DOM de cada variante de bloque
- [ ] Identificar y descargar imágenes/iconos, optimizarlas

### Fase 3 — Diseño / estilos
- [ ] Extraer design tokens del origen (tipografía, colores, espaciados)
- [ ] Migrar estilos globales (`styles.css`, `fonts.css`) mobile-first
- [ ] Estilar cada bloque para replicar el aspecto del origen

### Fase 4 — Bloques
- [ ] Migrar Header/Nav (desplegables + selector de idioma)
- [ ] Migrar Footer
- [ ] Construir Hero (2 variantes)
- [ ] Construir Cards (productos + blog)
- [ ] Construir Stats/Counters
- [ ] Construir bloque de Blog listing (según decisión Fase 0)
- [ ] Construir Formulario de contacto (según decisión Fase 0)

### Fase 5 — Infraestructura de importación de contenido
- [ ] Generar parsers de bloques por variante
- [ ] Generar transformers de página (limpieza, secciones, imágenes)
- [ ] Generar script de importación combinando plantilla + parsers + transformers
- [ ] Ejecutar importación en bulk hacia el directorio de contenido

### Fase 6 — Validación y QA
- [ ] Previsualizar cada página importada en el servidor local y comparar con el origen
- [ ] Validación de completitud de contenido (origen vs. salida) por página
- [ ] Crítica visual y ajuste de estilos hasta igualar el diseño
- [ ] Revisar accesibilidad (jerarquía de encabezados, alt text, ARIA) y responsive
- [ ] `npm run lint` y corrección de issues

### Fase 7 — Despliegue
- [ ] Push a rama de feature; verificar sincronización con AEM Code Sync
- [ ] Ejecutar PageSpeed Insights sobre la preview y corregir hasta ~100
- [ ] Abrir PR con enlace a página de preview que ilustre los cambios
- [ ] Revisión humana y merge a `main`

---

> **Nota:** Este plan está en modo planificación. La ejecución (scraping, generación de bloques, importación de contenido y cambios de archivos) requiere pasar a modo de ejecución. Antes de comenzar necesito tus respuestas a las 4 decisiones pendientes de la Fase 0.

¿Quieres que resuelva ahora las decisiones pendientes para dejar el plan listo para ejecutar?
