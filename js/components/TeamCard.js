class TeamCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set data(val) {
    this._data = val;
    this.render();
  }

  render() {
    if (!this._data) return;
    const t = this._data;
    const initials = t.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/main.css">
      <link rel="stylesheet" href="css/components.css">
      <div class="card team-card">
        <div style="text-align:center">
          <div class="team-avatar" style="background:${t.primaryColor};margin:0 auto">
            ${initials}
          </div>
          <h4 style="margin:0 0 0.25rem;font-size:0.95rem">${t.name}</h4>
          <p style="color:var(--text-muted);font-size:0.75rem;margin:0">
            ${t.city || ''} ${t.stats ? `· ${t.stats.pj} PJ · ${t.stats.pts} PTS` : ''}
          </p>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.card').onclick = () => {
      router.navigate(`team/${t.id}`);
    };
  }
}
customElements.define('podium-team-card', TeamCard);
