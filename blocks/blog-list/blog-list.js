/**
 * blog-list
 * Interactive blog listing block.
 *
 * Authored content: one block row per post. Cells, in order:
 *   1. image      (picture/img)
 *   2. title      (text)
 *   3. summary    (text)
 *   4. tags       (comma-separated text, e.g. "adobe, analytics")
 *   5. author     (text)
 *   6. date       (text, e.g. "5/25/2026")
 *   7. link       (anchor to /blog/{slug})
 *
 * The block reads these rows into a data model and renders:
 *   - a search box (filters by title / summary / author / date / tags)
 *   - tag filter tabs with counts (Todos + one per distinct tag)
 *   - a responsive grid of post cards
 *   - a result-count line and pagination controls
 */

const PAGE_SIZE = 10;

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function parsePosts(block) {
  const rows = [...block.children];
  return rows.map((row) => {
    const cells = [...row.children];
    const [imgCell, titleCell, summaryCell, tagsCell, authorCell, dateCell, linkCell] = cells;
    const picture = imgCell ? imgCell.querySelector('picture, img') : null;
    const anchor = linkCell ? linkCell.querySelector('a') : null;
    const tags = cellText(tagsCell)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    return {
      picture,
      title: cellText(titleCell),
      summary: cellText(summaryCell),
      tags,
      author: cellText(authorCell),
      date: cellText(dateCell),
      href: anchor ? anchor.getAttribute('href') : (cellText(linkCell) || null),
    };
  }).filter((p) => p.title || p.summary);
}

function buildTagCounts(posts) {
  const counts = new Map();
  posts.forEach((p) => {
    p.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });
  return counts;
}

function matchesSearch(post, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const haystack = [
    post.title,
    post.summary,
    post.author,
    post.date,
    ...post.tags,
  ].join(' ').toLowerCase();
  return haystack.includes(q);
}

function createCard(post) {
  const card = document.createElement(post.href ? 'a' : 'div');
  card.className = 'blog-list-card';
  if (post.href) {
    card.href = post.href;
  }

  if (post.picture) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'blog-list-card-image';
    imgWrap.append(post.picture);
    card.append(imgWrap);
  }

  const body = document.createElement('div');
  body.className = 'blog-list-card-body';

  if (post.title) {
    const title = document.createElement('h3');
    title.className = 'blog-list-card-title';
    title.textContent = post.title;
    body.append(title);
  }

  if (post.summary) {
    const summary = document.createElement('p');
    summary.className = 'blog-list-card-summary';
    summary.textContent = post.summary;
    body.append(summary);
  }

  if (post.tags.length) {
    const tags = document.createElement('div');
    tags.className = 'blog-list-card-tags';
    post.tags.forEach((tag) => {
      const span = document.createElement('span');
      span.className = 'blog-list-card-tag';
      span.textContent = tag;
      tags.append(span);
    });
    body.append(tags);
  }

  const meta = document.createElement('div');
  meta.className = 'blog-list-card-meta';
  if (post.author) {
    const author = document.createElement('span');
    author.className = 'blog-list-card-author';
    author.textContent = post.author;
    meta.append(author);
  }
  if (post.date) {
    const date = document.createElement('span');
    date.className = 'blog-list-card-date';
    date.textContent = post.date;
    meta.append(date);
  }
  body.append(meta);

  const more = document.createElement('span');
  more.className = 'blog-list-card-more';
  more.textContent = 'Ver más';
  body.append(more);

  card.append(body);
  return card;
}

export default function decorate(block) {
  const posts = parsePosts(block);
  const tagCounts = buildTagCounts(posts);

  block.textContent = '';
  block.classList.add('blog-list-ready');

  const state = { query: '', tag: 'all', page: 1 };

  // --- controls: search + tabs ---
  const controls = document.createElement('div');
  controls.className = 'blog-list-controls';

  const searchWrap = document.createElement('div');
  searchWrap.className = 'blog-list-search';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'blog-list-search-input';
  searchInput.placeholder = 'Buscar por título, descripción, autor o fecha...';
  searchInput.setAttribute('aria-label', 'Buscar');
  searchWrap.append(searchInput);
  controls.append(searchWrap);

  const tabs = document.createElement('div');
  tabs.className = 'blog-list-tabs';
  tabs.setAttribute('role', 'tablist');

  const makeTab = (key, label, count) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'blog-list-tab';
    tab.dataset.tag = key;
    tab.setAttribute('role', 'tab');
    tab.textContent = `${label} (${count})`;
    return tab;
  };

  tabs.append(makeTab('all', 'Todos', posts.length));
  [...tagCounts.keys()].forEach((tag) => {
    tabs.append(makeTab(tag, tag, tagCounts.get(tag)));
  });
  controls.append(tabs);

  const status = document.createElement('div');
  status.className = 'blog-list-status';
  controls.append(status);

  block.append(controls);

  // --- grid + pagination ---
  const grid = document.createElement('div');
  grid.className = 'blog-list-grid';
  block.append(grid);

  const pagination = document.createElement('div');
  pagination.className = 'blog-list-pagination';
  block.append(pagination);

  const getFiltered = () => posts.filter((p) => {
    const tagOk = state.tag === 'all' || p.tags.includes(state.tag);
    return tagOk && matchesSearch(p, state.query);
  });

  const render = () => {
    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    grid.textContent = '';
    if (pageItems.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'blog-list-empty';
      empty.textContent = 'No se encontraron resultados.';
      grid.append(empty);
    } else {
      pageItems.forEach((p) => grid.append(createCard(p)));
    }

    status.textContent = `Mostrando ${pageItems.length} de ${filtered.length} posts`;

    // tabs active state
    tabs.querySelectorAll('.blog-list-tab').forEach((t) => {
      t.classList.toggle('is-active', t.dataset.tag === state.tag);
      t.setAttribute('aria-selected', t.dataset.tag === state.tag ? 'true' : 'false');
    });

    // pagination
    pagination.textContent = '';
    const rangeEnd = Math.min(start + PAGE_SIZE, filtered.length);
    const info = document.createElement('span');
    info.className = 'blog-list-pagination-info';
    info.textContent = filtered.length
      ? `${start + 1}-${rangeEnd} de ${filtered.length} posts`
      : '0 posts';
    pagination.append(info);

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'blog-list-page-prev';
    prev.textContent = '‹';
    prev.setAttribute('aria-label', 'Página anterior');
    prev.disabled = state.page <= 1;
    prev.addEventListener('click', () => { state.page -= 1; render(); });
    pagination.append(prev);

    for (let i = 1; i <= totalPages; i += 1) {
      const pageBtn = document.createElement('button');
      pageBtn.type = 'button';
      pageBtn.className = 'blog-list-page';
      pageBtn.textContent = String(i);
      pageBtn.classList.toggle('is-active', i === state.page);
      pageBtn.addEventListener('click', () => { state.page = i; render(); });
      pagination.append(pageBtn);
    }

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'blog-list-page-next';
    next.textContent = '›';
    next.setAttribute('aria-label', 'Página siguiente');
    next.disabled = state.page >= totalPages;
    next.addEventListener('click', () => { state.page += 1; render(); });
    pagination.append(next);
  };

  searchInput.addEventListener('input', () => {
    state.query = searchInput.value.trim();
    state.page = 1;
    render();
  });

  tabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.blog-list-tab');
    if (!tab) return;
    state.tag = tab.dataset.tag;
    state.page = 1;
    render();
  });

  render();
}
