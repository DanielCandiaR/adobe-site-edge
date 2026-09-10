/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroPartnerParser from './parsers/hero-partner.js';
import cardsBenefitsParser from './parsers/cards-benefits.js';
import cardsSolutionParser from './parsers/cards-solution.js';
import titlePageParser from './parsers/title-page.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/puntos-cleanup.js';
import sectionsTransformer from './transformers/puntos-sections.js';

const parsers = {
  'hero-partner': heroPartnerParser,
  'cards-benefits': cardsBenefitsParser,
  'cards-solution': cardsSolutionParser,
  'title-page': titlePageParser,
};

const PAGE_TEMPLATE = {
  name: 'adobe-partner-landing',
  description: 'Adobe Partner solution landing: hero, benefit grid, product solution cards.',
  urls: [
    'http://adobe.puntos.net.s3-website-us-east-1.amazonaws.com/adobe-partner/cms-dam',
    'http://adobe.puntos.net.s3-website-us-east-1.amazonaws.com/adobe-partner/personalizacion',
    'http://adobe.puntos.net.s3-website-us-east-1.amazonaws.com/adobe-partner/datos-accionables',
    'http://adobe.puntos.net.s3-website-us-east-1.amazonaws.com/adobe-partner/arquitectura-headless',
    'http://adobe.puntos.net.s3-website-us-east-1.amazonaws.com/adobe-partner/mail-marketing',
    'http://adobe.puntos.net.s3-website-us-east-1.amazonaws.com/adobe-partner/automatizacion-omnicanal',
  ],
  blocks: [
    { name: 'hero-partner', instances: ['.hero-pn.hero-left'] },
    // only the big centered section titles (line-top); column subtitles
    // (line-bottom) stay inside their cards-benefits column as an h3
    { name: 'title-page', instances: ['.title-page.title-page-line-top'] },
    { name: 'cards-benefits', instances: ['.bg-pn-second.py-13 .ant-col.ant-col-lg-12'] },
    { name: 'cards-solution', instances: ['.bg-pn.py-13 .container-tools .ant-col'] },
  ],
  // three visual bands, matching the source shell classes
  sections: [
    { id: 'hero', name: 'Hero', selector: '.cmsdam-pn > .border-pn-b-2:first-child', style: 'bg-pn' },
    { id: 'why', name: 'Why', selector: '.bg-pn-second.py-13', style: 'bg-pn-second' },
    { id: 'tools', name: 'Tools', selector: '.bg-pn.py-13', style: 'bg-pn' },
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
