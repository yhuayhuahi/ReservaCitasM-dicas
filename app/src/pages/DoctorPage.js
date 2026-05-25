import { defaultStyle } from '../default/default.js'
import { AuthService } from '../model/authService.js'
import { MedicoRepository } from '../model/MedicoRepository.js'
import { PacienteRepository } from '../model/PacienteRepository.js'
import { CitaRepository } from '../model/CitaRepository.js'
import { CitaService } from '../model/citaService.js'
import { getTodayDateString, getCurrentTimeString } from '../utils/time.js'
import '../components/ConfirmDialog.js'
import '../components/AvailabilityGrid.js'

const styles = /*css*/`
  ${defaultStyle}
  .page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 32px 18px 40px 18px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .title {
    font-size: 2rem;
    color: #1976d2;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .subtitle {
    color: #4a4a4a;
    font-size: 1rem;
  }
  .row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
  }
  .card {
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 4px 16px #1976d214, 0 1.5px 8px #0002;
    padding: 20px 22px;
  }
  .card h2 {
    font-size: 1.35rem;
    margin-bottom: 8px;
    color: #1a237e;
  }
  .alert {
    padding: 10px 12px;
    border-radius: 8px;
    background: #fff3e0;
    color: #ef6c00;
    border: 1px solid #ffcc80;
    margin-bottom: 10px;
  }
  .btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  }
  .btn.ghost {
    background: #f5f5f5;
    color: #333;
  }
  .btn.small {
    padding: 8px 12px;
    font-size: 0.95rem;
  }
  .summary {
    display: grid;
    gap: 10px;
    margin-top: 6px;
  }
  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid #dde6f5;
    background: #f7f9ff;
  }
  .summary-item.available { background: #e8f5ff; border-color: #90caf9; color: #0d47a1; }
  .summary-item.reserved { background: #ffe8e8; border-color: #ef9a9a; color: #b71c1c; }
  .summary-item.empty { background: #f0f4f8; border-color: #cfd8dc; color: #455a64; }
  .summary-title { font-weight: 700; }
  .summary-pill {
    font-size: 0.9rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
    background: #ffffffcc;
  }
  @media (max-width: 900px) {
    .row { grid-template-columns: 1fr; }
  }
`

