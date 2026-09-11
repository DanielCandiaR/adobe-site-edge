/**
 * browser-frame — a mock browser window (port of the source
 * BrowserFrameComponent): a titled header with traffic-light window buttons
 * and an image/content area, with an optional glow and float animation.
 *
 * Content model — one block with up to two cells:
 *   | title | subtitle |   (header text; both optional)
 * plus an image placed in the block (the screenshot shown in the frame).
 *
 * Variants (block classes):
 *   glow      show the corner glows (default on)
 *   no-glow   hide the glows
 *   float     floating animation (default off)
 *   no-hover  disable the hover lift
 *   buttons-left   window buttons on the left (default: right)
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const WINDOW_BUTTONS = '<span class="window-buttons">'
  + '<span class="window-btn close"></span>'
  + '<span class="window-btn minimize"></span>'
  + '<span class="window-btn maximize"></span>'
  + '</span>';

export default function decorate(block) {
  const buttonsLeft = block.classList.contains('buttons-left');
  const showGlow = !block.classList.contains('no-glow');
  if (showGlow) block.classList.add('has-glow');
  if (block.classList.contains('float')) block.classList.add('has-float');
  if (!block.classList.contains('no-hover')) block.classList.add('has-hover');
  block.classList.add(buttonsLeft ? 'buttons-left' : 'buttons-right');

  // gather the authored pieces: an image and up to two text cells
  const cells = [...block.querySelectorAll(':scope > div > div')];
  let picture = null;
  const texts = [];
  cells.forEach((cell) => {
    const pic = cell.querySelector('picture, img');
    if (pic && !cell.textContent.trim()) picture = pic;
    else if (cell.textContent.trim()) texts.push(cell.textContent.trim());
  });

  const title = texts[0] || '';
  const subtitle = texts[1] || '';

  block.textContent = '';

  // glow layers
  if (showGlow) {
    block.insertAdjacentHTML('beforeend', '<div class="glow-top-right"></div><div class="glow-bottom-left"></div>');
  }

  // header
  const header = document.createElement('div');
  header.className = 'browser-frame-header';
  const center = `<div class="browser-frame-header-center">${
    title ? `<span class="browser-frame-title">${title}</span>` : ''
  }${subtitle ? `<span class="browser-frame-subtitle">${subtitle}</span>` : ''}</div>`;
  if (buttonsLeft) {
    header.innerHTML = `<div class="browser-frame-header-left">${WINDOW_BUTTONS}</div>${center}`;
  } else {
    header.innerHTML = `${center}<div class="browser-frame-header-right">${WINDOW_BUTTONS}</div>`;
  }
  block.append(header);

  // content
  const content = document.createElement('div');
  content.className = 'browser-frame-content';
  if (picture) {
    const wrapper = document.createElement('div');
    wrapper.className = 'browser-frame-image-wrapper';
    const img = picture.tagName === 'IMG' ? picture : picture.querySelector('img');
    if (img) {
      const optimized = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]);
      optimized.querySelector('img').className = 'browser-frame-image';
      wrapper.append(optimized);
    } else {
      wrapper.append(picture);
    }
    content.append(wrapper);
  } else {
    content.innerHTML = '<div class="browser-frame-placeholder"><span>Content area</span></div>';
  }
  block.append(content);
}
