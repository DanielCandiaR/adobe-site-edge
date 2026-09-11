/* eslint-disable */
/* global WebImporter */
/**
 * Parser for browser-frame (mock browser window with a screenshot).
 * Source: .browser-frame — a header title/subtitle + an image.
 * Emits a block: row 1 = [title | subtitle], row 2 = [image].
 */
export default function parse(element, { document }) {
  const title = element.querySelector('.browser-frame-title');
  const subtitle = element.querySelector('.browser-frame-subtitle');
  const img = element.querySelector('img');

  const cells = [];
  cells.push([
    title ? title.textContent.trim() : '',
    subtitle ? subtitle.textContent.trim() : '',
  ]);
  if (img) {
    const image = document.createElement('img');
    image.src = img.src;
    image.alt = img.alt || '';
    cells.push([image]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'browser-frame', cells });
  element.replaceWith(block);
}
