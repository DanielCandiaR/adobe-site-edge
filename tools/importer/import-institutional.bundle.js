/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-institutional.js
  var import_institutional_exports = {};
  __export(import_institutional_exports, {
    default: () => import_institutional_default
  });

  // tools/importer/parsers/hero-title.js
  function parse(element, { document: document2 }) {
    const eyebrowEl = element.querySelector(".content-info .title, .title");
    const titleEl = element.querySelector(".content-info .subtitle, .subtitle");
    const descriptionEl = element.querySelector(".content-info .description, .description");
    const contentCell = [];
    if (eyebrowEl && eyebrowEl.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = eyebrowEl.textContent.trim();
      contentCell.push(p);
    }
    if (titleEl && titleEl.textContent.trim()) {
      const h = document2.createElement("h1");
      h.textContent = titleEl.textContent.trim();
      contentCell.push(h);
    }
    if (descriptionEl && descriptionEl.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = descriptionEl.textContent.trim();
      contentCell.push(p);
    }
    if (contentCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[contentCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-title", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  function pushParagraphs(descEl, cell, document2) {
    const childBlocks = Array.from(descEl.children).filter(
      (c) => c.tagName === "DIV" && c.textContent.trim()
    );
    if (childBlocks.length) {
      childBlocks.forEach((c) => {
        const p = document2.createElement("p");
        p.textContent = c.textContent.trim();
        cell.push(p);
      });
    } else if (descEl.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = descEl.textContent.trim();
      cell.push(p);
    }
  }
  function pushList(listEl, cell, document2) {
    const items = Array.from(listEl.querySelectorAll(".item-list, li"));
    if (!items.length) return;
    const ul = document2.createElement("ul");
    items.forEach((li) => {
      const label = li.querySelector(".title-content, .container-content");
      const newLi = document2.createElement("li");
      newLi.textContent = (label ? label.textContent : li.textContent).trim();
      ul.append(newLi);
    });
    cell.push(ul);
  }
  function buildTextCell(colEl, document2) {
    const cell = [];
    const heading = colEl.querySelector('.title-page-content, [class*="title"]:not(.title-content)');
    if (heading && heading.textContent.trim()) {
      const h = document2.createElement("h3");
      h.textContent = heading.textContent.trim();
      cell.push(h);
    }
    Array.from(colEl.children).forEach((child) => {
      if (child.classList.contains("description")) {
        pushParagraphs(child, cell, document2);
      } else if (child.querySelector("ul.container-list, ul")) {
        pushList(child, cell, document2);
      } else if (child.matches("ul")) {
        pushList(child, cell, document2);
      }
    });
    return cell;
  }
  function parse2(element, { document: document2 }) {
    const cols = Array.from(element.querySelectorAll(":scope > .ant-col"));
    const rowCells = [];
    cols.forEach((col) => {
      const img = col.querySelector(":scope > img, img");
      const hasText = col.querySelector('.description, p, [class*="title"], ul');
      if (img && !hasText) {
        rowCells.push(img);
      } else {
        const textCell = buildTextCell(col, document2);
        if (img) textCell.unshift(img);
        rowCells.push(textCell);
      }
    });
    if (rowCells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [rowCells];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/puntos-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        '[aria-hidden="true"]',
        ".ant-tabs-ink-bar",
        'div[class*="ant-"][style*="position: absolute"]',
        'div[class*="ant-"][style*="position:absolute"]'
      ]);
      element.querySelectorAll(".reveal, .reveal-visible").forEach((el) => {
        el.classList.remove("reveal", "reveal-visible");
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.header-pn",
        "footer.footer-pn"
      ]);
      element.querySelectorAll("span").forEach((span) => {
        const hasText = span.textContent && span.textContent.trim().length > 0;
        const hasMedia = span.querySelector("img, a, svg, input, button");
        if (!hasText && !hasMedia) {
          span.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, ["iframe", "link", "noscript", "script"]);
    }
  }

  // tools/importer/transformers/puntos-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-institutional.js
  var parsers = {
    "hero-title": parse,
    "columns-media": parse2
  };
  var PAGE_TEMPLATE = {
    name: "institutional",
    description: "Institutional/about page: title hero and alternating text+image sections.",
    urls: [
      "http://adobe.puntos.net.s3-website-us-east-1.amazonaws.com/nosotros/quienes-somos",
      "http://adobe.puntos.net.s3-website-us-east-1.amazonaws.com/nosotros/storytelling"
    ],
    blocks: [
      { name: "hero-title", instances: [".wwa-pn > .border-pn-b-2:nth-of-type(1)"] },
      { name: "columns-media", instances: [".wwa-pn .ant-row.container-wwa"] }
    ],
    sections: []
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_institutional_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_institutional_exports);
})();
