class Footer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/main.css">
      <footer style="text-align:center;padding:1.5rem;border-top:1px solid var(--border-color);color:var(--text-muted);font-size:0.8rem">
        <p style="margin:0">Podium — Gestor de Ligas eSports &copy; 2026</p>
        <p style="margin:0.25rem 0 0">
          <span id="idb-status" style="display:inline-flex;align-items:center;gap:0.35rem">Comprobando IndexedDB…</span>
        </p>
        <p style="margin:0.25rem 0 0">
          <a href="#help" onclick="event.preventDefault(); router.navigate('help')" style="color:var(--text-secondary);text-decoration:none"><i class="fa-solid fa-circle-question"></i> Ayuda y FAQ</a>
        </p>
      </footer>
    `;
  }

  connectedCallback() {
    // Req 3.2: indicador del estado de IndexedDB (conectado / error)
    this._checkIdb();
  }

  async _checkIdb() {
    const el = this.shadowRoot.getElementById('idb-status');
    try {
      await openDB();
      el.innerHTML = '<span style="color:var(--success)">●</span> IndexedDB: conectado';
    } catch (e) {
      el.innerHTML = '<span style="color:var(--error)">●</span> IndexedDB: error de conexión';
    }
  }
}
customElements.define('podium-footer', Footer);
