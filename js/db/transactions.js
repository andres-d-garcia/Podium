async function finalizarPartido(matchId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['matches', 'teams', 'players', 'events'], 'readwrite');
    const matchStore = tx.objectStore('matches');
    const teamStore = tx.objectStore('teams');
    const playerStore = tx.objectStore('players');
    const eventStore = tx.objectStore('events');

    const matchReq = matchStore.get(matchId);
    matchReq.onsuccess = () => {
      const match = matchReq.result;
      if (!match || match.status === 'finished') {
        reject(new Error('Partido no disponible o ya finalizado'));
        return;
      }

      const homeScore = match.homeScore || 0;
      const awayScore = match.awayScore || 0;
      let homePts = 0, awayPts = 0;
      if (homeScore > awayScore) { homePts = 3; awayPts = 0; }
      else if (homeScore < awayScore) { homePts = 0; awayPts = 3; }
      else { homePts = 1; awayPts = 1; }

      const winnerId = homeScore > awayScore ? match.homeTeamId :
                        awayScore > homeScore ? match.awayTeamId : null;

      match.status = 'finished';
      match.winnerId = winnerId;
      matchStore.put(match);

      const homeReq = teamStore.get(match.homeTeamId);
      homeReq.onsuccess = () => {
        const home = homeReq.result;
        if (home) {
          home.stats.pj++;
          home.stats.pg += homePts === 3 ? 1 : 0;
          home.stats.pe += homePts === 1 ? 1 : 0;
          home.stats.pp += homePts === 0 ? 1 : 0;
          home.stats.pf += homeScore;
          home.stats.pc += awayScore;
          home.stats.dif = home.stats.pf - home.stats.pc;
          home.stats.pts += homePts;
          teamStore.put(home);
        }
      };

      const awayReq = teamStore.get(match.awayTeamId);
      awayReq.onsuccess = () => {
        const away = awayReq.result;
        if (away) {
          away.stats.pj++;
          away.stats.pg += awayPts === 3 ? 1 : 0;
          away.stats.pe += awayPts === 1 ? 1 : 0;
          away.stats.pp += awayPts === 0 ? 1 : 0;
          away.stats.pf += awayScore;
          away.stats.pc += homeScore;
          away.stats.dif = away.stats.pf - away.stats.pc;
          away.stats.pts += awayPts;
          teamStore.put(away);
        }
      };

      const eventReq = eventStore.index('byMatch').getAll(matchId);
      eventReq.onsuccess = () => {
        const events = eventReq.result || [];
        const processedPlayers = new Set();
        for (const evt of events) {
          if (!processedPlayers.has(evt.playerId)) {
            processedPlayers.add(evt.playerId);
            const playerReq = playerStore.get(evt.playerId);
            playerReq.onsuccess = () => {
              if (playerReq.result) {
                const player = playerReq.result;
                player.stats.pj++;
                player.stats.anotaciones = (player.stats.anotaciones || 0) + 1;
                player.stats.promedio = player.stats.anotaciones / player.stats.pj;
                playerStore.put(player);
              }
            };
          } else {
            const playerReq = playerStore.get(evt.playerId);
            playerReq.onsuccess = () => {
              if (playerReq.result) {
                const player = playerReq.result;
                player.stats.anotaciones = (player.stats.anotaciones || 0) + 1;
                player.stats.promedio = player.stats.anotaciones / (player.stats.pj || 1);
                playerStore.put(player);
              }
            };
          }
        }
      };

      if (match.nextMatchId) {
        const nextReq = matchStore.get(match.nextMatchId);
        nextReq.onsuccess = () => {
          const next = nextReq.result;
          if (next) {
            if (match.nextSlot === 'home') next.homeTeamId = winnerId;
            else next.awayTeamId = winnerId;
            if (next.homeTeamId && next.awayTeamId) next.status = 'scheduled';
            matchStore.put(next);
          }
        };
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(tx.error || e);
  });
}

async function deshacerPartido(matchId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['matches', 'teams', 'players', 'events'], 'readwrite');
    const matchStore = tx.objectStore('matches');
    const teamStore = tx.objectStore('teams');
    const playerStore = tx.objectStore('players');
    const eventStore = tx.objectStore('events');

    const matchReq = matchStore.get(matchId);
    matchReq.onsuccess = () => {
      const match = matchReq.result;
      if (!match || match.status !== 'finished') {
        reject(new Error('Partido no está finalizado'));
        return;
      }

      if (match.nextMatchId) {
        const nextReq = matchStore.get(match.nextMatchId);
        nextReq.onsuccess = () => {
          const next = nextReq.result;
          if (next && next.status === 'finished') {
            reject(new Error('No se puede deshacer: el partido de la siguiente ronda ya está finalizado. Deshace ese primero.'));
            return;
          }
          undoMatch(match, matchStore, teamStore, playerStore, eventStore, next);
        };
      } else {
        undoMatch(match, matchStore, teamStore, playerStore, eventStore, null);
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(tx.error || e);
  });
}

