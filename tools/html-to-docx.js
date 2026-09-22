/*
 * html-to-docx.js — converts the site's `.plain.html` content documents into
 * `.docx` authoring documents in the Edge Delivery format (the ones Google
 * Drive opens as Google Docs):
 *   - each top-level <div> is a section, sections separated by a `---` rule
 *   - default content (h1..h6, p, ul/ol) renders as normal doc content
 *   - each block (a div with a class) renders as a table whose first row is a
 *     single cell with the block name, e.g. "Cards Benefits" or
 *     "Title Page (line, center)"; block rows/cells become table rows/cells
 *
 * Usage: node tools/html-to-docx.js [outputDir]
 * Reads every content/**\/*.plain.html and writes <name>.docx to outputDir
 * (default: drive-docs/, mirroring the content folder structure).
 */

const fs = require('fs');
const path = require('path');
const { parseHTML } = require('linkedom');
const sharp = require('sharp');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, ExternalHyperlink, BorderStyle,
  ImageRun,
} = require('docx');

const REPO = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(REPO, 'content');
const OUT_DIR = path.join(REPO, process.argv[2] || 'drive-docs');
// folder holding the pre-downloaded/converted PNGs for every image src
const IMG_DIR = process.env.DOC_IMG_DIR || '/tmp/docimg';
// max width (px) an embedded image is scaled to inside the document
const MAX_IMG_WIDTH = 450;
// cache of local image path -> { width, height }, filled before rendering
const IMAGE_CACHE = new Map();

/**
 * Maps an HTML image `src` to the local PNG file prepared in IMG_DIR.
 *  - external S3 assets: ".../assets/NAME.png"  -> "assets_NAME.png"
 *  - external blog logo:  ".../blog/logo.png"    -> "blog_logo.png"
 *  - local project image: "images/NAME.svg|avif" -> "local_NAME.png"
 * Returns the absolute path or null when no local copy exists.
 */
