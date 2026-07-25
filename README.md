# Podium — Gestor de Ligas eSports

SPA en JavaScript vanilla para gestionar ligas de eSports. Persistencia offline con IndexedDB, sin backend, sin registro.

## Deportes soportados

- **Valorant** — temática roja
- **Fighting Games** — temática dorada
- **League of Legends** — temática champagne

## Funcionalidades

- CRUD completo: ligas, equipos, jugadores, partidos, eventos
- Modalidades: Liga (todos contra todos) y Eliminación directa (bracket simple o doble)
- Generación automática de fixture y bracket
- Tabla de posiciones con puntuación (3 pts victoria, 1 empate, 0 derrota)
- Gráficos estadísticos (Chart.js): distribución de resultados, evolución de puntos, top anotadores
- Temas visuales dinámicos según el deporte activo
- Importar/exportar ligas en JSON
- 100% offline — no requiere servidor ni conexión a internet

## Tecnologías

- JavaScript vanilla (ES Modules)
- IndexedDB (persistencia)
- Chart.js (gráficos)
- CSS Custom Properties (temas)
- Web Components (custom elements)
- PWA-ready (manifest.json)

## Uso

Abre `index.html` en cualquier navegador moderno o sirve la carpeta con cualquier servidor estático.

```
npx serve .
```

## Licencia

MIT
