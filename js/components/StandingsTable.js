class StandingsTable extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set data(val) {
    this._data = val;
    this.render();
  }

  set sport(val) {
    this._sport = val;
    this.render();
  }

  render() {
    if (!this._data || this._data.length === 0) {
      this.shadowRoot.innerHTML = `<p style="color:var(--text-muted)">No hay equipos en la liga</p>`;
      return;
    }

    const abbr = this._sport?.terms?.scoreAbbr || { for: 'PF', against: 'PC' };
    const sorted = [...this._data].sort((a, b) => {
      if (b.stats.pts !== a.stats.pts) return b.stats.pts - a.stats.pts;
      if (b.stats.dif !== a.stats.dif) return b.stats.dif - a.stats.dif;
      return b.stats.pf - a.stats.pf;
    });

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/main.css">
      <link rel="stylesheet" href="css/components.css">
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch">
      <table class="standings-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Equipo</th>
            <th>PJ</th>
            <th>PG</th>
            <th>PE</th>
            <th>PP</th>
            <th>${abbr.for}</th>
            <th>${abbr.against}</th>
            <th>DIF</th>
            <th>PTS</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map((team, i) => `
            <tr style="cursor:pointer" data-id="${team.id}">
              <td class="${i < 3 ? `pos-${i + 1}` : ''}">${i + 1}</td>
              <td><strong>${team.name}</strong></td>
              <td>${team.stats.pj}</td>
              <td>${team.stats.pg}</td>
              <td>${team.stats.pe}</td>
              <td>${team.stats.pp}</td>
              <td>${team.stats.pf}</td>
              <td>${team.stats.pc}</td>
              <td>${team.stats.dif}</td>
              <td><strong>${team.stats.pts}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      </div>
    `;

    this.shadowRoot.querySelectorAll('tr[data-id]').forEach(row => {
      row.onclick = () => router.navigate(`team/${row.dataset.id}`);
    });
  }
}
customElements.define('podium-standings', StandingsTable);
