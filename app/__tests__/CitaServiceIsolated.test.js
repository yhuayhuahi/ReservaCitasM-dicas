// El mock debe estar antes de importar citaService.js
jest.mock('../src/model/CitaRepository.js', () => ({
  CitaRepository: {
    getAll: jest.fn(() => [
      { medicoId: 1, fecha: '2099-01-01', hora: '09:00', tipo: 'paciente', activa: true },
      { medicoId: 1, fecha: '2099-01-01', hora: '11:00', tipo: 'paciente', activa: true }
    ])
  }
}));

const { CitaService } = require('../src/model/citaService.js');

describe('_isBloqueOcupado (aislado, mock robusto)', () => {
  test('devuelve true si el bloque está ocupado', () => {
    expect(CitaService._isBloqueOcupado(1, '2099-01-01', '09:00')).toBe(true);
  });
  test('devuelve false si el bloque no está ocupado', () => {
    expect(CitaService._isBloqueOcupado(1, '2099-01-01', '10:00')).toBe(false);
  });
});
