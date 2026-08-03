const NAV_ICONS = {
  dashboard: '<i class="fa-solid fa-th-large"></i>',
  leagues: '<i class="fa-solid fa-trophy"></i>',
  teams: '<i class="fa-solid fa-shield-halved"></i>',
  players: '<i class="fa-solid fa-user"></i>',
  matches: '<i class="fa-solid fa-calendar-days"></i>',
  stats: '<i class="fa-solid fa-chart-column"></i>',
};

const LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-36 116 341 238" fill="currentColor" style="height:28px;width:auto"><g transform="skewX(-18)"><rect x="80" y="230" width="45" height="120" /><rect x="140" y="120" width="45" height="230" /><path fill-rule="evenodd" d="M 200 160 H 275 C 330 160 365 185 365 225 C 365 265 330 290 275 290 H 245 V 350 H 200 Z M 245 200 H 275 C 300 200 315 208 315 225 C 315 242 300 250 275 250 H 245 Z" /></g></svg>';

class NavBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['league-name', 'league-sport', 'league-icon'];
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
    document.addEventListener('click', this._onDocClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick);
  }

  _onDocClick = (e) => {
    if (this.shadowRoot && !this.shadowRoot.contains(e.target)) {
      this._closeMenu();
    }
  };

  _closeMenu() {
    const menu = this.shadowRoot.querySelector('.navbar-fab-menu');
    const fab = this.shadowRoot.querySelector('.navbar-fab');
    if (menu) menu.classList.remove('open');
    if (fab) fab.setAttribute('aria-expanded', 'false');
  }

  async _toggleMenu() {
    const fab = this.shadowRoot.querySelector('.navbar-fab');
    const menu = this.shadowRoot.querySelector('.navbar-fab-menu');
    const opening = !menu.classList.contains('open');

    if (opening) {
      const league = typeof getActiveLeague === 'function' ? await getActiveLeague() : null;
      menu.innerHTML = this._buildMenu(league).map(opt => `
        <button data-create="${opt.type}">${opt.label}</button>
      `).join('');
    }

    menu.classList.toggle('open', opening);
    fab.setAttribute('aria-expanded', opening ? 'true' : 'false');
    if (opening) {
      menu.querySelectorAll('[data-create]').forEach(btn => {
        btn.onclick = (ev) => {
          ev.stopPropagation();
          this._closeMenu();
          openCreateForm(btn.dataset.create);
        };
      });
    }
  }

  _buildMenu(league) {
    if (!league) return [{ label: '+ Nueva liga', type: 'league' }];

    const base = location.hash.replace('#', '').split('/')[0];
    const opts = [];
    if (base === 'teams' || base === 'team') opts.push({ label: '+ Nuevo equipo', type: 'team' });
    if (base === 'players' || base === 'player') opts.push({ label: '+ Nuevo jugador', type: 'player' });
    if (base === 'matches' || base === 'match') opts.push({ label: '+ Programar partido', type: 'match' });
    if (opts.length === 0) {
      opts.push(
        { label: '+ Nueva liga', type: 'league' },
        { label: '+ Nuevo equipo', type: 'team' },
        { label: '+ Nuevo jugador', type: 'player' },
        { label: '+ Programar partido', type: 'match' },
      );
    }
    return opts;
  }

  render() {
    const name = this.getAttribute('league-name') || '';
    const sport = this.getAttribute('league-sport') || '';
    const icon = this.getAttribute('league-icon') || '';
    const navLinks = [
      ['dashboard', 'Dashboard'],
      ['leagues', 'Ligas'],
      ['teams', 'Equipos'],
      ['players', 'Jugadores'],
      ['matches', 'Partidos'],
      ['stats', 'Stats'],
    ];
    const base = typeof router !== 'undefined' ? router.currentRoute?.pattern?.split('/')[0] : '';

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/components.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
      <div class="navbar-topbar">
        <a href="#dashboard" onclick="event.preventDefault(); router.navigate('dashboard')" style="display:flex;align-items:center;gap:0.1rem;color:var(--text-primary);text-decoration:none">
          ${LOGO_SVG}
          <span style="font-weight:800;letter-spacing:0.5px">ODIUM</span>
        </a>
        <button class="navbar-help" aria-label="Ayuda" onclick="event.preventDefault(); router.navigate('help')">
          <i class="fa-solid fa-circle-question"></i>
        </button>
      </div>
      <nav class="navbar">
        <a href="#dashboard" class="navbar-brand" onclick="event.preventDefault(); router.navigate('dashboard')" style="color:var(--text-primary)">
          ${LOGO_SVG}
          ODIUM
        </a>
        <div class="navbar-links">
          ${navLinks.map(([href, label]) => `
            <a href="#${href}" onclick="event.preventDefault(); router.navigate('${href}')" class="${base === href ? 'active' : ''}">
              <span class="nav-icon">${NAV_ICONS[href]}</span>
              <span class="nav-label">${label}</span>
            </a>
          `).join('')}
        </div>
        <div class="navbar-spacer"></div>
        ${name ? `<div class="navbar-league"><span class="league-dot"></span> <i class="${escapeHtml(icon)}"></i> ${escapeHtml(name)} — ${escapeHtml(sport)}</div>` : ''}
        <button class="navbar-help" aria-label="Ayuda" onclick="event.preventDefault(); router.navigate('help')">
          <i class="fa-solid fa-circle-question"></i>
        </button>

        <div class="navbar-fab-wrap">
          <button class="navbar-fab" aria-label="Crear" aria-expanded="false">
            <i class="fa-solid fa-plus"></i>
          </button>
          <div class="navbar-fab-menu"></div>
        </div>
      </nav>
    `;

    this.shadowRoot.querySelector('.navbar-fab').onclick = (e) => {
      e.stopPropagation();
      this._toggleMenu();
    };
  }
}
customElements.define('podium-navbar', NavBar);
