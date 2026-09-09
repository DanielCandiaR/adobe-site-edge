/**
 * text-list — a simple list with an icon on the left of every item.
 * Default: a red check. Variant `numbered`: an auto-incrementing number
 * inside a red circle.
 * Content model: one block row per item (a single cell with the item text).
 */
const CHECK_ICON = '<svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 00-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"/></svg>';

export default function decorate(block) {
  const numbered = block.classList.contains('numbered');

  const list = document.createElement('ul');
  list.className = 'container-list';

  [...block.children].forEach((row, index) => {
    const item = document.createElement('li');
    item.className = 'item-list';

    const vineta = document.createElement('span');
    vineta.className = 'icon-vineta';
    if (numbered) vineta.textContent = index + 1;
    else vineta.innerHTML = CHECK_ICON;

    const content = document.createElement('div');
    content.className = 'container-content';
    const title = document.createElement('div');
    title.className = 'title-content';
    const cell = row.querySelector(':scope > div') || row;
    title.append(...cell.childNodes);
    content.append(title);

    item.append(vineta, content);
    list.append(item);
  });

  block.textContent = '';
  block.append(list);
}
