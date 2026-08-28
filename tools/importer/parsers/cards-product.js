/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base: cards.
 * Source: puntos.net (grid of product tiles — icon image + uppercase label)
 * Generated: 2026-08-25
 *
 * Cards with images → 2 columns.
 *   Row 1: block name
 *   Each subsequent row: [ icon image , label ]
 */
export default function parse(element, { document }) {
  const cardEls = Array.from(element.querySelectorAll('.floating-card'));

  const cells = [];

  cardEls.forEach((card) => {
    const icon = card.querySelector('.icon img, img');
    const labelEl = card.querySelector(':scope > span:not(.icon), span:not(.anticon):not(.icon)');
    const label = labelEl ? labelEl.textContent.trim() : '';

    const p = document.createElement('p');
    p.textContent = label;

    cells.push([icon || '', p]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
