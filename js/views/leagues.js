async function renderLeagues(main) {
  showLoading(true);
  const leagues = await LeagueDB.getAll();

  main.innerHTML = `
    <div class="section-header">
      <div class="section-title">🏆 Ligas</div>
      <button class="btn btn-primary" id="btn-create-league">+ Nueva liga</button>
    </div>
    <div id="league-list" class="grid-list">
      ${leagues.length === 0 ? '<div class="empty-state"><h3>No hay ligas creadas</h3><p>Crea tu primera liga para empezar</p></div>' : ''}
    </div>
    <div style="margin-top:1rem;display:flex;gap:0.75rem">
      <button class="btn btn-secondary" id="btn-import">📥 Importar liga</button>
    </div>
    <input type="file" id="import-input" accept=".json" style="display:none">
    <div id="league-modal" class="modal-overlay" style="display:none"></div>
  `;

  const list = main.querySelector('#league-list');
  for (const league of leagues) {
    const sport = getSport(league.sport);
    const teams = await TeamDB.getByLeague(league.id);
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div>
          <h3 style="margin:0 0 0.25rem">${sport.icon} ${league.name}</h3>
          <p style="color:var(--text-secondary);font-size:0.85rem;margin:0">
            ${sport.name} · ${league.season}
          </p>
          <p style="color:var(--text-muted);font-size:0.8rem;margin:0.25rem 0 0">
            ${teams.length} equipos · ${league.mode === 'liga' ? `Liga (${league.rounds === 2 ? 'Ida y vuelta' : 'Una vuelta'})` : `Eliminación directa (${league.bracketSize})`}
          </p>
        </div>
        ${league.isActive === '1' ? '<span style="background:var(--success);color:#000;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.7rem;font-weight:700">ACTIVA</span>' : ''}
      </div>
      <div style="margin-top:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap">
        ${league.isActive !== '1' ? `<button class="btn btn-sm btn-primary" data-activate="${league.id}">Activar</button>` : ''}
        <button class="btn btn-sm btn-secondary" data-edit="${league.id}">Editar</button>
        <button class="btn btn-sm btn-secondary" data-export="${league.id}">Exportar</button>
        <button class="btn btn-sm btn-danger" data-delete="${league.id}">Eliminar</button>
      </div>
    `;
    card.querySelector('[data-activate]')?.addEventListener('click', async () => {
      await LeagueDB.setActive(league.id);
      showToast(`"${league.name}" activada`, 'success');
      renderLeagues(main);
    });
    card.querySelector('[data-edit]').addEventListener('click', () => showLeagueForm(main, league));
    card.querySelector('[data-export]').addEventListener('click', () => exportLeague(league.id));
    card.querySelector('[data-delete]').addEventListener('click', () => deleteLeague(main, league));
    list.appendChild(card);
  }

  main.querySelector('#btn-create-league').onclick = () => showLeagueForm(main);
  main.querySelector('#btn-import').onclick = () => main.querySelector('#import-input').click();
  main.querySelector('#import-input').onchange = (e) => importLeagueFile(main, e.target.files[0]);

  showLoading(false);
}

function showLeagueForm(main, league) {
  const editMode = !!league;
  const sport = league ? getSport(league.sport) : null;
  const sports = Object.entries(SPORTS);

  const modal = main.querySelector('#league-modal');
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${editMode ? 'Editar liga' : 'Crear nueva liga'}</h2>
      <form id="league-form">
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" id="f-name" required value="${editMode ? league.name : ''}" ${editMode ? 'readonly' : ''}>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Deporte / eSport</label>
            <select id="f-sport" required ${editMode ? 'disabled' : ''}>
              ${sports.map(([key, s]) =>
                `<option value="${key}" ${editMode && key === league.sport ? 'selected' : ''}>${s.icon} ${s.name}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Temporada</label>
            <input type="text" id="f-season" required value="${editMode ? league.season : ''}">
          </div>
        </div>
        ${!editMode ? `
        <div class="form-group">
          <label>Modalidad</label>
          <select id="f-mode" required>
            <option value="liga">Liga (todos contra todos)</option>
            <option value="eliminacion">Eliminación directa (bracket)</option>
          </select>
        </div>
        <div id="f-mode-config" style="margin-top:0.75rem"></div>
        ` : ''}
        <div class="form-group">
          <label>Descripción (opcional)</label>
          <textarea id="f-desc" rows="2">${editMode ? (league.description || '') : ''}</textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="f-cancel">Cancelar</button>
          <button type="submit" class="btn btn-primary">${editMode ? 'Guardar cambios' : 'Crear liga'}</button>
        </div>
      </form>
    </div>
  `;

  if (!editMode) {
    const modeSelect = modal.querySelector('#f-mode');
    const configDiv = modal.querySelector('#f-mode-config');

    modeSelect.onchange = () => {
      if (modeSelect.value === 'liga') {
        configDiv.innerHTML = `
          <div class="form-group">
            <label>Vueltas</label>
            <select id="f-rounds">
              <option value="1">Una vuelta</option>
              <option value="2">Ida y vuelta</option>
            </select>
          </div>
        `;
      } else {
        configDiv.innerHTML = `
          <div class="form-group">
            <label>Tamaño del bracket</label>
            <select id="f-bracket-size">
              <option value="4">4 equipos</option>
              <option value="8">8 equipos</option>
              <option value="16">16 equipos</option>
            </select>
          </div>
        `;
      }
    };
    modeSelect.dispatchEvent(new Event('change'));
  }

  modal.querySelector('#f-cancel').onclick = () => { modal.style.display = 'none'; };
  modal.querySelector('#league-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: modal.querySelector('#f-name').value.trim(),
      sport: modal.querySelector('#f-sport').value,
      season: modal.querySelector('#f-season').value.trim(),
      description: modal.querySelector('#f-desc').value.trim(),
    };

    if (editMode) {
      await LeagueDB.update(league.id, data);
      showToast('Liga actualizada', 'success');
    } else {
      data.mode = modal.querySelector('#f-mode').value;
      if (data.mode === 'liga') {
        data.rounds = parseInt(modal.querySelector('#f-rounds').value);
      } else {
        data.bracketSize = parseInt(modal.querySelector('#f-bracket-size').value);
      }
      await LeagueDB.create(data);
      showToast('Liga creada', 'success');
    }

    modal.style.display = 'none';
    renderLeagues(main);
  };
}

async function deleteLeague(main, league) {
  const confirmed = await confirmAction(`¿Eliminar la liga "${league.name}"? Se borrarán todos sus equipos, jugadores, partidos y eventos.`);
  if (!confirmed) return;

  await eliminarLigaEnCascada(league.id);
  if (league.isActive === '1') {
    localStorage.removeItem('podium-active-league');
  }
  showToast(`Liga "${league.name}" eliminada`, 'success');
  renderLeagues(main);
}

async function exportLeague(leagueId) {
  const data = await exportarLiga(leagueId);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.league.name.replace(/\s+/g, '_')}_export.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Liga exportada', 'success');
}

async function importLeagueFile(main, file) {
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.league || !data.league.name) {
      showToast('Archivo JSON inválido', 'error');
      return;
    }

    const existing = await LeagueDB.getAll();
    if (existing.some(l => l.name === data.league.name)) {
      showToast('Ya existe una liga con ese nombre. Renómbrala antes de importar.', 'error');
      return;
    }

    await importarLiga(data);
    showToast(`Liga "${data.league.name}" importada`, 'success');
    renderLeagues(main);
  } catch (e) {
    showToast('Error al importar: formato inválido', 'error');
  }
}
