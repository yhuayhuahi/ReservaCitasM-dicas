import { defaultStyle } from '../default/default.js'
import { AuthService } from '../model/authService.js'

const styles = /*css*/`
  ${defaultStyle}
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 380px;
    margin: 48px auto;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 4px 16px #1976d214, 0 1.5px 8px #0002;
    padding: 2.7rem 2.2rem 2.2rem 2.2rem;
    transition: box-shadow .18s;
  }
  h1 {
    text-align: center;
    font-size: 2.1em;
    color: #1976d2;
    font-weight: 700;
    margin: 0 0 12px 0;
    letter-spacing: -.03em;
  }
  form {
    display: grid;
    gap: 1.5rem;
    margin-top: 1.5rem;
    width: 100%;
  }
  .material-field {
    position: relative;
    margin-bottom: 4px;
  }
  label.material-label {
    position: absolute;
    left: 16px; top: 14px;
    font-size: 1em;
    color: #777;
    background: none;
    pointer-events: none;
    transition: all 0.19s cubic-bezier(.4,0,.2,1);
    z-index: 1;
    padding: 0 6px;
    border-radius: 3px;
  }
  input.material-input {
    width: 100%;
    border: 1.7px solid #b3c6e4;
    border-radius: 6px;
    padding: 18px 15px 7px 15px;
    font-size: 1.07em;
    background: none;
    outline: none;
    transition: border-color .19s;
  }
  input.material-input:focus {
    border-color: #1976d2;
  }
  input.material-input:focus + label.material-label, input.material-input.notempty + label.material-label {
    top: -10px;
    left: 10px;
    font-size: 0.87em;
    color: #1976d2;
    background: #fff;
    padding: 0 6px;
    z-index: 2;
  }
  select {
    border-radius: 6px;
    border: 1.5px solid #b3c6e4;
    font-size: 1.01em;
    padding: 8.5px 7.5px;
    margin-top: 8px;
    background: #fafbff;
  }
  button[type="submit"] {
    display: block;
    width: 100%;
    padding: 12px 0;
    background: linear-gradient(90deg,#1976d2 70%,#2196f3 100%);
    color: #fff;
    border: none;
    border-radius: 7px;
    font-size: 1.18em;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 10px #1976d225;
    overflow: hidden;
    position: relative;
    transition: box-shadow .15s;
  }
  button[type="submit"]:hover,
  button[type="submit"]:focus {
    box-shadow: 0 4px 20px #1976d240;
    background: linear-gradient(90deg,#2196f3 80%,#1769aa 100%);
  }
  .toggle {
    color: #1976d2; border: 0; background: none; cursor: pointer; margin-top: 1.7rem; font-size: 1.08rem; text-decoration: underline;
    outline: none; text-align: center;
  }
  .error {
    background: #ffe7e7;
    color: #d4001e;
    border: 1.3px solid #efc1c1;
    margin-bottom: 1rem;
    padding: 7.5px 12px;
    border-radius: 7px;
    font-size: 0.99em;
    text-align: center;
  }
  .success {
    background: #e1fae1;
    color: #197448;
    border: 1.3px solid #97deaa;
    margin-bottom: 1rem;
    padding: 7.5px 12px;
    border-radius: 7px;
    font-size: 0.99em;
    text-align: center;
  }
  @media (max-width: 500px) {
    .container { padding: 2rem 0.7rem; }
  }
`

const htmlRender = (mode, error, success) => `
  <div class="container">
    <h1>${mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}</h1>
    ${error ? `<div class="error">${error}</div>` : ''}
    ${success ? `<div class="success">${success}</div>` : ''}
    <form id="auth-form" autocomplete="off">
      <div class="material-field">
        <input type="email" name="email" required class="material-input" autocomplete="username" />
        <label class="material-label">Email</label>
      </div>
      <div class="material-field">
        <input type="password" name="password" required minlength="3" class="material-input" autocomplete="current-password" />
        <label class="material-label">Contraseña</label>
      </div>
      ${mode === 'register' ? `
        <div class="material-field">
          <input type="text" name="nombre" required class="material-input" />
          <label class="material-label">Nombre</label>
        </div>
        <div class="material-field">
          <select name="rol" required>
            <option value="paciente">Paciente</option>
            <option value="medico">Médico</option>
          </select>
        </div>
        <div class="data-extra"></div>
      ` : ''}
      <button type="submit">${mode === 'login' ? 'Entrar' : 'Crear cuenta'}</button>
    </form>
    <button class="toggle" id="toggle-mode">${mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresar'}</button>
  </div>
`