class DoctorPage extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.selectedDate = getTodayDateString()
    this.pendingAdd = new Set()
    this.pendingRemove = new Set()
  }

  connectedCallback() {
    this.render()
  }

  render() {
    const session = AuthService.getSession()
    if (!session || session.rol !== 'medico') {
      this.shadowRoot.innerHTML = `<style>${styles}</style><div class="page"><div class="alert">Necesitas iniciar sesión como médico.</div></div>`
      return
    }

    const medico = MedicoRepository.getById(session.id)
    const date = this.selectedDate
    const bloques = CitaService.getBloquesHorario()
    const estadoSlots = this._mapEstadoSlots(session.id, date)
    const nowDate = getTodayDateString()
    const nowTime = getCurrentTimeString()

    const slotsHtml = bloques.map(hora => {
      const estado = estadoSlots[hora] || 'empty'
      const isPast = date < nowDate || (date === nowDate && hora <= nowTime)
      let cls = `slot ${estado}`
      if (isPast) cls += ' disabled'
      if (estado === 'empty' && this.pendingAdd.has(hora)) cls = 'slot add'
      if (estado === 'available' && this.pendingRemove.has(hora)) cls = 'slot remove'
      return `<div class="${cls}" data-hora="${hora}" data-estado="${estado}">${hora}</div>`
    }).join('')

    const resumen = this._getResumenDia(estadoSlots)

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="page">
        <div class="header">
          <div>
            <div class="title">Panel del médico</div>
            <div class="subtitle">${medico ? medico.nombre : 'Médico'} • ${medico ? medico.especialidad : ''}</div>
          </div>
          <div class="header-actions">
            <div class="subtitle">Agenda y disponibilidad</div>
            <button class="btn ghost small" id="logout-btn">Cerrar sesión</button>
          </div>
        </div>
        <div class="row">
          <div class="card">
            <h2>Disponibilidad por día</h2>
            <availability-grid id="availability-grid"></availability-grid>
          </div>
          <div class="card">
            <h2>Resumen del día</h2>
            <div class="summary">
              <div class="summary-item available">
                <div class="summary-title">Bloques disponibles</div>
                <span class="summary-pill">${resumen.disponibles}</span>
              </div>
              <div class="summary-item reserved">
                <div class="summary-title">Bloques reservados</div>
                <span class="summary-pill">${resumen.reservados}</span>
              </div>
              <div class="summary-item empty">
                <div class="summary-title">Bloques sin definir</div>
                <span class="summary-pill">${resumen.vacios}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <confirm-dialog id="confirm-dialog"></confirm-dialog>
    `

    const grid = this.shadowRoot.getElementById('availability-grid')
    if (grid) grid.data = { date, slotsHtml }

    this._bindEvents(session.id)
  }

  _bindEvents(medicoId) {
    const grid = this.shadowRoot.getElementById('availability-grid')
    if (!grid) return
    const dateInput = grid.shadowRoot.getElementById('date-input')
    const clearBtn = grid.shadowRoot.getElementById('clear-selection')
    const saveBtn = grid.shadowRoot.getElementById('save-availability')
    const confirmDialog = this.shadowRoot.getElementById('confirm-dialog')
    const logoutBtn = this.shadowRoot.getElementById('logout-btn')

    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        this.selectedDate = e.target.value
        this.pendingAdd.clear()
        this.pendingRemove.clear()
        this.render()
      })
    }

    grid.addEventListener('slot-toggle', (e) => {
      const { hora, action, selected } = e.detail
      if (action === 'add') {
        if (selected) this.pendingAdd.add(hora)
        else this.pendingAdd.delete(hora)
      } else if (action === 'remove') {
        if (selected) this.pendingRemove.add(hora)
        else this.pendingRemove.delete(hora)
      }
    })

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.pendingAdd.clear()
        this.pendingRemove.clear()
        grid.clearSelection()
      })
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const horasAdd = Array.from(this.pendingAdd)
        const horasRemove = Array.from(this.pendingRemove)
        if (!horasAdd.length && !horasRemove.length) return

        const message = `Vas a agregar ${horasAdd.length} bloque(s) y quitar ${horasRemove.length} bloque(s). ¿Deseas continuar?`
        const ok = await confirmDialog.open({
          title: 'Confirmar cambios',
          message
        })
        if (!ok) return

        if (horasAdd.length) {
          CitaService.medicoDeclaraDisponibilidad({
            medicoId,
            fecha: this.selectedDate,
            horas: horasAdd
          })
        }
        horasRemove.forEach(hora => {
          CitaService.medicoDeshabilitaBloque({
            medicoId,
            fecha: this.selectedDate,
            hora
          })
        })
        this.pendingAdd.clear()
        this.pendingRemove.clear()
        this.render()
      })
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        AuthService.logout()
        window.location.hash = '#/'
      })
    }
  }

  _mapEstadoSlots(medicoId, fecha) {
    const slots = {}
    const citas = CitaRepository.getAll().filter(c => c.medicoId === medicoId && c.fecha === fecha && c.activa)
    citas.forEach(c => {
      if (c.tipo === 'paciente') slots[c.hora] = 'reserved'
      if (c.tipo === 'medico' && !slots[c.hora]) slots[c.hora] = 'available'
    })
    return slots
  }

  _getResumenDia(estadoSlots) {
    let disponibles = 0
    let reservados = 0
    let vacios = 0
    Object.values(estadoSlots).forEach(estado => {
      if (estado === 'available') disponibles += 1
      if (estado === 'reserved') reservados += 1
    })
    const totalDefinidos = disponibles + reservados
    const totalBloques = CitaService.getBloquesHorario().length
    vacios = totalBloques - totalDefinidos
    return { disponibles, reservados, vacios }
  }

  _getFechaHoy() {
    return getTodayDateString()
  }

  _getHoraActual() {
    return getCurrentTimeString()
  }
}

customElements.define('doctor-page', DoctorPage)
