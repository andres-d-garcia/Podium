const LeagueDB = {
  async getAll() {
    return getAll('leagues');
  },

  async getById(id) {
    return getById('leagues', id);
  },

  async getActive() {
    const leagues = await getByIndex('leagues', 'byActive', '1');
    return leagues.length > 0 ? leagues[0] : null;
  },

  async create(data) {
    const league = {
      name: data.name,
      sport: data.sport,
      mode: data.mode,
      season: data.season,
      description: data.description || '',
      rounds: data.mode === 'liga' ? (data.rounds || 1) : null,
      bracketSize: data.mode === 'eliminacion' ? (data.bracketSize || 4) : null,
      isActive: '0',
      createdAt: new Date().toISOString(),
    };
    return addItem('leagues', league);
  },

  async update(id, data) {
    const league = await getById('leagues', id);
    if (!league) throw new Error('Liga no encontrada');
    if (data.name !== undefined) league.name = data.name;
    if (data.season !== undefined) league.season = data.season;
    if (data.description !== undefined) league.description = data.description;
    return putItem('leagues', league);
  },

  async setActive(id) {
    return openDB().then(db => {
      const tx = db.transaction('leagues', 'readwrite');
      const store = tx.objectStore('leagues');
      const index = store.index('byActive');

      return new Promise((resolve, reject) => {
        const request = index.openCursor(IDBKeyRange.only('1'));
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const league = cursor.value;
            league.isActive = '0';
            cursor.update(league);
          }
        };
        tx.oncomplete = () => {
          getById('leagues', id).then(league => {
            if (!league) { reject(new Error('Liga no encontrada')); return; }
            league.isActive = '1';
            putItem('leagues', league).then(() => {
              localStorage.setItem('podium-active-league', id);
              resolve();
            }).catch(reject);
          });
        };
        tx.onerror = () => reject(tx.error);
      });
    });
  },

  async remove(id) {
    return deleteItem('leagues', id);
  },
};
