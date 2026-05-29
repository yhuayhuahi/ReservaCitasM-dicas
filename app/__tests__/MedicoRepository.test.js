// Mock localStorage para entorno Node
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};
const { MedicoRepository } = require('../src/model/MedicoRepository.js');

describe('MedicoRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('save and getAll', () => {
    MedicoRepository.save({ id: 1, nombre: 'Dr. A' });
    MedicoRepository.save({ id: 2, nombre: 'Dr. B' });
    const all = MedicoRepository.getAll();
    expect(all.length).toBe(2);
    expect(all[0].nombre).toBe('Dr. A');
    expect(all[1].nombre).toBe('Dr. B');
  });

  test('getById returns correct medico', () => {
    MedicoRepository.save({ id: 1, nombre: 'Dr. A' });
    const medico = MedicoRepository.getById(1);
    expect(medico.nombre).toBe('Dr. A');
  });

  test('remove deletes medico', () => {
    MedicoRepository.save({ id: 1, nombre: 'Dr. A' });
    MedicoRepository.remove(1);
    expect(MedicoRepository.getAll().length).toBe(0);
  });

  test('clear removes all medicos', () => {
    MedicoRepository.save({ id: 1, nombre: 'Dr. A' });
    MedicoRepository.save({ id: 2, nombre: 'Dr. B' });
    MedicoRepository.clear();
    expect(MedicoRepository.getAll().length).toBe(0);
  });
});
