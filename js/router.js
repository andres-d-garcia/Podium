class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    window.addEventListener('hashchange', () => this.resolve());
  }

  // Registra una vista (pattern → handler). Manejo de navegación por hash (RNF-04).
  addRoute(pattern, handler) {
    this.routes[pattern] = handler;
  }

  navigate(path) {
    window.location.hash = path;
  }

  // Resuelve el hash actual contra las rutas registradas y renderiza la vista
  resolve() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const main = document.getElementById('app');

    for (const [pattern, handler] of Object.entries(this.routes)) {
      const regex = new RegExp('^' + pattern.replace(/:\w+/g, '([^/]+)') + '$');
      const match = hash.match(regex);
      if (match) {
        const params = {};
        const paramNames = [...pattern.matchAll(/:(\w+)/g)].map(m => m[1]);
        paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });

        this.currentRoute = { pattern, params };
        handler(main, params);
        updateNavActive(hash);
        if (typeof refreshActiveLeagueIndicator === 'function') {
          refreshActiveLeagueIndicator();
        }
        return;
      }
    }

    this.routes['dashboard'](main, {});
    updateNavActive('dashboard');
    if (typeof refreshActiveLeagueIndicator === 'function') {
      refreshActiveLeagueIndicator();
    }
  }

  start() {
    this.resolve();
  }
}

function updateNavActive(hash) {
  const baseHash = hash.split('/')[0];
  const nav = document.querySelector('podium-navbar');
  const root = nav?.shadowRoot || document;
  root.querySelectorAll('.navbar-links a').forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    link.classList.toggle('active', href === baseHash);
  });
}

const router = new Router();
