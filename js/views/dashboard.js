async function renderDashboard(main) {
  const league = await getActiveLeague();
  if (!league) {
    main.innerHTML = `
      <div class="empty-state">
        <h3>Bienvenido a Podium</h3>
        <p>Aún no hay ninguna liga creada. ¡Crea tu primera liga de eSports!</p>
        <button class="btn btn-primary" onclick="router.navigate('leagues')">Crear primera liga</button>
        <button class="btn btn-secondary" style="margin-top:0.5rem" onclick="router.navigate('help')">Ver guía rápida</button>
      </div>
    `;
    return;
  }

  const sport = getLeagueSport(league);
  const teams = await TeamDB.getByLeague(league.id);
  const allLeagues = await LeagueDB.getAll();
  const allMatches = await MatchDB.getByLeague(league.id);
  const finished = allMatches.filter(m => m.status === 'finished');
  const scheduled = allMatches.filter(m => m.status === 'scheduled');
  const nextMatch = scheduled.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  const lastMatch = finished.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const sortedTeams = [...teams].sort((a, b) => b.stats.pts - a.stats.pts);

  let nextHtml = '<p style="color:var(--text-muted)">No hay partidos programados</p>';
  if (nextMatch) {
    const home = await TeamDB.getById(nextMatch.homeTeamId);
    const away = await TeamDB.getById(nextMatch.awayTeamId);
    const date = new Date(nextMatch.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    nextHtml = `<p><strong>${escapeHtml(home?.name) || '???'}</strong> vs <strong>${escapeHtml(away?.name) || '???'}</strong> — ${date}</p>`;
  }

  let lastHtml = '<p style="color:var(--text-muted)">No hay partidos finalizados</p>';
  if (lastMatch) {
    const home = await TeamDB.getById(lastMatch.homeTeamId);
    const away = await TeamDB.getById(lastMatch.awayTeamId);
    const sl = sport.terms.scoreLabel;
    lastHtml = `<p><strong>${escapeHtml(home?.name) || '???'}</strong> ${sl ? `${sl}: ` : ''}${lastMatch.homeScore} - ${lastMatch.awayScore} <strong>${escapeHtml(away?.name) || '???'}</strong></p>`;
  }

  let topHtml = '';
  if (league.mode === 'liga') {
    const top5 = sortedTeams.slice(0, 5);
    topHtml = `
      <h4>Top 5 — Tabla de posiciones</h4>
      <table style="width:100%;font-size:0.85rem">
        <thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>PTS</th></tr></thead>
        <tbody>
          ${top5.map((t, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(t.name)}</td><td>${t.stats.pj}</td><td><strong>${t.stats.pts}</strong></td></tr>`).join('')}
        </tbody>
      </table>
      <button class="btn btn-secondary btn-sm" style="margin-top:0.75rem" onclick="router.navigate('stats')">Ver tabla completa</button>
    `;
  } else {
    topHtml = `<p style="color:var(--text-muted)">Modalidad eliminación directa. <a href="#" onclick="event.preventDefault(); router.navigate('stats')">Ver bracket completo</a></p>`;
  }

  main.innerHTML = `
    <div class="section-header">
      <div class="section-title"><i class="${sport.icon}"></i> ${escapeHtml(league.name)} <span style="font-size:0.9rem;color:var(--text-secondary);font-weight:400">— ${sport.name} · ${escapeHtml(league.season)}</span></div>
      ${allLeagues.length > 1 ? `
        <div style="display:flex;align-items:center;gap:0.5rem">
          <label style="font-size:0.85rem;color:var(--text-secondary)">Liga activa:</label>
          <select id="dash-league-select" class="form-select" style="padding:0.35rem 0.6rem;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-card);color:var(--text-primary)">
            ${allLeagues.map(l => `<option value="${l.id}" ${l.id === league.id ? 'selected' : ''}>${escapeHtml(l.name)}</option>`).join('')}
          </select>
        </div>
      ` : ''}
    </div>
    <div class="dashboard-grid">
      <div class="card">
        <h4><i class="fa-solid fa-calendar-days"></i> Próximo partido</h4>
        ${nextHtml}
      </div>
      <div class="card">
        <h4><i class="fa-solid fa-flag-checkered"></i> Último resultado</h4>
        ${lastHtml}
      </div>
      <div class="card full-width">
        ${topHtml}
      </div>
      <div class="card full-width">
        <h4><i class="fa-solid fa-chart-pie"></i> Distribución de resultados</h4>
        <podium-chart id="chart-results"></podium-chart>
      </div>
      <div class="card full-width">
        <h4><i class="fa-solid fa-chart-line"></i> Evolución de puntos</h4>
        <podium-chart id="chart-evolution"></podium-chart>
      </div>
      <div class="card full-width">
        <h4><i class="fa-solid fa-medal"></i> Top anotadores</h4>
        <podium-chart id="chart-top"></podium-chart>
      </div>
      <div class="card full-width">
        <h4><i class="fa-solid fa-star"></i> Equipos con más puntos a favor</h4>
        <podium-chart id="chart-pf"></podium-chart>
      </div>
    </div>
  `;

  if (teams.length === 0) {
    main.innerHTML += `
      <div class="card" style="margin-top:1rem">
        <h4><i class="fa-solid fa-shoe-prints"></i> ¿Cómo usar Podium?</h4>
        <ol style="margin:0.5rem 0 0 1.25rem;display:flex;flex-direction:column;gap:0.25rem">
          <li>Agrega equipos en la pestaña <strong>Equipos</strong>.</li>
          <li>Agrega jugadores en la pestaña <strong>Jugadores</strong>.</li>
          <li>Genera el calendario desde <strong>Ligas</strong>.</li>
          <li>Programa y finaliza partidos en <strong>Partidos</strong>.</li>
        </ol>
        <button class="btn btn-secondary btn-sm" style="margin-top:0.75rem" onclick="router.navigate('help')">Ver guía completa</button>
      </div>
    `;
  }

  if (finished.length > 0) {
    const teamPlayers = [];
    for (const team of teams) {
      const players = await PlayerDB.getByTeam(team.id);
      teamPlayers.push(...players.map(p => ({ ...p, teamName: team.name })));
    }

    setTimeout(() => {
      const chartResults = main.querySelector('#chart-results');
      if (chartResults) chartResults.renderChart(getResultDistributionChart(teams));

      const chartEvolution = main.querySelector('#chart-evolution');
      const evoConfig = getPointsByDateChart(allMatches, teams, league);
      if (chartEvolution) chartEvolution.renderChart(evoConfig);

      const chartTop = main.querySelector('#chart-top');
      if (chartTop && teamPlayers.length > 0) {
        chartTop.renderChart(getTopScorersChart(teamPlayers, 10, sport.terms.eventNamePlural));
      }

      const chartPf = main.querySelector('#chart-pf');
      if (chartPf && teams.length > 0) {
        chartPf.renderChart(getTeamPointsRadar(teams));
      }
    }, 50);
  }

  // Req 4.1.1: cambiar de liga activa desde el dashboard
  const leagueSelect = main.querySelector('#dash-league-select');
  if (leagueSelect) {
    leagueSelect.onchange = async () => {
      const nextId = Number(leagueSelect.value);
      if (nextId && nextId !== league.id) {
        await LeagueDB.setActive(nextId);
        showToast('Liga activa cambiada', 'success');
        router.navigate('dashboard');
      }
    };
  }

  await refreshActiveLeagueIndicator();
}