function resolveImage(src) {
  if (!src) return null;
  let name = null;
  const assets = src.match(/\/assets\/([^/?#]+)\.(png|jpg|jpeg)/i);
  if (assets) name = `assets_${assets[1]}.png`;
  else if (/\/blog\/logo\.png/i.test(src)) name = 'blog_logo.png';
  else {
    const local = src.match(/images\/([^/?#]+)\.(svg|avif|png|jpg|jpeg)/i);
    if (local) name = `local_${local[1]}.png`;
  }
  if (!name) return null;
  const full = path.join(IMG_DIR, name);
  return fs.existsSync(full) ? full : null;
}

/** Builds a docx ImageRun for a local PNG, scaled to fit MAX_IMG_WIDTH. */
function imageRun(filePath, meta) {
  const data = fs.readFileSync(filePath);
  let { width, height } = meta;
  if (width > MAX_IMG_WIDTH) {
    height = Math.round((height * MAX_IMG_WIDTH) / width);
    width = MAX_IMG_WIDTH;
  }
  return new ImageRun({
    type: 'png', data, transformation: { width, height },
  });
}

/** "cards-benefits" -> "Cards Benefits" */
function titleCase(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Turns a block div's class list into the EDS block-name label.
 * "title-page line center" -> "Title Page (line, center)"
 */
function blockName(classList) {
  const classes = [...classList];
  const [name, ...variants] = classes;
  const label = titleCase(name);
  return variants.length ? `${label} (${variants.join(', ')})` : label;
}

const HEADING_MAP = {
  H1: HeadingLevel.HEADING_1,
  H2: HeadingLevel.HEADING_2,
  H3: HeadingLevel.HEADING_3,
  H4: HeadingLevel.HEADING_4,
  H5: HeadingLevel.HEADING_5,
  H6: HeadingLevel.HEADING_6,
};

/** Collect the inline runs (text, bold, italic, links) inside an element. */
function inlineRuns(node) {
  const runs = [];
  node.childNodes.forEach((child) => {
    if (child.nodeType === 3) {
      // text node
      const text = child.textContent.replace(/\s+/g, ' ');
      if (text.trim() || text === ' ') runs.push(new TextRun(text));
      return;
    }
    if (child.nodeType !== 1) return;
    const tag = child.tagName;
    if (tag === 'A') {
      const href = child.getAttribute('href') || '';
      const img = child.querySelector('img'); // also finds img inside <picture>
      const local = img ? resolveImage(img.getAttribute('src') || '') : null;
      const meta = local ? IMAGE_CACHE.get(local) : null;
      if (local && meta) {
        // a linked image: embed the image itself (drop the link wrapper)
        runs.push(imageRun(local, meta));
      } else {
        runs.push(new ExternalHyperlink({
          link: href,
          children: [new TextRun({ text: child.textContent.trim(), style: 'Hyperlink' })],
        }));
      }
    } else if (tag === 'STRONG' || tag === 'B') {
      runs.push(new TextRun({ text: child.textContent, bold: true }));
    } else if (tag === 'EM' || tag === 'I') {
      runs.push(new TextRun({ text: child.textContent, italics: true }));
    } else if (tag === 'IMG' || tag === 'PICTURE') {
      // <picture> wraps an <img>; resolve to that inner image
      const img = tag === 'PICTURE' ? child.querySelector('img') : child;
      const src = img ? img.getAttribute('src') || '' : '';
      const alt = img ? img.getAttribute('alt') || '' : '';
      const local = resolveImage(src);
      const meta = local ? IMAGE_CACHE.get(local) : null;
      if (local && meta) {
        runs.push(imageRun(local, meta));
      } else {
        // no local copy available — keep a readable reference
        runs.push(new TextRun({ text: `[imagen: ${alt || 'sin alt'} — ${src}]`, italics: true }));
      }
    } else if (tag === 'BR') {
      runs.push(new TextRun({ break: 1 }));
    } else {
      const text = child.textContent.replace(/\s+/g, ' ');
      if (text.trim()) runs.push(new TextRun(text));
    }
  });
  return runs.length ? runs : [new TextRun('')];
}

/**
 * Collects inline runs for an element but IGNORES nested lists, so a list
 * item that contains a sub-menu contributes only its own label (e.g.
 * "Adobe Partner"), not the flattened text of its children.
 */
function directInlineRuns(node) {
  const clone = node.cloneNode(true);
  [...clone.querySelectorAll('ul, ol')].forEach((l) => l.remove());
  return inlineRuns(clone);
}

/** Renders a <ul>/<ol> (and its nested lists) as indented bullet paragraphs. */
function renderList(listEl, out, level = 0) {
  [...listEl.children].forEach((li) => {
    if (li.tagName !== 'LI') return;
    out.push(new Paragraph({ bullet: { level }, children: directInlineRuns(li) }));
    // recurse into any nested lists as a deeper indent level
    [...li.children].forEach((child) => {
      if (child.tagName === 'UL' || child.tagName === 'OL') {
        renderList(child, out, level + 1);
      }
    });
  });
}

/** Render a single default-content element into one or more Paragraphs. */
function renderDefaultElement(el, out) {
  const tag = el.tagName;
  if (HEADING_MAP[tag]) {
    out.push(new Paragraph({ heading: HEADING_MAP[tag], children: inlineRuns(el) }));
  } else if (tag === 'P') {
    out.push(new Paragraph({ children: inlineRuns(el) }));
  } else if (tag === 'UL' || tag === 'OL') {
    renderList(el, out, 0);
  } else if (tag === 'PICTURE') {
    const img = el.querySelector('img');
    if (img) out.push(new Paragraph({ children: inlineRuns(el) }));
  } else if (tag === 'DIV') {
    // recurse into wrapper divs so nested content (h1/p/ul inside a cell's
    // inner div) is rendered structurally instead of flattened to plain text
    const kids = [...el.children];
    if (kids.length) {
      kids.forEach((k) => renderDefaultElement(k, out));
    } else {
      const text = el.textContent.replace(/\s+/g, ' ').trim();
      if (text) out.push(new Paragraph(text));
    }
  } else {
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    if (text) out.push(new Paragraph(text));
  }
}

const CELL_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
  left: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
  right: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
};

/** Build the paragraphs for the contents of a single block cell. */
function cellContent(cell) {
  const out = [];
  const kids = [...cell.children];
  if (kids.length === 0) {
    out.push(new Paragraph({ children: inlineRuns(cell) }));
  } else {
    kids.forEach((k) => renderDefaultElement(k, out));
  }
  return out.length ? out : [new Paragraph('')];
}

// total usable content width in twips (dxa): Letter 8.5in - 1in margins each
// side = 6.5in * 1440 = 9360
const TABLE_WIDTH_DXA = 9360;

/** Render a block div (`<div class="name"> rows... `) as a docx Table. */
function renderBlock(blockDiv) {
  const name = blockName(blockDiv.classList);

  // parse body rows first so we know the max column count for the block
  const bodyRows = [...blockDiv.children].map((rowDiv) => {
    const cells = [...rowDiv.children].filter((c) => c.tagName === 'DIV');
    return cells.length ? cells : [rowDiv];
  });
  const maxCols = bodyRows.reduce((m, cells) => Math.max(m, cells.length), 1);
  const colWidth = Math.floor(TABLE_WIDTH_DXA / maxCols);
  const columnWidths = Array.from({ length: maxCols }, () => colWidth);

  const rows = [];

  // header row: single cell spanning all columns with the block name
  rows.push(new TableRow({
    children: [new TableCell({
      borders: CELL_BORDER,
      columnSpan: maxCols,
      width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
      children: [new Paragraph({ children: [new TextRun({ text: name, bold: true })] })],
    })],
  }));

  // body rows: each direct child div is a row; its child divs are cells
  bodyRows.forEach((cellNodes) => {
    rows.push(new TableRow({
      children: cellNodes.map((c) => new TableCell({
        borders: CELL_BORDER,
        width: { size: colWidth, type: WidthType.DXA },
        children: cellContent(c),
      })),
    }));
  });

  return new Table({
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths,
    layout: 'fixed',
    rows,
  });
}

/** Convert one .plain.html file's HTML string into docx children. */
function htmlToDocxChildren(html) {
  // linkedom hoists top-level <div>s out of <body> in some cases, so wrap the
  // fragment in an explicit container and read the sections from there.
  const { document } = parseHTML(`<div id="__root">${html}</div>`);
  const root = document.getElementById('__root')
    || document.querySelector('#__root')
    || document.body;
  const sections = [...root.children].filter((n) => n.tagName === 'DIV');
  const children = [];

  sections.forEach((section, i) => {
    if (i > 0) {
      // section separator
      children.push(new Paragraph({ children: [new TextRun('---')] }));
    }
    [...section.children].forEach((node) => {
      if (node.tagName === 'DIV' && node.classList.length > 0) {
        children.push(renderBlock(node));
        children.push(new Paragraph('')); // spacing after a table
      } else {
        renderDefaultElement(node, children);
      }
    });
  });

  return children.length ? children : [new Paragraph('')];
}

function findPlainHtml(dir) {
  const results = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findPlainHtml(full));
    else if (entry.name.endsWith('.plain.html')) results.push(full);
  });
  return results;
}

/** Reads dimensions of every PNG in IMG_DIR into IMAGE_CACHE. */
async function loadImageMeta() {
  if (!fs.existsSync(IMG_DIR)) {
    process.stderr.write(`Aviso: no existe ${IMG_DIR}; las imágenes quedarán como texto.\n`);
    return;
  }
  const pngs = fs.readdirSync(IMG_DIR).filter((f) => f.endsWith('.png'));
  await Promise.all(pngs.map(async (f) => {
    const full = path.join(IMG_DIR, f);
    const { width, height } = await sharp(full).metadata();
    IMAGE_CACHE.set(full, { width, height });
  }));
  process.stdout.write(`Imágenes cargadas: ${IMAGE_CACHE.size}\n`);
}

async function main() {
  await loadImageMeta();
  const files = findPlainHtml(CONTENT_DIR);
  let count = 0;
  for (const file of files) {
    const rel = path.relative(CONTENT_DIR, file).replace(/\.plain\.html$/, '');
    const html = fs.readFileSync(file, 'utf8');
    const children = htmlToDocxChildren(html);
    const doc = new Document({ sections: [{ children }] });
    // eslint-disable-next-line no-await-in-loop
    const buffer = await Packer.toBuffer(doc);
    const outPath = path.join(OUT_DIR, `${rel}.docx`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buffer);
    count += 1;
    process.stdout.write(`  ✓ ${rel}.docx\n`);
  }
  process.stdout.write(`\nGenerados ${count} documentos en ${path.relative(REPO, OUT_DIR)}/\n`);
}

main().catch((err) => {
  process.stderr.write(`Error: ${err.stack}\n`);
  process.exit(1);
});
