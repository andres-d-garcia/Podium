class LoadingState extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/components.css">
      <div class="loading-container" id="loader" style="display:none">
        <div class="loading-spinner"></div>
      </div>
    `;
  }

  set visible(val) {
    this.shadowRoot.getElementById('loader').style.display = val ? 'flex' : 'none';
  }
}
customElements.define('podium-loading', LoadingState);
