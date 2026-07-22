async function renderStats(main) {
  const league = await getActiveLeague();
  if (!league) {
    main.innerHTML = `<div class="empty-state"><h3>Sin liga activa</h3></div>`;
    return;
  }

  showLoading(true);
  const sport = getSport(league.sport);
  const teams = await TeamDB.getByLeague(league.id);
  const allMatches = await MatchDB.getByLeague(league.id);
  const finished = allMatches.filter(m => m.status === 'finished');

  main.innerHTML = `
    <div class="section-title">📊 Estadísticas — ${league.name}</div>

    <div id="standings-section" style="margin-bottom:2rem"></div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem">
      <div class="card">
        <h4>🏅 Top anotadores</h4>
        <podium-ranking id="rank-anotadores"></podium-ranking>
      </div>
      <div class="card">
        <h4>📊 Distribución de resultados</h4>
        <podium-chart id="chart-results"></podium-chart>
      </div>
      <div class="card">
        <h4>📈 Top puntos a favor</h4>
        <podium-chart id="chart-top-pf"></podium-chart>
      </div>
      <div class="card">
        <h4>📉 Evolución comparativa</h4>
        <podium-chart id="chart-evolution"></podium-chart>
      </div>
    </div>
  `;

  const standingsSection = main.querySelector('#standings-section');

  if (league.mode === 'liga') {
    standingsSection.innerHTML = `
      <h3 style="margin-bottom:0.75rem">Tabla de posiciones</h3>
      <podium-standings id="standings-table"></podium-standings>
    `;
    const standings = main.querySelector('#standings-table');
    if (standings) standings.data = teams;
  } else {
    const bracketMatches = allMatches.filter(m => m.round > 0);
    standingsSection.innerHTML = `
      <h3 style="margin-bottom:0.75rem">Bracket del torneo</h3>
      <podium-bracket id="bracket-view"></podium-bracket>
    `;
    const bracket = main.querySelector('#bracket-view');
    if (bracket) bracket.data = bracketMatches;
  }

  if (finished.length > 0) {
    const teamPlayers = [];
    for (const team of teams) {
      const players = await PlayerDB.getByTeam(team.id);
      teamPlayers.push(...players.map(p => ({ ...p, teamName: team.name })));
    }

    setTimeout(() => {
      const ranking = main.querySelector('#rank-anotadores');
      if (ranking) ranking.data = teamPlayers;

      const chartResults = main.querySelector('#chart-results');
      if (chartResults) chartResults.renderChart(getResultDistributionChart(teams));

      const chartTopPf = main.querySelector('#chart-top-pf');
      if (chartTopPf) chartTopPf.renderChart(getTopScorersChart(teamPlayers, 10, sport.terms.eventNamePlural));

      const chartEvo = main.querySelector('#chart-evolution');
      const evoConfig = getPointsByDateChart(allMatches, teams);
      if (chartEvo) chartEvo.renderChart(evoConfig);
    }, 50);
  }

  showLoading(false);
}
