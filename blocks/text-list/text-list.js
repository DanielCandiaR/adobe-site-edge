/**
 * text-list — reusable list component (mirrors the source TextListComponent).
 *
 * Variants (block classes):
 *   - default            → check-vineta list
 *   - text-list card     → each item is a card (bg + border + hover)
 *
 * Content model — one block row per list item:
 *   | title | (optional) description |
 * A single-cell row is title only. A link in the item makes it clickable.
 */
const CHECK_ICON = '<svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 00-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"/></svg>';

export default function decorate(block) {
  const isCard = block.classList.contains('card');

  const list = document.createElement('ul');
  list.className = 'container-list';

  [...block.children].forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];

    const item = document.createElement('li');
    item.className = 'item-list';
    if (isCard) item.classList.add('item-card');

    // an authored link makes the whole item clickable
    const link = row.querySelector('a[href]');
    if (link) {
      item.classList.add('item-clickable');
      const href = link.getAttribute('href');
      item.addEventListener('click', () => { window.location.href = href; });
    }

    // vineta (red check circle)
    const vineta = document.createElement('span');
    vineta.className = 'icon-vineta';
    vineta.innerHTML = CHECK_ICON;

    // content: first cell = title, second cell (if any) = description
    const content = document.createElement('div');
    content.className = 'container-content';

    const title = document.createElement('div');
    title.className = 'title-content';
    if (cells[0]) title.append(...cells[0].childNodes);
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
  block.append(list);
}
