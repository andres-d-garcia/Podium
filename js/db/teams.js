const TeamDB = {
  async getAll() {
    return getAll('teams');
  },

  async getById(id) {
    return getById('teams', id);
  },

  async getByLeague(leagueId) {
    return getByIndex('teams', 'byLeague', leagueId);
  },

  async create(data) {
    const team = {
      name: data.name,
      leagueId: data.leagueId,
      primaryColor: data.primaryColor || '#ff4655',
      secondaryColor: data.secondaryColor || '#0f1923',
      city: data.city || '',
      logo: data.logo || '',
      stats: { pj: 0, pg: 0, pe: 0, pp: 0, pf: 0, pc: 0, dif: 0, pts: 0 },
      createdAt: new Date().toISOString(),
    };
    return addItem('teams', team);
  },

  async update(id, data) {
    const team = await getById('teams', id);
    if (!team) throw new Error('Equipo no encontrado');
    if (data.name !== undefined) team.name = data.name;
    if (data.primaryColor !== undefined) team.primaryColor = data.primaryColor;
    if (data.secondaryColor !== undefined) team.secondaryColor = data.secondaryColor;
    if (data.city !== undefined) team.city = data.city;
    if (data.logo !== undefined) team.logo = data.logo;
    return putItem('teams', team);
  },

  async remove(id) {
    return deleteItem('teams', id);
  },
};
