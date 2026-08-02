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
      this.shadowRoot.innerHTML = `<p style="color:var(--text-muted);padding:1rem">No hay bracket generado</p>`;
      return;
    }

    const matches = this._data;
    const teamCache = {};

    async function getTeamName(id) {
      if (!id) return 'Por definir';
      if (!teamCache[id]) {
        const team = await TeamDB.getById(id);
        teamCache[id] = team ? team.name : '???';
      }
      return escapeHtml(teamCache[id]);
    }

    const wbMatches = matches.filter(m => !m.bracket || m.bracket === 'winners');
    const lbMatches = matches.filter(m => m.bracket === 'losers');
    const gfMatch = matches.filter(m => m.bracket === 'grand_final');

    const wbRounds = [...new Set(wbMatches.map(m => m.round))].sort();
    const lbRounds = [...new Set(lbMatches.map(m => m.round))].sort();

    const roundNames = { 1: 'Octavos', 2: 'Cuartos', 3: 'Semifinal', 4: 'Final' };

    async function renderBracketSection(title, bracketMatches, rounds) {
      let html = `<h3 style="margin:0 0 0.75rem;font-size:1rem;color:var(--text-secondary)">${title}</h3><div class="bracket">`;
      for (const r of rounds) {
        html += `<div class="bracket-round"><div class="bracket-round-title">${roundNames[r] || `Ronda ${r}`}</div>`;
        const roundMatches = bracketMatches.filter(m => m.round === r);
        for (const m of roundMatches) {
          const homeName = await getTeamName(m.homeTeamId);
          const awayName = await getTeamName(m.awayTeamId);
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
      return html;
    }

    let html = '';
    if (wbMatches.length > 0) {
      html += await renderBracketSection('Winners Bracket', wbMatches, wbRounds);
    }
    if (lbMatches.length > 0) {
      html += await renderBracketSection('Losers Bracket', lbMatches, lbRounds);
    }
    if (gfMatch.length > 0) {
      html += `<h3 style="margin:1.5rem 0 0.75rem;font-size:1rem;color:var(--text-secondary)">Gran Final</h3><div class="bracket">`;
      for (const m of gfMatch) {
        const homeName = await getTeamName(m.homeTeamId);
        const awayName = await getTeamName(m.awayTeamId);
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

    if (!html) {
      html = `<p style="color:var(--text-muted);padding:1rem">Sin partidos de bracket</p>`;
    }

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
