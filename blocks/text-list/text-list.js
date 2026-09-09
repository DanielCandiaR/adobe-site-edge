/**
 * text-list — reusable list component (port of the source TextListComponent).
 *
 * The source component is a fully configurable list engine; every knob is
 * exposed here as a block variant (class) and/or a CSS custom property.
 *
 * VINETA FAMILIES (pick one; default = `check`):
 *   check          red check glyph, transparent, no circle  ← site default
 *   check-circle   red filled circle + white check
 *   check-outline  transparent circle, red border + red check
 *   dot            "·" text glyph in a circular container
 *   number         auto-incrementing numbers (1, 2, 3…)
 *   icon           use an author-supplied image/svg as the glyph
 *
 * LAYOUT / BEHAVIOUR (combinable with any family):
 *   card           each item is a card (bg + border + padding)
 *   hover          hover effect (bg/border/shadow + text colour shift)
 *   compact        tight spacing (items-gap 0, icon-gap 5) — the site look
 *   align-start    align the vineta to the top instead of centered
 *   with-heading   the first block row becomes the list heading
 *   (a link inside an item makes the whole item clickable — automatic)
 *
 * CONTENT MODEL — one block row per item:
 *   | title | (optional) description |
 * With `with-heading`, the first row is the heading instead of an item.
 * An <img>/<picture> in an item's first cell is used as the vineta (icon).
 */
const CHECK_ICON = '<svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 00-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"/></svg>';

const VINETA_FAMILIES = ['check', 'check-circle', 'check-outline', 'dot', 'number', 'icon'];

export default function decorate(block) {
  const family = VINETA_FAMILIES.find((f) => block.classList.contains(f)) || 'check';
  const isCard = block.classList.contains('card');
  const withHeading = block.classList.contains('with-heading');

  const rows = [...block.children];

  // optional heading (first row) when `with-heading` is set
  let heading = null;
  if (withHeading && rows.length) {
    const headRow = rows.shift();
    heading = document.createElement('div');
    heading.className = 'header-text-list';
    const cell = headRow.querySelector(':scope > div') || headRow;
    heading.append(...cell.childNodes);
  }

  const list = document.createElement('ul');
  list.className = 'container-list';

  rows.forEach((row, index) => {
    const cells = [...row.querySelectorAll(':scope > div')];

    const item = document.createElement('li');
    item.className = 'item-list';
    if (isCard) item.classList.add('item-card');

    // an authored link makes the whole item clickable
    const link = row.querySelector('a[href]');
    if (link) {
      item.classList.add('item-clickable');
      const href = link.getAttribute('href');
      const external = /^https?:\/\//i.test(href) && !href.includes(window.location.hostname);
      item.addEventListener('click', () => {
        if (external) window.open(href, '_blank', 'noopener');
        else window.location.href = href;
      });
    }

    // vineta
    const vineta = document.createElement('span');
    vineta.className = 'icon-vineta';

    const titleCell = cells[0];
    const authorImg = family === 'icon' && titleCell
      ? titleCell.querySelector(':scope > picture, :scope > img') : null;

    if (authorImg) {
      vineta.append(authorImg);
    } else if (family === 'dot') {
      vineta.innerHTML = '<span class="content-vineta">·</span>';
    } else if (family === 'number') {
      vineta.innerHTML = `<span class="content-vineta">${index + 1}</span>`;
    } else {
      vineta.innerHTML = CHECK_ICON;
    }

    // content: first cell = title, optional second cell = description
    const content = document.createElement('div');
    content.className = 'container-content';

    const title = document.createElement('div');
    title.className = 'title-content';
    if (titleCell) title.append(...titleCell.childNodes);
    else title.append(...row.childNodes);
    content.append(title);

    if (cells[1] && cells[1].textContent.trim()) {
      const text = document.createElement('div');
      text.className = 'text-content';
      text.append(...cells[1].childNodes);
      content.append(text);
    }

    item.append(vineta, content);
    list.append(item);
  });

  block.textContent = '';
  if (heading) block.append(heading);
  block.append(list);
}
