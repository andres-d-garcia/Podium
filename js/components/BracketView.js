class BracketView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set data(val) {
    this._data = val;
    this.render();
  }

  async render() {
    if (!this._data || this._data.length === 0) {
      this.shadowRoot.innerHTML = `<p style="color:var(--text-muted)">No hay bracket generado</p>`;
      return;
    }

    const matches = this._data;
    const rounds = [...new Set(matches.map(m => m.round))].sort();
    const roundNames = { 1: 'Octavos', 2: 'Cuartos', 3: 'Semifinal', 4: 'Final' };

    let html = `<div class="bracket">`;
    for (const round of rounds) {
      html += `<div class="bracket-round">
        <div class="bracket-round-title">${roundNames[round] || `Ronda ${round}`}</div>`;
      const roundMatches = matches.filter(m => m.round === round);
      for (const m of roundMatches) {
        const homeName = m.homeTeamId ? (await TeamDB.getById(m.homeTeamId))?.name || '???' : 'Por definir';
        const awayName = m.awayTeamId ? (await TeamDB.getById(m.awayTeamId))?.name || '???' : 'Por definir';
        const finished = m.status === 'finished';
        html += `<div class="bracket-match" data-id="${m.id}">
          <div class="bm-teams">
            <div class="bm-team ${finished && m.winnerId === m.homeTeamId ? 'winner' : ''}">
              <span>${homeName}</span>
              ${finished ? `<span class="bm-score">${m.homeScore}</span>` : ''}
            </div>
            <div class="bm-team ${finished && m.winnerId === m.awayTeamId ? 'winner' : ''}">
              <span>${awayName}</span>
              ${finished ? `<span class="bm-score">${m.awayScore}</span>` : ''}
            </div>
          </div>
        </div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/main.css">
      <link rel="stylesheet" href="css/components.css">
      ${html}
    `;

    this.shadowRoot.querySelectorAll('.bracket-match').forEach(el => {
      el.onclick = () => router.navigate(`match/${el.dataset.id}`);
    });
  }
}
customElements.define('podium-bracket', BracketView);
