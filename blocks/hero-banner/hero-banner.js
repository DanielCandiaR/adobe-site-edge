/**
 * hero-banner — "hero-full" variant of the Puntos.net hero component.
 * Content model:
 *   - first row with a picture → full-bleed background image
 *   - remaining rows → centered title / subtitle / text
 */
export default function decorate(block) {
  const bgPicture = block.querySelector(':scope > div:first-child picture');

  // pull the background image out into its own layer
  if (bgPicture) {
    const bg = document.createElement('div');
    bg.className = 'hero-bg';
    const ownerRow = bgPicture.closest(':scope > div');
    bg.append(bgPicture);
    if (ownerRow) ownerRow.remove();
    block.prepend(bg);
  } else {
    block.classList.add('no-image');
  }

  // flatten the remaining content rows into a single centered content block
  const content = document.createElement('div');
  content.className = 'hero-content';
  [...block.children].forEach((row) => {
    if (row.classList.contains('hero-bg')) return;
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length) {
      cells.forEach((cell) => [...cell.childNodes].forEach((n) => content.append(n)));
    } else {
      [...row.childNodes].forEach((n) => content.append(n));
    }
    row.remove();
  });
  block.append(content);
}
