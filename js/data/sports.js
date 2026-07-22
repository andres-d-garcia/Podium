const SPORTS = {
  valorant: {
    id: 'valorant',
    name: 'Valorant',
    icon: '🎯',
    color: '#ff4655',
    theme: 'valorant',
    terms: {
      eventName: 'Eliminación',
      eventNamePlural: 'Eliminaciones',
      scorerLabel: 'Top Fragger',
      scoreLabel: 'Rondas',
      scoreAbbr: { for: 'RF', against: 'RC' },
      eventTypes: ['Normal', 'Headshot', 'Ability', 'Ultimate'],
      matchAction: 'Disparar',
      winnerLabel: 'Vencedor',
      roundLabel: 'Ronda',
      arenaLabel: 'Mapa',
      teamLabel: 'Escuadra',
      playerLabel: 'Agente',
      resultWin: 'Victoria',
      resultDraw: 'Empate',
      resultLoss: 'Derrota',
      knockout: 'Baja',
      rankingTitle: 'Ranking de Top Fraggers',
      stats_title: 'Estadísticas de Escuadra',
    },
    positions: ['Duelista', 'Iniciador', 'Centinela', 'Controlador'],
  },

  fighting: {
    id: 'fighting',
    name: 'Fighting Games',
    icon: '🥊',
    color: '#fbbf24',
    theme: 'fighting',
    terms: {
      eventName: 'KO',
      eventNamePlural: 'KOs',
      scorerLabel: 'Finalizador',
      scoreLabel: 'KOs',
      scoreAbbr: { for: 'KF', against: 'KC' },
      eventTypes: ['Jab', 'Golpe Fuerte', 'Combo', 'Ultimate'],
      matchAction: 'Golpear',
      winnerLabel: 'Campeón',
      roundLabel: 'Round',
      arenaLabel: 'Escenario',
      teamLabel: 'Luchador',
      playerLabel: 'Peleador',
      resultWin: 'KO Técnico',
      resultDraw: 'Empate',
      resultLoss: 'Derrota',
      knockout: 'KO',
      rankingTitle: 'Ranking de Finalizadores',
      stats_title: 'Estadísticas de Luchador',
    },
    positions: ['All-Rounder', 'Zoner', 'Grappler', 'Rushdown', 'Footsies'],
  },

  lol: {
    id: 'lol',
    name: 'League of Legends',
    icon: '🧙',
    color: '#c8aa6e',
    theme: 'lol',
    terms: {
      eventName: 'Asesinato',
      eventNamePlural: 'Asesinatos',
      scorerLabel: 'MVP',
      scoreLabel: 'Asesinatos',
      scoreAbbr: { for: 'AF', against: 'AC' },
      eventTypes: ['Normal', 'Habilidad', 'Ultimate'],
      matchAction: 'Atacar',
      winnerLabel: 'Vencedor',
      roundLabel: 'Jornada',
      arenaLabel: 'Grieta',
      teamLabel: 'Equipo',
      playerLabel: 'Campeón',
      resultWin: 'Victoria',
      resultDraw: 'Empate',
      resultLoss: 'Derrota',
      knockout: 'Asesinato',
      rankingTitle: 'Ranking de MVPs',
      stats_title: 'Estadísticas de Equipo',
    },
    positions: ['Top', 'Jungla', 'Mid', 'ADC', 'Support'],
  },
};

function getSport(sportId) {
  return SPORTS[sportId] || SPORTS.valorant;
}

function getTerm(sportId, termKey) {
  const sport = getSport(sportId);
  return sport.terms[termKey] || termKey;
}
