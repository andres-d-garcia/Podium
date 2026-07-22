class ChartContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<div id="chart-wrapper"><canvas id="chart"></canvas></div>`;
    this._chart = null;
  }

  renderChart(config) {
    const canvas = this.shadowRoot.getElementById('chart');
    if (this._chart) this._chart.destroy();

    if (!config || !config.data || !config.data.labels || config.data.labels.length === 0) {
      this.shadowRoot.innerHTML = `
        <div style="text-align:center;padding:2rem;color:var(--text-muted);font-size:0.9rem">
          No hay datos suficientes
        </div>
      `;
      return;
    }

    const ctx = canvas.getContext('2d');
    this._chart = new Chart(ctx, {
      type: config.type || 'bar',
      data: config.data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        color: '#8b978f',
        plugins: {
          legend: {
            labels: { color: '#ece8e1' }
          }
        },
        scales: config.type !== 'pie' && config.type !== 'doughnut' ? {
          x: { ticks: { color: '#8b978f' }, grid: { color: '#2a3648' } },
          y: { ticks: { color: '#8b978f' }, grid: { color: '#2a3648' } }
        } : undefined,
        ...(config.options || {})
      }
    });
  }
}
customElements.define('podium-chart', ChartContainer);
