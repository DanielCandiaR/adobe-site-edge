/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroPartnerParser from './parsers/hero-partner.js';
import cardsStatsParser from './parsers/cards-stats.js';
import cardsProductParser from './parsers/cards-product.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/puntos-cleanup.js';
import sectionsTransformer from './transformers/puntos-sections.js';

// PARSER REGISTRY (site-level header/footer are stripped by transformer, no parser)
const parsers = {
  'hero-partner': heroPartnerParser,
  'cards-stats': cardsStatsParser,
  'cards-product': cardsProductParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Homepage: hero, animated stat counters, grid of 6 Adobe product tiles.',
  urls: [
    'http://adobe.puntos.net.s3-website-us-east-1.amazonaws.com/',
  ],
  blocks: [
    { name: 'hero-partner', instances: ['.content-left .content-info'] },
    { name: 'cards-stats', instances: ['.content-left > .ant-space > .ant-space-item:nth-of-type(2)'] },
    { name: 'cards-product', instances: ['.content-right'] },
  ],
  sections: [],
};

// TRANSFORMER REGISTRY (sections transformer only when 2+ sections)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
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

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
