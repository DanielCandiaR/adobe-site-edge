/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-benefits. Base: cards.
 * Source: puntos.net (benefit item — sub-heading + paragraph, OR a check-list)
 * Generated: 2026-08-25
 *
 * No images → single-column ("no images") card layout.
 *   Row 1: block name
 *   Each subsequent row: one card cell holding heading + description (and/or list).
 *
 * The block-mapping selector targets each benefit column individually, so the
 * element is usually a single card. A container is also handled defensively.
 */
function buildCardCell(cardEl, document) {
  const cell = [];

  const title = cardEl.querySelector('.title-page-content, [class*="title"]');
  if (title && title.textContent.trim()) {
    const h = document.createElement('h3');
    h.textContent = title.textContent.trim();
    cell.push(h);
  }

  // Paragraph body
  const text = cardEl.querySelector('.text, p');
  if (text && text.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = text.textContent.trim();
    cell.push(p);
  }

  // Optional check-list form
  const listItems = Array.from(cardEl.querySelectorAll('.container-list .item-list, ul li'));
  if (listItems.length) {
    const ul = document.createElement('ul');
    listItems.forEach((li) => {
      const label = li.querySelector('.title-content, .container-content');
      const newLi = document.createElement('li');
      newLi.textContent = (label ? label.textContent : li.textContent).trim();
      ul.append(newLi);
    });
    cell.push(ul);
  }

  return cell;
}

export default function parse(element, { document }) {
  // Detect multiple cards within a container; otherwise treat element as one card.
  let cardEls = Array.from(element.querySelectorAll(':scope > .ant-col, .ant-col-lg-12'));
  if (cardEls.length === 0) cardEls = [element];

  const cells = [];
  cardEls.forEach((card) => {
    const cell = buildCardCell(card, document);
    if (cell.length) cells.push([cell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-benefits', cells });
  element.replaceWith(block);
}
