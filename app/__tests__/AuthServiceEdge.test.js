const { AuthService } = require('../src/model/authService.js');
const { PacienteRepository } = require('../src/model/PacienteRepository.js');
const { MedicoRepository } = require('../src/model/MedicoRepository.js');

global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

describe('AuthService edge cases', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('registrarPaciente falla si email ya existe', () => {
    PacienteRepository.getAll = jest.fn(() => [{ email: 'a@mail.com' }]);
    MedicoRepository.getAll = jest.fn(() => []);
    const result = AuthService.registrarPaciente({ id: 1, nombre: 'Juan', telefono: '123', email: 'a@mail.com', password: '123' });
    expect(result.ok).toBe(false);
  });

  test('registrarMedico falla si email ya existe', () => {
    PacienteRepository.getAll = jest.fn(() => []);
    MedicoRepository.getAll = jest.fn(() => [{ email: 'a@mail.com' }]);
    const result = AuthService.registrarMedico({ id: 1, nombre: 'Dr. A', especialidad: 'Cardio', email: 'a@mail.com', password: '123' });
    expect(result.ok).toBe(false);
  });

  test('getSession retorna null si localStorage tiene basura', () => {
    localStorage.setItem('SESS_USER', 'nojson');
    expect(AuthService.getSession()).toBe(null);
  });

  test('logout elimina la sesión', () => {
    localStorage.setItem('SESS_USER', '{"id":1}');
    AuthService.logout();
    expect(localStorage.getItem('SESS_USER')).toBe(null);
  });
});
