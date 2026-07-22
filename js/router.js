class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    window.addEventListener('hashchange', () => this.resolve());
  }

  addRoute(pattern, handler) {
    this.routes[pattern] = handler;
  }

  navigate(path) {
    window.location.hash = path;
  }

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
        return;
      }
    }

    this.routes['dashboard'](main, {});
    updateNavActive('dashboard');
  }

  start() {
    this.resolve();
  }
}

function updateNavActive(hash) {
  const baseHash = hash.split('/')[0];
  document.querySelectorAll('.navbar-links a').forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    link.classList.toggle('active', href === baseHash);
  });
}

const router = new Router();
