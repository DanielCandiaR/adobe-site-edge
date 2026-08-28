/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Puntos.net section breaks + Section Metadata.
 *
 * Driven by payload.template.sections from page-templates.json. Templates with
 * 2+ sections (e.g. blog-detail) get an <hr> before each non-first section and a
 * Section Metadata block for each section that declares a `style`. Puntos.net
 * sections are dark navy throughout (style: "dark"), matching the bg-pn /
 * bg-pn-second / bg-pn-dot shell classes.
 *
 * Section selectors are DOM-verified boundaries from page analysis and are used
 * as-is. Uses both hooks: breaks are inserted in beforeTransform (while every
 * section element still exists, before block parsers replace them), metadata is
 * anchored to a marker <hr> in afterTransform. Sections are processed in reverse
 * so inserts never disturb not-yet-processed section positions.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no break, no metadata
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (first section, no marker inserted) the
    // original element itself.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
