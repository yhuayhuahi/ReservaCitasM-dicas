import { PacienteRepository } from './PacienteRepository.js';
import { MedicoRepository } from './MedicoRepository.js';

const SESSION_KEY = 'SESS_USER';

export class AuthService {
  // Intenta login. Retorna {ok: true, rol, user} o {ok: false, error}
  static login({ email, password }) {
    const emailNorm = (email || '').toLowerCase().trim();
    const medico = MedicoRepository.getAll().find(m => m.email === emailNorm && m.password === password);
    if (medico) {
      this._saveSession({ id: medico.id, email: medico.email, rol: 'medico' });
      return { ok: true, rol: 'medico', user: medico };
    }
    const user = PacienteRepository.getAll().find(p => p.email === emailNorm && p.password === password);
    if (user) {
      this._saveSession({ id: user.id, email: user.email, rol: 'paciente' });
      return { ok: true, rol: 'paciente', user };
    }
    return { ok: false, error: 'Usuario o contraseña incorrectos' };
  }

  // Registra un paciente. Email único obligatorio.
  static registrarPaciente({ id, nombre, telefono, email, password }) {
    email = email.toLowerCase().trim();
    if (PacienteRepository.getAll().some(p => p.email === email) ||
        MedicoRepository.getAll().some(m => m.email === email)) {
      return { ok: false, error: 'El email ya está registrado.' };
    }
    PacienteRepository.save({ id, nombre, telefono, email, password });
    return { ok: true };
  }

  // Registra médico. Email único obligatorio.
  static registrarMedico({ id, nombre, especialidad, email, password }) {
    email = email.toLowerCase().trim();
    if (PacienteRepository.getAll().some(p => p.email === email) ||
        MedicoRepository.getAll().some(m => m.email === email)) {
      return { ok: false, error: 'El email ya está registrado.' };
    }
    MedicoRepository.save({ id, nombre, especialidad, email, password });
    return { ok: true };
  }

  // Devuelve el usuario actualmente logueado (de localStorage), o null
  static getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
    } catch {
      return null;
    }
  }

  // Cierra sesión del usuario
  static logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  static _saveSession(sessionData) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }
}
