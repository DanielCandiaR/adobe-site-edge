/**
 * home-ecosystem — the Puntos.net home hero: a two-column layout with the
 * authored content on the left (title, description, check list, partner badge,
 * metric cards) and a fixed "Adobe ecosystem" visual on the right (a central
 * hub with orbiting product cards + connection lines).
 *
 * Content model (default content rows inside the block):
 *   row 1  — left column content:
 *            h1 (title) · p (description) · ul (check list) ·
 *            p with a picture + text (partner badge)
 *   row 2+ — one metric per row: `+100 | Clientes empresariales`
 *            (first cell = value, second cell = label)
 * The right-hand visual is generated here (no authoring needed).
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

// the six Adobe-cloud product cards orbiting the hub (Ant Design icon paths)
const FLOATING = [
  {
    cls: 'card-aem', label: 'Marketing Cloud', vb: '64 64 896 896', d: 'M864 736c0-111.6-65.4-208-160-252.9V317.3c0-15.1-5.3-29.7-15.1-41.2L536.5 95.4C530.1 87.8 521 84 512 84s-18.1 3.8-24.5 11.4L335.1 276.1a63.97 63.97 0 00-15.1 41.2v165.8C225.4 528 160 624.4 160 736h156.5c-2.3 7.2-3.5 15-3.5 23.8 0 22.1 7.6 43.7 21.4 60.8a97.2 97.2 0 0043.1 30.6c23.1 54 75.6 88.8 134.5 88.8 29.1 0 57.3-8.6 81.4-24.8 23.6-15.8 41.9-37.9 53-64a97 97 0 0043.1-30.5 97.52 97.52 0 0021.4-60.8c0-8.4-1.1-16.4-3.1-23.8H864zM762.3 621.4c9.4 14.6 17 30.3 22.5 46.6H700V558.7a211.6 211.6 0 0162.3 62.7zM388 483.1V318.8l124-147 124 147V668H388V483.1zM239.2 668c5.5-16.3 13.1-32 22.5-46.6 16.3-25.2 37.5-46.5 62.3-62.7V668h-84.8zm388.9 116.2c-5.2 3-11.2 4.2-17.1 3.4l-19.5-2.4-2.8 19.4c-5.4 37.9-38.4 66.5-76.7 66.5-38.3 0-71.3-28.6-76.7-66.5l-2.8-19.5-19.5 2.5a27.7 27.7 0 01-17.1-3.5c-8.7-5-14.1-14.3-14.1-24.4 0-10.6 5.9-19.4 14.6-23.8h231.3c8.8 4.5 14.6 13.3 14.6 23.8-.1 10.2-5.5 19.6-14.2 24.5zM464 400a48 48 0 1096 0 48 48 0 10-96 0z',
  },
  {
    cls: 'card-commerce', label: 'Analytics Cloud', vb: '64 64 896 896', d: 'M888 792H200V168c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h752c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm-616-64h536c4.4 0 8-3.6 8-8V284c0-7.2-8.7-10.7-13.7-5.7L592 488.6l-125.4-124a8.03 8.03 0 00-11.3 0l-189 189.6a7.87 7.87 0 00-2.3 5.6V720c0 4.4 3.6 8 8 8z',
  },
  {
    cls: 'card-cdp', label: 'Campaign', vb: '64 64 896 896', d: 'M834.1 469.2A347.49 347.49 0 00751.2 354l-29.1-26.7a8.09 8.09 0 00-13 3.3l-13 37.3c-8.1 23.4-23 47.3-44.1 70.8-1.4 1.5-3 1.9-4.1 2-1.1.1-2.8-.1-4.3-1.5-1.4-1.2-2.1-3-2-4.8 3.7-60.2-14.3-128.1-53.7-202C555.3 171 510 123.1 453.4 89.7l-41.3-24.3c-5.4-3.2-12.3 1-12 7.3l2.2 48c1.5 32.8-2.3 61.8-11.3 85.9-11 29.5-26.8 56.9-47 81.5a295.64 295.64 0 01-47.5 46.1 352.6 352.6 0 00-100.3 121.5A347.75 347.75 0 00160 610c0 47.2 9.3 92.9 27.7 136a349.4 349.4 0 0075.5 110.9c32.4 32 70 57.2 111.9 74.7C418.5 949.8 464.5 959 512 959s93.5-9.2 136.9-27.3A348.6 348.6 0 00760.8 857c32.4-32 57.8-69.4 75.5-110.9a344.2 344.2 0 0027.7-136c0-48.8-10-96.2-29.9-140.9zM713 808.5c-53.7 53.2-125 82.4-201 82.4s-147.3-29.2-201-82.4c-53.5-53.1-83-123.5-83-198.4 0-43.5 9.8-85.2 29.1-124 18.8-37.9 46.8-71.8 80.8-97.9a349.6 349.6 0 0058.6-56.8c25-30.5 44.6-64.5 58.2-101a240 240 0 0012.1-46.5c24.1 22.2 44.3 49 61.2 80.4 33.4 62.6 48.8 118.3 45.8 165.7a74.01 74.01 0 0024.4 59.8 73.36 73.36 0 0053.4 18.8c19.7-1 37.8-9.7 51-24.4 13.3-14.9 24.8-30.1 34.4-45.6 14 17.9 25.7 37.4 35 58.4 15.9 35.8 24 73.9 24 113.1 0 74.9-29.5 145.4-83 198.4z',
  },
  {
    cls: 'card-campaign', label: 'Commerce Cloud', vb: '0 0 1024 1024', d: 'M922.9 701.9H327.4l29.9-60.9 496.8-.9c16.8 0 31.2-12 34.2-28.6l68.8-385.1c1.8-10.1-.9-20.5-7.5-28.4a34.99 34.99 0 00-26.6-12.5l-632-2.1-5.4-25.4c-3.4-16.2-18-28-34.6-28H96.5a35.3 35.3 0 100 70.6h125.9L246 312.8l58.1 281.3-74.8 122.1a34.96 34.96 0 00-3 36.8c6 11.9 18.1 19.4 31.5 19.4h62.8a102.43 102.43 0 00-20.6 61.7c0 56.6 46 102.6 102.6 102.6s102.6-46 102.6-102.6c0-22.3-7.4-44-20.6-61.7h161.1a102.43 102.43 0 00-20.6 61.7c0 56.6 46 102.6 102.6 102.6s102.6-46 102.6-102.6c0-22.3-7.4-44-20.6-61.7H923c19.4 0 35.3-15.8 35.3-35.3a35.42 35.42 0 00-35.4-35.2zM305.7 253l575.8 1.9-56.4 315.8-452.3.8L305.7 253zm96.9 612.7c-17.4 0-31.6-14.2-31.6-31.6 0-17.4 14.2-31.6 31.6-31.6s31.6 14.2 31.6 31.6a31.6 31.6 0 01-31.6 31.6zm325.1 0c-17.4 0-31.6-14.2-31.6-31.6 0-17.4 14.2-31.6 31.6-31.6s31.6 14.2 31.6 31.6a31.6 31.6 0 01-31.6 31.6z',
  },
  {
    cls: 'card-application', label: 'Application Services', vb: '64 64 896 896', d: 'M704 446H320c-4.4 0-8 3.6-8 8v402c0 4.4 3.6 8 8 8h384c4.4 0 8-3.6 8-8V454c0-4.4-3.6-8-8-8zm-328 64h272v117H376V510zm272 290H376V683h272v117z',
  },
  {
    cls: 'card-intelligent', label: 'Intelligent Services', vb: '64 64 896 896', d: 'M300 328a60 60 0 10120 0 60 60 0 10-120 0zM852 64H172c-17.7 0-32 14.3-32 32v660c0 17.7 14.3 32 32 32h680c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-32 660H204V128h616v596zM604 328a60 60 0 10120 0 60 60 0 10-120 0zm250.2 556H169.8c-16.5 0-29.8 14.3-29.8 32v36c0 4.4 3.3 8 7.4 8h729.1c4.1 0 7.4-3.6 7.4-8v-36c.1-17.7-13.2-32-29.7-32zM664 508H360c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h304c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z',
  },
];

// the connection lines from hub to the orbiting cards
const LINES = [
  { d: 'M200 300 L50 120', c: '#06b6d4' },
  { d: 'M200 300 L300 90', c: '#06b6d4' },
  { d: 'M200 300 L350 415', c: '#ef4444' },
  { d: 'M200 300 L130 475', c: '#06b6d4' },
  { d: 'M200 300 L115 320', c: '#ef4444' },
  { d: 'M200 300 L270 275', c: '#06b6d4' },
];

const HUB_LOGO = '<svg viewBox="0 0 1024 1024" width="1024" height="1024" aria-hidden="true"><circle fill="#f00" cx="512" cy="512" r="512"/><path fill="#fff" d="M578.2 298.6h189.9v426.8L578.2 298.6zM445.9 298.6H256v426.8L445.9 298.6zM512.1 456.5l119.5 268.9h-81.1L516.4 640h-87.5L512.1 456.5z"/></svg>';

// Adobe partner mark (red triangle) used in the partner badge
const ADOBE_MARK = '<svg viewBox="0 0 512 512" width="512" height="512" fill-rule="evenodd" clip-rule="evenodd" aria-hidden="true"><path d="M302.562 477.27L266.27 376.206h-91.166l76.604-192.875 116.25 293.937h138.04L321.729 34.73H191.604L6 477.269h296.562z" fill="#eb1000"/></svg>';

function iconSvg(vb, d) {
  return `<svg viewBox="${vb}" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`;
}

/** Animates a number from 0 to its target once it scrolls into view. */
function animateNumber(el) {
  const raw = el.textContent.trim();
  const prefix = raw.startsWith('+') ? '+' : '';
  const target = parseInt(raw.replace(/[^0-9]/g, ''), 10);
  if (Number.isNaN(target)) return;
  const run = () => {
    const start = performance.now();
    const dur = 800;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = `${prefix}${Math.round(p * target)}`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { run(); io.disconnect(); }
    });
  }, { threshold: 0.4 });
  io.observe(el);
}

