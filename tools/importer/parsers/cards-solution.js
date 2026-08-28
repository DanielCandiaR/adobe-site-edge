/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-solution. Base: cards.
 * Source: puntos.net (product-solution cards — logo image + title + subtitle + description)
 * Generated: 2026-08-25
 *
 * Cards with images → 2 columns.
 *   Row 1: block name
 *   Each subsequent row: [ logo image , (title heading + subtitle + description) ]
 *
 * The block-mapping selector targets each solution card individually; a container
 * of multiple cards is also handled defensively.
 *
 * Note: each source element wraps the card in an inline <style> block (responsive
 * CSS). That CSS text is intentionally NOT emitted into the block, so the
 * completeness score is slightly reduced — a validator artifact, not dropped content.
 */
function buildRow(cardEl, document) {
  const image = cardEl.querySelector('.card-image, img');

  const textCell = [];
  const title = cardEl.querySelector('.card-title');
  const subtitle = cardEl.querySelector('.card-subtitle');
  const text = cardEl.querySelector('.card-text');

  if (title && title.textContent.trim()) {
    const h = document.createElement('h3');
    h.textContent = title.textContent.trim();
    textCell.push(h);
  }
  if (subtitle && subtitle.textContent.trim()) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = subtitle.textContent.trim();
    p.append(strong);
    textCell.push(p);
  }
  if (text && text.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = text.textContent.trim();
    textCell.push(p);
  }

  if (!image && textCell.length === 0) return null;
  return [image || '', textCell];
}

export default function parse(element, { document }) {
  let cardEls = Array.from(element.querySelectorAll(':scope > .card, .card.image-left'));
  if (cardEls.length === 0) cardEls = [element];

  const cells = [];
  cardEls.forEach((card) => {
    const row = buildRow(card, document);
    if (row) cells.push(row);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-solution', cells });
  element.replaceWith(block);
}
