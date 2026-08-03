const FMT_ICONS = [
  { value: 'fa-solid fa-trophy', label: 'Trofeo' },
  { value: 'fa-solid fa-futbol', label: 'Fútbol' },
  { value: 'fa-solid fa-volleyball', label: 'Voleibol' },
  { value: 'fa-solid fa-basketball', label: 'Baloncesto' },
  { value: 'fa-solid fa-table-tennis-paddle-ball', label: 'Tenis' },
  { value: 'fa-solid fa-golf-ball-tee', label: 'Golf' },
  { value: 'fa-solid fa-shield-halved', label: 'Escudo' },
  { value: 'fa-solid fa-crosshairs', label: 'Diana' },
  { value: 'fa-solid fa-hand-fist', label: 'Puño' },
  { value: 'fa-solid fa-hat-wizard', label: 'Mago' },
  { value: 'fa-solid fa-gamepad', label: 'Gamepad' },
  { value: 'fa-solid fa-bolt', label: 'Rayo' },
  { value: 'fa-solid fa-fire', label: 'Fuego' },
  { value: 'fa-solid fa-medal', label: 'Medalla' },
  { value: 'fa-solid fa-star', label: 'Estrella' },
  { value: 'fa-solid fa-users', label: 'Equipo' },
  { value: 'fa-solid fa-flag', label: 'Bandera' },
  { value: 'fa-solid fa-heart', label: 'Corazón' },
];

function previewFmtIcon(value) {
  const preview = document.getElementById('f-fmt-icon-preview');
  if (preview) preview.innerHTML = `<i class="${value}"></i>`;
}

async function renderLeagues(main) {
  showLoading(true);
  const leagues = await LeagueDB.getAll();

  main.innerHTML = `
    <div class="section-header">
      <div class="section-title"><i class="fa-solid fa-trophy"></i> Ligas</div>
      <button class="btn btn-primary" id="btn-create-league">+ Nueva liga</button>
    </div>
    <div id="league-list" class="grid-list">
      ${leagues.length === 0 ? '<div class="empty-state"><h3>No hay ligas creadas</h3><p>Crea tu primera liga para empezar</p></div>' : ''}
    </div>
    <div style="margin-top:1rem;display:flex;gap:0.75rem">
      <button class="btn btn-secondary" id="btn-import"><i class="fa-solid fa-download"></i> Importar liga</button>
    </div>
    <input type="file" id="import-input" accept=".json" style="display:none">
    <div id="league-modal" class="modal-overlay" style="display:none"></div>
  `;

  const list = main.querySelector('#league-list');
  for (const league of leagues) {
    const teams = await TeamDB.getByLeague(league.id);

    const card = document.createElement('div');
    card.className = 'card';

    const leagueCard = document.createElement('podium-league-card');
    leagueCard.data = { ...league, teamCount: teams.length };
    card.appendChild(leagueCard);

    const actions = document.createElement('div');
    actions.style.cssText = 'margin-top:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap';
    actions.innerHTML = `
      ${league.isActive !== '1' ? `<button class="btn btn-sm btn-primary" data-activate="${league.id}">Activar</button>` : ''}
      ${canGenerate(league, teams.length) ? `<button class="btn btn-sm btn-success" data-generate="${league.id}" style="background:var(--success);color:#000">${league.mode === 'liga' ? 'Generar fixture' : 'Generar bracket'}</button>` : ''}
      <button class="btn btn-sm btn-secondary" data-edit="${league.id}">Editar</button>
      <button class="btn btn-sm btn-secondary" data-export="${league.id}">Exportar</button>
      <button class="btn btn-sm btn-danger" data-delete="${league.id}">Eliminar</button>
    `;
    actions.querySelector('[data-activate]')?.addEventListener('click', async () => {
      await LeagueDB.setActive(league.id);
      showToast(`"${league.name}" activada`, 'success');
      renderLeagues(main);
    });
    actions.querySelector('[data-generate]')?.addEventListener('click', async () => generateMatches(league, main));
    actions.querySelector('[data-edit]').addEventListener('click', () => showLeagueForm(main, league));
    actions.querySelector('[data-export]').addEventListener('click', () => exportLeague(league.id));
    actions.querySelector('[data-delete]').addEventListener('click', () => deleteLeague(main, league));
    card.appendChild(actions);

    list.appendChild(card);
  }

  main.querySelector('#btn-create-league').onclick = () => showLeagueForm(main);
  main.querySelector('#btn-import').onclick = () => main.querySelector('#import-input').click();
  main.querySelector('#import-input').onchange = (e) => importLeagueFile(main, e.target.files[0]);

  showLoading(false);
}

