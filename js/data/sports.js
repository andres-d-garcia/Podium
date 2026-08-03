const SPORTS = {
  valorant: {
    id: 'valorant',
    name: 'Valorant',
    icon: 'fa-solid fa-crosshairs',
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
    matchStructure: 'single',
    allowDraw: true,
    eventsEnabled: true,
    points: { win: 3, draw: 1, loss: 0 },
    setsToWin: null,
    maxSets: null,
  },

  fighting: {
    id: 'fighting',
    name: 'Fighting Games',
    icon: 'fa-solid fa-hand-fist',
    color: '#fbbf24',
    theme: 'fighting',
    terms: {
      eventName: 'KO',
      eventNamePlural: 'KOs',
      scorerLabel: 'Finalizador',
      scoreLabel: 'Rondas',
      scoreAbbr: { for: 'RF', against: 'RC' },
      eventTypes: ['KO'],
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
    matchStructure: 'single',
    allowDraw: true,
    eventsEnabled: false,
    points: { win: 3, draw: 1, loss: 0 },
    setsToWin: null,
    maxSets: null,
  },

  lol: {
    id: 'lol',
    name: 'League of Legends',
    icon: 'fa-solid fa-hat-wizard',
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
    matchStructure: 'events',
    allowDraw: true,
    eventsEnabled: true,
    points: { win: 3, draw: 1, loss: 0 },
    setsToWin: null,
    maxSets: null,
  },
};

function getSport(sportId) {
  return SPORTS[sportId] || SPORTS.valorant;
}

function getLeagueSport(league) {
  if (league && league.format) return league.format;
  return getSport(league ? league.sport : 'valorant');
}

function getTerm(sportId, termKey) {
  const sport = getSport(sportId);
  return sport.terms[termKey] || termKey;
}

function computeMatchResult(league, homeId, awayId, homeScore, awayScore) {
  const sport = getLeagueSport(league);
  const pts = sport.points || { win: 3, draw: 1, loss: 0 };
  const h = Number(homeScore) || 0;
  const a = Number(awayScore) || 0;
  let homePts = 0, awayPts = 0;
  let homeStatus = 'draw', awayStatus = 'draw';
  let winnerId = null, loserId = null;

  if (h > a) {
    homePts = pts.win;
    awayPts = pts.loss;
    homeStatus = 'win';
    awayStatus = 'loss';
    winnerId = homeId;
    loserId = awayId;
  } else if (h < a) {
    homePts = pts.loss;
    awayPts = pts.win;
    homeStatus = 'loss';
    awayStatus = 'win';
    winnerId = awayId;
    loserId = homeId;
  } else {
    homePts = pts.draw;
    awayPts = pts.draw;
  }

  return { homePts, awayPts, homeStatus, awayStatus, winnerId, loserId, isDraw: h === a };
}
