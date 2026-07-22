# Sesión — 22/07/2026

## Último commit
`29fc8e6` feat: aplicar tema visual según el deporte de la liga activa

## Progreso actual

### Completado
- [x] Estructura de carpetas del proyecto
- [x] `index.html` con carga de scripts
- [x] `main.css` + `components.css`
- [x] `css/themes/valorant.css`, `fighting.css`, `lol.css` — temas por eSport
- [x] `js/data/sports.js` — mapa de terminología (Valorant, Fighting, LoL)
- [x] `js/data/sample.js` — datos de ejemplo precargados (3 ligas)
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
- [x] 14 componentes custom elements
- [x] `js/views/dashboard.js` — Dashboard con 3 gráficos
- [x] `js/views/leagues.js` — CRUD ligas (crear, editar, activar, export/import)
- [x] `js/views/teams.js` — listado de equipos con CRUD
- [x] `js/views/teamDetail.js` — detalle de equipo (plantilla, stats, partidos, gráfico)
- [x] `js/views/players.js` — listado de jugadores con filtros y debounce
- [x] `js/views/playerDetail.js` — detalle de jugador (historial, anotaciones, gráfico)
- [x] `js/views/matches.js` — listado de partidos con filtros
- [x] `js/views/matchDetail.js` — detalle de partido (eventos, finalizar/deshacer)
- [x] `js/views/stats.js` — tabla de posiciones / bracket + gráficos
- [x] Logo SVG con diseño de podio (skewX), monocromático adaptativo
- [x] Repositorio GitHub con 22 commits (historial granular)
- [x] GitHub Pages configurado

### Pendiente
- [ ] Probar que LeagueCard funcione correctamente (onclick navega a ligas, no al detalle)
- [ ] Revisar que el fixture se genere correctamente
- [ ] Agregar botón "Generar fixture/bracket" en la vista ligas
- [ ] Verificar operación de deshacer partido en bracket
- [ ] `README.md`
- [ ] Probar la aplicación completa

## GitHub
- Repositorio: https://github.com/andres-d-garcia/Podium
- GitHub Pages: https://andres-d-garcia.github.io/podium/
- Descripción: Podium - Gestor de Ligas eSports. SPA en HTML, CSS y JavaScript vanilla con IndexedDB.

## Decisiones de diseño
- 3 eSports: Valorant, Fighting Games, League of Legends
- Logo: podio inclinado (skewX -18°) con 2 barras + letra P, colores: #ff4655, #c8aa6e, #ece8e1
- Persistencia: IndexedDB + LocalStorage (solo liga activa)
- 2 modalidades: Liga (todos contra todos) y Eliminación directa (bracket)
- Puntuación: 3 pts victoria, 1 empate, 0 derrota
- Transacciones: finalizar/deshacer partido, eliminar liga en cascada, importar
