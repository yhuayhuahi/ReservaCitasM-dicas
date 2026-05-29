// Mock localStorage para entorno Node
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};
const { PacienteRepository } = require('../src/model/PacienteRepository.js');

describe('PacienteRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('save and getAll', () => {
    PacienteRepository.save({ id: 1, nombre: 'Juan' });
    PacienteRepository.save({ id: 2, nombre: 'Ana' });
    const all = PacienteRepository.getAll();
    expect(all.length).toBe(2);
    expect(all[0].nombre).toBe('Juan');
    expect(all[1].nombre).toBe('Ana');
  });

  test('getById returns correct paciente', () => {
    PacienteRepository.save({ id: 1, nombre: 'Juan' });
    const paciente = PacienteRepository.getById(1);
    expect(paciente.nombre).toBe('Juan');
  });

  test('remove deletes paciente', () => {
    PacienteRepository.save({ id: 1, nombre: 'Juan' });
    PacienteRepository.remove(1);
    expect(PacienteRepository.getAll().length).toBe(0);
  });

  test('clear removes all pacientes', () => {
    PacienteRepository.save({ id: 1, nombre: 'Juan' });
    PacienteRepository.save({ id: 2, nombre: 'Ana' });
    PacienteRepository.clear();
    expect(PacienteRepository.getAll().length).toBe(0);
  });
});
