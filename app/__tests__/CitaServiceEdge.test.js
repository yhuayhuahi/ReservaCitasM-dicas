const { CitaService } = require('../src/model/citaService.js');
const { CitaRepository } = require('../src/model/CitaRepository.js');
const { Cita } = require('../src/model/Cita.js');

describe('CitaService edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('pacienteReserva falla si bloque no existe', () => {
    CitaRepository.getAll = jest.fn(() => []);
    const result = CitaService.pacienteReserva({ medicoId: 1, pacienteId: 2, fecha: '2099-01-01', hora: '08:00' });
    expect(result.ok).toBe(false);
  });

  test('pacienteReserva falla si fecha es pasada', () => {
    CitaRepository.getAll = jest.fn(() => []);
    const result = CitaService.pacienteReserva({ medicoId: 1, pacienteId: 2, fecha: '2000-01-01', hora: '08:00' });
    expect(result.ok).toBe(false);
  });

  test('cancelarCitaPaciente falla si cita no existe', () => {
    CitaRepository.getById = jest.fn(() => null);
    const result = CitaService.cancelarCitaPaciente({ citaId: 1, pacienteId: 2 });
    expect(result.ok).toBe(false);
  });

  test('medicoDeshabilitaBloque falla si bloque no existe', () => {
    CitaRepository.getAll = jest.fn(() => []);
    const result = CitaService.medicoDeshabilitaBloque({ medicoId: 1, fecha: '2099-01-01', hora: '08:00' });
    expect(result.ok).toBe(false);
  });
});
