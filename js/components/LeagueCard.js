class LeagueCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set data(val) {
    this._data = val;
    this.render();
  }

  get data() {
    return this._data;
  }

  render() {
    if (!this._data) return;
    const l = this._data;
    const sport = getSport(l.sport);
    const modeText = l.mode === 'liga' ? `Liga (${l.rounds === 2 ? 'Ida y vuelta' : 'Una vuelta'})` : 'Eliminación directa';

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/main.css">
      <link rel="stylesheet" href="css/components.css">
      <div class="card" style="cursor:pointer">
        <div style="display:flex;justify-content:space-between;align-items:start">
          <div>
            <h3 style="margin:0 0 0.25rem">${sport.icon} ${l.name}</h3>
            <p style="color:var(--text-secondary);font-size:0.85rem;margin:0">
              ${sport.name} · ${l.season}
            </p>
          </div>
          ${l.isActive ? '<span style="background:var(--success);color:#000;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.7rem;font-weight:700">ACTIVA</span>' : ''}
        </div>
        <div style="margin-top:0.75rem;font-size:0.8rem;color:var(--text-muted)">
          ${modeText}
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.card').onclick = () => {
      router.navigate(`leagues`);
    };
  }
}
customElements.define('podium-league-card', LeagueCard);
