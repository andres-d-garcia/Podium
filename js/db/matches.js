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
      bracket: data.bracket || 'winners',
      nextMatchId: data.nextMatchId || null,
      nextSlot: data.nextSlot || null,
      loserMatchId: data.loserMatchId || null,
      loserSlot: data.loserSlot || null,
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
    let roundSize = n / 2;
    const matchRows = [];

    for (let r = 0; r < rounds; r++) {
      const row = [];
      for (let i = 0; i < roundSize; i++) {
        const home = r === 0 ? shuffled[i * 2].id : null;
        const away = r === 0 ? shuffled[i * 2 + 1].id : null;
        const date = new Date();
        date.setDate(date.getDate() + matchRows.flat().length + 1);
        const id = await addItem('matches', {
          leagueId,
          homeTeamId: home,
          awayTeamId: away,
          date: date.toISOString(),
          status: r === 0 ? 'scheduled' : 'pending',
          homeScore: 0,
          awayScore: 0,
          round: r + 1,
          bracket: 'winners',
          nextMatchId: null,
          nextSlot: i % 2 === 0 ? 'home' : 'away',
          loserMatchId: null,
          loserSlot: null,
          winnerId: null,
          createdAt: new Date().toISOString(),
        });
        row.push(id);
      }
      matchRows.push(row);
      roundSize /= 2;
    }

    for (let r = 0; r < matchRows.length - 1; r++) {
      for (let i = 0; i < matchRows[r].length; i++) {
        const matchId = matchRows[r][i];
        const nextRowIndex = Math.floor(i / 2);
        const nextMatchId = matchRows[r + 1][nextRowIndex];
        const match = await getById('matches', matchId);
        match.nextMatchId = nextMatchId;
        await putItem('matches', match);
      }
    }

    return matchRows.flat();
  },

  async generateDoubleBracket(leagueId, teams) {
    const n = teams.length;
    const k = Math.log2(n);
    const shuffled = [...teams].sort(() => Math.random() - 0.5);

    const wbRows = [];
    let size = n / 2;

    for (let r = 0; r < k; r++) {
      const row = [];
      for (let i = 0; i < size; i++) {
        const home = r === 0 ? shuffled[i * 2].id : null;
        const away = r === 0 ? shuffled[i * 2 + 1].id : null;
        const id = await addItem('matches', {
          leagueId,
          homeTeamId: home,
          awayTeamId: away,
          date: new Date(Date.now() + (wbRows.flat().length + 1) * 86400000).toISOString(),
          status: r === 0 ? 'scheduled' : 'pending',
          homeScore: 0,
          awayScore: 0,
          round: r + 1,
          bracket: 'winners',
          nextMatchId: null,
          nextSlot: i % 2 === 0 ? 'home' : 'away',
          loserMatchId: null,
          loserSlot: null,
          winnerId: null,
          createdAt: new Date().toISOString(),
        });
        row.push(id);
      }
      wbRows.push(row);
      size /= 2;
    }

    const lbMatchCounts = [];
    let lbRound = 0;
    let remaining = n / 4;
    while (remaining >= 1) {
      lbMatchCounts.push(remaining);
      lbRound++;
      if (lbRound % 2 === 0) remaining /= 2;
    }

    const lbRows = [];
    let offset = 0;
    for (let r = 0; r < lbMatchCounts.length; r++) {
      const cnt = lbMatchCounts[r];
      const row = [];
      for (let i = 0; i < cnt; i++) {
        const id = await addItem('matches', {
          leagueId,
          homeTeamId: null,
          awayTeamId: null,
          date: new Date(Date.now() + (wbRows.flat().length + lbRows.flat().length + 2) * 86400000).toISOString(),
          status: 'pending',
          homeScore: 0,
          awayScore: 0,
          round: r + 1,
          bracket: 'losers',
          nextMatchId: null,
          nextSlot: null,
          loserMatchId: null,
          loserSlot: null,
          winnerId: null,
          createdAt: new Date().toISOString(),
        });
        row.push(id);
      }
      lbRows.push(row);
      offset += cnt;
    }

    const gfId = await addItem('matches', {
      leagueId,
      homeTeamId: null,
      awayTeamId: null,
      date: new Date(Date.now() + (wbRows.flat().length + lbRows.flat().length + 3) * 86400000).toISOString(),
      status: 'pending',
      homeScore: 0,
      awayScore: 0,
      round: 1,
      bracket: 'grand_final',
      nextMatchId: null,
      nextSlot: null,
      loserMatchId: null,
      loserSlot: null,
      winnerId: null,
      createdAt: new Date().toISOString(),
    });

    for (let i = 0; i < wbRows[0].length; i++) {
      const match = await getById('matches', wbRows[0][i]);
      const lbRowIndex = Math.floor(i / 2);
      match.loserMatchId = lbRows[0][lbRowIndex];
      match.loserSlot = i % 2 === 0 ? 'home' : 'away';
      await putItem('matches', match);
    }

    for (let r = 0; r < wbRows.length - 1; r++) {
      for (let i = 0; i < wbRows[r].length; i++) {
        const match = await getById('matches', wbRows[r][i]);
        const nextRowIndex = Math.floor(i / 2);
        match.nextMatchId = wbRows[r + 1][nextRowIndex];
        await putItem('matches', match);
      }
    }

    const wbFinalId = wbRows[k - 1][0];
    const wbFinal = await getById('matches', wbFinalId);
    wbFinal.nextMatchId = gfId;
    wbFinal.nextSlot = 'home';
    const lastLbRow = lbRows[lbRows.length - 1];
    wbFinal.loserMatchId = lastLbRow[0];
    wbFinal.loserSlot = 'away';
    await putItem('matches', wbFinal);

    for (let r = 0; r < lbRows.length - 1; r++) {
      for (let i = 0; i < lbRows[r].length; i++) {
        const match = await getById('matches', lbRows[r][i]);
        const nextRowIndex = lbRows[r].length === lbRows[r + 1].length ? i : Math.floor(i / 2);
        if (lbRows[r + 1] && lbRows[r + 1][nextRowIndex] !== undefined) {
          match.nextMatchId = lbRows[r + 1][nextRowIndex];
          match.nextSlot = i % 2 === 0 ? 'home' : 'away';
          await putItem('matches', match);
        }
      }
    }

    for (let r = 0; r < wbRows.length - 1; r++) {
      const wbRow = wbRows[r];
      const lbIdx = r === 0 ? 0 : r * 2 - 1;
      if (lbIdx < lbRows.length) {
        for (let i = 0; i < wbRow.length; i++) {
          const match = await getById('matches', wbRow[i]);
          const loserNextIdx = r === 0 ? Math.floor(i / 2) : i;
          if (lbRows[lbIdx] && lbRows[lbIdx][loserNextIdx] !== undefined) {
            match.loserMatchId = lbRows[lbIdx][loserNextIdx];
            match.loserSlot = i % 2 === 0 ? 'home' : 'away';
            await putItem('matches', match);
          }
        }
      }
    }

    const lbFinalId = lbRows[lbRows.length - 1][0];
    const lbFinal = await getById('matches', lbFinalId);
    lbFinal.nextMatchId = gfId;
    lbFinal.nextSlot = 'away';
    await putItem('matches', lbFinal);

    return [...wbRows.flat(), ...lbRows.flat(), gfId];
  },
};
