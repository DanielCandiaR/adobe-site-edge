/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-stats. Base: cards.
 * Source: puntos.net (animated stat tiles — number + caption)
 * Generated: 2026-08-25
 *
 * Note: card numbers are animated counters (source snapshot may capture an
 * intermediate value vs the settled value); the parser captures the current
 * rendered value + caption. Any similarity gap is a counter-animation artifact.
 * No images in these cards → single-column card layout.
 *   Row 1: block name
 *   Each subsequent row: one card cell containing the number (heading) + caption.
 */
export default function parse(element, { document }) {
  const cardEls = Array.from(element.querySelectorAll('.card.stadistic, .card'));

  const cells = [];

  cardEls.forEach((card) => {
    const number = card.querySelector('.card-title');
    const caption = card.querySelector('.card-text');
    const cardCell = [];

    if (number) {
      const h = document.createElement('h2');
      h.textContent = number.textContent.trim();
      cardCell.push(h);
    }
    if (caption) {
      const p = document.createElement('p');
      p.textContent = caption.textContent.trim();
      cardCell.push(p);
    }
    if (cardCell.length) cells.push([cardCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-stats', cells });
  element.replaceWith(block);
}
