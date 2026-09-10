/**
 * title-page — section title with a blue accent line (port of the source
 * TitlePageComponent).
 *
 * Variants (block classes):
 *   line              show the accent line (default look; without it, plain)
 *   line-top          line above the title (default when `line` is set)
 *   line-bottom       line below the title
 *   center | left | right   text + line alignment (default: center)
 *   small             20px column-subtitle size (default is the 41px heading)
 *
 * Content model: a single cell with the title text (or a heading).
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block.querySelector(':scope > div') || block;

  const content = document.createElement('div');
  content.className = 'title-page-content';
  content.append(...cell.childNodes);

  const line = document.createElement('span');
  line.className = 'title-page-line';

  block.textContent = '';
  // default to showing the line unless authored plain
  if (!block.classList.contains('no-line')) block.classList.add('has-line');

  if (block.classList.contains('line-bottom')) {
    block.append(content, line);
  } else {
    block.append(line, content);
  }
}