class LoginPage extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.mode = 'login' // o 'register'
    this.error = ''
    this.success = ''
    this._handleSubmit = this.onSubmit.bind(this)
  }

  connectedCallback() {
    this.render()
  }

  disconnectedCallback() {
    const form = this.shadowRoot.getElementById('auth-form')
    if (form) form.removeEventListener('submit', this._handleSubmit)
  }

  render() {
    this.shadowRoot.innerHTML = `<style>${styles}</style>${htmlRender(this.mode, this.error, this.success)}`
    this._bindEvents()
    this.upgradeRegisterForm()
    this.materialFloatingLabels()
  }

  _bindEvents() {
    const form = this.shadowRoot.getElementById('auth-form')
    const toggle = this.shadowRoot.getElementById('toggle-mode')

    if (form) {
      form.addEventListener('submit', this._handleSubmit)
    }
    if (toggle) {
      toggle.addEventListener('click', () => {
        this.mode = this.mode === 'login' ? 'register' : 'login'
        this.error = ''
        this.success = ''
        this.render()
      })
    }
  }

  upgradeRegisterForm() {
    // Para mostrar campos extra en registro de médico
    if (this.mode !== 'register') return
    const form = this.shadowRoot.getElementById('auth-form')
    if (!form) return
    form.rolSelect = form.querySelector('select[name="rol"]')
    const extra = form.querySelector('.data-extra')
    if (form.rolSelect) {
      form.rolSelect.addEventListener('change', (e) => {
        if (e.target.value === 'medico') {
          extra.innerHTML = `<div class="material-field"><input type="text" name="especialidad" required class="material-input" /><label class="material-label">Especialidad</label></div>`
        } else {
          extra.innerHTML = ''
        }
      })
    }
  }

  materialFloatingLabels() {
    // Añade/quita clase 'notempty' para inputs rellenos (label flotante)
    this.shadowRoot.querySelectorAll('.material-input').forEach(input => {
      input.addEventListener('blur', e => {
        if (e.target.value) {
          e.target.classList.add('notempty')
        } else {
          e.target.classList.remove('notempty')
        }
      })
      // En caso de autocompletado u ojos de password
      input.addEventListener('input', e => {
        if (e.target.value) {
          e.target.classList.add('notempty')
        } else {
          e.target.classList.remove('notempty')
        }
      })
    })
  }

  async onSubmit(e) {
    e.preventDefault()
    const form = e.target
    const fd = new FormData(form)
    const email = fd.get('email').toLowerCase().trim()
    const password = fd.get('password')
    if (this.mode === 'login') {
      const result = AuthService.login({ email, password })
      if (result.ok) {
        this.success = `Bienvenido${result.user.nombre ? ', ' + result.user.nombre : ''}! Redirigiendo...`
        this.error = ''
        this.render()
        setTimeout(() => {
          window.location.hash = result.rol === 'medico' ? '#/doctor' : '#/patient'
        }, 1200)
      } else {
        this.success = ''
        this.error = result.error
        this.render()
      }
    } else {
      // Registro
      const nombre = fd.get('nombre')
      const rol = fd.get('rol')
      let out
      if (!email || !password || !nombre || !rol) {
        this.error = 'Completa todos los campos.'
        this.success = ''
        this.render()
        return
      }
      if (rol === 'paciente') {
        out = AuthService.registrarPaciente({
          id: 'P_' + Date.now() + '_' + Math.floor(Math.random()*1000),
          nombre, telefono: '', email, password
        })
      } else if (rol === 'medico') {
        const especialidad = fd.get('especialidad')
        if (!especialidad) {
          this.error = 'Debes indicar una especialidad.'
          this.success = ''
          this.render()
          return
        }
        out = AuthService.registrarMedico({
          id: 'M_' + Date.now() + '_' + Math.floor(Math.random()*1000),
          nombre, especialidad, email, password
        })
      }
      if (out && out.ok) {
        this.success = 'Cuenta creada, ¡puedes iniciar sesión!'
        this.error = ''
        this.mode = 'login'
        this.render()
      } else {
        this.error = out.error
        this.success = ''
        this.render()
      }
    }
  }
}

customElements.define('login-page', LoginPage)
