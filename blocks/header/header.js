import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 768px)');

// Inline SVG icons matching the source site (Ant Design icons)
const ICONS = {
  down: '<svg class="pn-icon pn-icon-down" viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"/></svg>',
  global: '<svg class="pn-icon pn-icon-global" viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M854.4 800.9c.2-.3.5-.6.7-.9C920.6 722.1 960 621.7 960 512s-39.4-210.1-104.8-288c-.2-.3-.5-.5-.7-.8-1.1-1.3-2.1-2.5-3.2-3.7-.4-.5-.8-.9-1.2-1.4l-4.1-4.7-.1-.1c-1.5-1.7-3.1-3.4-4.6-5.1l-.1-.1c-3.2-3.4-6.4-6.8-9.7-10.1l-.1-.1-4.8-4.8-.3-.3c-1.5-1.5-3-2.9-4.5-4.3-.5-.5-1-1-1.6-1.5-1-1-2.1-1.9-3.1-2.9-.4-.4-.9-.8-1.3-1.2C723.4 130.7 621.2 88 512 88s-211.4 42.7-288.9 111.2c-.4.4-.9.8-1.3 1.2-1.1.9-2.1 1.9-3.1 2.9-.5.5-1 1-1.6 1.5-1.5 1.4-3 2.9-4.5 4.3l-.3.3-4.8 4.8-.1.1c-3.3 3.3-6.5 6.7-9.7 10.1l-.1.1c-1.6 1.7-3.1 3.4-4.6 5.1l-.1.1c-1.4 1.5-2.8 3.1-4.1 4.7-.4.5-.8.9-1.2 1.4-1.1 1.2-2.2 2.5-3.2 3.7-.2.3-.5.5-.7.8C143.4 301.9 104 402.3 104 512s39.4 210.1 104.8 288c.2.3.5.6.7.9l3.1 3.7c.4.5.8.9 1.2 1.4l4.1 4.7c0 .1.1.1.1.2 1.5 1.7 3 3.4 4.6 5l.1.1c3.2 3.4 6.4 6.8 9.6 10.1l.1.1c1.6 1.6 3.1 3.2 4.7 4.7l.3.3c3.3 3.3 6.7 6.5 10.1 9.6 78.6 71.6 182.5 115.2 296.5 115.2s217.9-43.6 296.5-115.2c3.5-3.1 6.8-6.3 10.1-9.6l.3-.3c1.6-1.5 3.2-3.1 4.7-4.7l.1-.1c3.3-3.3 6.5-6.7 9.6-10.1l.1-.1c1.5-1.7 3.1-3.3 4.6-5 0-.1.1-.1.1-.2 1.4-1.5 2.8-3.1 4.1-4.7.4-.5.8-.9 1.2-1.4a99 99 0 003.3-3.7zm4.1-142.6c-13.8 32.6-32 62.8-54.2 90.2a444.07 444.07 0 00-81.5-55.9c11.6-46.9 18.8-98.4 20.7-152.6H872c-3 40.9-12.6 80.6-28.5 118.3zM418 838.1c-24.5-27.4-45.5-63.4-61.6-105.4 39.5-9.4 80.6-14.9 122.6-16.3v135.8c-8.6-2.4-16.8-6-24.4-10.4-9.9-5.7-17.8-11.6-24.6-18.3-4.2-4.1-8-8.5-11.6-13.1-2.9-3.7-5.6-7.5-8.1-11.4a266.4 266.4 0 01-7.8-12.8c-.5-.9-1-1.9-1.5-2.9-2.5-4.7-4.9-9.6-7-14.6-.6-1.3-1.1-2.6-1.6-4-1.9-4.6-3.6-9.3-5.2-14.1zM461 461v-99h94v99h-94zm0 61h94v99h-94v-99zm155-61v-99h94.4c1.3 25 2.1 51.8 2.1 80s-.8 55-2.1 80H616v-99zm0 61h94.4c-2.3 41.5-6.9 79.9-13.4 113.9-27.4-6.9-56.4-11.4-86.5-13.4v-99zm0-283h94.4c6.5 34 11.1 72.4 13.4 113.9-30.1-2-59.1-6.5-86.5-13.4v-99zm-155 0v-99h94v99h-94zm0 61h94v99h-94v-99zm-61 99H305.6c-1.3-25-2.1-51.8-2.1-80s.8-55 2.1-80H400v99z"/></svg>',
  calendar: '<svg class="pn-icon pn-icon-calendar" viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M112 880c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V423H112v457zm640-208c0-4.4 3.6-8 8-8h72c4.4 0 8 3.6 8 8v72c0 4.4-3.6 8-8 8h-72c-4.4 0-8-3.6-8-8v-72zM880 128H768v-52c0-6.6-5.4-12-12-12h-60c-6.6 0-12 5.4-12 12v52H340v-52c0-6.6-5.4-12-12-12h-60c-6.6 0-12 5.4-12 12v52H144c-17.7 0-32 14.3-32 32v199h800V160c0-17.7-14.3-32-32-32z"/></svg>',
};

