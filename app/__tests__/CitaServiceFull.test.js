
// ¡IMPORTANTE! El mock debe ir antes de cualquier import
jest.mock('../src/model/CitaRepository.js', () => ({
  CitaRepository: {
    getAll: jest.fn()
  }
}));

const { CitaService } = require('../src/model/citaService.js');
const { CitaRepository } = require('../src/model/CitaRepository.js');
const { Cita } = require('../src/model/Cita.js');

describe('CitaService full coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock date helpers
    CitaService._getFechaHoy = jest.fn(() => '2099-01-01');
    CitaService._getHoraActual = jest.fn(() => '08:00');
  });

  test('pacienteReserva éxito', () => {
    CitaRepository.getAll = jest.fn(() => [{
      medicoId: 1, fecha: '2099-01-01', hora: '09:00', tipo: 'medico', activa: true
    }]);
    CitaService._isBloqueOcupado = jest.fn(() => false);
    CitaRepository.save = jest.fn();
    const result = CitaService.pacienteReserva({ medicoId: 1, pacienteId: 2, fecha: '2099-01-01', hora: '09:00' });
    expect(result.ok).toBe(true);
    expect(CitaRepository.save).toHaveBeenCalled();
  });

  test('cancelarCitaPaciente éxito', () => {
    const cita = { id: 1, tipo: 'paciente', pacienteId: 2, fecha: '2099-01-01', hora: '09:00', activa: true };
    CitaRepository.getById = jest.fn(() => cita);
    CitaRepository.save = jest.fn();
    const result = CitaService.cancelarCitaPaciente({ citaId: 1, pacienteId: 2 });
    expect(result.ok).toBe(true);
    expect(cita.activa).toBe(false);
    expect(CitaRepository.save).toHaveBeenCalledWith(cita);
  });

  test('medicoDeshabilitaBloque éxito', () => {
    const bloque = { medicoId: 1, fecha: '2099-01-01', hora: '09:00', tipo: 'medico', activa: true };
    CitaRepository.getAll = jest.fn(() => [bloque]);
    CitaService._isBloqueOcupado = jest.fn(() => false);
    CitaRepository.save = jest.fn();
    const result = CitaService.medicoDeshabilitaBloque({ medicoId: 1, fecha: '2099-01-01', hora: '09:00' });
    expect(result.ok).toBe(true);
    expect(bloque.activa).toBe(false);
    expect(CitaRepository.save).toHaveBeenCalledWith(bloque);
  });

  test('getBloquesHorario retorna array', () => {
    const bloques = CitaService.getBloquesHorario();
    expect(Array.isArray(bloques)).toBe(true);
    expect(bloques[0]).toMatch(/\d{2}:\d{2}/);
  });

});
