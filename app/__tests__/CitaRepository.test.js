// Mock localStorage para entorno Node
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};
const { CitaRepository } = require('../src/model/CitaRepository.js');

describe('CitaRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('save and getAll', () => {
    CitaRepository.save({ id: 1, medicoId: 1, fecha: '2024-01-01', hora: '08:00' });
    CitaRepository.save({ id: 2, medicoId: 2, fecha: '2024-01-02', hora: '09:00' });
    const all = CitaRepository.getAll();
    expect(all.length).toBe(2);
    expect(all[0].hora).toBe('08:00');
    expect(all[1].hora).toBe('09:00');
  });

  test('getById returns correct cita', () => {
    CitaRepository.save({ id: 1, medicoId: 1, fecha: '2024-01-01', hora: '08:00' });
    const cita = CitaRepository.getById(1);
    expect(cita.hora).toBe('08:00');
  });

  test('remove deletes cita', () => {
    CitaRepository.save({ id: 1, medicoId: 1, fecha: '2024-01-01', hora: '08:00' });
    CitaRepository.remove(1);
    expect(CitaRepository.getAll().length).toBe(0);
  });

  test('clear removes all citas', () => {
    CitaRepository.save({ id: 1, medicoId: 1, fecha: '2024-01-01', hora: '08:00' });
    CitaRepository.save({ id: 2, medicoId: 2, fecha: '2024-01-02', hora: '09:00' });
    CitaRepository.clear();
    expect(CitaRepository.getAll().length).toBe(0);
  });
});
