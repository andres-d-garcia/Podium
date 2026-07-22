class RankingTable extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set data(val) {
    this._data = val;
    this.render();
  }

  render() {
    if (!this._data || this._data.length === 0) {
      this.shadowRoot.innerHTML = `<p style="color:var(--text-muted)">No hay datos de jugadores</p>`;
      return;
    }

    const sorted = [...this._data].sort((a, b) => (b.stats.anotaciones || 0) - (a.stats.anotaciones || 0));
    const top = sorted.slice(0, 10);

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/main.css">
      <link rel="stylesheet" href="css/components.css">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Jugador</th>
            <th>Equipo</th>
            <th>Anotaciones</th>
            <th>PJ</th>
            <th>Promedio</th>
          </tr>
        </thead>
        <tbody>
          ${top.map((p, i) => `
            <tr style="cursor:pointer" data-id="${p.id}">
              <td>${i + 1}</td>
              <td><strong>${p.name}</strong></td>
              <td style="color:var(--text-secondary)">${p.teamName || '-'}</td>
              <td>${p.stats.anotaciones || 0}</td>
              <td>${p.stats.pj || 0}</td>
              <td>${(p.stats.promedio || 0).toFixed(1)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    this.shadowRoot.querySelectorAll('tr[data-id]').forEach(row => {
      row.onclick = () => router.navigate(`player/${row.dataset.id}`);
    });
  }
}
customElements.define('podium-ranking', RankingTable);