function showLeagueForm(main, league) {
  const editMode = !!league;
  const sport = getLeagueSport(league);
  const sports = Object.entries(SPORTS);

  const modal = main.querySelector('#league-modal');
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${editMode ? 'Editar liga' : 'Crear nueva liga'}</h2>
      <form id="league-form">
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" id="f-name" required value="${escapeHtml(editMode ? league.name : '')}" ${editMode ? 'readonly' : ''}>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Deporte / eSport</label>
            <select id="f-sport" required ${editMode ? 'disabled' : ''}>
              ${sports.map(([key, s]) =>
                `<option value="${key}" ${editMode && key === league.sport ? 'selected' : ''}>${s.name}</option>`
              ).join('')}
              ${editMode && league.sport === 'custom' ? `<option value="custom" selected>${escapeHtml(league.format?.name || 'Formato personalizado')}</option>` : ''}
              ${!editMode ? '<option value="custom">Formato personalizado</option>' : ''}
            </select>
          </div>
          <div class="form-group">
            <label>Temporada</label>
            <input type="text" id="f-season" required value="${escapeHtml(editMode ? league.season : '')}">
          </div>
        </div>
        <div id="f-custom-format" style="display:none"></div>
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
          <textarea id="f-desc" rows="2">${escapeHtml(editMode ? (league.description || '') : '')}</textarea>
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
          <div class="form-group" style="margin-top:0.75rem">
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;text-transform:none;letter-spacing:0;font-size:0.85rem">
              <input type="checkbox" id="f-double-elim" value="1"> Doble eliminación (con losers bracket)
            </label>
          </div>
        `;
      }
    };
    modeSelect.dispatchEvent(new Event('change'));

    const sportSelect = modal.querySelector('#f-sport');
    const customDiv = modal.querySelector('#f-custom-format');
    sportSelect.onchange = () => {
      if (sportSelect.value === 'custom') {
        customDiv.style.display = 'block';
        customDiv.innerHTML = renderCustomFormatBuilder();
      } else {
        customDiv.style.display = 'none';
        customDiv.innerHTML = '';
      }
    };
    sportSelect.dispatchEvent(new Event('change'));
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
      if (data.sport === 'custom') {
        data.format = readCustomFormat(modal);
      }
      if (data.mode === 'liga') {
        data.rounds = parseInt(modal.querySelector('#f-rounds').value);
      } else {
        data.bracketSize = parseInt(modal.querySelector('#f-bracket-size').value);
        data.doubleElimination = modal.querySelector('#f-double-elim')?.checked || false;
      }
      await LeagueDB.create(data);
      showToast('Liga creada', 'success');
    }

    modal.style.display = 'none';
    renderLeagues(main);
  };
}

function renderCustomFormatBuilder() {
  return `
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1rem;margin-top:0.75rem">
      <h4 style="margin:0 0 0.75rem;font-size:0.95rem"><i class="fa-solid fa-gear"></i> Configura tu formato</h4>
      <div class="form-row">
        <div class="form-group">
          <label>Nombre del deporte</label>
          <input type="text" id="f-fmt-name" placeholder="Ej: Voleibol">
        </div>
        <div class="form-group">
          <label>Ícono</label>
          <div style="display:flex;gap:0.5rem;align-items:center">
            <select id="f-fmt-icon" onchange="previewFmtIcon(this.value)" style="flex:1;min-width:0">
              ${FMT_ICONS.map(ic => `<option value="${ic.value}">${ic.label}</option>`).join('')}
            </select>
            <span id="f-fmt-icon-preview" style="font-size:1.3rem;width:26px;text-align:center;color:var(--text-primary)"><i class="fa-solid fa-trophy"></i></span>
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Color</label>
          <input type="color" id="f-fmt-color" value="#ff4655" style="height:38px;padding:2px">
        </div>
        <div class="form-group">
          <label>Estructura de marcador</label>
          <select id="f-fmt-structure" onchange="toggleFmtStructure(this.value)">
            <option value="single">Marcador simple (ej: fútbol)</option>
            <option value="sets">Mejor de N sets (ej: voleibol)</option>
            <option value="events">Automático por eventos</option>
          </select>
        </div>
      </div>
      <div class="form-row" id="f-fmt-sets-row" style="display:none">
        <div class="form-group">
          <label>Sets para ganar</label>
          <input type="number" id="f-fmt-sets" value="3" min="1">
        </div>
        <div class="form-group">
          <label>Máximo de sets</label>
          <input type="number" id="f-fmt-maxsets" value="5" min="1">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Puntos por victoria</label>
          <input type="number" id="f-fmt-pwin" value="3" min="0">
        </div>
        <div class="form-group">
          <label>Puntos por empate</label>
          <input type="number" id="f-fmt-pdraw" value="1" min="0">
        </div>
        <div class="form-group">
          <label>Puntos por derrota</label>
          <input type="number" id="f-fmt-ploss" value="0" min="0">
        </div>
      </div>
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap;margin-top:0.25rem">
        <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;text-transform:none;letter-spacing:0;font-size:0.85rem;color:var(--text-secondary)">
          <input type="checkbox" id="f-fmt-draw" checked> Empates permitidos
        </label>
        <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;text-transform:none;letter-spacing:0;font-size:0.85rem;color:var(--text-secondary)">
          <input type="checkbox" id="f-fmt-events" checked> Registrar eventos de jugadores
        </label>
      </div>

      <details style="margin-top:0.75rem">
        <summary style="cursor:pointer;font-size:0.85rem;font-weight:600;color:var(--accent)">Terminología y posiciones</summary>
        <div style="margin-top:0.75rem">
          <div class="form-row">
            <div class="form-group"><label>Evento (singular)</label><input type="text" id="f-fmt-event" placeholder="Ej: Gol"></div>
            <div class="form-group"><label>Evento (plural)</label><input type="text" id="f-fmt-event-plural" placeholder="Ej: Goles"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Marcador (etiqueta)</label><input type="text" id="f-fmt-scorelabel" placeholder="Ej: Goles o Sets"></div>
            <div class="form-group"><label>Tipos de evento (coma)</label><input type="text" id="f-fmt-eventtypes" placeholder="Gol, Amarilla, Roja"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>A favor (abrev.)</label><input type="text" id="f-fmt-abbr-for" placeholder="GF"></div>
            <div class="form-group"><label>En contra (abrev.)</label><input type="text" id="f-fmt-abbr-against" placeholder="GC"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Equipo</label><input type="text" id="f-fmt-teamlabel" placeholder="Equipo"></div>
            <div class="form-group"><label>Jugador</label><input type="text" id="f-fmt-playerlabel" placeholder="Jugador"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Victoria</label><input type="text" id="f-fmt-resultwin" placeholder="Victoria"></div>
            <div class="form-group"><label>Empate</label><input type="text" id="f-fmt-resultdraw" placeholder="Empate"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Derrota</label><input type="text" id="f-fmt-resultloss" placeholder="Derrota"></div>
            <div class="form-group"><label>Posiciones (coma)</label><input type="text" id="f-fmt-positions" placeholder="Líbero, Armador, Central"></div>
          </div>
        </div>
      </details>
    </div>
  `;
}

function toggleFmtStructure(value) {
  const setsRow = document.getElementById('f-fmt-sets-row');
  const draw = document.getElementById('f-fmt-draw');
  if (!setsRow) return;
  setsRow.style.display = value === 'sets' ? 'grid' : 'none';
  if (draw) {
    draw.disabled = value === 'sets';
    if (value === 'sets') draw.checked = false;
  }
}

function readCustomFormat(modal) {
  const q = (id) => modal.querySelector(id);
  const structure = q('#f-fmt-structure').value;
  const isSets = structure === 'sets';
  const eventNamePlural = q('#f-fmt-event-plural').value.trim() || 'Eventos';
  const eventTypes = q('#f-fmt-eventtypes').value.split(',').map(s => s.trim()).filter(Boolean);
  const positions = q('#f-fmt-positions').value.split(',').map(s => s.trim()).filter(Boolean);
  return {
    name: q('#f-fmt-name').value.trim() || 'Mi Deporte',
    icon: q('#f-fmt-icon').value || 'fa-solid fa-trophy',
    color: q('#f-fmt-color').value || '#ff4655',
    positions,
    terms: {
      eventName: q('#f-fmt-event').value.trim() || 'Evento',
      eventNamePlural,
      scorerLabel: 'Máximo anotador',
      scoreLabel: q('#f-fmt-scorelabel').value.trim() || 'Puntos',
      scoreAbbr: {
        for: q('#f-fmt-abbr-for').value.trim() || 'PF',
        against: q('#f-fmt-abbr-against').value.trim() || 'PC',
      },
      eventTypes: eventTypes.length > 0 ? eventTypes : ['Normal'],
      matchAction: 'Marcar',
      winnerLabel: 'Ganador',
      roundLabel: 'Jornada',
      arenaLabel: 'Cancha',
      teamLabel: q('#f-fmt-teamlabel').value.trim() || 'Equipo',
      playerLabel: q('#f-fmt-playerlabel').value.trim() || 'Jugador',
      resultWin: q('#f-fmt-resultwin').value.trim() || 'Victoria',
      resultDraw: q('#f-fmt-resultdraw').value.trim() || 'Empate',
      resultLoss: q('#f-fmt-resultloss').value.trim() || 'Derrota',
      knockout: 'Evento',
      rankingTitle: `Ranking de ${eventNamePlural}`,
      stats_title: 'Estadísticas de equipo',
    },
    matchStructure: structure,
    allowDraw: isSets ? false : q('#f-fmt-draw').checked,
    points: {
      win: parseInt(q('#f-fmt-pwin').value) || 3,
      draw: parseInt(q('#f-fmt-pdraw').value) || 1,
      loss: parseInt(q('#f-fmt-ploss').value) || 0,
    },
    setsToWin: isSets ? (parseInt(q('#f-fmt-sets').value) || 3) : null,
    maxSets: isSets ? (parseInt(q('#f-fmt-maxsets').value) || 5) : null,
    eventsEnabled: q('#f-fmt-events').checked,
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

function canGenerate(league, teamCount) {
  if (league.mode === 'liga') return teamCount >= 2;
  if (league.mode === 'eliminacion') return teamCount === (league.bracketSize || 4);
  return false;
}

async function generateMatches(league, main) {
  const existing = await MatchDB.getByLeague(league.id);
  if (existing.length > 0) {
    const ok = await confirmAction('Ya hay partidos generados. ¿Generar de nuevo? Se eliminarán todos los existentes y se revertirán las estadísticas de los finalizados.');
    if (!ok) return;
    showLoading(true);
    for (const m of existing) {
      if (m.status === 'finished') {
        try {
          await revertMatchStats(m.id);
        } catch (e) {
          console.error('No se pudieron revertir stats del partido', m.id, e);
        }
      }
    }
    for (const m of existing) {
      const events = await EventDB.getByMatch(m.id);
      for (const e of events) await EventDB.remove(e.id);
      await MatchDB.remove(m.id);
    }
  } else {
    showLoading(true);
  }

  const teams = await TeamDB.getByLeague(league.id);

  if (league.mode === 'liga') {
    const fixture = await MatchDB.generateFixture(league.id, teams, league.rounds || 1);
    for (const match of fixture) {
      await addItem('matches', match);
    }
    showToast(`Fixture generado: ${fixture.length} partidos`, 'success');
  } else {
    if (league.doubleElimination) {
      await MatchDB.generateDoubleBracket(league.id, teams);
      showToast('Bracket doble eliminación generado', 'success');
    } else {
      await MatchDB.generateBracket(league.id, teams);
      showToast('Bracket generado', 'success');
    }
  }

  showLoading(false);
  renderLeagues(main);
}
