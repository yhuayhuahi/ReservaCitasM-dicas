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

describe('Cobertura total de authService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('registrarPaciente falla si email ya existe en MedicoRepository', () => {
    PacienteRepository.getAll = jest.fn(() => []);
    MedicoRepository.getAll = jest.fn(() => [{ email: 'a@mail.com' }]);
    const result = AuthService.registrarPaciente({ id: 1, nombre: 'Juan', telefono: '123', email: 'a@mail.com', password: '123' });
    expect(result.ok).toBe(false);
  });
});
