/* export default function decorate(block) {
  block.innerHTML = `
    <div class="header-adobe-content">

      <h2>Puntos Net Adobe</h2>

      <nav class="header-adobe-nav">

        <a href="/">Inicio</a>

        <div class="header-adobe-dropdown">
          <button
            type="button"
            class="header-adobe-dropdown-button"
          >
            Servicios
          </button>

          <div class="header-adobe-dropdown-menu">
            <a href="#">AEM</a>
            <a href="#">Analytics</a>
            <a href="#">Target</a>
          </div>
        </div>

        <a href="#">Adobe</a>

        <a href="#">Contacto</a>

      </nav>

    </div>
  `;

  const dropdownButton = block.querySelector(".header-adobe-dropdown-button");

  const dropdownMenu = block.querySelector(".header-adobe-dropdown-menu");

  dropdownButton.addEventListener("click", () => {
    dropdownMenu.classList.toggle("is-open");
  });
}
 */

export default function decorate(block) {
  block.textContent = "HEADER ADOBE FUNCIONANDO";
}
