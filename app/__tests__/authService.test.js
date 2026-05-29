
// Mock localStorage para entorno Node
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

const { AuthService } = require('../src/model/authService.js');
const { PacienteRepository } = require('../src/model/PacienteRepository.js');
const { MedicoRepository } = require('../src/model/MedicoRepository.js');

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    PacienteRepository.save = jest.fn();
    MedicoRepository.save = jest.fn();
    PacienteRepository.getAll = jest.fn(() => []);
    MedicoRepository.getAll = jest.fn(() => []);
  });

  test('registrarPaciente returns ok', () => {
    const result = AuthService.registrarPaciente({ id: 1, nombre: 'Juan', telefono: '123', email: 'juan@mail.com', password: '123' });
    expect(result.ok).toBe(true);
    expect(PacienteRepository.save).toHaveBeenCalled();
  });

  test('registrarMedico returns ok', () => {
    const result = AuthService.registrarMedico({ id: 1, nombre: 'Dr. A', especialidad: 'Cardio', email: 'dr@mail.com', password: '123' });
    expect(result.ok).toBe(true);
    expect(MedicoRepository.save).toHaveBeenCalled();
  });

  test('login fails with wrong credentials', () => {
    PacienteRepository.getAll = jest.fn(() => [{ id: 1, email: 'a@mail.com', password: 'x' }]);
    MedicoRepository.getAll = jest.fn(() => []);
    const result = AuthService.login({ email: 'a@mail.com', password: 'bad' });
    expect(result.ok).toBe(false);
  });
});
