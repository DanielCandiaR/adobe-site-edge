import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// Inline SVG icons matching the source site (Ant Design icons)
const ICONS = {
  dropbox: '<svg class="pn-icon" viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M64 556.9l264.2 173.5L512.5 577 246.8 412.7zm896-290.5l-263.7-172-184.3 153.4L777.5 421zM512.5 577l184.8 153.4L960 557.4 777.5 421zM64 556.9L246.8 693l265.7-224.9-184.3-120.5zM256.4 796.7l256.1 167.7 255.9-167.7-256-153.4z"/></svg>',
  linkedin: '<svg class="pn-icon" viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zM349.3 793.7H230.6V411.9h118.7v381.8zm-59.3-434a68.8 68.8 0 1168.8-68.8c-.1 38-30.9 68.8-68.8 68.8zm503.7 434H674.4V608c0-44.3-.8-101.2-61.7-101.2-61.7 0-71.2 48.2-71.2 98v188.9H422.8V411.9h113.9v52.2h1.6c15.9-30 54.6-61.7 112.3-61.7 120.2 0 142.4 79.1 142.4 181.9v209.4z"/></svg>',
  twitter: '<svg class="pn-icon" viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M928 254.3c-30.6 13.2-63.9 22.7-98.2 26.4a170.1 170.1 0 0075-94 336.64 336.64 0 01-108.2 41.2A170.1 170.1 0 00672 174c-94.5 0-170.5 76.6-170.5 170.6 0 13.2 1.6 26.4 4.2 39.1-141.5-7.4-267.7-75-351.6-178.5a169.32 169.32 0 00-23.2 86.1c0 59.2 30.1 111.4 76 142.1a172 172 0 01-77.1-21.7v2.1c0 82.9 58.6 151.6 136.7 167.4a180.6 180.6 0 01-44.9 5.8c-11.1 0-21.6-1.1-32.2-2.6C325 559.3 388.4 610 464.7 611.6c-59.7 46.8-134.8 74.2-216.2 74.2-14.3 0-27.9-.7-41.6-2.6C282.7 731.9 373.9 760 472 760c322.6 0 499.1-267.3 499.1-499.1 0-7.4 0-14.8-.5-22.2 34.4-24.8 64.1-56 87.8-91.4z"/></svg>',
};

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  let footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  // Content for this site is served under /content/. When no explicit footer
  // metadata is set, resolve the footer fragment relative to the content root
  // so the local Puntos.net footer (content/footer.plain.html) is used.
  if (!footerMeta && window.location.pathname.startsWith('/content/')) {
    footerPath = '/content/footer';
  }
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Rebase relative image paths (e.g. images/logo.avif) against the footer
  // fragment location so they resolve correctly on nested pages.
  const footerBase = new URL(footerPath, window.location);
  footer.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('/') && !src.startsWith('http') && !src.startsWith('data:')) {
      img.src = new URL(src, footerBase).href;
    }
  });

  // The fragment yields 4 default-content sections: brand, expertise, company, adobe
  const cols = footer.querySelectorAll(':scope > .section, :scope > div');
  const [brandCol, expertiseCol, companyCol, adobeCol] = cols;

  // --- brand column: dropbox icon + name, description, social icons ---
  if (brandCol) {
    brandCol.classList.add('footer-brand');
    const paras = brandCol.querySelectorAll(':scope .default-content-wrapper > p, :scope > div > p, :scope > p');
    const nameP = paras[0];
    if (nameP) {
      nameP.classList.add('footer-logo');
      const icon = document.createElement('span');
      icon.className = 'footer-logo-icon';
      icon.innerHTML = ICONS.dropbox;
      const text = document.createElement('span');
      text.className = 'footer-logo-text';
      text.textContent = nameP.textContent.trim();
      nameP.textContent = '';
      nameP.append(icon, text);
    }
    if (paras[1]) paras[1].classList.add('footer-description');
    // social links (last paragraph with anchors) → icon buttons
    const socialP = [...paras].find((p) => p.querySelector('a'));
    if (socialP) {
      socialP.classList.add('footer-socials');
      socialP.querySelectorAll('a').forEach((a) => {
        const label = a.textContent.trim().toLowerCase();
        const icon = ICONS[label] || '';
        a.textContent = '';
        a.setAttribute('aria-label', a.getAttribute('aria-label') || label);
        a.innerHTML = icon;
      });
    }
  }

  // --- expertise + company columns: menu list ---
  [expertiseCol, companyCol].forEach((col) => {
    if (col) col.classList.add('footer-menu');
  });

  // --- adobe partner column ---
  if (adobeCol) {
    adobeCol.classList.add('footer-partner');
    const paras = adobeCol.querySelectorAll(':scope .default-content-wrapper > p, :scope > div > p, :scope > p');
    // paras: [0]=logo img, [1]=label, [2]=copyright
    if (paras[1]) paras[1].classList.add('footer-partner-label');
    if (paras[2]) paras[2].classList.add('footer-partner-copyright');
  }

  block.append(footer);
}
