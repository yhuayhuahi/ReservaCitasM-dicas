import { defaultStyle } from '../default/default.js'

const styles = /*css*/`
  ${defaultStyle}
  :host {
    position: fixed;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  :host([open]) { display: flex; }
  .backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.25);
  }
  .dialog {
    position: relative;
    z-index: 1;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 6px 24px #0003;
    padding: 20px 24px;
    max-width: 380px;
    width: calc(100% - 32px);
  }
  h3 { margin-bottom: 8px; font-size: 1.2rem; color: #1a237e; }
  p { margin-bottom: 16px; color: #444; }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  button {
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
  }
  .cancel { background: #f5f5f5; color: #333; }
  .confirm { background: #1976d2; color: #fff; }
`

class ConfirmDialog extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this._resolve = null
  }

  connectedCallback() {
    this.render()
  }

  render() {
    const title = this.getAttribute('title') || 'Confirmar'
    const message = this.getAttribute('message') || '¿Deseas confirmar esta acción?'
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="backdrop"></div>
      <div class="dialog">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="actions">
          <button class="cancel" id="cancel">Cancelar</button>
          <button class="confirm" id="confirm">Confirmar</button>
        </div>
      </div>
    `

    this.shadowRoot.getElementById('cancel').addEventListener('click', () => this._finish(false))
    this.shadowRoot.getElementById('confirm').addEventListener('click', () => this._finish(true))
    this.shadowRoot.querySelector('.backdrop').addEventListener('click', () => this._finish(false))
  }

  open({ title, message }) {
    if (title) this.setAttribute('title', title)
    if (message) this.setAttribute('message', message)
    this.setAttribute('open', '')
    this.render()
    return new Promise(resolve => { this._resolve = resolve })
  }

  _finish(result) {
    this.removeAttribute('open')
    if (this._resolve) {
      this._resolve(result)
      this._resolve = null
    }
  }
}

customElements.define('confirm-dialog', ConfirmDialog)
