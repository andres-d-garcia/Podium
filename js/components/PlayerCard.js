class PlayerCard extends HTMLElement {
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
    const p = this._data;
    const initials = p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/main.css">
      <link rel="stylesheet" href="css/components.css">
      <div class="card player-card">
        <div style="text-align:center">
          <div class="player-avatar" style="margin:0 auto">
            ${p.photo ? `<img src="${p.photo}" alt="${p.name}">` : initials}
          </div>
          <h4 style="margin:0 0 0.25rem;font-size:0.95rem">${p.name}</h4>
          <p style="color:var(--text-muted);font-size:0.75rem;margin:0">
            ${p.position ? `${p.position} · ` : ''} #${p.number || '-'}
            ${p.stats ? `· ${p.stats.anotaciones || 0} ${getTerm('valorant', 'eventNamePlural')}` : ''}
          </p>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.card').onclick = () => {
      router.navigate(`player/${p.id}`);
    };
  }
}
customElements.define('podium-player-card', PlayerCard);
