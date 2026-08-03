async function renderMatchDetail(main, params) {
  showLoading(true);
  const match = await MatchDB.getById(Number(params.id));
  if (!match) {
    main.innerHTML = `<div class="empty-state"><h3>Partido no encontrado</h3></div>`;
    showLoading(false);
    return;
  }

  const league = await getActiveLeague();
  const sport = getLeagueSport(league);
  const home = await TeamDB.getById(match.homeTeamId);
  const away = await TeamDB.getById(match.awayTeamId);
  const events = await EventDB.getByMatch(match.id);
  const homePlayers = home ? await PlayerDB.getByTeam(home.id) : [];
  const awayPlayers = away ? await PlayerDB.getByTeam(away.id) : [];
  let homeEvents = events.filter(e => e.teamId === match.homeTeamId);
  let awayEvents = events.filter(e => e.teamId === match.awayTeamId);
  const date = new Date(match.date).toLocaleString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const structure = sport.matchStructure || 'single';
  const autoScore = structure === 'events';
  const manualInputs = !autoScore;
  const showEvents = sport.eventsEnabled !== false;
  const allowDraw = sport.allowDraw !== false;
  const isSets = structure === 'sets';
  const maxSets = sport.maxSets || 5;
  const setsToWin = sport.setsToWin || 3;

  function renderEvents() {
    const homeCol = main.querySelector('#ev-home');
    const awayCol = main.querySelector('#ev-away');
    if (!homeCol || !awayCol) return;

    homeEvents = events.filter(e => e.teamId === match.homeTeamId);
    awayEvents = events.filter(e => e.teamId === match.awayTeamId);
    const he = homeEvents;
    const ae = awayEvents;

    const renderEventList = (evts, container) => {
      container.innerHTML = evts.map(ev => {
        const player = [...homePlayers, ...awayPlayers].find(p => p.id === ev.playerId);
        return `<div class="event-item">
          <span>${escapeHtml(player?.name) || '???'}</span>
          <span class="event-badge">${escapeHtml(ev.type) || escapeHtml(sport.terms.eventName)}</span>
          <span class="event-minute">${ev.minute ? `min ${ev.minute}` : ''}</span>
        </div>`;
      }).join('') || '<p style="color:var(--text-muted);font-size:0.85rem">Sin eventos</p>';
    };

    renderEventList(he, homeCol);
    renderEventList(ae, awayCol);

    if (autoScore) {
      const homeScoreEl = main.querySelector('#score-home');
      const awayScoreEl = main.querySelector('#score-away');
      if (homeScoreEl) homeScoreEl.textContent = he.length;
      if (awayScoreEl) awayScoreEl.textContent = ae.length;
    }
  }

  main.innerHTML = `
    <a href="#" class="btn-back" onclick="event.preventDefault(); router.navigate('matches')">← Volver a partidos</a>

    <div style="text-align:center;margin-bottom:2rem">
      <div class="match-score-display">
        <div class="msd-team">
          <div class="team-badge" style="background:${safeColor(home?.primaryColor)}">${escapeHtml(home?.name)?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'}</div>
          <div class="msd-name">${escapeHtml(home?.name) || '???'}</div>
        </div>
        <div class="msd-score">
          ${match.status === 'finished'
            ? `${sport.terms.scoreLabel ? sport.terms.scoreLabel + ' ' : ''}${match.homeScore} - ${match.awayScore}`
            : '<span class="msd-vs">VS</span>'
          }
        </div>
        <div class="msd-team">
          <div class="team-badge" style="background:${safeColor(away?.primaryColor)}">${escapeHtml(away?.name)?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'}</div>
          <div class="msd-name">${escapeHtml(away?.name) || '???'}</div>
        </div>
      </div>
      <p style="color:var(--text-secondary);font-size:0.9rem">${date} · <span class="match-status ${match.status}">${match.status === 'finished' ? 'Finalizado' : match.status === 'scheduled' ? 'Programado' : 'Pendiente'}</span>${match.bracket && match.bracket !== 'winners' ? ` · ${match.bracket === 'losers' ? 'Losers Bracket' : 'Gran Final'} R${match.round}` : ''}</p>
    </div>

    ${match.status !== 'finished' ? `
    <div id="event-section">

      ${manualInputs ? `
      <div style="display:flex;gap:1rem;justify-content:center;align-items:center;margin-bottom:0.5rem">
        <div style="text-align:center">
          <label style="display:block;font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.25rem">${escapeHtml(home?.name) || 'Local'}</label>
          <input type="number" id="score-input-home" value="${match.homeScore}" min="0" ${isSets ? `max="${maxSets}"` : ''} style="width:60px;text-align:center;font-size:1.5rem;font-weight:800;font-family:var(--font-mono);padding:0.25rem;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-card);color:var(--text-primary)">
        </div>
        <span style="font-size:1.5rem;font-weight:800;color:var(--text-secondary)">-</span>
        <div style="text-align:center">
          <label style="display:block;font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.25rem">${escapeHtml(away?.name) || 'Visitante'}</label>
          <input type="number" id="score-input-away" value="${match.awayScore}" min="0" ${isSets ? `max="${maxSets}"` : ''} style="width:60px;text-align:center;font-size:1.5rem;font-weight:800;font-family:var(--font-mono);padding:0.25rem;border:1px solid var(--border-color);border-radius:var(--radius);background:var(--bg-card);color:var(--text-primary)">
        </div>
      </div>
      ${isSets ? `<p style="text-align:center;color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem">Al mejor de ${maxSets} ${sport.terms.scoreLabel || 'sets'}: gana quien llegue a ${setsToWin}</p>` : ''}
      ` : ''}

      ${showEvents ? `
      <podium-event-form id="event-form"></podium-event-form>
      <div class="event-columns">
        <div class="event-column">
          <h4>${escapeHtml(home?.name) || 'Local'} ${autoScore ? `<span id="score-home" style="color:var(--accent)">${homeEvents.length}</span>` : `<span style="color:var(--text-muted);font-size:0.8rem">${escapeHtml(sport.terms.eventNamePlural)}</span>`}</h4>
          <div id="ev-home"></div>
        </div>
        <div class="event-column">
          <h4>${escapeHtml(away?.name) || 'Visitante'} ${autoScore ? `<span id="score-away" style="color:var(--accent)">${awayEvents.length}</span>` : `<span style="color:var(--text-muted);font-size:0.8rem">${escapeHtml(sport.terms.eventNamePlural)}</span>`}</h4>
          <div id="ev-away"></div>
        </div>
      </div>
      ` : ''}

      <div style="display:flex;gap:0.75rem;justify-content:center;margin-top:1rem">
        <button class="btn btn-primary" id="btn-finish">Finalizar partido</button>
      </div>
    </div>
    ` : `
    <div style="text-align:center">
      <button class="btn btn-danger" id="btn-undo">Deshacer partido</button>
    </div>
    `}
  `;

  if (match.status !== 'finished') {
    if (showEvents) {
      const eventForm = main.querySelector('#event-form');
      if (eventForm) {
        eventForm.data = { match, homeTeam: home, awayTeam: away, homePlayers, awayPlayers, sport };
        eventForm.onAdd = async (data) => {
          if (!data.playerId || !data.teamId) return;
          await EventDB.create({
            matchId: match.id,
            playerId: data.playerId,
            teamId: data.teamId,
            type: data.type || null,
            minute: data.minute || null,
          });
          const updatedEvents = await EventDB.getByMatch(match.id);
          events.length = 0;
          events.push(...updatedEvents);

          if (autoScore) {
            match.homeScore = events.filter(e => e.teamId === match.homeTeamId).length;
            match.awayScore = events.filter(e => e.teamId === match.awayTeamId).length;
            await MatchDB.update(match.id, { homeScore: match.homeScore, awayScore: match.awayScore });
          }

          renderEvents();
          showToast(`${sport.terms.eventName} registrada`, 'success');
        };
        renderEvents();
      }
    }

    main.querySelector('#btn-finish').onclick = async () => {
      if (manualInputs) {
        const homeScore = Number(main.querySelector('#score-input-home').value) || 0;
        const awayScore = Number(main.querySelector('#score-input-away').value) || 0;
        match.homeScore = homeScore;
        match.awayScore = awayScore;
      }

      const noDraw = !allowDraw || league.mode === 'eliminacion';
      if (noDraw && match.homeScore === match.awayScore) {
        showToast('Debes declarar un ganador: el marcador no puede quedar empatado', 'error');
        return;
      }

      if (isSets && match.homeScore !== match.awayScore) {
        const winnerSets = Math.max(match.homeScore, match.awayScore);
        const loserSets = Math.min(match.homeScore, match.awayScore);
        if (winnerSets !== setsToWin || loserSets >= setsToWin || winnerSets > maxSets || loserSets > maxSets) {
          showToast(`Marcador inválido: se gana al llegar a ${setsToWin} de ${maxSets} ${sport.terms.scoreLabel || 'sets'}`, 'error');
          return;
        }
      }

      try {
        if (manualInputs) {
          await MatchDB.update(match.id, { homeScore: match.homeScore, awayScore: match.awayScore });
        }
        await finalizarPartido(match.id);
        showToast('Partido finalizado', 'success');
        renderMatchDetail(main, params);
      } catch (e) {
        showToast(e.message, 'error');
      }
    };
  } else {
    main.querySelector('#btn-undo').onclick = async () => {
      const confirmed = await confirmAction('¿Deshacer este partido? Las estadísticas volverán al estado anterior.');
      if (!confirmed) return;
      try {
        await deshacerPartido(match.id);
        showToast('Partido deshecho', 'success');
        renderMatchDetail(main, params);
      } catch (e) {
        showToast(e.message, 'error');
      }
    };
  }

  showLoading(false);
}
