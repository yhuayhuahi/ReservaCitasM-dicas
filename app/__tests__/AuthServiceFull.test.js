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

describe('AuthService full coverage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('login como medico', () => {
    MedicoRepository.getAll = jest.fn(() => [{ id: 1, email: 'a@mail.com', password: '123' }]);
    PacienteRepository.getAll = jest.fn(() => []);
    const result = AuthService.login({ email: 'a@mail.com', password: '123' });
    expect(result.ok).toBe(true);
    expect(result.rol).toBe('medico');
  });

  test('login como paciente', () => {
    MedicoRepository.getAll = jest.fn(() => []);
    PacienteRepository.getAll = jest.fn(() => [{ id: 2, email: 'b@mail.com', password: '456' }]);
    const result = AuthService.login({ email: 'b@mail.com', password: '456' });
    expect(result.ok).toBe(true);
    expect(result.rol).toBe('paciente');
  });
});
