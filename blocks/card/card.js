/**
 * card — reusable card component (port of the source CardComponent).
 *
 * A single configurable card. The layout is driven by a variant class:
 *
 * TYPE (pick one; default = `default`):
 *   default        title + subtitle + text, optional footer link
 *   stadistic      centered stat: big number/title + uppercase label
 *   image-left     image column on the left, content on the right
 *   image-right    content on the left, image column on the right
 *   image-top      image on top, content below
 *   image-bottom   content on top, image below
 *
 * IMAGE TREATMENT (combine with an image-* type):
 *   icon           small framed icon (default for image types)
 *   cover          full-width cover image (object-fit: cover)
 *   full           edge-to-edge image, no rounding
 *
 * MODIFIERS:
 *   hover-simple   hover only changes the border colour (default is full)
 *   no-hover       disable the hover effect
 *   link-align-left | link-align-center | link-align-right
 *
 * CONTENT MODEL (default content rows, in order):
 *   [image]   a row whose only child is a picture/img → the card image
 *   title     first heading, or first bold paragraph
 *   subtitle  the paragraph right after the title (optional)
 *   text      remaining paragraph(s)
 *   link      a button/linked paragraph → footer link
 * The whole card becomes clickable if it contains a single link and no
 * separate footer link (the link's href is used).
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const IMAGE_TYPES = ['image-left', 'image-right', 'image-top', 'image-bottom'];

function buildContentInfo(nodes) {
  const info = document.createElement('div');
  info.className = 'card-content-info';

  const headings = nodes.filter((n) => /^H[1-6]$/.test(n.tagName));
  const paragraphs = nodes.filter((n) => n.tagName === 'P');

  // title: first heading, else first bold paragraph, else first paragraph
  let titleNode = headings[0];
  if (!titleNode) {
    titleNode = paragraphs.find((p) => p.querySelector('strong')) || paragraphs[0];
  }

  const rest = nodes.filter((n) => n !== titleNode);

  if (titleNode) {
    const title = document.createElement('div');
    title.className = 'card-title';
    title.append(...titleNode.childNodes);
    info.append(title);
  }

  // subtitle: the next paragraph after the title (if any remain > 1)
  const remainingParas = rest.filter((n) => n.tagName === 'P' || /^H[1-6]$/.test(n.tagName));
  if (remainingParas.length > 1) {
    const sub = document.createElement('div');
    sub.className = 'card-subtitle';
    sub.append(...remainingParas[0].childNodes);
    info.append(sub);
    remainingParas.shift();
  }

  remainingParas.forEach((p) => {
    const text = document.createElement('div');
    text.className = 'card-text';
    text.append(...p.childNodes);
    info.append(text);
  });

  return info;
}

export default function decorate(block) {
  const type = IMAGE_TYPES.find((t) => block.classList.contains(t))
    || (block.classList.contains('stadistic') ? 'stadistic' : 'default');
  const hasImageType = IMAGE_TYPES.includes(type);
  const imageTreatment = ['icon', 'cover', 'full'].find((t) => block.classList.contains(t))
    || (hasImageType ? 'icon' : null);

  // hover: full by default, simple or off via modifiers
  if (!block.classList.contains('no-hover')) {
    block.classList.add('has-hover');
    block.classList.add(block.classList.contains('hover-simple') ? 'hover-simple' : 'hover-full');
  }

  // flatten the block into a single cell's worth of nodes; pull out the image
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const nodes = [];
  let picture = null;
  const takePicture = (el) => {
    // an element that is (or only wraps) a picture/img and has no real text
    const pic = el.matches('picture, img') ? el : el.querySelector('picture, img');
    return pic && !el.textContent.trim() ? pic : null;
  };
  cells.forEach((cell) => {
    [...cell.children].forEach((child) => {
      const pic = !picture ? takePicture(child) : null;
      if (pic) picture = pic;
      else nodes.push(child);
    });
  });

  // detect a footer link (a standalone linked paragraph / button)
  let footerLink = null;
  const linkPara = nodes.find((n) => n.tagName === 'P' && n.querySelector('a')
    && n.textContent.trim() === n.querySelector('a').textContent.trim());
  if (linkPara) {
    footerLink = linkPara.querySelector('a');
    nodes.splice(nodes.indexOf(linkPara), 1);
  }

  // build image wrapper
  let imageWrapper = null;
  if (hasImageType && picture) {
    imageWrapper = document.createElement('div');
    imageWrapper.className = 'card-image-wrapper';
    const img = picture.tagName === 'IMG' ? picture : picture.querySelector('img');
    if (img) {
      const width = imageTreatment === 'icon' ? '150' : '750';
      const optimized = createOptimizedPicture(img.src, img.alt || '', false, [{ width }]);
      optimized.querySelector('img').className = `card-image ${imageTreatment}`;
      imageWrapper.append(optimized);
    } else {
      imageWrapper.append(picture);
    }
  }

  const info = buildContentInfo(nodes);

  // assemble
  const layout = document.createElement('div');
  layout.className = 'card-vertical-layout';

  const imageFirst = type === 'image-left' || type === 'image-top';
  if (imageWrapper && imageFirst) layout.append(imageWrapper);

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'card-content-wrapper';
  const content = document.createElement('div');
  content.className = 'card-content';
  content.append(info);
  contentWrapper.append(content);
  layout.append(contentWrapper);

  if (imageWrapper && !imageFirst) layout.append(imageWrapper);

  if (footerLink) {
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    const link = document.createElement('a');
    link.className = 'card-link';
    link.href = footerLink.getAttribute('href');
    link.append(...footerLink.childNodes);
    footer.append(link);
    layout.append(footer);
  }

  // whole-card click when there's a single link and no footer link
  if (!footerLink) {
    const links = block.querySelectorAll('a[href]');
    if (links.length === 1) {
      const href = links[0].getAttribute('href');
      block.classList.add('is-clickable');
      block.setAttribute('role', 'link');
      block.tabIndex = 0;
      const go = () => { window.location.href = href; };
      block.addEventListener('click', go);
      block.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    }
  }

  block.textContent = '';
  block.append(layout);
}
