async function renderPlayers(main) {
  const league = await getActiveLeague();
  if (!league) {
    main.innerHTML = `<div class="empty-state"><h3>Sin liga activa</h3></div>`;
    return;
  }

  showLoading(true);
  const teams = await TeamDB.getByLeague(league.id);
  const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));
  const allPlayers = await PlayerDB.getByLeague(league.id);
  let filtered = [...allPlayers];

  let searchTimeout;
  const positions = [...new Set(allPlayers.map(p => p.position).filter(Boolean))];

  function renderList() {
    const container = main.querySelector('#player-list');
    container.innerHTML = '';
    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>Sin resultados</h3></div>';
      return;
    }
    for (const p of filtered) {
      const team = teamMap[p.teamId];
      const card = document.createElement('div');
      card.className = 'card player-card';
      const initials = p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      card.innerHTML = `
        <div style="text-align:center">
          <div class="player-avatar" style="margin:0 auto">${initials}</div>
          <h4 style="margin:0.5rem 0 0.25rem">${p.name}</h4>
          <p style="color:var(--text-muted);font-size:0.8rem;margin:0">
            ${team ? team.name : ''} ${p.position ? `· ${p.position}` : ''} ${p.number ? `· #${p.number}` : ''}
          </p>
          <p style="color:var(--text-secondary);font-size:0.8rem;margin:0.25rem 0 0">
            ${p.stats?.anotaciones || 0} anotaciones · ${p.stats?.pj || 0} PJ
          </p>
        </div>
      `;
      card.onclick = () => router.navigate(`player/${p.id}`);
      container.appendChild(card);
    }
  }

  function applyFilters() {
    const search = main.querySelector('#pf-search').value.toLowerCase();
    const teamFilter = main.querySelector('#pf-team').value;
    const posFilter = main.querySelector('#pf-position').value;
    filtered = allPlayers.filter(p => {
      if (search && !p.name.toLowerCase().includes(search)) return false;
      if (teamFilter && p.teamId !== Number(teamFilter)) return false;
      if (posFilter && p.position !== posFilter) return false;
      return true;
    });
    renderList();
  }

  main.innerHTML = `
    <div class="section-header">
      <div class="section-title">👤 Jugadores — ${league.name}</div>
      <button class="btn btn-primary" id="btn-create-player">+ Nuevo jugador</button>
    </div>
    <div class="filters-bar">
      <div class="form-group">
        <label>Buscar</label>
        <input type="text" id="pf-search" placeholder="Nombre...">
      </div>
      <div class="form-group">
        <label>Equipo</label>
        <select id="pf-team">
          <option value="">Todos</option>
          ${teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Posición</label>
        <select id="pf-position">
          <option value="">Todas</option>
          ${positions.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-secondary" id="pf-clear">Limpiar</button>
    </div>
    <div id="player-list" class="grid-list"></div>
    <div id="player-modal" class="modal-overlay" style="display:none"></div>
  `;

  main.querySelector('#pf-search').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilters, 350);
  });
  main.querySelector('#pf-team').onchange = applyFilters;
  main.querySelector('#pf-position').onchange = applyFilters;
  main.querySelector('#pf-clear').onclick = () => {
    main.querySelector('#pf-search').value = '';
    main.querySelector('#pf-team').value = '';
    main.querySelector('#pf-position').value = '';
    applyFilters();
  };
  main.querySelector('#btn-create-player').onclick = () => showPlayerForm(main, league, teams);

  applyFilters();
  showLoading(false);
}

function showPlayerForm(main, league, teams, player) {
  const editMode = !!player;
  const modal = main.querySelector('#player-modal');
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${editMode ? 'Editar jugador' : 'Nuevo jugador'}</h2>
      <form id="player-form">
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" id="pf-name" required value="${editMode ? player.name : ''}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Posición</label>
            <input type="text" id="pf-position-field" value="${editMode ? player.position : ''}" placeholder="Ej: Duelista, Top, All-Rounder">
          </div>
          <div class="form-group">
            <label>Número</label>
            <input type="number" id="pf-number" value="${editMode ? player.number : ''}">
          </div>
        </div>
        <div class="form-group">
          <label>Equipo</label>
          <select id="pf-team-select" required>
            ${teams.map(t => `<option value="${t.id}" ${editMode && player.teamId === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="pf-cancel">Cancelar</button>
          <button type="submit" class="btn btn-primary">${editMode ? 'Guardar' : 'Crear'}</button>
        </div>
      </form>
    </div>
  `;

  modal.querySelector('#pf-cancel').onclick = () => { modal.style.display = 'none'; };
  modal.querySelector('#player-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: modal.querySelector('#pf-name').value.trim(),
      position: modal.querySelector('#pf-position-field').value.trim(),
      number: parseInt(modal.querySelector('#pf-number').value) || 0,
      teamId: Number(modal.querySelector('#pf-team-select').value),
    };

    if (editMode) {
      await PlayerDB.update(player.id, data);
      showToast('Jugador actualizado', 'success');
    } else {
      await PlayerDB.create(data);
      showToast('Jugador creado', 'success');
    }
    modal.style.display = 'none';
    renderPlayers(main);
  };
}
