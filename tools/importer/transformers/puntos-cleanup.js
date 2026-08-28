/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Puntos.net site-wide cleanup.
 *
 * Puntos.net is a Spanish React SPA (Ant Design). The imported page shell is:
 *   #root > div.main-layout > (header.header-pn, main.layout-content, footer.footer-pn)
 * Only main.layout-content holds authorable content. The header and footer are
 * global chrome handled by the navigation/footer orchestrators separately, so
 * they must be stripped from the imported content. Ant Design also injects
 * runtime-only DOM (measurement nodes, ink bars, floating tooltip/portal layers,
 * empty utility spans) and JS-driven animation helper classes that are not
 * authorable content.
 *
 * All selectors below were verified by reading migration-work/cleaned.html.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Ant Design runtime cruft that must not reach block parsing.
    // - aria-hidden measurement/mirror nodes (Ant uses these for inputs, tabs, etc.)
    // - .ant-tabs-ink-bar animated underline element (no authorable content)
    // - absolutely-positioned floating ant-* layers (tooltips/dropdown portals/popovers)
    WebImporter.DOMUtils.remove(element, [
      '[aria-hidden="true"]',
      '.ant-tabs-ink-bar',
      'div[class*="ant-"][style*="position: absolute"]',
      'div[class*="ant-"][style*="position:absolute"]',
    ]);

    // JS-injected animation helper classes: strip so they don't wrap/hide content
    // in the imported output. Remove only the class, keep the element + its content.
    element.querySelectorAll('.reveal, .reveal-visible').forEach((el) => {
      el.classList.remove('reveal', 'reveal-visible');
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome. header.header-pn and footer.footer-pn are
    // handled by the navigation and footer orchestrators, not authored per page.
    WebImporter.DOMUtils.remove(element, [
      'header.header-pn',
      'footer.footer-pn',
    ]);

    // Empty Ant utility spans (icon wrappers / count badges / affix spacers that
    // carry no authorable text). Only remove spans with no text and no image/anchor.
    element.querySelectorAll('span').forEach((span) => {
      const hasText = span.textContent && span.textContent.trim().length > 0;
      const hasMedia = span.querySelector('img, a, svg, input, button');
      if (!hasText && !hasMedia) {
        span.remove();
      }
    });

    // Safe leftover elements that are never authorable content.
    WebImporter.DOMUtils.remove(element, ['iframe', 'link', 'noscript', 'script']);
  }
}
