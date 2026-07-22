const PlayerDB = {
  async getAll() {
    return getAll('players');
  },

  async getById(id) {
    return getById('players', id);
  },

  async getByTeam(teamId) {
    return getByIndex('players', 'byTeam', teamId);
  },

  async getByLeague(leagueId) {
    const teams = await TeamDB.getByLeague(leagueId);
    const teamIds = teams.map(t => t.id);
    const allPlayers = await getAll('players');
    return allPlayers.filter(p => teamIds.includes(p.teamId));
  },

  async create(data) {
    const player = {
      name: data.name,
      photo: data.photo || '',
      position: data.position || '',
      number: data.number || 0,
      teamId: data.teamId,
      stats: { pj: 0, anotaciones: 0, promedio: 0 },
      createdAt: new Date().toISOString(),
    };
    return addItem('players', player);
  },

  async update(id, data) {
    const player = await getById('players', id);
    if (!player) throw new Error('Jugador no encontrado');
    if (data.name !== undefined) player.name = data.name;
    if (data.photo !== undefined) player.photo = data.photo;
    if (data.position !== undefined) player.position = data.position;
    if (data.number !== undefined) player.number = data.number;
    if (data.teamId !== undefined) player.teamId = data.teamId;
    return putItem('players', player);
  },

  async remove(id) {
    return deleteItem('players', id);
  },
};
