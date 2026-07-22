function createChartConfig(type, labels, datasets, options = {}) {
  return { type, data: { labels, datasets }, options };
}

function getResultDistributionChart(teams) {
  const total = teams.reduce((acc, t) => ({
    pg: acc.pg + (t.stats.pg || 0),
    pe: acc.pe + (t.stats.pe || 0),
    pp: acc.pp + (t.stats.pp || 0),
  }), { pg: 0, pe: 0, pp: 0 });

  return createChartConfig('doughnut',
    ['Victorias', 'Empates', 'Derrotas'],
    [{
      data: [total.pg, total.pe, total.pp],
      backgroundColor: ['#4ade80', '#fbbf24', '#ef4444'],
      borderColor: ['#14532d', '#713f12', '#450a0a'],
      borderWidth: 1,
    }],
    { plugins: { legend: { position: 'bottom' } } }
  );
}

function getTopScorersChart(players, limit = 10, label = 'Anotaciones') {
  const sorted = [...players].sort((a, b) => (b.stats.anotaciones || 0) - (a.stats.anotaciones || 0));
  const top = sorted.slice(0, limit);

  return createChartConfig('bar',
    top.map(p => p.name),
    [{
      label,
      data: top.map(p => p.stats.anotaciones || 0),
      backgroundColor: '#ff4655',
      borderRadius: 4,
    }],
    { indexAxis: 'y', plugins: { legend: { display: false } } }
  );
}

function getPointsByDateChart(matches, teams) {
  const finished = matches.filter(m => m.status === 'finished')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (finished.length === 0) return null;

  const dates = [...new Set(finished.map(m => {
    const d = new Date(m.date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }))];

  const labels = dates;

  const datasets = teams.slice(0, 5).map((team, i) => {
    const colors = ['#ff4655', '#c8aa6e', '#4ade80', '#60a5fa', '#fbbf24'];
    let pts = 0;
    const ptsByDate = dates.map(date => {
      const dayMatches = finished.filter(m => {
        const d = new Date(m.date);
        const key = `${d.getDate()}/${d.getMonth() + 1}`;
        return key === date && (m.homeTeamId === team.id || m.awayTeamId === team.id);
      });
      for (const m of dayMatches) {
        if (m.homeTeamId === team.id) {
          pts += m.homeScore > m.awayScore ? 3 : m.homeScore === m.awayScore ? 1 : 0;
        } else {
          pts += m.awayScore > m.homeScore ? 3 : m.homeScore === m.awayScore ? 1 : 0;
        }
      }
      return pts;
    });
    return { label: team.name, data: ptsByDate, borderColor: colors[i % colors.length], fill: false, tension: 0.3 };
  });

  return createChartConfig('line', labels, datasets, {
    plugins: { legend: { position: 'bottom' } }
  });
}

function getTeamPointsRadar(teams) {
  const top = [...teams].sort((a, b) => b.stats.pf - a.stats.pf).slice(0, 6);
  return createChartConfig('radar',
    top.map(t => t.name),
    [{
      label: 'Puntos a favor',
      data: top.map(t => t.stats.pf),
      borderColor: '#ff4655',
      backgroundColor: 'rgba(255,70,85,0.2)',
    }],
    { plugins: { legend: { position: 'bottom' } } }
  );
}

function getPlayerProgressionChart(events, matchDates, playerName) {
  const matchLabels = matchDates.map(d => {
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });

  const counts = matchDates.map(() => 0);
  let cumulative = 0;
  matchLabels.forEach((_, i) => {
    cumulative += events.filter(e => {
      const d = new Date(matchDates[i]);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      return true;
    }).length;
    counts[i] = cumulative;
  });

  return createChartConfig('line', matchLabels, [{
    label: playerName,
    data: counts,
    borderColor: '#ff4655',
    fill: false,
    tension: 0.3,
  }], { plugins: { legend: { position: 'bottom' } } });
}
