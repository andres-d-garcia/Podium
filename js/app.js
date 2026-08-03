document.addEventListener('DOMContentLoaded', async () => {
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js');
    }
    await openDB();
    document.querySelector('podium-footer').setAttribute('db-status', 'connected');
    initRouter();
    await loadSampleData();
    await restoreActiveLeague();
    router.start();
  } catch (e) {
    console.error('Error inicializando Podium:', e);
    document.querySelector('podium-footer').setAttribute('db-status', 'error');
    document.getElementById('app').innerHTML = `
      <div class="empty-state">
        <h3>Error de conexión</h3>
        <p>No se pudo conectar con IndexedDB: ${e.message}</p>
      </div>
    `;
  }
});

async function restoreActiveLeague() {
  const savedId = localStorage.getItem('podium-active-league');
  if (savedId) {
    const league = await LeagueDB.getById(Number(savedId));
    if (league) {
      await LeagueDB.setActive(league.id);
    }
  }
}

function initRouter() {
  router.addRoute('dashboard', renderDashboard);
  router.addRoute('leagues', renderLeagues);
  router.addRoute('teams', renderTeams);
  router.addRoute('team/:id', renderTeamDetail);
  router.addRoute('players', renderPlayers);
  router.addRoute('player/:id', renderPlayerDetail);
  router.addRoute('matches', renderMatches);
  router.addRoute('match/:id', renderMatchDetail);
  router.addRoute('stats', renderStats);
}

function getActiveLeague() {
  return LeagueDB.getActive();
}

async function refreshActiveLeagueIndicator() {
  const nav = document.querySelector('podium-navbar');
  const league = await getActiveLeague();
  if (nav) {
    if (league) {
      const sport = getLeagueSport(league);
      nav.setAttribute('league-name', league.name);
      nav.setAttribute('league-sport', sport.name);
      nav.setAttribute('league-icon', sport.icon);
      if (league.format) {
        document.body.removeAttribute('data-sport');
        const accent = league.format.color || '#ff4655';
        document.body.style.setProperty('--accent', accent);
        document.body.style.setProperty('--accent-muted', hexToRgba(accent, 0.15));
      } else {
        document.body.setAttribute('data-sport', league.sport);
        document.body.style.removeProperty('--accent');
        document.body.style.removeProperty('--accent-muted');
      }
    } else {
      nav.removeAttribute('league-name');
      nav.removeAttribute('league-sport');
      nav.removeAttribute('league-icon');
      document.body.removeAttribute('data-sport');
      document.body.style.removeProperty('--accent');
      document.body.style.removeProperty('--accent-muted');
    }
  }
}

function hexToRgba(hex, alpha) {
  const clean = String(hex || '').replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return `rgba(255,70,85,${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function showToast(message, type = 'info') {
  const toast = document.querySelector('podium-toast');
  if (toast) toast.show(message, type);
}

function showLoading(show = true) {
  const loading = document.querySelector('podium-loading');
  if (loading) loading.visible = show;
}

function confirmAction(message) {
  return new Promise((resolve) => {
    const dialog = document.querySelector('podium-confirm');
    dialog.show(message, resolve);
  });
}

function waitFor(predicate, timeout = 3000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      if (predicate()) return resolve(true);
      if (Date.now() - start > timeout) return resolve(false);
      requestAnimationFrame(check);
    };
    check();
  });
}

async function openCreateForm(type) {
  const route = { league: 'leagues', team: 'teams', player: 'players', match: 'matches' }[type];
  const current = router.currentRoute?.pattern?.split('/')[0];
  const main = document.getElementById('app');
  const modalSel = { league: '#league-modal', team: '#team-modal', player: '#player-modal', match: '#match-modal' }[type];

  if (current !== route) {
    router.navigate(route);
    await waitFor(() => main.querySelector(modalSel));
  }

  if (!main.querySelector(modalSel)) {
    showToast('Crea o activa una liga primero', 'error');
    return;
  }

  if (type === 'league') {
    showLeagueForm(main);
    return;
  }

  const league = await getActiveLeague();
  if (!league) {
    showToast('Activa una liga primero', 'error');
    return;
  }

  if (type === 'team') {
    showTeamForm(main, league);
  } else if (type === 'player') {
    const teams = await TeamDB.getByLeague(league.id);
    showPlayerForm(main, league, teams);
  } else if (type === 'match') {
    if (league.mode !== 'liga') {
      showToast('Solo se programan partidos en modalidad Liga', 'error');
      return;
    }
    const teams = await TeamDB.getByLeague(league.id);
    if (teams.length < 2) {
      showToast('Necesitas al menos 2 equipos para programar un partido', 'error');
      return;
    }
    showMatchForm(main, league, teams);
  }
}
