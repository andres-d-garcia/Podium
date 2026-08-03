async function finalizarPartido(matchId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['leagues', 'matches', 'teams', 'players', 'events'], 'readwrite');
    const leagueStore = tx.objectStore('leagues');
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

      const leagueReq = leagueStore.get(match.leagueId);
      leagueReq.onsuccess = () => {
        const league = leagueReq.result || null;
        const { homePts, awayPts, homeStatus, awayStatus, winnerId, loserId } = computeMatchResult(
          league, match.homeTeamId, match.awayTeamId, match.homeScore, match.awayScore
        );

        match.status = 'finished';
        match.winnerId = winnerId;
        matchStore.put(match);

        const homeReq = teamStore.get(match.homeTeamId);
        homeReq.onsuccess = () => {
          const home = homeReq.result;
          if (home) {
            home.stats.pj++;
            home.stats.pg += homeStatus === 'win' ? 1 : 0;
            home.stats.pe += homeStatus === 'draw' ? 1 : 0;
            home.stats.pp += homeStatus === 'loss' ? 1 : 0;
            home.stats.pf += match.homeScore;
            home.stats.pc += match.awayScore;
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
            away.stats.pg += awayStatus === 'win' ? 1 : 0;
            away.stats.pe += awayStatus === 'draw' ? 1 : 0;
            away.stats.pp += awayStatus === 'loss' ? 1 : 0;
            away.stats.pf += match.awayScore;
            away.stats.pc += match.homeScore;
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

        if (match.loserMatchId && loserId) {
          const loserReq = matchStore.get(match.loserMatchId);
          loserReq.onsuccess = () => {
            const loserMatch = loserReq.result;
            if (loserMatch) {
              if (match.loserSlot === 'home') loserMatch.homeTeamId = loserId;
              else loserMatch.awayTeamId = loserId;
              if (loserMatch.homeTeamId && loserMatch.awayTeamId) loserMatch.status = 'scheduled';
              matchStore.put(loserMatch);
            }
          };
        }
      };
    };

    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(tx.error || e);
  });
}

async function deshacerPartido(matchId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['leagues', 'matches', 'teams', 'players', 'events'], 'readwrite');
    const leagueStore = tx.objectStore('leagues');
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

      const leagueReq = leagueStore.get(match.leagueId);
      leagueReq.onsuccess = () => {
        const league = leagueReq.result || null;
        const { homePts, awayPts, homeStatus, awayStatus } = computeMatchResult(
          league, match.homeTeamId, match.awayTeamId, match.homeScore, match.awayScore
        );

        if (match.nextMatchId) {
          const nextReq = matchStore.get(match.nextMatchId);
          nextReq.onsuccess = () => {
            const next = nextReq.result;
            if (next && next.status === 'finished') {
              reject(new Error('No se puede deshacer: el partido de la siguiente ronda ya está finalizado. Deshace ese primero.'));
              return;
            }
            if (match.loserMatchId) {
              const loserReq2 = matchStore.get(match.loserMatchId);
              loserReq2.onsuccess = () => {
                const loserMatch = loserReq2.result;
                if (loserMatch && loserMatch.status === 'finished') {
                  reject(new Error('No se puede deshacer: el partido del losers bracket ya está finalizado. Deshace ese primero.'));
                  return;
                }
                undoMatch(match, matchStore, teamStore, playerStore, eventStore, next, homePts, awayPts, homeStatus, awayStatus);
              };
            } else {
              undoMatch(match, matchStore, teamStore, playerStore, eventStore, next, homePts, awayPts, homeStatus, awayStatus);
            }
          };
        } else if (match.loserMatchId) {
          const loserReq2 = matchStore.get(match.loserMatchId);
          loserReq2.onsuccess = () => {
            const loserMatch = loserReq2.result;
            if (loserMatch && loserMatch.status === 'finished') {
              reject(new Error('No se puede deshacer: el partido del losers bracket ya está finalizado. Deshace ese primero.'));
              return;
            }
            undoMatch(match, matchStore, teamStore, playerStore, eventStore, null, homePts, awayPts, homeStatus, awayStatus);
          };
        } else {
          undoMatch(match, matchStore, teamStore, playerStore, eventStore, null, homePts, awayPts, homeStatus, awayStatus);
        }
      };
    };

    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(tx.error || e);
  });
}

function undoMatch(match, matchStore, teamStore, playerStore, eventStore, nextMatch, homePts, awayPts, homeStatus, awayStatus) {
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
      home.stats.pg -= homeStatus === 'win' ? 1 : 0;
      home.stats.pe -= homeStatus === 'draw' ? 1 : 0;
      home.stats.pp -= homeStatus === 'loss' ? 1 : 0;
      home.stats.pf -= match.homeScore;
      home.stats.pc -= match.awayScore;
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
      away.stats.pg -= awayStatus === 'win' ? 1 : 0;
      away.stats.pe -= awayStatus === 'draw' ? 1 : 0;
      away.stats.pp -= awayStatus === 'loss' ? 1 : 0;
      away.stats.pf -= match.awayScore;
      away.stats.pc -= match.homeScore;
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

  if (match.loserMatchId) {
    const loserReq = matchStore.get(match.loserMatchId);
    loserReq.onsuccess = () => {
      const loserMatch = loserReq.result;
      if (loserMatch) {
        if (match.loserSlot === 'home') loserMatch.homeTeamId = null;
        else loserMatch.awayTeamId = null;
        if (!loserMatch.homeTeamId || !loserMatch.awayTeamId) loserMatch.status = 'pending';
        matchStore.put(loserMatch);
      }
    };
  }
}

