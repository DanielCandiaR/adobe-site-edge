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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-partner.js
  function parse(element, { document: document2 }) {
    const titleEl = element.querySelector('.title, [class*="title"]:not(.title-content)');
    const description = element.querySelector(".description, p");
    const listItems = Array.from(element.querySelectorAll(".container-list .item-list, ul li"));
    const badge = element.querySelector(".partner-badge");
    const bgImage = element.querySelector('img[class*="background"], img[class*="hero-bg"]');
    const contentCell = [];
    if (titleEl) {
      const heading = document2.createElement("h1");
      heading.append(...titleEl.childNodes);
      contentCell.push(heading);
    }
    if (description) {
      const p = document2.createElement("p");
      p.textContent = description.textContent.trim();
      contentCell.push(p);
    }
    if (listItems.length) {
      const ul = document2.createElement("ul");
      listItems.forEach((li) => {
        const label = li.querySelector(".title-content, .container-content");
        const newLi = document2.createElement("li");
        newLi.textContent = (label ? label.textContent : li.textContent).trim();
        ul.append(newLi);
      });
      contentCell.push(ul);
    }
    if (badge) {
      const badgeImg = badge.querySelector("img");
      const labelParts = Array.from(badge.querySelectorAll(".partner-label, .partner-text")).map((el) => el.textContent.trim()).filter(Boolean);
      const p = document2.createElement("p");
      if (badgeImg) p.append(badgeImg);
      if (labelParts.length) {
        const strong = document2.createElement("strong");
        strong.textContent = labelParts.join(" ");
        if (badgeImg) p.append(" ");
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-partner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-stats.js
  function parse2(element, { document: document2 }) {
    const cardEls = Array.from(element.querySelectorAll(".card.stadistic, .card"));
    const cells = [];
    cardEls.forEach((card) => {
      const number = card.querySelector(".card-title");
      const caption = card.querySelector(".card-text");
      const cardCell = [];
      if (number) {
        const h = document2.createElement("h2");
        h.textContent = number.textContent.trim();
        cardCell.push(h);
      }
      if (caption) {
        const p = document2.createElement("p");
        p.textContent = caption.textContent.trim();
        cardCell.push(p);
      }
      if (cardCell.length) cells.push([cardCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse3(element, { document: document2 }) {
    const cardEls = Array.from(element.querySelectorAll(".floating-card"));
    const cells = [];
    cardEls.forEach((card) => {
      const icon = card.querySelector(".icon img, img");
      const labelEl = card.querySelector(":scope > span:not(.icon), span:not(.anticon):not(.icon)");
      const label = labelEl ? labelEl.textContent.trim() : "";
      const p = document2.createElement("p");
      p.textContent = label;
      cells.push([icon || "", p]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-product", cells });
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

  // tools/importer/import-home.js
  var parsers = {
    "hero-partner": parse,
    "cards-stats": parse2,
    "cards-product": parse3
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Homepage: hero, animated stat counters, grid of 6 Adobe product tiles.",
    urls: [
      "http://adobe.puntos.net.s3-website-us-east-1.amazonaws.com/"
    ],
    blocks: [
      { name: "hero-partner", instances: [".content-left .content-info"] },
      { name: "cards-stats", instances: [".content-left > .ant-space > .ant-space-item:nth-of-type(2)"] },
      { name: "cards-product", instances: [".content-right"] }
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
  var import_home_default = {
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
  return __toCommonJS(import_home_exports);
})();
