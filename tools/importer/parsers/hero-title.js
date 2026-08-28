/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-title. Base: hero.
 * Source: puntos.net (text-only title hero — eyebrow + gradient title, no image)
 * Generated: 2026-08-25
 *
 * Hero library structure: 1 column, up to 3 rows.
 *   Row 1: block name
 *   (no background image row — text-only variant)
 *   Row 2: content — eyebrow (.title) + gradient main title (.subtitle) + optional description
 */
export default function parse(element, { document }) {
  const eyebrowEl = element.querySelector('.content-info .title, .title');
  const titleEl = element.querySelector('.content-info .subtitle, .subtitle');
  const descriptionEl = element.querySelector('.content-info .description, .description');

  const contentCell = [];

  // Eyebrow → small lead paragraph
  if (eyebrowEl && eyebrowEl.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = eyebrowEl.textContent.trim();
    contentCell.push(p);
  }

  // Gradient main title → heading
  if (titleEl && titleEl.textContent.trim()) {
    const h = document.createElement('h1');
    h.textContent = titleEl.textContent.trim();
    contentCell.push(h);
  }

  if (descriptionEl && descriptionEl.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = descriptionEl.textContent.trim();
    contentCell.push(p);
  }

  if (contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-title', cells });
  element.replaceWith(block);
}
