# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Organizadores de torneos eSports que necesitan gestionar ligas, equipos, jugadores y partidos sin depender de un servidor. También participantes que consultan estadísticas y tablas de posiciones.

## Product Purpose

Podium permite crear y gestionar ligas de eSports completamente en el navegador, con persistencia offline mediante IndexedDB, soporte para múltiples deportes y modalidades de competencia.

## Positioning

Gestor de ligas eSports que funciona sin registro, sin backend, 100% en el navegador. Ideal para torneos presenciales donde no hay conexión a internet.

## Operating Context

SPA en el navegador. Sin servidor, sin API. Persistencia local con IndexedDB. El usuario crea ligas, equipos, jugadores, genera fixtures/brackets, registra resultados y visualiza estadísticas.

## Capabilities and Constraints

- 3 eSports: Valorant, Fighting Games, League of Legends
- Modalidades: Liga (todos contra todos) y Eliminación directa (bracket simple o doble)
- CRUD completo: ligas, equipos, jugadores, partidos, eventos
- Generación automática de fixture y bracket
- Tabla de posiciones con puntuación (3 pts victoria, 1 empate, 0 derrota)
- Gráficos con Chart.js: distribución de resultados, evolución de puntos, top anotadores
- Temas visuales por deporte (colores de acento)
- Importar/exportar ligas en JSON
- Persistencia: IndexedDB + LocalStorage (liga activa)
- Sin backend, sin API, sin registro
- JavaScript vanilla, sin frameworks

## Brand Commitments

- Nombre: Podium
- Logo: podio inclinado (skewX -18°) con 2 barras + letra P
- Tema oscuro con acentos por deporte
- Diseño actual aprobado

## Evidence on Hand

- Repositorio GitHub con historial de commits
- Datos de ejemplo precargados (3 ligas)
- Temas visuales implementados para los 3 deportes

## Product Principles

- Offline-first: todo debe funcionar sin conexión a internet
- Sin fricción: sin registro, sin configuración, abre y usa
- Datos del usuario: el usuario es dueño de sus datos, puede importar/exportar
- Específico para eSports: terminología y experiencia adaptada por deporte

## Accessibility & Inclusion

Tema oscuro reducción de fatiga visual. Contraste suficiente entre colores.