function closeAllDropdowns(nav) {
  nav.querySelectorAll('[aria-expanded="true"]').forEach((el) => {
    if (el.classList.contains('nav-drop') || el.classList.contains('nav-lang')) {
      el.setAttribute('aria-expanded', 'false');
    }
  });
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    if (!nav) return;
    if (isDesktop.matches) {
      closeAllDropdowns(nav);
    } else if (nav.getAttribute('aria-expanded') === 'true') {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav);
    }
  }
}

/**
 * Toggles the mobile nav drawer.
 * @param {Element} nav the nav element
 * @param {*} forceExpanded optional param to force nav expand behavior
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Abrir navegación' : 'Cerrar navegación');
  if (expanded || isDesktop.matches) {
    closeAllDropdowns(nav);
  }
}

/**
 * Wires a dropdown trigger <li> to open on hover (desktop) and click (all).
 * @param {Element} drop the trigger list item
 * @param {Element} nav the nav element
 */
function wireDropdown(drop, nav) {
  // click toggles (works on desktop + mobile accordion)
  drop.addEventListener('click', (e) => {
    // only toggle when clicking the trigger row itself, not a submenu link
    if (e.target.closest('ul ul a')) return;
    const isOpen = drop.getAttribute('aria-expanded') === 'true';
    if (isDesktop.matches) closeAllDropdowns(nav);
    drop.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  });
  drop.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      const isOpen = drop.getAttribute('aria-expanded') === 'true';
      if (isDesktop.matches) closeAllDropdowns(nav);
      drop.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    }
  });
  // hover opens on desktop (matches source Ant Design behavior)
  drop.addEventListener('mouseenter', () => {
    if (isDesktop.matches) {
      closeAllDropdowns(nav);
      drop.setAttribute('aria-expanded', 'true');
    }
  });
  drop.addEventListener('mouseleave', () => {
    if (isDesktop.matches) drop.setAttribute('aria-expanded', 'false');
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  let navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  // Content for this site is served under /content/. When no explicit nav
  // metadata is set, resolve the nav fragment relative to the content root so
  // the local Puntos.net nav (content/nav.plain.html) is used instead of the
  // boilerplate default proxied from /nav.
  if (!navMeta && window.location.pathname.startsWith('/content/')) {
    navPath = '/content/nav';
  }
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Rebase relative image paths (e.g. images/logo.avif) against the nav
  // fragment location so they resolve correctly on nested pages.
  const navBase = new URL(navPath, window.location);
  nav.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('/') && !src.startsWith('http') && !src.startsWith('data:')) {
      img.src = new URL(src, navBase).href;
    }
  });

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // brand: strip button styling classes from the logo link
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      const bc = brandLink.closest('.button-container');
      if (bc) bc.className = '';
    }
  }

  // main nav sections — mark dropdowns, append arrow icons, wire behavior
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) {
        navSection.classList.add('nav-drop');
        navSection.setAttribute('role', 'button');
        navSection.setAttribute('tabindex', '0');
        navSection.setAttribute('aria-expanded', 'false');
        const submenu = navSection.querySelector('ul');
        // wrap the trigger label text nodes in a span so it can carry the
        // animated underline (needed on mobile where the li is a flex row)
        const label = document.createElement('span');
        label.className = 'nav-drop-label';
        [...navSection.childNodes].forEach((node) => {
          if (node === submenu) return;
          if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
          label.appendChild(node);
        });
        // append the down-arrow icon right after the trigger label
        const arrow = document.createElement('span');
        arrow.className = 'nav-drop-arrow';
        arrow.innerHTML = ICONS.down;
        label.appendChild(arrow);
        navSection.insertBefore(label, submenu);
        wireDropdown(navSection, nav);
      }
    });
  }

  // tools: language selector (first li with a submenu) + CTA (last li)
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const toolItems = navTools.querySelectorAll(':scope .default-content-wrapper > ul > li');
    toolItems.forEach((li) => {
      const submenu = li.querySelector('ul');
      if (submenu) {
        // language dropdown: globe + label + arrow
        li.classList.add('nav-lang');
        li.setAttribute('role', 'button');
        li.setAttribute('tabindex', '0');
        li.setAttribute('aria-expanded', 'false');
        const globe = document.createElement('span');
        globe.className = 'nav-lang-globe';
        globe.innerHTML = ICONS.global;
        li.insertBefore(globe, li.firstChild);
        const arrow = document.createElement('span');
        arrow.className = 'nav-drop-arrow';
        arrow.innerHTML = ICONS.down;
        li.insertBefore(arrow, submenu);
        wireDropdown(li, nav);
      } else {
        // CTA button — wrap label text and prepend calendar icon so the
        // narrow (tablet) range can collapse to icon-only.
        const link = li.querySelector('a');
        if (link) {
          li.classList.add('nav-cta');
          const text = document.createElement('span');
          text.className = 'btn-text';
          [...link.childNodes].forEach((node) => text.appendChild(node));
          link.appendChild(text);
          const cal = document.createElement('span');
          cal.className = 'nav-cta-icon';
          cal.innerHTML = ICONS.calendar;
          link.insertBefore(cal, link.firstChild);
        }
      }
    });

    // Mobile-only CTA shown in the top bar (between logo and hamburger),
    // mirroring the source. The tools CTA remains inside the drawer.
    const ctaLink = navTools.querySelector('.nav-cta a');
    if (ctaLink) {
      const topCta = document.createElement('div');
      topCta.className = 'nav-cta-top';
      const clone = ctaLink.cloneNode(true);
      topCta.appendChild(clone);
      nav.appendChild(topCta);
    }
  }

  // mark the active nav item based on the current page path (mirrors the
  // source site's isActive: exact match for "/", prefix match otherwise)
  const current = (window.location.pathname
    .replace(/\.html$/, '')
    .replace(/^\/content/, '')
    .replace(/\/index$/, '/')) || '/';
  const isActive = (path) => {
    if (!path) return false;
    if (path === '/') return current === '/';
    return current === path || current.startsWith(`${path}/`);
  };
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((li) => {
      const directLink = li.querySelector(':scope > a');
      if (directLink && isActive(new URL(directLink.href, window.location).pathname)) {
        li.classList.add('active');
      }
      // dropdown trigger is active when any of its sub-links match
      const subActive = [...li.querySelectorAll(':scope > ul a')]
        .some((a) => isActive(new URL(a.href, window.location).pathname));
      if (subActive) {
        li.classList.add('active');
        li.querySelectorAll(':scope > ul a').forEach((a) => {
          if (isActive(new URL(a.href, window.location).pathname)) a.classList.add('active');
        });
      }
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Abrir navegación">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // keep behavior consistent across breakpoint changes: always collapse the
  // mobile drawer and reset residual state so the desktop header is clean
  isDesktop.addEventListener('change', () => {
    nav.setAttribute('aria-expanded', 'false');
    const button = nav.querySelector('.nav-hamburger button');
    if (button) button.setAttribute('aria-label', 'Abrir navegación');
    document.body.style.overflowY = '';
    closeAllDropdowns(nav);
  });
  window.addEventListener('keydown', closeOnEscape);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
