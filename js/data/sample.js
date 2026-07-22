const SAMPLE_DATA = [
  {
    league: {
      name: 'VCT 2026 — Split 1',
      sport: 'valorant',
      mode: 'liga',
      season: '2026-I',
      description: 'Liga de Valorant con 6 equipos',
      rounds: 1,
      bracketSize: null,
      isActive: '0',
    },
    teams: [
      { name: 'Sentinels', color: '#e81038', players: ['TenZ', 'zekken', 'pancakes', 'nAts', 'johnqt'] },
      { name: 'LOUD', color: '#00ff00', players: ['aspas', 'tuyz', 'cauanzin', 'pANcada', 'Less'] },
      { name: 'FNATIC', color: '#ff6a00', players: ['Derke', 'Boaster', 'Chronicle', 'Alfajer', 'Leo'] },
      { name: 'Cloud9', color: '#0077ff', players: ['yay', 'vanity', 'xeppaa', 'jakee', 'leaf'] },
      { name: 'DRX', color: '#8b00ff', players: ['MaKo', 'Foxy9', 'BuZz', 'stax', 'Rb'] },
      { name: 'Paper Rex', color: '#ff69b4', players: ['f0rsakeN', 'mindfreak', 'something', 'd4v41', 'jinggg'] },
    ],
  },
  {
    league: {
      name: 'VCT Masters Santiago',
      sport: 'valorant',
      mode: 'eliminacion',
      season: '2026',
      description: 'Torneo internacional — 8 equipos en bracket',
      rounds: null,
      bracketSize: 8,
      isActive: '0',
    },
    teams: [
      { name: 'Sentinels', color: '#e81038', players: ['TenZ', 'zekken', 'pancakes', 'nAts', 'johnqt'] },
      { name: 'LOUD', color: '#00ff00', players: ['aspas', 'tuyz', 'cauanzin', 'pANcada', 'Less'] },
      { name: 'FNATIC', color: '#ff6a00', players: ['Derke', 'Boaster', 'Chronicle', 'Alfajer', 'Leo'] },
      { name: 'Cloud9', color: '#0077ff', players: ['yay', 'vanity', 'xeppaa', 'jakee', 'leaf'] },
      { name: 'DRX', color: '#8b00ff', players: ['MaKo', 'Foxy9', 'BuZz', 'stax', 'Rb'] },
      { name: 'Paper Rex', color: '#ff69b4', players: ['f0rsakeN', 'mindfreak', 'something', 'd4v41', 'jinggg'] },
      { name: 'KRÜ Esports', color: '#ffcc00', players: ['keznit', 'Melser', 'Shyy', 'heat', 'mta'] },
      { name: 'Leviatán', color: '#00ddff', players: ['kiNgg', 'tex', 'rozzi', 'Mazino', 'spyro'] },
    ],
  },
  {
    league: {
      name: 'EVO 2026',
      sport: 'fighting',
      mode: 'eliminacion',
      season: '2026',
      description: 'Torneo de fighting games — 4 jugadores',
      rounds: null,
      bracketSize: 4,
      isActive: '0',
    },
    teams: [
      { name: 'Punk', color: '#ff4444', players: ['Punk Player'] },
      { name: 'Tokido', color: '#4444ff', players: ['Tokido Player'] },
      { name: 'Daigo', color: '#44ff44', players: ['Daigo Player'] },
      { name: 'SonicFox', color: '#ff44ff', players: ['SonicFox Player'] },
    ],
  },
  {
    league: {
      name: 'LCS 2026',
      sport: 'lol',
      mode: 'liga',
      season: 'Summer 2026',
      description: 'Liga de League of Legends — ida y vuelta',
      rounds: 2,
      bracketSize: null,
      isActive: '0',
    },
    teams: [
      { name: 'T1', color: '#e81038', players: ['Faker', 'Gumayusi', 'Keria', 'Oner', 'Zeus'] },
      { name: 'G2 Esports', color: '#aa0000', players: ['Caps', 'Hans Sama', 'Mikyx', 'BrokenBlade', 'Yike'] },
      { name: 'Dplus KIA', color: '#0055ff', players: ['ShowMaker', 'Aiming', 'Kellin', 'Canna', 'Lucid'] },
      { name: 'JD Gaming', color: '#ff0000', players: ['Knight', 'Ruler', 'Missing', 'Kanavi', '369'] },
      { name: 'Fnatic', color: '#ff8800', players: ['Rekkles', 'Humanoid', 'Razork', 'Oscar', 'Jun'] },
      { name: 'Cloud9', color: '#0077ff', players: ['Berserker', 'Vulcan', 'Blaber', 'Fudge', 'Jojo'] },
    ],
  },
];

async function loadSampleData() {
  for (const group of SAMPLE_DATA) {
    const existing = await LeagueDB.getAll();
    const alreadyExists = existing.some(l => l.name === group.league.name);
    if (alreadyExists) continue;

    const leagueId = await LeagueDB.create(group.league);
    const teamIds = [];

    for (const tData of group.teams) {
      const teamId = await TeamDB.create({
        name: tData.name,
        leagueId,
        primaryColor: tData.color,
        secondaryColor: darkenColor(tData.color),
        city: '',
      });
      teamIds.push(teamId);

      for (let i = 0; i < tData.players.length; i++) {
        await PlayerDB.create({
          name: tData.players[i],
          position: getRandomPosition(group.league.sport),
          number: i + 1,
          teamId,
        });
      }
    }

    const teams = await TeamDB.getByLeague(leagueId);
    if (group.league.mode === 'liga' && teams.length >= 2) {
      const fixture = await MatchDB.generateFixture(leagueId, teams, group.league.rounds || 1);
      for (const match of fixture) {
        await addItem('matches', match);
      }
    } else if (group.league.mode === 'eliminacion') {
      if (teams.length === (group.league.bracketSize || 4)) {
        await MatchDB.generateBracket(leagueId, teams);
      }
    }
  }
}

function darkenColor(hex) {
  const c = hex.replace('#', '');
  const r = Math.max(0, parseInt(c.slice(0, 2), 16) - 40);
  const g = Math.max(0, parseInt(c.slice(2, 4), 16) - 40);
  const b = Math.max(0, parseInt(c.slice(4, 6), 16) - 40);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function randomColor() {
  const colors = ['#ff4655', '#c8aa6e', '#4ade80', '#60a5fa', '#fbbf24', '#a855f7', '#ec4899', '#14b8a6'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomPosition(sport) {
  const positions = SPORTS[sport]?.positions || [];
  return positions[Math.floor(Math.random() * positions.length)] || 'Jugador';
}