function undoMatch(match, matchStore, teamStore, playerStore, eventStore, nextMatch) {
  const homeScore = match.homeScore || 0;
  const awayScore = match.awayScore || 0;
  let homePts = 0, awayPts = 0;
  if (homeScore > awayScore) { homePts = 3; awayPts = 0; }
  else if (homeScore < awayScore) { homePts = 0; awayPts = 3; }
  else { homePts = 1; awayPts = 1; }

  match.status = 'scheduled';
  match.homeScore = 0;
  match.awayScore = 0;
  match.winnerId = null;
  matchStore.put(match);

  const homeReq = teamStore.get(match.homeTeamId);
  homeReq.onsuccess = () => {
    const home = homeReq.result;
    if (home) {
      home.stats.pj--;
      home.stats.pg -= homePts === 3 ? 1 : 0;
      home.stats.pe -= homePts === 1 ? 1 : 0;
      home.stats.pp -= homePts === 0 ? 1 : 0;
      home.stats.pf -= homeScore;
      home.stats.pc -= awayScore;
      home.stats.dif = home.stats.pf - home.stats.pc;
      home.stats.pts -= homePts;
      teamStore.put(home);
    }
  };

  const awayReq = teamStore.get(match.awayTeamId);
  awayReq.onsuccess = () => {
    const away = awayReq.result;
    if (away) {
      away.stats.pj--;
      away.stats.pg -= awayPts === 3 ? 1 : 0;
      away.stats.pe -= awayPts === 1 ? 1 : 0;
      away.stats.pp -= awayPts === 0 ? 1 : 0;
      away.stats.pf -= awayScore;
      away.stats.pc -= homeScore;
      away.stats.dif = away.stats.pf - away.stats.pc;
      away.stats.pts -= awayPts;
      teamStore.put(away);
    }
  };

  const eventReq = eventStore.index('byMatch').getAll(match.id);
  eventReq.onsuccess = () => {
    const events = eventReq.result || [];
    const processedPlayers = new Set();
    for (const evt of events) {
      if (!processedPlayers.has(evt.playerId)) {
        processedPlayers.add(evt.playerId);
        const playerReq = playerStore.get(evt.playerId);
        playerReq.onsuccess = () => {
          if (playerReq.result) {
            const player = playerReq.result;
            player.stats.pj = Math.max(0, (player.stats.pj || 1) - 1);
            player.stats.anotaciones = Math.max(0, (player.stats.anotaciones || 1) - 1);
            player.stats.promedio = player.stats.pj > 0 ? player.stats.anotaciones / player.stats.pj : 0;
            playerStore.put(player);
          }
        };
      } else {
        const playerReq = playerStore.get(evt.playerId);
        playerReq.onsuccess = () => {
          if (playerReq.result) {
            const player = playerReq.result;
            player.stats.anotaciones = Math.max(0, (player.stats.anotaciones || 1) - 1);
            player.stats.promedio = player.stats.pj > 0 ? player.stats.anotaciones / player.stats.pj : 0;
            playerStore.put(player);
          }
        };
      }
    }
  };

  if (nextMatch) {
    if (match.nextSlot === 'home') nextMatch.homeTeamId = null;
    else nextMatch.awayTeamId = null;
    nextMatch.status = 'pending';
    matchStore.put(nextMatch);
  }
}

async function eliminarLigaEnCascada(leagueId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['leagues', 'teams', 'players', 'matches', 'events'], 'readwrite');
    const leagueStore = tx.objectStore('leagues');
    const teamStore = tx.objectStore('teams');
    const playerStore = tx.objectStore('players');
    const matchStore = tx.objectStore('matches');
    const eventStore = tx.objectStore('events');

    leagueStore.delete(leagueId);

    const teamReq = teamStore.index('byLeague').getAll(leagueId);
    teamReq.onsuccess = () => {
      const teams = teamReq.result || [];
      for (const team of teams) {
        const playerReq = playerStore.index('byTeam').getAll(team.id);
        playerReq.onsuccess = () => {
          const players = playerReq.result || [];
          for (const player of players) {
            playerStore.delete(player.id);
          }
        };
        teamStore.delete(team.id);
      }

      const matchReq = matchStore.index('byLeague').getAll(leagueId);
      matchReq.onsuccess = () => {
        const matches = matchReq.result || [];
        for (const match of matches) {
          const eventReq = eventStore.index('byMatch').getAll(match.id);
          eventReq.onsuccess = () => {
            const events = eventReq.result || [];
            for (const event of events) {
              eventStore.delete(event.id);
            }
          };
          matchStore.delete(match.id);
        }
      };
    };

    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(tx.error || e);
  });
}

async function importarLiga(data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['leagues', 'teams', 'players', 'matches', 'events'], 'readwrite');
    try {
      const leagueId = tx.objectStore('leagues').add(data.league).result;
      for (const team of (data.teams || [])) {
        team.leagueId = leagueId;
        tx.objectStore('teams').add(team);
      }
      for (const match of (data.matches || [])) {
        match.leagueId = leagueId;
        tx.objectStore('matches').add(match);
      }
      for (const event of (data.events || [])) {
        tx.objectStore('events').add(event);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(tx.error || e);
    } catch (e) {
      reject(e);
    }
  });
}

async function exportarLiga(leagueId) {
  const league = await LeagueDB.getById(leagueId);
  const teams = await TeamDB.getByLeague(leagueId);
  const teamIds = teams.map(t => t.id);
  const allPlayers = await PlayerDB.getAll();
  const players = allPlayers.filter(p => teamIds.includes(p.teamId));
  const matches = await MatchDB.getByLeague(leagueId);
  const matchIds = matches.map(m => m.id);
  const allEvents = await EventDB.getAll();
  const events = allEvents.filter(e => matchIds.includes(e.matchId));
  return { league, teams, players, matches, events };
}
