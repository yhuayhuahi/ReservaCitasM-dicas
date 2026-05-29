const { CitaService } = require('../src/model/citaService.js');
const { CitaRepository } = require('../src/model/CitaRepository.js');
const { Cita } = require('../src/model/Cita.js');

describe('Cobertura total de citaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    CitaService._getFechaHoy = jest.fn(() => '2099-01-01');
    CitaService._getHoraActual = jest.fn(() => '08:00');
  });

  test('medicoDeclaraDisponibilidad no permite pasado', () => {
    const save = jest.spyOn(CitaRepository, 'save').mockImplementation(() => {});
    CitaService._getFechaHoy = jest.fn(() => '2099-01-02');
    CitaService._getHoraActual = jest.fn(() => '08:00');
    CitaService._isBloqueOcupado = jest.fn(() => false);
    CitaRepository.getAll = jest.fn(() => []);
    CitaService.medicoDeclaraDisponibilidad({ medicoId: 1, fecha: '2099-01-01', horas: ['07:00'] });
    expect(save).not.toHaveBeenCalled();
  });

  test('medicoDeclaraDisponibilidad no permite bloque ocupado', () => {
    const save = jest.spyOn(CitaRepository, 'save').mockImplementation(() => {});
    CitaService._isBloqueOcupado = jest.fn(() => true);
    CitaRepository.getAll = jest.fn(() => []);
    CitaService.medicoDeclaraDisponibilidad({ medicoId: 1, fecha: '2099-01-01', horas: ['08:00'] });
    expect(save).not.toHaveBeenCalled();
  });

  test('medicoDeclaraDisponibilidad no duplica bloque existente', () => {
    const save = jest.spyOn(CitaRepository, 'save').mockImplementation(() => {});
    CitaService._isBloqueOcupado = jest.fn(() => false);
    CitaRepository.getAll = jest.fn(() => [{ medicoId: 1, fecha: '2099-01-01', hora: '08:00', tipo: 'medico', activa: true }]);
    CitaService.medicoDeclaraDisponibilidad({ medicoId: 1, fecha: '2099-01-01', horas: ['08:00'] });
    expect(save).not.toHaveBeenCalled();
  });

  test('cancelarCitaPaciente no permite cancelar pasada', () => {
    const cita = { id: 1, tipo: 'paciente', pacienteId: 2, fecha: '2099-01-01', hora: '07:00', activa: true };
    CitaRepository.getById = jest.fn(() => cita);
    CitaService._getFechaHoy = jest.fn(() => '2099-01-01');
    CitaService._getHoraActual = jest.fn(() => '08:00');
    const result = CitaService.cancelarCitaPaciente({ citaId: 1, pacienteId: 2 });
    expect(result.ok).toBe(false);
  });

  test('medicoDeshabilitaBloque no permite reservado', () => {
    const bloque = { medicoId: 1, fecha: '2099-01-01', hora: '08:00', tipo: 'medico', activa: true };
    CitaRepository.getAll = jest.fn(() => [bloque]);
    CitaService._isBloqueOcupado = jest.fn(() => true);
    const result = CitaService.medicoDeshabilitaBloque({ medicoId: 1, fecha: '2099-01-01', hora: '08:00' });
    expect(result.ok).toBe(false);
  });

  test('medicoDeshabilitaBloque no permite pasado', () => {
    const bloque = { medicoId: 1, fecha: '2099-01-01', hora: '07:00', tipo: 'medico', activa: true };
    CitaRepository.getAll = jest.fn(() => [bloque]);
    CitaService._isBloqueOcupado = jest.fn(() => false);
    CitaService._getFechaHoy = jest.fn(() => '2099-01-01');
    CitaService._getHoraActual = jest.fn(() => '08:00');
    const result = CitaService.medicoDeshabilitaBloque({ medicoId: 1, fecha: '2099-01-01', hora: '07:00' });
    expect(result.ok).toBe(false);
  });
});