async function revertMatchStats(matchId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['leagues', 'matches', 'teams', 'players', 'events'], 'readwrite');
    const leagueStore = tx.objectStore('leagues');
    const matchStore = tx.objectStore('matches');
    const teamStore = tx.objectStore('teams');
    const playerStore = tx.objectStore('players');
    const eventStore = tx.objectStore('events');

    const matchReq = matchStore.get(matchId);
    matchReq.onsuccess = () => {
      const match = matchReq.result;
      if (!match || match.status !== 'finished') {
        resolve();
        return;
      }

      const leagueReq = leagueStore.get(match.leagueId);
      leagueReq.onsuccess = () => {
        const league = leagueReq.result || null;
        const { homePts, awayPts, homeStatus, awayStatus } = computeMatchResult(
          league, match.homeTeamId, match.awayTeamId, match.homeScore, match.awayScore
        );

        const homeReq = teamStore.get(match.homeTeamId);
        homeReq.onsuccess = () => {
          const home = homeReq.result;
          if (home && home.stats) {
            home.stats.pj = Math.max(0, (home.stats.pj || 0) - 1);
            home.stats.pg = Math.max(0, (home.stats.pg || 0) - (homeStatus === 'win' ? 1 : 0));
            home.stats.pe = Math.max(0, (home.stats.pe || 0) - (homeStatus === 'draw' ? 1 : 0));
            home.stats.pp = Math.max(0, (home.stats.pp || 0) - (homeStatus === 'loss' ? 1 : 0));
            home.stats.pf = Math.max(0, (home.stats.pf || 0) - match.homeScore);
            home.stats.pc = Math.max(0, (home.stats.pc || 0) - match.awayScore);
            home.stats.dif = (home.stats.pf || 0) - (home.stats.pc || 0);
            home.stats.pts = Math.max(0, (home.stats.pts || 0) - homePts);
            teamStore.put(home);
          }
        };

        const awayReq = teamStore.get(match.awayTeamId);
        awayReq.onsuccess = () => {
          const away = awayReq.result;
          if (away && away.stats) {
            away.stats.pj = Math.max(0, (away.stats.pj || 0) - 1);
            away.stats.pg = Math.max(0, (away.stats.pg || 0) - (awayStatus === 'win' ? 1 : 0));
            away.stats.pe = Math.max(0, (away.stats.pe || 0) - (awayStatus === 'draw' ? 1 : 0));
            away.stats.pp = Math.max(0, (away.stats.pp || 0) - (awayStatus === 'loss' ? 1 : 0));
            away.stats.pf = Math.max(0, (away.stats.pf || 0) - match.awayScore);
            away.stats.pc = Math.max(0, (away.stats.pc || 0) - match.homeScore);
            away.stats.dif = (away.stats.pf || 0) - (away.stats.pc || 0);
            away.stats.pts = Math.max(0, (away.stats.pts || 0) - awayPts);
            teamStore.put(away);
          }
        };

        const eventReq = eventStore.index('byMatch').getAll(matchId);
        eventReq.onsuccess = () => {
          const events = eventReq.result || [];
          const counts = {};
          for (const evt of events) {
            counts[evt.playerId] = (counts[evt.playerId] || 0) + 1;
          }
          for (const [playerId, count] of Object.entries(counts)) {
            const playerReq = playerStore.get(Number(playerId));
            playerReq.onsuccess = () => {
              const player = playerReq.result;
              if (player && player.stats) {
                player.stats.pj = Math.max(0, (player.stats.pj || 0) - 1);
                player.stats.anotaciones = Math.max(0, (player.stats.anotaciones || 0) - count);
                player.stats.promedio = player.stats.pj > 0 ? (player.stats.anotaciones || 0) / player.stats.pj : 0;
                playerStore.put(player);
              }
            };
          }
        };
      };
    };

    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(tx.error || e);
  });
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
  const idMaps = { teams: {}, players: {}, matches: {} };

  const league = { ...data.league };
  delete league.id;
  league.isActive = '0';
  const leagueId = await addItem('leagues', league);

  for (const team of (data.teams || [])) {
    const record = { ...team };
    delete record.id;
    record.leagueId = leagueId;
    const newId = await addItem('teams', record);
    idMaps.teams[team.id] = newId;
  }

  for (const player of (data.players || [])) {
    const record = { ...player };
    delete record.id;
    if (record.teamId !== undefined) record.teamId = idMaps.teams[record.teamId];
    const newId = await addItem('players', record);
    idMaps.players[player.id] = newId;
  }

  for (const match of (data.matches || [])) {
    const record = { ...match };
    delete record.id;
    record.leagueId = leagueId;
    if (record.homeTeamId !== undefined) record.homeTeamId = idMaps.teams[record.homeTeamId] || null;
    if (record.awayTeamId !== undefined) record.awayTeamId = idMaps.teams[record.awayTeamId] || null;
    if (record.winnerId !== undefined) record.winnerId = idMaps.teams[record.winnerId] || null;
    const newId = await addItem('matches', record);
    idMaps.matches[match.id] = newId;
  }

  for (const match of (data.matches || [])) {
    if (!match.nextMatchId && !match.loserMatchId) continue;
    const record = await getById('matches', idMaps.matches[match.id]);
    if (!record) continue;
    if (match.nextMatchId) record.nextMatchId = idMaps.matches[match.nextMatchId] || null;
    if (match.loserMatchId) record.loserMatchId = idMaps.matches[match.loserMatchId] || null;
    await putItem('matches', record);
  }

  for (const event of (data.events || [])) {
    const record = { ...event };
    delete record.id;
    if (record.matchId !== undefined) record.matchId = idMaps.matches[record.matchId];
    if (record.playerId !== undefined) record.playerId = idMaps.players[record.playerId] || null;
    if (record.teamId !== undefined) record.teamId = idMaps.teams[record.teamId] || null;
    await addItem('events', record);
  }
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
