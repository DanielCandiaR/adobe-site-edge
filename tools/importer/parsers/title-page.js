/* eslint-disable */
/* global WebImporter */
/**
 * Parser for title-page (section titles with a blue accent line).
 * Source: TitlePageComponent (.title-page ...).
 *
 * Variant mapping from the source classes:
 *   .title-page-line-top    → "line, center"           (41px section title)
 *   .title-page-line-bottom → "line, line-bottom, left, small" (20px subtitle)
 */
export default function parse(element, { document }) {
  const content = element.querySelector('.title-page-content, [class*="content"]');
  const text = (content ? content.textContent : element.textContent).trim();
  if (!text) {
    element.remove();
    return;
  }

  const cn = element.className || '';
  let variants;
  if (/title-page-line-bottom/.test(cn)) {
    // small column subtitle (line under, left)
    variants = 'line, line-bottom, left, small';
  } else if (/title-page-text-left|title-page-line-left/.test(cn)) {
    // big section title, left-aligned (line on top)
    variants = 'line, left';
  } else {
    // big section title, centered
    variants = 'line, center';
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: `title-page (${variants})`,
    cells: [[text]],
  });
  element.replaceWith(block);
}
