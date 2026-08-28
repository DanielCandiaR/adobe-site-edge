/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns.
 * Source: puntos.net (alternating image + text row)
 * Generated: 2026-08-25
 *
 * Columns library: multiple columns/rows; the first row is the block name.
 * This variant is a single 2-column row: [ image , text ].
 * Text cell may contain a heading, one or more paragraphs, and optionally a check-list.
 * Column order follows the source DOM so image-left / image-right layouts are preserved.
 */
function pushParagraphs(descEl, cell, document) {
  // A .description may hold text directly, or wrap paragraphs in child block divs.
  const childBlocks = Array.from(descEl.children).filter(
    (c) => c.tagName === 'DIV' && c.textContent.trim(),
  );
  if (childBlocks.length) {
    childBlocks.forEach((c) => {
      const p = document.createElement('p');
      p.textContent = c.textContent.trim();
      cell.push(p);
    });
  } else if (descEl.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = descEl.textContent.trim();
    cell.push(p);
  }
}

function pushList(listEl, cell, document) {
  const items = Array.from(listEl.querySelectorAll('.item-list, li'));
  if (!items.length) return;
  const ul = document.createElement('ul');
  items.forEach((li) => {
    const label = li.querySelector('.title-content, .container-content');
    const newLi = document.createElement('li');
    newLi.textContent = (label ? label.textContent : li.textContent).trim();
    ul.append(newLi);
  });
  cell.push(ul);
}

function buildTextCell(colEl, document) {
  const cell = [];

  const heading = colEl.querySelector('.title-page-content, [class*="title"]:not(.title-content)');
  if (heading && heading.textContent.trim()) {
    const h = document.createElement('h3');
    h.textContent = heading.textContent.trim();
    cell.push(h);
  }

  // Walk direct children in document order to preserve text/list/text sequence.
  Array.from(colEl.children).forEach((child) => {
    if (child.classList.contains('description')) {
      pushParagraphs(child, cell, document);
    } else if (child.querySelector('ul.container-list, ul')) {
      pushList(child, cell, document);
    } else if (child.matches('ul')) {
      pushList(child, cell, document);
    }
  });

  return cell;
}

export default function parse(element, { document }) {
  const cols = Array.from(element.querySelectorAll(':scope > .ant-col'));

  const rowCells = [];
  cols.forEach((col) => {
    const img = col.querySelector(':scope > img, img');
    // An image-only column → image cell; otherwise a text cell.
    const hasText = col.querySelector('.description, p, [class*="title"], ul');
    if (img && !hasText) {
      rowCells.push(img);
    } else {
      const textCell = buildTextCell(col, document);
      // include an image if this column mixes image + text
      if (img) textCell.unshift(img);
      rowCells.push(textCell);
    }
  });

  if (rowCells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [rowCells];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
