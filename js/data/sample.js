const SAMPLE_DATA = {
  leagues: [
    {
      name: 'VCT 2026 — Split 1',
      sport: 'valorant',
      mode: 'liga',
      season: '2026-I',
      description: 'Liga de Valorant de prueba',
      rounds: 1,
      bracketSize: null,
      isActive: false,
    },
    {
      name: 'EVO 2026',
      sport: 'fighting',
      mode: 'eliminacion',
      season: '2026',
      description: 'Torneo de fighting games',
      rounds: null,
      bracketSize: 4,
      isActive: false,
    },
    {
      name: 'LCS 2026',
      sport: 'lol',
      mode: 'liga',
      season: 'Summer 2026',
      description: 'Liga de League of Legends',
      rounds: 2,
      bracketSize: null,
      isActive: false,
    },
  ],
  teamNames: {
    valorant: ['Sentinels', 'LOUD', 'FNATIC', 'Cloud9', 'DRX', 'Paper Rex'],
    fighting: ['Punk', 'Tokido', 'Daigo', 'SonicFox'],
    lol: ['T1', 'G2 Esports', 'Dplus KIA', 'JD Gaming', 'Fnatic', 'Cloud9'],
  },
  playerNames: [
    'TenZ', 'Aspas', 'Derke', 'yay', 'Sacy', 'Less',
    'Tokido', 'Daigo', 'Punk', 'SonicFox', 'MenaRD', 'Problem X',
    'Faker', 'Caps', 'ShowMaker', 'Knight', 'Uzi', 'Rekkles',
  ],
};

async function loadSampleData() {
  const existing = await LeagueDB.getAll();
  if (existing.length > 0) return;

  for (const leagueData of SAMPLE_DATA.leagues) {
    const leagueId = await LeagueDB.create(leagueData);
    const sport = leagueData.sport;
    const names = SAMPLE_DATA.teamNames[sport];
    const teamIds = [];

    for (const teamName of names) {
      const teamId = await TeamDB.create({
        name: teamName,
        leagueId,
        primaryColor: randomColor(),
        secondaryColor: randomColor(),
        city: '',
      });
      teamIds.push(teamId);

      const numPlayers = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numPlayers; i++) {
        await PlayerDB.create({
          name: SAMPLE_DATA.playerNames[Math.floor(Math.random() * SAMPLE_DATA.playerNames.length)],
          position: getRandomPosition(sport),
          number: i + 1,
          teamId,
        });
      }
    }

    if (leagueData.mode === 'liga') {
      const teams = await TeamDB.getByLeague(leagueId);
      const fixture = await MatchDB.generateFixture(leagueId, teams, leagueData.rounds || 1);
      for (const match of fixture) {
        await addItem('matches', match);
      }
    } else if (leagueData.mode === 'eliminacion') {
      const teams = await TeamDB.getByLeague(leagueId);
      const bracket = await MatchDB.generateBracket(leagueId, teams);
      for (const match of bracket) {
        await addItem('matches', match);
      }
    }
  }
}

function randomColor() {
  const colors = ['#ff4655', '#c8aa6e', '#4ade80', '#60a5fa', '#fbbf24', '#a855f7', '#ec4899', '#14b8a6'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomPosition(sport) {
  const positions = SPORTS[sport]?.positions || [];
  return positions[Math.floor(Math.random() * positions.length)] || 'Jugador';
}
