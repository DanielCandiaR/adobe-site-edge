/* eslint-disable */
/* global WebImporter */
/**
 * Parser for timeline-cards (AEM Headless architecture cards).
 * Source: the 4 .card.image-top tiles in the "Arquitectura" section.
 * Emits one block row per card: | title | description |. Icons/colours are
 * fixed by position in the block JS.
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('.card'));
  const cells = [];
  cards.forEach((card) => {
    const title = card.querySelector('.card-title');
    const text = card.querySelector('.card-text');
    if (!title) return;
    cells.push([
      title.textContent.trim(),
      text ? text.textContent.trim() : '',
    ]);
  });
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'timeline-cards', cells });
  element.replaceWith(block);
}
