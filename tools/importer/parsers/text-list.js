/* eslint-disable */
/* global WebImporter */
/**
 * Parser for text-list (numbered/check list used on the Headless page).
 * Source: .text-list-component with .item-list rows, each having a vineta
 * ("1".."5" or a check), a title and an optional description.
 * Emits one block row per item: | title | description |. When items are
 * numbered, the number is prefixed to the title ("1. Title") so the block/
 * shared list rule renders the red numbered circle.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.item-list'));
  const cells = [];
  items.forEach((li, i) => {
    const titleEl = li.querySelector('.title-content');
    const textEl = li.querySelector('.text-content');
    const vineta = li.querySelector('.icon-vineta');
    const title = titleEl ? titleEl.textContent.trim() : li.textContent.trim();
    const num = vineta ? vineta.textContent.trim() : '';
    const isNumber = /^\d+$/.test(num);
    const label = isNumber ? `${num}. ${title}` : title;
    cells.push([
      label,
      textEl ? textEl.textContent.trim() : '',
    ]);
  });
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'text-list', cells });
  element.replaceWith(block);
}
