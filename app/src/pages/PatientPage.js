import { defaultStyle } from '../default/default.js'
import { AuthService } from '../model/authService.js'
import { MedicoRepository } from '../model/MedicoRepository.js'
import { CitaRepository } from '../model/CitaRepository.js'
import { CitaService } from '../model/citaService.js'
import { minutesUntil, formatRemaining, getTodayDateString, getCurrentTimeString } from '../utils/time.js'
import '../components/ConfirmDialog.js'

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
  .subtitle { color: #4a4a4a; font-size: 1rem; }
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
  .card h2 { font-size: 1.35rem; margin-bottom: 8px; color: #1a237e; }
  .filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    margin-bottom: 14px;
  }
  select, input[type="date"] {
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
    margin-top: 10px;
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
  .slot.selected { background: #e0f7fa; color: #00796b; border-color: #4dd0e1; }
  .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; }
  .btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  }
  .btn.small {
    padding: 8px 12px;
    font-size: 0.95rem;
  }
  .btn.primary { background: #1976d2; color: #fff; box-shadow: 0 2px 10px #1976d225; }
  .btn.ghost { background: #f5f5f5; color: #333; }
  .list { margin-top: 12px; display: grid; gap: 8px; }
  .list-item {
    padding: 10px 12px;
    border-radius: 8px;
    background: #f7f9ff;
    border: 1px solid #dde6f5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .pill {
    font-size: 0.85rem;
    background: #e3f2fd;
    color: #1565c0;
    padding: 4px 10px;
    border-radius: 999px;
    white-space: nowrap;
    min-width: 88px;
    text-align: center;
  }
  .danger {
    background: #ffe8e8;
    color: #c62828;
    border: 1px solid #ef9a9a;
  }
  .alert {
    padding: 10px 12px;
    border-radius: 8px;
    background: #fff3e0;
    color: #ef6c00;
    border: 1px solid #ffcc80;
    margin-bottom: 10px;
  }
  #appointments-list {
    max-height: 360px;
    overflow: auto;
    padding-right: 4px;
  }
  @media (max-width: 900px) {
    .row { grid-template-columns: 1fr; }
  }
`

class PatientPage extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.selectedDate = getTodayDateString()
    this.selectedEspecialidad = ''
    this.selectedMedicoId = ''
    this.selectedHora = ''
  }

  connectedCallback() {
    this.render()
  }

  render() {
    const session = AuthService.getSession()
    if (!session || session.rol !== 'paciente') {
      this.shadowRoot.innerHTML = `<style>${styles}</style><div class="page"><div class="alert">Necesitas iniciar sesión como paciente.</div></div>`
      return
    }

    const medicos = MedicoRepository.getAll()
    const especialidades = [...new Set(medicos.map(m => m.especialidad))]
    if (!this.selectedEspecialidad && especialidades.length) this.selectedEspecialidad = especialidades[0]
    const medicosFiltrados = medicos.filter(m => m.especialidad === this.selectedEspecialidad)
    if (!this.selectedMedicoId && medicosFiltrados.length) this.selectedMedicoId = medicosFiltrados[0].id

    const nowDate = getTodayDateString()
    const nowTime = getCurrentTimeString()
    const bloquesDisponibles = this.selectedMedicoId
      ? CitaService.getBloquesDisponibles(this.selectedMedicoId, nowDate, nowTime, this.selectedDate)
      : []

    const slotsHtml = bloquesDisponibles.length
      ? bloquesDisponibles.map(h => {
          const sel = this.selectedHora === h ? 'selected' : ''
          return `<div class="slot ${sel}" data-hora="${h}">${h}</div>`
        }).join('')
      : `<div class="alert">No hay bloques disponibles para la fecha seleccionada.</div>`

    const citas = this._getCitasPaciente(session.id)
    const citasHtml = citas.length ? citas.map(c => {
      const medico = MedicoRepository.getById(c.medicoId)
      const nombreMedico = medico ? medico.nombre : c.medicoId
      const mins = minutesUntil(c.fecha, c.hora)
      const remain = formatRemaining(mins)
      return `<div class="list-item">
        <div><strong>${c.fecha}</strong> ${c.hora} - ${nombreMedico}</div>
        <div style="display:flex; gap:8px; align-items:center;">
          <span class="pill">${remain}</span>
          <button class="btn ghost danger" data-cancel-id="${c.id}">Cancelar</button>
        </div>
      </div>`
    }).join('') : `<div class="alert">No tienes citas próximas.</div>`

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="page">
        <div class="header">
          <div>
            <div class="title">Panel del paciente</div>
            <div class="subtitle">Reserva y gestiona tus citas</div>
          </div>
          <div class="header-actions">
            <div class="subtitle">Disponibilidad y reservas</div>
            <button class="btn ghost small" id="logout-btn">Cerrar sesión</button>
          </div>
        </div>
        <div class="row">
          <div class="card">
            <h2>Reservar cita</h2>
            <div class="filters">
              <select id="especialidad-select">
                ${especialidades.map(e => `<option value="${e}" ${e === this.selectedEspecialidad ? 'selected' : ''}>${e}</option>`).join('')}
              </select>
              <select id="medico-select">
                ${medicosFiltrados.map(m => `<option value="${m.id}" ${m.id === this.selectedMedicoId ? 'selected' : ''}>${m.nombre}</option>`).join('')}
              </select>
              <input type="date" id="date-input" value="${this.selectedDate}" />
            </div>
            <div class="slot-grid" id="slot-grid">${slotsHtml}</div>
            <div class="actions">
              <button class="btn ghost" id="clear-selection">Limpiar</button>
              <button class="btn primary" id="reserve-slot">Reservar</button>
            </div>
          </div>
          <div class="card">
            <h2>Mis próximas citas</h2>
            <div class="list" id="appointments-list">${citasHtml}</div>
          </div>
        </div>
      </div>
      <confirm-dialog id="confirm-dialog"></confirm-dialog>
    `

    this._bindEvents(session.id)
  }

  _bindEvents(pacienteId) {
    const especialidadSelect = this.shadowRoot.getElementById('especialidad-select')
    const medicoSelect = this.shadowRoot.getElementById('medico-select')
    const dateInput = this.shadowRoot.getElementById('date-input')
    const slotGrid = this.shadowRoot.getElementById('slot-grid')
    const clearBtn = this.shadowRoot.getElementById('clear-selection')
    const reserveBtn = this.shadowRoot.getElementById('reserve-slot')
    const confirmDialog = this.shadowRoot.getElementById('confirm-dialog')
    const list = this.shadowRoot.getElementById('appointments-list')
    const logoutBtn = this.shadowRoot.getElementById('logout-btn')

    if (especialidadSelect) {
      especialidadSelect.addEventListener('change', (e) => {
        this.selectedEspecialidad = e.target.value
        this.selectedMedicoId = ''
        this.selectedHora = ''
        this.render()
      })
    }

    if (medicoSelect) {
      medicoSelect.addEventListener('change', (e) => {
        this.selectedMedicoId = e.target.value
        this.selectedHora = ''
        this.render()
      })
    }

    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        this.selectedDate = e.target.value
        this.selectedHora = ''
        this.render()
      })
    }

    if (slotGrid) {
      slotGrid.addEventListener('click', (e) => {
        const slot = e.target.closest('.slot')
        if (!slot) return
        const hora = slot.dataset.hora
        this.selectedHora = this.selectedHora === hora ? '' : hora
        this.render()
      })
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.selectedHora = ''
        this.render()
      })
    }

    if (reserveBtn) {
      reserveBtn.addEventListener('click', async () => {
        if (!this.selectedMedicoId || !this.selectedHora) return
        const ok = await confirmDialog.open({
          title: 'Confirmar reserva',
          message: `¿Deseas reservar la cita del ${this.selectedDate} a las ${this.selectedHora}?`
        })
        if (!ok) return
        const result = CitaService.pacienteReserva({
          medicoId: this.selectedMedicoId,
          pacienteId,
          fecha: this.selectedDate,
          hora: this.selectedHora
        })
        if (result.ok) {
          this.selectedHora = ''
          this.render()
        }
      })
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        AuthService.logout()
        window.location.hash = '#/'
      })
    }

    if (list) {
      list.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-cancel-id]')
        if (!btn) return
        const citaId = btn.getAttribute('data-cancel-id')
        const ok = await confirmDialog.open({
          title: 'Cancelar cita',
          message: '¿Deseas cancelar esta cita?' }
        )
        if (!ok) return
        const out = CitaService.cancelarCitaPaciente({ citaId, pacienteId })
        if (out.ok) this.render()
      })
    }
  }

  _getCitasPaciente(pacienteId) {
    const hoy = getTodayDateString()
    const ahora = getCurrentTimeString()
    return CitaRepository.getAll()
      .filter(c => c.pacienteId === pacienteId && c.tipo === 'paciente' && c.activa)
      .filter(c => c.fecha > hoy || (c.fecha === hoy && c.hora > ahora))
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
  }

  _getFechaHoy() {
    return getTodayDateString()
  }

  _getHoraActual() {
    return getCurrentTimeString()
  }
}

customElements.define('patient-page', PatientPage)
