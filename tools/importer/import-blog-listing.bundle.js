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

  // tools/importer/import-blog-listing.js
  var import_blog_listing_exports = {};
  __export(import_blog_listing_exports, {
    default: () => import_blog_listing_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document: document2 }) {
    const bgImage = element.querySelector('.hero-bg img, img.bg-image, img[class*="bg"]');
    const titleEl = element.querySelector(".content-info .title, .title");
    const subtitleEl = element.querySelector(".content-info .subtitle, .subtitle");
    const descriptionEl = element.querySelector(".content-info .description, .description");
    const contentCell = [];
    if (titleEl && titleEl.textContent.trim()) {
      const h = document2.createElement("h1");
      h.textContent = titleEl.textContent.trim();
      contentCell.push(h);
    }
    if (subtitleEl && subtitleEl.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = subtitleEl.textContent.trim();
      contentCell.push(p);
    }
    if (descriptionEl && descriptionEl.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = descriptionEl.textContent.trim();
      contentCell.push(p);
    }
    if (!bgImage && contentCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) cells.push([bgImage]);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/blog-list.js
  function slugify(text) {
    return text.toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function parse2(element, { document: document2 }) {
    const cards = Array.from(element.querySelectorAll(".card.image-top, .card.has-image, .card.is-clickable"));
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(".card-image, img");
      const titleEl = card.querySelector(".card-title");
      const title = titleEl ? titleEl.textContent.trim() : "";
      const textDivs = Array.from(card.querySelectorAll(":scope .card-text > div"));
      const summaryText = textDivs[0] ? textDivs[0].textContent.trim() : "";
      let tagSpans = [];
      const tagContainer = textDivs.find(
        (d, i) => i > 0 && !d.classList.contains("text-right") && d.querySelector("span")
      );
      if (tagContainer) tagSpans = Array.from(tagContainer.querySelectorAll("span"));
      const metaBlock = card.querySelector(".card-text .text-right") || textDivs[textDivs.length - 1];
      let author = "";
      let date = "";
      if (metaBlock) {
        const metaChildren = Array.from(metaBlock.children);
        const dateEl = metaBlock.querySelector(".date");
        date = dateEl ? dateEl.textContent.trim() : "";
        const authorEl = metaChildren.find((c) => c !== dateEl);
        author = authorEl ? authorEl.textContent.trim() : "";
      }
      const titleCell = [];
      if (title) {
        const a = document2.createElement("a");
        a.href = `/blog/${slugify(title)}`;
        a.textContent = title;
        const h = document2.createElement("h3");
        h.append(a);
        titleCell.push(h);
      }
      const summaryCell = [];
      if (summaryText) {
        const p = document2.createElement("p");
        p.textContent = summaryText;
        summaryCell.push(p);
      }
      const tagsCell = [];
      if (tagSpans.length) {
        const p = document2.createElement("p");
        p.textContent = tagSpans.map((s) => s.textContent.trim()).filter(Boolean).join(", ");
        tagsCell.push(p);
      }
      const authorCell = [];
      if (author) {
        const p = document2.createElement("p");
        p.textContent = author;
        authorCell.push(p);
      }
      const dateCell = [];
      if (date) {
        const p = document2.createElement("p");
        p.textContent = date;
        dateCell.push(p);
      }
      cells.push([image || "", titleCell, summaryCell, tagsCell, authorCell, dateCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "blog-list", cells });
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

  // tools/importer/import-blog-listing.js
  var parsers = {
    "hero-banner": parse,
    "blog-list": parse2
  };
  var PAGE_TEMPLATE = {
    name: "blog-listing",
    description: "Blog listing: banner hero and interactive blog-list block (search, tags, cards, pagination).",
    urls: [
      "http://adobe.puntos.net.s3-website-us-east-1.amazonaws.com/blog"
    ],
    blocks: [
      { name: "hero-banner", instances: [".border-pn-b-2 .hero-pn.hero-full"] },
      { name: "blog-list", instances: [".bg-pn-dot.py-13"] }
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
  var import_blog_listing_default = {
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
  return __toCommonJS(import_blog_listing_exports);
})();
