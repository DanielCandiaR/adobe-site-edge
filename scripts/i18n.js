/*
 * Lightweight runtime i18n for the Puntos.net EDS site.
 *
 * Content is authored in Spanish (the default). Instead of maintaining a
 * translated copy of every page, we translate the rendered DOM on the fly
 * using a Spanish→English dictionary. The chosen language is stored in
 * localStorage (key `app-language`) so it persists across navigation and
 * reloads — mirroring the behaviour of the previous React/i18next header.
 *
 * Translation is symmetric and stateless: we can map ES→EN when switching to
 * English and EN→ES to restore Spanish, so re-running it after blocks
 * re-render (or on a fresh page) always produces the correct result without
 * needing to remember each node's original text.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
];
export const DEFAULT_LANGUAGE = 'es';
const STORAGE_KEY = 'app-language';

// attributes whose values should be translated when present
const TRANSLATABLE_ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];

let esToEn = null;
let enToEs = null;
let mapsPromise = null;

/**
 * Builds (once) the forward and reverse lookup maps from the dictionary.
 * The dictionary is imported dynamically so Spanish visitors (the default)
 * never download or parse it — it is only fetched the first time a
 * translation is actually needed.
 * @returns {Promise<void>}
 */
function ensureMaps() {
  if (esToEn) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  mapsPromise = import('../translations/dictionary.js').then(({ getDictionary }) => {
    esToEn = new Map();
    enToEs = new Map();
    const dict = getDictionary();
    Object.entries(dict).forEach(([es, en]) => {
      if (!es || !en) return;
      esToEn.set(es, en);
      // first ES wins on collisions when mapping back from EN
      if (!enToEs.has(en)) enToEs.set(en, es);
    });
  });
  return mapsPromise;
}

/**
 * Returns the currently selected language code, validated against the
 * supported list and falling back to the default.
 */
export function getLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch (e) {
    // localStorage unavailable (private mode / SSR) — use default
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Translates a single string using the active direction. Whitespace around
 * the text is preserved so inline layout is not disturbed.
 * @param {string} text raw text node / attribute value
 * @param {Map} map the active lookup map (esToEn or enToEs)
 * @returns {string|null} the translated string, or null when no match
 */
function translateString(text, map) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const hit = map.get(trimmed);
  if (hit === undefined) return null;
  // re-attach the original leading/trailing whitespace
  const lead = text.match(/^\s*/)[0];
  const tail = text.match(/\s*$/)[0];
  return `${lead}${hit}${tail}`;
}

/**
 * Walks a subtree and translates text nodes and select attributes using the
 * already-built maps. Synchronous — callers must ensure the maps are loaded.
 * @param {Element} root subtree to translate
 * @param {string} lang target language code
 */
function translateTree(root, lang) {
  const map = lang === 'en' ? esToEn : enToEs;
  if (!map || map.size === 0) return;

  // 1) text nodes
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      // never touch code the browser executes/styles as text
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') {
        return NodeFilter.FILTER_REJECT;
      }
      // opt-out hook for authored content that must not be translated
      if (parent.closest('[translate="no"], [data-i18n="skip"]')) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);
  nodes.forEach((node) => {
    const next = translateString(node.nodeValue, map);
    if (next !== null && next !== node.nodeValue) node.nodeValue = next;
  });

  // 2) translatable attributes
  root.querySelectorAll(TRANSLATABLE_ATTRS.map((a) => `[${a}]`).join(',')).forEach((el) => {
    if (el.closest('[translate="no"], [data-i18n="skip"]')) return;
    TRANSLATABLE_ATTRS.forEach((attr) => {
      const val = el.getAttribute(attr);
      if (!val) return;
      const next = translateString(val, map);
      if (next !== null && next !== val) el.setAttribute(attr, next);
    });
  });
}

/**
 * Loads the dictionary (once) and translates a subtree to the target language.
 * @param {Element} root subtree to translate (defaults to document.body)
 * @param {string} lang target language code
 * @returns {Promise<void>}
 */
export async function applyLanguage(root = document.body, lang = getLanguage()) {
  if (!root) return;
  await ensureMaps();
  translateTree(root, lang);
}

/**
 * Persists and applies a new language across the whole page. Dispatches a
 * `languagechange` event on document so late-loading parts (header, footer,
 * blocks) can re-apply to their own subtree.
 * @param {string} lang language code (must be supported)
 */
export async function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.some((l) => l.code === lang)) return;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    // ignore write failures
  }
  document.documentElement.lang = lang;
  await applyLanguage(document.body, lang);
  document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
}

/**
 * Sets the document language attribute early (before content is translated).
 * Call this in the eager phase.
 */
export function initI18n() {
  document.documentElement.lang = getLanguage();
}
