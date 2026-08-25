import { loadFragment } from "../fragment/fragment.js";
import { getMetadata } from "../../scripts/aem.js";

/**
 * Procesa el logo: detecta default, imagen (con/sin link) o texto
 */
function processLogo(contentHTML, containerElement) {
  const logoElement = document.createElement("div");
  logoElement.className = "logo";

  // ============================================================
  // PASO 1: Limpiar contenido y detectar si es "Logo Default"
  // ============================================================
  // Eliminamos etiquetas HTML para quedarnos solo con el texto
  const cleanContent = contentHTML ? contentHTML.trim() : "";
  const cleanText = cleanContent.replace(/<[^>]*>/g, "").trim();

  // Si está vacío, o el texto es "Logo Default" (sin importar mayúsculas)
  // → Usamos el logo por defecto del sistema
  const isDefault =
    !cleanContent ||
    cleanText.toLowerCase() === "logo default" ||
    cleanContent.toLowerCase().includes("logo default");

  if (isDefault) {
    logoElement.innerHTML = `
      <a tabindex="0" href="/" data-discover="true" class="logo-link">
        <img alt="Puntos.net" width="100" height="70" src="./media/LogoPN.avif" loading="lazy">
      </a>
    `;
    containerElement.prepend(logoElement); // Va al inicio del header
    return;
  }

  // ============================================================
  // PASO 2: Extraer link, texto e imagen del contenido
  // ============================================================
  let link = null;
  let text = cleanText;
  let isImage = false;

  // 2a. Buscar imagen con link: <a href="url"><img src="img"></a>
  //     Soporta <picture> y saltos de línea entre etiquetas
  const linkMatch =
    contentHTML.match(
      /<a\s+href=["']([^"']+)["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/i,
    ) || contentHTML.match(/<a\s+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/i);

  if (linkMatch) {
    link = linkMatch[1]; // La URL del link
    text = linkMatch[2] || text; // El texto o alt de la imagen
    isImage = !!link.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)/i); // ¿Es imagen?
  }

  // 2b. Buscar Markdown: [texto](url) - formato escrito manualmente
  if (!link) {
    const mdMatch = contentHTML.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (mdMatch) {
      text = mdMatch[1];
      link = mdMatch[2];
      isImage = !!link.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)/i);
    }
  }

  // 2c. Buscar imagen sin link (solo la URL de la imagen)
  if (!link && !isImage) {
    const imgMatch = contentHTML.match(
      /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|svg|webp|avif)/i,
    );
    if (imgMatch) {
      isImage = true;
      text = imgMatch[0]; // La URL de la imagen
    }
  }

  // ============================================================
  // PASO 3: Construir el HTML final del logo
  // ============================================================
  const finalLink = link || "/"; // Si no hay link, va al home
  let logoHTML = "";

  if (isImage) {
    // Caso 1: Es una imagen → mostramos <img> dentro de <a>
    const imgTag = `<img alt="logo" class="logo-img" width="100" height="70" src="${text}" loading="lazy">`;
    logoHTML = `<a tabindex="0" href="${finalLink}" data-discover="true" class="logo-link">${imgTag}</a>`;
  } else if (text) {
    // Caso 2: Es texto → mostramos el texto dentro de <a>
    logoHTML = `<a tabindex="0" href="${finalLink}" data-discover="true" class="logo-link"><div class="logo-text">${text}</div></a>`;
  } else {
    // Caso 3: Fallback (nunca debería ocurrir) → logo por defecto
    logoHTML = `
      <a tabindex="0" href="/" data-discover="true" class="logo-link">
        <img alt="Puntos.net" width="100" height="70" src="./media/LogoPN.avif" loading="lazy">
      </a>
    `;
  }

  logoElement.innerHTML = logoHTML;
  containerElement.appendChild(logoElement);
}

// ============================================================
// PROCESAR CTA: extrae texto y link para el botón
// ============================================================
/**
 * Procesa el CTA: extrae texto y link, si no tiene link usa "/"
 * Si no tiene texto usa "CTA" por defecto
 */
function processCta(contentHTML, containerElement) {
  const ctaElement = document.createElement("div");
  ctaElement.className = "cta";

  // Limpiar contenido
  const cleanContent = contentHTML ? contentHTML.trim() : "";
  const cleanText = cleanContent.replace(/<[^>]*>/g, "").trim();

  let link = null;
  let text = cleanText || "CTA";

  // Buscar link en formato HTML: <a href="...">texto</a>
  const htmlLink = contentHTML.match(
    /<a\s+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/i,
  );
  if (htmlLink) {
    link = htmlLink[1];
    text = htmlLink[2] || text;
  }

  // Buscar link en formato Markdown: [texto](url)
  if (!link) {
    const mdMatch = contentHTML.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (mdMatch) {
      text = mdMatch[1];
      link = mdMatch[2];
    }
  }

  // Si no hay link, usar "/"
  const finalLink = link || "/";

  // Si no hay texto, usar "CTA" por defecto
  const finalText = text || "CTA";

  // Construir el botón CTA
  ctaElement.innerHTML = `
    <a tabindex="0" href="${finalLink}" data-discover="true" class="button-cta">
      ${finalText}
    </a>
  `;

  containerElement.appendChild(ctaElement);
}

/**
 * Función principal: decora el header con las secciones del nav
 */
export default async function decorate(block) {
  // ============================================================
  // PASO 1: Crear estructura del header
  // ============================================================
  const headerEl = document.createElement("nav");
  headerEl.className = "header-pn";

  const containerEl = document.createElement("div");
  containerEl.className = "header-pn-container";

  // ============================================================
  // PASO 2: Cargar contenido desde Google Drive
  // ============================================================
  // Buscar ruta personalizada en metadatos, o usar "/nav" por defecto
  const navMeta = getMetadata("nav");
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : "/nav";
  const fragment = await loadFragment(navPath);

  // ============================================================
  // PASO 3: Procesar cada sección por orden
  // ============================================================
  // AEM Edge convierte cada sección (separada por ---) en un <div class="section">
  const sections = fragment.querySelectorAll(".section");

  // Las clases se asignan por posición: 0→logo, 1→menu, 2→lang, 3→cta
  const classes = ["logo", "menu", "lang-switch", "cta"];

  sections.forEach((section, index) => {
    // Cada sección tiene un wrapper con el contenido
    const wrapper = section.querySelector(".default-content-wrapper");
    if (!wrapper) return;

    const content = wrapper.innerHTML;
    const className = classes[index];
    if (!className) return;

    if (index === 0) {
      // Sección 0: Logo (tiene procesamiento especial)
      processLogo(content, containerEl);
    } else if (index === 3) {
      // Sección 3: CTA (tiene procesamiento especial para botón)
      processCta(content, containerEl);
    } else {
      // Secciones 1, 2: Menu y Lang van directas
      const newSection = document.createElement("div");
      newSection.className = className;
      newSection.innerHTML = content;
      containerEl.appendChild(newSection);
    }
  });

  // ============================================================
  // PASO 4: Insertar el header en la página
  // ============================================================
  headerEl.appendChild(containerEl);
  block.textContent = "";
  block.appendChild(headerEl);
}
