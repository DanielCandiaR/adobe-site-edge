/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: puntos.net (full-bleed banner — background image + centered title)
 * Generated: 2026-08-25
 *
 * Hero library structure: 1 column, up to 3 rows.
 *   Row 1: block name
 *   Row 2 (optional): background image
 *   Row 3: content (title heading + optional subtitle/description)
 */
export default function parse(element, { document }) {
  const bgImage = element.querySelector('.hero-bg img, img.bg-image, img[class*="bg"]');

  const titleEl = element.querySelector('.content-info .title, .title');
  const subtitleEl = element.querySelector('.content-info .subtitle, .subtitle');
  const descriptionEl = element.querySelector('.content-info .description, .description');

  const contentCell = [];

  if (titleEl && titleEl.textContent.trim()) {
    const h = document.createElement('h1');
    h.textContent = titleEl.textContent.trim();
    contentCell.push(h);
  }
  if (subtitleEl && subtitleEl.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = subtitleEl.textContent.trim();
    contentCell.push(p);
  }
  if (descriptionEl && descriptionEl.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = descriptionEl.textContent.trim();
    contentCell.push(p);
  }

  if (!bgImage && contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (bgImage) cells.push([bgImage]);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
