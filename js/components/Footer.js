class Footer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/main.css">
      <footer style="text-align:center;padding:1.5rem;border-top:1px solid var(--border-color);color:var(--text-muted);font-size:0.8rem">
        <p style="margin:0">Podium — Gestor de Ligas eSports &copy; 2026</p>
        <p style="margin:0.25rem 0 0">
          <a href="#help" onclick="event.preventDefault(); router.navigate('help')" style="color:var(--text-secondary);text-decoration:none"><i class="fa-solid fa-circle-question"></i> Ayuda y FAQ</a>
        </p>
      </footer>
    `;
  }
}
customElements.define('podium-footer', Footer);
