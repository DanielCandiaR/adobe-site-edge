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
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, ExternalHyperlink, BorderStyle,
} = require('docx');

const REPO = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(REPO, 'content');
const OUT_DIR = path.join(REPO, process.argv[2] || 'drive-docs');

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
      runs.push(new ExternalHyperlink({
        link: href,
        children: [new TextRun({ text: child.textContent.trim(), style: 'Hyperlink' })],
      }));
    } else if (tag === 'STRONG' || tag === 'B') {
      runs.push(new TextRun({ text: child.textContent, bold: true }));
    } else if (tag === 'EM' || tag === 'I') {
      runs.push(new TextRun({ text: child.textContent, italics: true }));
    } else if (tag === 'IMG') {
      const src = child.getAttribute('src') || '';
      const alt = child.getAttribute('alt') || '';
      runs.push(new TextRun({ text: `[imagen: ${alt || 'sin alt'} — ${src}]`, italics: true }));
    } else if (tag === 'BR') {
      runs.push(new TextRun({ break: 1 }));
    } else {
      const text = child.textContent.replace(/\s+/g, ' ');
      if (text.trim()) runs.push(new TextRun(text));
    }
  });
  return runs.length ? runs : [new TextRun('')];
}

/** Render a single default-content element into one or more Paragraphs. */
function renderDefaultElement(el, out) {
  const tag = el.tagName;
  if (HEADING_MAP[tag]) {
    out.push(new Paragraph({ heading: HEADING_MAP[tag], children: inlineRuns(el) }));
  } else if (tag === 'P') {
    // a lone image paragraph
    out.push(new Paragraph({ children: inlineRuns(el) }));
  } else if (tag === 'UL' || tag === 'OL') {
    [...el.children].forEach((li) => {
      if (li.tagName !== 'LI') return;
      // nested list handling: render the li's own text, then nested items
      const nested = li.querySelector(':scope > ul, :scope > ol');
      out.push(new Paragraph({
        bullet: { level: 0 },
        children: inlineRuns(li),
      }));
      if (nested) {
        [...nested.children].forEach((sub) => {
          if (sub.tagName !== 'LI') return;
          out.push(new Paragraph({ bullet: { level: 1 }, children: inlineRuns(sub) }));
        });
      }
    });
  } else if (tag === 'PICTURE') {
    const img = el.querySelector('img');
    if (img) out.push(new Paragraph({ children: inlineRuns(el) }));
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

/** Render a block div (`<div class="name"> rows... `) as a docx Table. */
function renderBlock(blockDiv) {
  const name = blockName(blockDiv.classList);
  const rows = [];

  // header row: single cell with the block name
  rows.push(new TableRow({
    children: [new TableCell({
      borders: CELL_BORDER,
      children: [new Paragraph({ children: [new TextRun({ text: name, bold: true })] })],
    })],
  }));

  // body rows: each direct child div is a row; its child divs are cells
  const bodyRows = [...blockDiv.children];
  bodyRows.forEach((rowDiv) => {
    const cells = [...rowDiv.children].filter((c) => c.tagName === 'DIV');
    const cellNodes = cells.length ? cells : [rowDiv];
    rows.push(new TableRow({
      children: cellNodes.map((c) => new TableCell({
        borders: CELL_BORDER,
        children: cellContent(c),
      })),
    }));
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
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

async function main() {
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
