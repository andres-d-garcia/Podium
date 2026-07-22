class MatchCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set data(val) {
    this._data = val;
    this.render();
  }

  async render() {
    if (!this._data) return;
    const m = this._data;
    const home = await TeamDB.getById(m.homeTeamId);
    const away = await TeamDB.getById(m.awayTeamId);
    const homeInitials = home ? home.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';
    const awayInitials = away ? away.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';
    const date = new Date(m.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/main.css">
      <link rel="stylesheet" href="css/components.css">
      <div class="card match-card">
        <div class="match-teams">
          <div class="match-team">
            <div class="team-badge" style="background:${home ? home.primaryColor : '#333'}">
              ${homeInitials}
            </div>
            <span style="font-weight:600;font-size:0.9rem">${home ? home.name : '???'}</span>
          </div>
          ${m.status === 'finished'
            ? `<div class="match-score">${m.homeScore} - ${m.awayScore}</div>`
            : `<div class="match-vs">VS</div>`
          }
          <div class="match-team away">
            <span style="font-weight:600;font-size:0.9rem">${away ? away.name : '???'}</span>
            <div class="team-badge" style="background:${away ? away.primaryColor : '#333'}">
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
