/**
 * cards-stats: animated stat counters (number + caption).
 * Each row = one stat card. First line of text is the number (with optional
 * leading "+" and trailing "%"/"+"), remaining text is the caption.
 */

function animateCount(el, target, suffix, prefix) {
  const duration = 1500;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(progress * target);
    el.textContent = `${prefix}${value}${suffix}`;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = `${prefix}${target}${suffix}`;
  };
  requestAnimationFrame(step);
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      div.className = 'cards-stats-card-body';
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);

  // Identify the number element (first heading or first line of text) per card.
  const counters = [];
  ul.querySelectorAll('.cards-stats-card-body').forEach((body) => {
    const numEl = body.querySelector('h1, h2, h3, h4, h5, h6') || body.firstElementChild;
    if (!numEl) return;
    const raw = numEl.textContent.trim();
    const match = raw.match(/^(\D*)(\d+)(\D*)$/);
    if (match) {
      const [, prefix, digits, suffix] = match;
      numEl.classList.add('cards-stats-number');
      counters.push({
        el: numEl, target: parseInt(digits, 10), prefix, suffix,
      });
      numEl.textContent = `${prefix}0${suffix}`;
    }
    [...body.children].forEach((child) => {
      if (child !== numEl) child.classList.add('cards-stats-caption');
    });
  });

  // Trigger the count-up when the block scrolls into view.
  if (counters.length) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          counters.forEach((c) => animateCount(c.el, c.target, c.suffix, c.prefix));
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(block);
  }
}
