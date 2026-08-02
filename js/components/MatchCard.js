class MatchCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set data(val) {
    this._data = val;
  }

  set sport(val) {
    this._sport = val;
    this.render();
  }

  async render() {
    if (!this._data) return;
    const m = this._data;
    const home = await TeamDB.getById(m.homeTeamId);
    const away = await TeamDB.getById(m.awayTeamId);
    const scoreLabel = this._sport?.terms?.scoreLabel;
    const homeInitials = home ? home.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';
    const awayInitials = away ? away.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';
    const date = new Date(m.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/main.css">
      <link rel="stylesheet" href="css/components.css">
      <div class="card match-card">
        <div class="match-teams">
          <div class="match-team">
            <div class="team-badge" style="background:${safeColor(home?.primaryColor)}">
              ${homeInitials}
            </div>
            <span style="font-weight:600;font-size:0.9rem">${escapeHtml(home?.name) || '???'}</span>
          </div>
          ${m.status === 'finished'
            ? `<div class="match-score">${scoreLabel ? `${scoreLabel}: ` : ''}${m.homeScore} - ${m.awayScore}</div>`
            : `<div class="match-vs">VS</div>`
          }
          <div class="match-team away">
            <span style="font-weight:600;font-size:0.9rem">${escapeHtml(away?.name) || '???'}</span>
            <div class="team-badge" style="background:${safeColor(away?.primaryColor)}">
              ${awayInitials}
            </div>
          </div>
        </div>
        <div class="match-info">
          <span>${date}</span>
          <span class="match-status ${m.status}">
            ${m.status === 'finished' ? 'Finalizado' : m.status === 'scheduled' ? 'Programado' : 'Pendiente'}
          </span>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.card').onclick = () => {
      router.navigate(`match/${m.id}`);
    };
  }
}
customElements.define('podium-match-card', MatchCard);
