/**
 * hero-partner — "hero-left" variant of the Puntos.net hero component.
 *
 * Content model (rows in the block):
 *   - optional first row containing a picture  → background image (right side)
 *   - content row(s): headings / paragraphs / list
 *       · <h1>  → title
 *       · <h2>  → subtitle
 *       · <p>   → description
 *       · <ul>  → feature checklist
 *
 * An eyebrow "badge" can be authored as the first paragraph wrapped in
 * emphasis (e.g. *SILVER PARTNER*) — it renders as the pill badge.
 */
export default function decorate(block) {
  // 1. Background image (first cell that contains a picture)
  const bgPicture = block.querySelector(':scope > div:first-child picture');
  const heroBg = document.createElement('div');
  heroBg.className = 'hero-bg';
  heroBg.innerHTML = '<div class="gradient"></div>';
  // The dark navy background is intrinsic to this variant; the image is
  // optional (only the hero-title variant is truly background-less).
  if (bgPicture) {
    const ownerRow = bgPicture.closest(':scope > div');
    heroBg.prepend(bgPicture);
    if (ownerRow) ownerRow.remove();
  } else {
    block.classList.add('no-image');
  }

  // 2. Collect the remaining authored content into a single info container
  const info = document.createElement('div');
  info.className = 'content-info';
  [...block.children].forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length) {
      cells.forEach((cell) => [...cell.childNodes].forEach((n) => info.append(n)));
    } else {
      [...row.childNodes].forEach((n) => info.append(n));
    }
    row.remove();
  });

  // 3. Tag the pieces so the CSS can style them like the source component
  info.querySelectorAll(':scope > h1').forEach((h) => h.classList.add('title'));
  info.querySelectorAll(':scope > h2').forEach((h) => h.classList.add('subtitle'));
  info.querySelectorAll(':scope > p').forEach((p) => {
    // a paragraph whose only content is emphasis becomes the eyebrow badge
    if (p.children.length === 1 && p.firstElementChild.matches('em')) {
      p.classList.add('badge');
      p.firstElementChild.replaceWith(...p.firstElementChild.childNodes);
    } else if (p.textContent.trim()) {
      p.classList.add('description');
    }
  });
  info.querySelectorAll(':scope > ul').forEach((ul) => ul.classList.add('content-list'));

  // 4. Assemble the component structure
  const inner = document.createElement('div');
  inner.className = 'content-inner';
  inner.append(info);
  const content = document.createElement('div');
  content.className = 'hero-content';
  content.append(inner);
  const glow = document.createElement('div');
  glow.className = 'bottom-glow';

  block.textContent = '';
  block.append(heroBg, content, glow);
}
