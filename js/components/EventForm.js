class EventForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onAdd = null;
  }

  set data(val) {
    this._data = val;
    this.render();
  }

  set onAdd(callback) {
    this._onAdd = callback;
  }

  render() {
    if (!this._data) return;
    const { match, homeTeam, awayTeam, homePlayers, awayPlayers, sport } = this._data;
    const term = sport.terms;
    const types = term.eventTypes || ['Normal'];

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/main.css">
      <link rel="stylesheet" href="css/components.css">
      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);padding:1rem;margin-bottom:1rem">
        <h4 style="margin:0 0 0.75rem;font-size:0.9rem;color:var(--text-secondary)">Registrar ${term.eventName}</h4>
        <div class="form-row" style="gap:0.65rem">
          <div class="form-group">
            <label>Equipo</label>
            <select id="ev-team">
              <option value="${homeTeam.id}">${escapeHtml(homeTeam.name)}</option>
              <option value="${awayTeam.id}">${escapeHtml(awayTeam.name)}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Jugador</label>
            <select id="ev-player">
              ${homePlayers.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}
              ${awayPlayers.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Tipo</label>
            <select id="ev-type">
              ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Minuto</label>
            <input type="number" id="ev-minute" min="0" placeholder="—" style="width:70px">
          </div>
          <button id="ev-add" class="btn btn-primary" style="align-self:flex-end">+</button>
        </div>
      </div>
    `;

    const teamSelect = this.shadowRoot.getElementById('ev-team');
    const playerSelect = this.shadowRoot.getElementById('ev-player');

    teamSelect.onchange = () => {
      const teamId = Number(teamSelect.value);
      const players = teamId === homeTeam.id ? homePlayers : awayPlayers;
      playerSelect.innerHTML = players.map(p =>
        `<option value="${p.id}">${escapeHtml(p.name)}</option>`
      ).join('');
    };

    this.shadowRoot.getElementById('ev-add').onclick = () => {
      const teamId = Number(teamSelect.value);
      const playerId = Number(playerSelect.value);
      const type = this.shadowRoot.getElementById('ev-type').value;
      const minute = this.shadowRoot.getElementById('ev-minute').value;
      if (this._onAdd) this._onAdd({ teamId, playerId, type, minute: minute || null });
    };
  }
}
customElements.define('podium-event-form', EventForm);
