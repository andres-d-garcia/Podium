---
name: Podium
description: Gestor de Ligas eSports — SPA offline-first con temática oscura
colors:
  primary: "#ff4655"
  accent-valorant: "#ff4655"
  accent-fighting: "#fbbf24"
  accent-lol: "#c8aa6e"
  bg-primary: "#0f1923"
  bg-secondary: "#1a2332"
  bg-card: "#1e2a3a"
  bg-input: "#243044"
  text-primary: "#ece8e1"
  text-secondary: "#8b978f"
  text-muted: "#5a6570"
  border-color: "#2a3648"
  success: "#4ade80"
  warning: "#fbbf24"
  error: "#ef4444"
  info: "#60a5fa"
typography:
  display:
    fontFamily: "Segoe UI, system-ui, -apple-system, sans-serif"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Segoe UI, system-ui, -apple-system, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Segoe UI, system-ui, -apple-system, sans-serif"
    fontWeight: 600
    letterSpacing: "0.5px"
    textTransform: "uppercase"
  mono:
    fontFamily: "Cascadia Code, Fira Code, monospace"
    fontWeight: 700
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    fontWeight: 600
  button-secondary:
    backgroundColor: "{colors.bg-input}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.border-color}"
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.bg-card}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.border-color}"
    padding: "1.25rem"
  input:
    backgroundColor: "{colors.bg-input}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.border-color}"
    padding: "0.5rem 0.75rem"
---

# Design System: Podium

## Overview

**Creative North Star: "The eSports Command Center"**

Podium es una interfaz oscura, de alto contraste, diseñada para la gestión rápida de torneos presenciales. La estética se inspira en los paneles de control de torneos profesionales: sobrio, funcional, con acentos de color que cobran vida según el deporte activo. El diseño prioriza la escaneabilidad y la densidad de información sin sacrificar jerarquía visual. No hay decoración gratuita — cada elemento tiene un propósito operativo.

