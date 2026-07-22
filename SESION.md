# Sesión — 22/07/2026

## Último commit
`631881a` fix: logo monocromático adaptativo al tema

## Progreso actual

### Completado
- [x] Estructura de carpetas del proyecto
- [x] `index.html` con carga de scripts
- [x] `main.css` + `components.css`
- [x] `js/data/sports.js` — mapa de terminología (Valorant, Fighting, LoL)
- [x] `js/db/schema.js` — esquema de IndexedDB
- [x] `js/db/db.js` — helper genérico de conexión
- [x] `js/db/leagues.js` — CRUD ligas
- [x] `js/db/teams.js` — CRUD equipos
- [x] `js/db/players.js` — CRUD jugadores
- [x] `js/db/matches.js` — CRUD partidos + generación fixture/bracket
- [x] `js/db/events.js` — CRUD eventos
- [x] `js/db/transactions.js` — finalizar/deshacer partido, eliminar cascada, importar/exportar
- [x] `js/router.js` — hash router
- [x] `js/app.js` — bootstrap y funciones globales
- [x] `js/charts/chartSetup.js` + `charts.js` — helpers de Chart.js
- [x] 14 componentes custom elements (`NavBar`, `Toast`, `ConfirmDialog`, `LoadingState`, `Footer`, `LeagueCard`, `TeamCard`, `PlayerCard`, `MatchCard`, `StandingsTable`, `BracketView`, `RankingTable`, `EventForm`, `ChartContainer`)
- [x] `js/views/dashboard.js` — Dashboard con 3 gráficos
- [x] Logo SVG con diseño de podio (skewX), monocromático adaptativo
- [x] Repositorio GitHub creado, 5 commits subidos

### Pendiente
- [ ] `css/themes/valorant.css`
- [ ] `css/themes/fighting.css`
- [ ] `css/themes/lol.css`
- [ ] `js/views/leagues.js` — CRUD ligas (crear, editar, eliminar, activar, fixture/bracket, export/import)
- [ ] `js/views/teams.js` — listado de equipos
- [ ] `js/views/teamDetail.js` — detalle de equipo (plantilla, stats, partidos)
- [ ] `js/views/players.js` — listado de jugadores con filtros
- [ ] `js/views/playerDetail.js` — detalle de jugador (historial, stats)
- [ ] `js/views/matches.js` — listado de partidos con filtros
- [ ] `js/views/matchDetail.js` — detalle de partido (eventos, finalizar/deshacer)
- [ ] `js/views/stats.js` — tabla de posiciones / bracket + 3 gráficos
- [ ] `js/data/sample.js` — datos de ejemplo precargados
- [ ] `README.md`

## Decisiones de diseño
- 3 eSports: Valorant, Fighting Games, League of Legends
- Logo: podio inclinado (skewX -18°) con 2 barras + letra P, colores: #ff4655, #c8aa6e, #ece8e1
- Persistencia: IndexedDB + LocalStorage (solo liga activa)
- 2 modalidades: Liga (todos contra todos) y Eliminación directa (bracket)
- Puntuación: 3 pts victoria, 1 empate, 0 derrota
- Transacciones: finalizar/deshacer partido, eliminar liga en cascada, importar
