import { defaultStyle } from '../default/default.js'

const styles = /*css*/`
  ${defaultStyle}
  .date-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 14px;
  }
  input[type="date"] {
    border: 1.4px solid #b3c6e4;
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 1rem;
    background: #f8faff;
  }
  .slot-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 10px;
  }
  .slot {
    padding: 9px 10px;
    border-radius: 8px;
    border: 1.4px solid #c8d4f0;
    background: #f6f9ff;
    color: #223;
    font-weight: 600;
    cursor: pointer;
    text-align: center;
    transition: all .15s;
    user-select: none;
  }
  .slot.available { background: #e8f5ff; color: #1976d2; border-color: #90caf9; }
  .slot.reserved { background: #ffe8e8; color: #c62828; border-color: #ef9a9a; cursor: not-allowed; }
  .slot.empty { background: #f6f9ff; color: #37474f; }
  .slot.add { background: #e0f7fa; color: #00796b; border-color: #4dd0e1; }
  .slot.remove { background: #fff3e0; color: #ef6c00; border-color: #ffcc80; }
  .slot.disabled { background: #f0f0f0; color: #9e9e9e; border-color: #ddd; cursor: not-allowed; }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 14px;
  }
  .btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  }
  .btn.primary { background: #1976d2; color: #fff; box-shadow: 0 2px 10px #1976d225; }
  .btn.ghost { background: #f5f5f5; color: #333; }
`

class AvailabilityGrid extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this._handleClick = this._handleClick.bind(this)
  }

  set data({ date, slotsHtml }) {
    this._date = date
    this._slotsHtml = slotsHtml
    this.render()
  }

  connectedCallback() {
    if (!this._date) this._date = ''
    if (!this._slotsHtml) this._slotsHtml = ''
    this.render()
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="date-row">
        <label>Fecha:</label>
        <input type="date" id="date-input" value="${this._date}" />
      </div>
      <div class="slot-grid" id="slot-grid">${this._slotsHtml || ''}</div>
      <div class="actions">
        <button class="btn ghost" id="clear-selection">Limpiar selección</button>
        <button class="btn primary" id="save-availability">Guardar cambios</button>
      </div>
    `

    const grid = this.shadowRoot.getElementById('slot-grid')
    if (grid) grid.addEventListener('click', this._handleClick)
  }

  _handleClick(e) {
    const slot = e.target.closest('.slot')
    if (!slot || slot.classList.contains('reserved') || slot.classList.contains('disabled')) return
    const estado = slot.dataset.estado
    let action = null
    if (estado === 'empty') action = 'add'
    if (estado === 'available') action = 'remove'
    if (!action) return

    const className = action === 'add' ? 'add' : 'remove'
    const selected = !slot.classList.contains(className)
    slot.classList.toggle(className, selected)

    this.dispatchEvent(new CustomEvent('slot-toggle', {
      detail: { hora: slot.dataset.hora, action, selected },
      bubbles: true,
      composed: true
    }))
  }

  clearSelection() {
    this.shadowRoot.querySelectorAll('.slot.add, .slot.remove')
      .forEach(slot => slot.classList.remove('add', 'remove'))
  }
}

customElements.define('availability-grid', AvailabilityGrid)
