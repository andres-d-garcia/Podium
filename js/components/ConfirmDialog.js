class ConfirmDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="css/main.css">
      <div id="overlay" class="modal-overlay" style="display:none">
        <div class="modal-content">
          <p id="message" style="margin-bottom:1.5rem"></p>
          <div class="modal-actions">
            <button id="cancel" class="btn btn-secondary">Cancelar</button>
            <button id="confirm" class="btn btn-danger">Confirmar</button>
          </div>
        </div>
      </div>
    `;
    this.callback = null;
  }

  connectedCallback() {
    this.shadowRoot.getElementById('confirm').onclick = () => {
      this.hide();
      if (this.callback) this.callback(true);
    };
    this.shadowRoot.getElementById('cancel').onclick = () => {
      this.hide();
      if (this.callback) this.callback(false);
    };
  }

  show(message, callback) {
    this.callback = callback;
    this.shadowRoot.getElementById('message').textContent = message;
    this.shadowRoot.getElementById('overlay').style.display = 'flex';
  }

  hide() {
    this.shadowRoot.getElementById('overlay').style.display = 'none';
  }
}
customElements.define('podium-confirm', ConfirmDialog);
