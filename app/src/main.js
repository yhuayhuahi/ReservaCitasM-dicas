import './pages/LoginPage.js'
import './pages/PatientPage.js'
import './pages/DoctorPage.js'
import { AuthService } from './model/authService.js'

const app = document.querySelector("#app")

function render() {
  // Obtenemos el hash (ej: #/about) o '/' por defecto si está vacío
  const path = window.location.hash || '#/'
  
  app.innerHTML = ''; // Limpia

  if (path === '#/') {
    const loginPage = document.createElement('login-page');
    app.appendChild(loginPage);
  } else if (path === '#/patient') {
    const session = AuthService.getSession()
    if (!session || session.rol !== 'paciente') {
      window.location.hash = '#/'
      return
    }
    const patientPage = document.createElement('patient-page');
    app.appendChild(patientPage);
  } else if (path === '#/doctor') {
    const session = AuthService.getSession()
    if (!session || session.rol !== 'medico') {
      window.location.hash = '#/'
      return
    }
    const doctorPage = document.createElement('doctor-page');
    app.appendChild(doctorPage);
  }
}

// Escuchar cambios en el hash (cuando cambia la URL)
window.addEventListener('hashchange', render)

// Configuración inicial
render()
