async function renderPlayerDetail(main, params) {
  showLoading(true);
  const player = await PlayerDB.getById(Number(params.id));
  if (!player) {
    main.innerHTML = `<div class="empty-state"><h3>Jugador no encontrado</h3></div>`;
    showLoading(false);
    return;
  }

  const team = await TeamDB.getById(player.teamId);
  const allEvents = await EventDB.getByPlayer(player.id);
  const matchIds = [...new Set(allEvents.map(e => e.matchId))];
  const matches = [];
  for (const mid of matchIds) {
    const m = await MatchDB.getById(mid);
    if (m) matches.push(m);
  }

  const initials = player.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const avg = player.stats.pj > 0 ? (player.stats.anotaciones / player.stats.pj).toFixed(1) : '0.0';

  main.innerHTML = `
    <a href="#" class="btn-back" onclick="event.preventDefault(); router.navigate('players')">← Volver a jugadores</a>
    <div class="detail-header">
      <div class="detail-avatar" style="background:${team ? team.primaryColor : '#333'}">${initials}</div>
      <div class="detail-info">
        <h1>${player.name}</h1>
        <div class="detail-meta">
          ${team ? team.name : 'Sin equipo'} ${player.position ? `· ${player.position}` : ''} ${player.number ? `· #${player.number}` : ''}
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">${player.stats.pj}</div><div class="stat-label">PJ</div></div>
      <div class="stat-card"><div class="stat-value">${player.stats.anotaciones || 0}</div><div class="stat-label">Anotaciones</div></div>
      <div class="stat-card"><div class="stat-value">${avg}</div><div class="stat-label">Promedio</div></div>
    </div>

    <h3 class="section-title" style="font-size:1.1rem">📋 Historial de partidos</h3>
    <div id="player-matches">
      ${matches.length === 0 ? '<p style="color:var(--text-muted)">Sin partidos registrados</p>' : ''}
    </div>

    ${matches.length > 0 ? `
      <div class="card" style="margin-top:1.5rem">
        <h4>Anotaciones por partido</h4>
        <podium-chart id="chart-player"></podium-chart>
      </div>
    ` : ''}
  `;

  const matchContainer = main.querySelector('#player-matches');
  for (const m of matches) {
    const home = await TeamDB.getById(m.homeTeamId);
    const away = await TeamDB.getById(m.awayTeamId);
    const playerEvents = allEvents.filter(e => e.matchId === m.id);
    const date = new Date(m.date).toLocaleDateString('es-ES');
    const opponent = m.homeTeamId === player.teamId ? away : home;
    const result = m.homeScore > m.awayScore ? (m.homeTeamId === player.teamId ? 'V' : 'D') :
                   m.homeScore < m.awayScore ? (m.homeTeamId === player.teamId ? 'D' : 'V') : 'E';
    const color = result === 'V' ? 'var(--success)' : result === 'D' ? 'var(--error)' : 'var(--warning)';

    const div = document.createElement('div');
    div.className = 'card match-card';
    div.style.cssText = 'padding:0.75rem;margin-bottom:0.5rem;cursor:pointer';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span>vs <strong>${opponent?.name || '???'}</strong> <span style="color:var(--text-muted);font-size:0.85rem">${date}</span></span>
        <span><strong>${m.homeScore} - ${m.awayScore}</strong></span>
        <span style="color:${color};font-weight:700">${result}</span>
      </div>
      <div style="font-size:0.8rem;color:var(--accent);margin-top:0.25rem">
        ${playerEvents.length} anotaciones · ${playerEvents.map(e => e.minute ? `min ${e.minute}` : '').filter(Boolean).join(', ')}
      </div>
    `;
    div.onclick = () => router.navigate(`match/${m.id}`);
    matchContainer.appendChild(div);
  }

  if (matches.length > 0) {
    setTimeout(() => {
      const chart = main.querySelector('#chart-player');
      if (chart) {
        const sortedMatches = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = sortedMatches.map((_, i) => `#${i + 1}`);
        const data = sortedMatches.map(m => allEvents.filter(e => e.matchId === m.id).length);
        chart.renderChart({
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Anotaciones',
              data,
              backgroundColor: '#ff4655',
              borderRadius: 4,
            }],
          },
          options: {
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: '#8b978f' }, grid: { color: '#2a3648' } },
              y: { ticks: { color: '#8b978f', stepSize: 1 }, grid: { color: '#2a3648' } },
            },
          },
        });
      }
    }, 50);
  }

  showLoading(false);
}
