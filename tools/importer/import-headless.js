/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroPartnerParser from './parsers/hero-partner.js';
import titlePageParser from './parsers/title-page.js';
import timelineCardsParser from './parsers/timeline-cards.js';
import browserFrameParser from './parsers/browser-frame.js';
import textListParser from './parsers/text-list.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/puntos-cleanup.js';
import sectionsTransformer from './transformers/puntos-sections.js';

const parsers = {
  'hero-partner': heroPartnerParser,
  'title-page': titlePageParser,
  'timeline-cards': timelineCardsParser,
  'browser-frame': browserFrameParser,
  'text-list': textListParser,
};

const PAGE_TEMPLATE = {
  name: 'headless',
  description: 'AEM Headless page: hero, architecture timeline cards, model + implementation (numbered list + browser frame).',
  urls: [
    'http://adobe.puntos.net.s3-website-us-east-1.amazonaws.com/adobe-partner/arquitectura-headless',
  ],
  blocks: [
    { name: 'hero-partner', instances: ['.hero-pn.hero-left'] },
    { name: 'title-page', instances: ['.title-page'] },
    { name: 'timeline-cards', instances: ['.timeline-cards'] },
    { name: 'browser-frame', instances: ['.browser-frame'] },
    { name: 'text-list', instances: ['.text-list-component'] },
  ],
  sections: [
    { id: 'hero', name: 'Hero', selector: '.headless-pn > .border-pn-b-2:first-child', style: 'bg-pn' },
    { id: 'architecture', name: 'Architecture', selector: '.headless-pn > .bg-pn-second.py-13:nth-of-type(2)', style: 'bg-pn-second' },
    { id: 'model', name: 'Model', selector: '.headless-pn > .bg-pn.py-13', style: 'bg-pn' },
    { id: 'implementation', name: 'Implementation', selector: '.headless-pn > .bg-pn-second.py-13:last-child', style: 'bg-pn-second' },
  ],
};

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
