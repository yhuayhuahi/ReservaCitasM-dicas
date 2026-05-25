import { defaultStyle } from '../default/default.js'

const styles = /*css*/`
  ${defaultStyle}
  .list {
    margin-top: 12px;
    display: grid;
    gap: 8px;
  }
  .list-item {
    padding: 10px 12px;
    border-radius: 8px;
    background: #f7f9ff;
    border: 1px solid #dde6f5;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .pill {
    font-size: 0.85rem;
    background: #e3f2fd;
    color: #1565c0;
    padding: 4px 10px;
    border-radius: 999px;
  }
  .alert {
    padding: 10px 12px;
    border-radius: 8px;
    background: #fff3e0;
    color: #ef6c00;
    border: 1px solid #ffcc80;
    margin-bottom: 10px;
  }
  .meta {
    margin-bottom: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    background: #e8f5ff;
    color: #0d47a1;
    border: 1px solid #90caf9;
    font-size: 0.95rem;
  }
`

class AppointmentsList extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  set data({ html, meta }) {
    this._html = html
    this._meta = meta
    this.render()
  }

  connectedCallback() {
    if (!this._html) this._html = ''
    if (!this._meta) this._meta = ''
    this.render()
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      ${this._meta || ''}
      <div class="list">${this._html || ''}</div>
    `
  }
}

customElements.define('appointments-list', AppointmentsList)