**Key Characteristics:**
- Fondo oscuro profundo (#0f1923) que reduce la fatiga visual en sesiones largas
- Acentos de color dinámicos que cambian según el eSport activo (rojo Valorant, dorado Fighting, champagne LoL)
- Cards con bordes sutiles y hover con glow en el acento
- Tipografía limpia sin serifa, con monoespaciada para datos numéricos
- Espaciado generoso en desktop que se comprime en mobile sin perder legibilidad

## Colors

La paleta es monocromática oscura con un solo acento de color que varía según el deporte activo. El fondo primario (#0f1923) es el lienzo; los elementos flotan sobre fondos ligeramente más claros (#1a2332, #1e2a3a).

### Primary
- **Razer Red** (#ff4655): Acento por defecto. Usado en botones primarios, hover de cards, bordes de focus, enlaces y gráficos. También es el acento del tema Valorant.

### Sport Accents
- **Fighting Gold** (#fbbf24): Acento para Fighting Games. Reemplaza al primary cuando el deporte activo es fighting.
- **LoL Champagne** (#c8aa6e): Acento para League of Legends. Reemplaza al primary cuando el deporte activo es lol.

### Neutral
- **Deep Navy** (#0f1923): Fondo principal del body. Proporciona el contraste base.
- **Slate Navy** (#1a2332): Fondo secundario para modales y navbar.
- **Card Navy** (#1e2a3a): Fondo de cards y contenedores elevados.
- **Input Navy** (#243044): Fondo de inputs y selectores.
- **Warm Ivory** (#ece8e1): Texto primario. Blanco ligeramente cálido para reducir el contraste agresivo.
- **Muted Sage** (#8b978f): Texto secundario y metadata.
- **Dim Slate** (#5a6570): Texto deshabilitado y placeholders.
- **Border Steel** (#2a3648): Bordes de cards, inputs, tablas y separadores.

### Semantic
- **Match Green** (#4ade80): Éxito, activo, badge "ACTIVA", estado finished.
- **Warning Gold** (#fbbf24): Advertencias, posiciones destacadas.
- **Error Red** (#ef4444): Peligro, botones destructivos, errores.
- **Info Blue** (#60a5fa): Información, badge "scheduled".

## Typography

**Display Font:** Segoe UI, system-ui, -apple-system, sans-serif
**Body Font:** Segoe UI, system-ui, -apple-system, sans-serif
**Label/Mono Font:** Cascadia Code, Fira Code, monospace

**Character:** Tipografía limpia, sin serifa, con buena legibilidad en pantalla. La monoespaciada se reserva exclusivamente para datos numéricos (marcadores, puntuaciones, minutos) transmitiendo precisión técnica.

### Hierarchy
- **Display** (800, 1.5rem / 1.75rem): Títulos de sección y encabezados de página. Uso exclusivo para jerarquía primaria.
- **Headline** (700, 1.25rem): Títulos de cards y modales.
- **Title** (600, 0.95rem / 1.1rem): Nombres de equipos y jugadores en cards.
- **Body** (400, 0.875rem): Texto general, descripciones, metadatos. Máximo 75 caracteres por línea.
- **Label** (600, 0.8rem, +0.5px letter-spacing, uppercase): Labels de formularios, encabezados de tabla, badges de estado.

### Named Rules
**The Mono For Numbers Rule.** Los marcadores, puntuaciones, estadísticas y datos numéricos usan la fuente monoespaciada (Cascadia Code / Fira Code) para alineación precisa y legibilidad.

## Layout

El layout usa un contenedor centralizado con max-width de 1200px. La navegación superior está fija (56px). Los contenidos fluyen en una sola columna con grids de cards responsivos.

- **Grid principal:** `repeat(auto-fill, minmax(280px, 1fr))` para listas de cards
- **Dashboard:** Grid de 2 columnas que colapsa a 1 en mobile
- **Formularios:** Grid de 2 columnas para form-row, colapsa a 1 en mobile
- **Espaciado:** 1.5rem entre secciones, 1rem entre items, 0.75rem en mobile
- **Padding de página:** 2rem (desktop) → 1rem (tablet) → 0.75rem (mobile)
- **Padding top:** 5rem para compensar la navbar fija

### Responsive breakpoints
- 1024px: padding reducido
- 768px: grids colapsan a 1 columna, padding se reduce
- 480px: navbar compacta, cards con menos padding

## Elevation & Depth

El sistema usa un modelo de profundidad basado en capas tonales, no en sombras. Los elementos se elevan visualmente usando fondos más claros que el fondo base.

- **Body:** `--bg-primary: #0f1923` — la superficie más profunda
- **Navbar + Modales:** `--bg-secondary: #1a2332` — capa superior
- **Cards + Contenedores:** `--bg-card: #1e2a3a` — capa de contenido
- **Inputs:** `--bg-input: #243044` — capa interactiva

Las sombras existen pero son sutiles:
- **Card hover:** `0 4px 16px rgba(0,0,0,0.3)` — solo en hover, con borde que cambia al acento
- **Toast:** `0 4px 12px rgba(0,0,0,0.4)` — notificaciones flotantes
- **Modal overlay:** `rgba(0,0,0,0.7)` — fondo semitransparente

### Named Rules
**The Flat-By-Default Rule.** Las superficies son planas en reposo. La profundidad se comunica mediante cambios tonales del fondo, no con sombras. Las sombras aparecen solo como respuesta a estados (hover, focus).

## Shapes

Las esquinas son consistentemente redondeadas con una escala limitada:
- **4px (sm):** badges, match-status, eventos
- **8px (md):** inputs, botones, bracket-matches, toasts — el radio por defecto
- **12px (lg):** cards, modales — la variante más suave

Los avatares de equipo y jugador usan círculos perfectos (50% border-radius). No hay bordes clipping ni formas geométricas no convencionales.

## Components

### Buttons
- **Shape:** 8px de radio, sin bordes (primario/danger) o con borde sutil (secundario)
- **Primary:** Fondo del acento activo (var(--accent)), texto blanco, hover con brightness(1.15)
- **Secondary:** Fondo input navy, texto primario, borde steel, hover con fondo border
- **Danger:** Fondo error red, texto blanco, hover con brightness(1.15)
- **Small variant:** 0.3rem 0.6rem padding, 0.8rem font-size
- **Transition:** 0.2s ease en todas las propiedades

### Cards / Containers
- **Corner Style:** 12px de radio
- **Background:** Card navy (#1e2a3a)
- **Border:** 1px solid border-steel (#2a3648)
- **Hover:** Borde cambia al acento, sombra sutil
- **Internal Padding:** 1.25rem (1rem en mobile)

### Inputs / Selects / Textareas
- **Style:** Fondo input navy (#243044), borde steel (#2a3648), 8px de radio
- **Focus:** Outline eliminado, borde cambia al acento activo
- **Font:** Body size (0.875rem), misma tipografía que el sistema
- **Full width por defecto**

### Navigation
- **Barra:** Fija en parte superior, 56px de altura, fondo secondary (#1a2332), borde inferior steel
- **Links:** Color text-secondary, hover con fondo semitransparente y texto primary
- **Active:** Acento activo + fondo semitransparente
- **Mobile:** Overflow-x scrollable, algunos elementos se ocultan en pantallas muy pequeñas

### Tables (Standings)
- **Headers:** Uppercase, 0.75rem, letter-spacing 0.5px, color text-secondary
- **Rows:** Borde inferior steel, hover con fondo semitransparente
- **Scroll horizontal en mobile** (min-width 650px)

### Chips / Badges
- **Active badge:** Fondo success, texto negro, 4px de radio, 0.7rem font-weight 700
- **Status badges (scheduled/finished):** Fondo azul/verde oscuro con texto del color semántico
- **Event badges:** Fondo acento con opacidad reducida

### Modals
- **Overlay:** Negro 70% opacidad, fadeIn 0.2s
- **Content:** Fondo secondary, 12px radio, slideUp 0.2s, max-width 500px
- **Scroll vertical** si el contenido excede 90vh

### Bracket Matches
- **Style:** Misma estética que cards (fondo card, 8px radio, borde steel)
- **Hover:** Borde cambia al acento
- **Winner highlight:** Fondo semitransparente + fontWeight 600

## Do's and Don'ts

### Do:
- **Do** usar el acento de color con moderación — el rojo, dorado o champagne son el punto focal, no el fondo
- **Do** mantener la jerarquía tipográfica: display para títulos grandes, labels uppercase para metadata
- **Do** usar la fuente monoespaciada para todos los valores numéricos en marcadores y estadísticas
- **Do** aprovechar las cards como contenedor principal de contenido
- **Do** mantener el espaciado generoso en desktop y comprimir gradualmente hacia mobile

### Don't:
- **Don't** usar sombras agresivas — el sistema es plano por defecto
- **Don't** mezclar acentos de diferentes deportes en la misma vista
- **Don't** usar fondos blancos o claros — el sistema es oscuro
- **Don't** agregar decoración sin función — cada elemento debe tener propósito operativo
- **Don't** usar la fuente monoespaciada para texto no numérico
