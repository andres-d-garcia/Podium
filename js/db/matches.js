const MatchDB = {
  async getAll() {
    return getAll('matches');
  },

  async getById(id) {
    return getById('matches', id);
  },

  async getByLeague(leagueId) {
    return getByIndex('matches', 'byLeague', leagueId);
  },

  async getByStatus(leagueId, status) {
    const all = await getByIndex('matches', 'byLeague', leagueId);
    return all.filter(m => m.status === status);
  },

  async getByTeam(teamId) {
    const all = await getAll('matches');
    return all.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId);
  },

  async create(data) {
    const match = {
      leagueId: data.leagueId,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      date: data.date,
      status: 'scheduled',
      homeScore: 0,
      awayScore: 0,
      round: data.round || 1,
      nextMatchId: data.nextMatchId || null,
      nextSlot: data.nextSlot || null,
      winnerId: null,
      createdAt: new Date().toISOString(),
    };
    return addItem('matches', match);
  },

  async update(id, data) {
    const match = await getById('matches', id);
    if (!match) throw new Error('Partido no encontrado');
    Object.assign(match, data);
    return putItem('matches', match);
  },

  async remove(id) {
    return deleteItem('matches', id);
  },

  async generateFixture(leagueId, teams, rounds = 1) {
    const matches = [];
    const n = teams.length;

    for (let r = 0; r < rounds; r++) {
      const isReturnLeg = r === 1;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const home = isReturnLeg ? teams[j].id : teams[i].id;
          const away = isReturnLeg ? teams[i].id : teams[j].id;
          const date = new Date();
          date.setDate(date.getDate() + matches.length + 1);
          matches.push({
            leagueId,
            homeTeamId: home,
            awayTeamId: away,
            date: date.toISOString(),
            status: 'scheduled',
            homeScore: 0,
            awayScore: 0,
            round: 1,
            nextMatchId: null,
            nextSlot: null,
            winnerId: null,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
    return matches;
  },

  async generateBracket(leagueId, teams) {
    const n = teams.length;
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const rounds = Math.log2(n);
    const totalMatches = n - 1;
    const matches = [];
    let roundSize = n / 2;

    for (let r = 0; r < rounds; r++) {
      for (let i = 0; i < roundSize; i++) {
        const matchIndex = matches.length;
        const date = new Date();
        date.setDate(date.getDate() + matchIndex + 1);

        const home = r === 0
          ? shuffled[i * 2].id
          : null;
        const away = r === 0
          ? shuffled[i * 2 + 1].id
          : null;

        const nextMatchIndex = roundSize + Math.floor(i / 2) + (r > 0 ? totalMatches - (n / Math.pow(2, r)) : 0);
        const totalCurrentRound = n / Math.pow(2, r + 1);
        const nextSlot = i % 2 === 0 ? 'home' : 'away';

        matches.push({
          leagueId,
          homeTeamId: home,
          awayTeamId: away,
          date: date.toISOString(),
          status: r === 0 ? 'scheduled' : 'pending',
          homeScore: 0,
          awayScore: 0,
          round: r + 1,
          nextMatchId: null,
          nextSlot: null,
          winnerId: null,
          createdAt: new Date().toISOString(),
        });
      }
      roundSize /= 2;
    }

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const totalCurrentRound = n / Math.pow(2, match.round);
      const roundOffset = matches.filter(m => m.round === match.round).indexOf(match);
      if (match.round < rounds) {
        const nextRoundStart = matches.findIndex(m => m.round === match.round + 1);
        match.nextMatchId = null;
        match.nextSlot = roundOffset % 2 === 0 ? 'home' : 'away';
        if (nextRoundStart >= 0) {
          match.nextMatchId = matches[nextRoundStart + Math.floor(roundOffset / 2)]?.id || null;
        }
      }
    }

    return matches;
  },
};
