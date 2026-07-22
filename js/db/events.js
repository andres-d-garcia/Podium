const EventDB = {
  async getAll() {
    return getAll('events');
  },

  async getByMatch(matchId) {
    return getByIndex('events', 'byMatch', matchId);
  },

  async getByPlayer(playerId) {
    return getByIndex('events', 'byPlayer', playerId);
  },

  async create(data) {
    const event = {
      matchId: data.matchId,
      playerId: data.playerId,
      teamId: data.teamId,
      minute: data.minute || null,
      type: data.type || 'anotacion',
      createdAt: new Date().toISOString(),
    };
    return addItem('events', event);
  },

  async bulkCreate(events) {
    return openDB().then(db => {
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      for (const event of events) {
        store.add({
          ...event,
          createdAt: new Date().toISOString(),
        });
      }
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    });
  },

  async remove(id) {
    return deleteItem('events', id);
  },

  async removeByMatch(matchId) {
    const events = await getByIndex('events', 'byMatch', matchId);
    return openDB().then(db => {
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      for (const event of events) {
        store.delete(event.id);
      }
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    });
  },
};