export default function decorate(block) {
  const rows = [...block.children];
  const contentRow = rows.shift();

  // ---- LEFT: authored content ----
  const left = document.createElement('div');
  left.className = 'content-left';

  const info = document.createElement('div');
  info.className = 'content-info';
  const cell = contentRow.querySelector(':scope > div') || contentRow;
  [...cell.children].forEach((node) => {
    if (/^H[1-6]$/.test(node.tagName)) {
      node.classList.add('title');
      info.append(node);
    } else if (node.tagName === 'UL' || node.tagName === 'OL') {
      node.classList.add('home-check-list');
      info.append(node);
    } else if (node.tagName === 'P'
      && (node.querySelector('picture, img') || /partner|platinum/i.test(node.textContent))) {
      // partner badge — always render the Adobe mark + a two-line label
      const badge = document.createElement('div');
      badge.className = 'partner-badge';

      const iconWrap = document.createElement('div');
      iconWrap.className = 'partner-icon';
      const pic = node.querySelector('picture, img');
      if (pic) iconWrap.append(pic);
      else iconWrap.innerHTML = ADOBE_MARK;

      // split the text: "Adobe Platinum" (label) + the rest ("Solution Partner")
      const full = node.textContent.replace(/\s+/g, ' ').trim();
      const m = full.match(/^(.*?platinum)\s*(.*)$/i);
      const labelText = m ? m[1].trim() : full;
      const subText = m ? m[2].trim() : '';

      const textWrap = document.createElement('div');
      const label = document.createElement('span');
      label.className = 'partner-label';
      label.textContent = labelText;
      textWrap.append(label);
      if (subText) {
        const sub = document.createElement('div');
        sub.className = 'partner-text';
        sub.textContent = subText;
        textWrap.append(sub);
      }

      badge.append(iconWrap, textWrap);
      info.append(badge);
    } else {
      node.classList.add('description');
      info.append(node);
    }
  });
  left.append(info);

  // ---- metrics ----
  if (rows.length) {
    const metrics = document.createElement('div');
    metrics.className = 'content-metrics';
    const colors = ['#ef4444', '#06b6d4'];
    rows.forEach((row, i) => {
      const cells = [...row.querySelectorAll(':scope > div')];
      if (!cells.length) return;
      const card = document.createElement('div');
      card.className = 'metric-card';
      const value = document.createElement('div');
      value.className = 'metric-value';
      value.style.color = colors[i % colors.length];
      value.textContent = cells[0].textContent.trim();
      const label = document.createElement('div');
      label.className = 'metric-label';
      if (cells[1]) label.textContent = cells[1].textContent.trim();
      card.append(value, label);
      metrics.append(card);
      animateNumber(value);
    });
    left.append(metrics);
  }

  // ---- RIGHT: fixed Adobe-ecosystem visual ----
  const right = document.createElement('div');
  right.className = 'content-right';
  const wrapper = document.createElement('div');
  wrapper.className = 'metrics-wrapper';

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'connection-lines');
  svg.setAttribute('viewBox', '0 0 400 600');
  svg.setAttribute('aria-hidden', 'true');
  LINES.forEach((l) => {
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', l.d);
    p.setAttribute('stroke', l.c);
    p.setAttribute('stroke-width', '1.5');
    p.setAttribute('fill', 'none');
    svg.append(p);
  });

  const hub = document.createElement('div');
  hub.className = 'central-hub';
  hub.innerHTML = `<div class="hub-circle">${HUB_LOGO}</div>`;

  wrapper.append(svg, hub);
  FLOATING.forEach((f) => {
    const fc = document.createElement('div');
    fc.className = `floating-card ${f.cls}`;
    fc.innerHTML = `${iconSvg(f.vb, f.d)}<span>${f.label}</span>`;
    wrapper.append(fc);
  });
  right.append(wrapper);

  // ---- assemble ----
  block.textContent = '';
  block.append(left, right);

  // optimize the partner badge image
  block.querySelectorAll('.partner-icon img').forEach((img) => {
    if (!img.src) return;
    const opt = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '128' }]);
    opt.querySelector('img').className = 'partner-image';
    const replaceable = img.closest('picture') || img;
    replaceable.replaceWith(opt);
  });

  // parallax on the visual (desktop, respects reduced motion)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduce.matches) {
    window.addEventListener('mousemove', (e) => {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.015;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.015;
      wrapper.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  }
}
