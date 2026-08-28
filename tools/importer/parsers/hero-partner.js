/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-partner. Base: hero.
 * Source: puntos.net (dark hero — highlighted heading, paragraph, check-list, Adobe Platinum badge)
 * Generated: 2026-08-25
 *
 * Hero library structure: 1 column, up to 3 rows.
 *   Row 1: block name
 *   Row 2 (optional): background image — none in this source
 *   Row 3: content cell (title, subheading, and supporting content)
 */
export default function parse(element, { document }) {
  // Title (heading with highlighted span) — promote to a real heading for semantics
  const titleEl = element.querySelector('.title, [class*="title"]:not(.title-content)');
  const description = element.querySelector('.description, p');

  // Feature check-list items
  const listItems = Array.from(element.querySelectorAll('.container-list .item-list, ul li'));

  // Partner badge (Adobe Platinum)
  const badge = element.querySelector('.partner-badge');

  const bgImage = element.querySelector('img[class*="background"], img[class*="hero-bg"]');

  const contentCell = [];

  if (titleEl) {
    const heading = document.createElement('h1');
    // preserve highlighted span + text
    heading.append(...titleEl.childNodes);
    contentCell.push(heading);
  }

  if (description) {
    const p = document.createElement('p');
    p.textContent = description.textContent.trim();
    contentCell.push(p);
  }

  if (listItems.length) {
    const ul = document.createElement('ul');
    listItems.forEach((li) => {
      const label = li.querySelector('.title-content, .container-content');
      const newLi = document.createElement('li');
      newLi.textContent = (label ? label.textContent : li.textContent).trim();
      ul.append(newLi);
    });
    contentCell.push(ul);
  }

  if (badge) {
    const badgeImg = badge.querySelector('img');
    const labelParts = Array.from(badge.querySelectorAll('.partner-label, .partner-text'))
      .map((el) => el.textContent.trim())
      .filter(Boolean);
    const p = document.createElement('p');
    if (badgeImg) p.append(badgeImg);
    if (labelParts.length) {
      const strong = document.createElement('strong');
      strong.textContent = labelParts.join(' ');
      if (badgeImg) p.append(' ');
      p.append(strong);
    }
    if (p.childNodes.length) contentCell.push(p);
  }

  if (contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (bgImage) cells.push([bgImage]);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-partner', cells });
  element.replaceWith(block);
}
