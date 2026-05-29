const { CitaService } = require('../src/model/citaService.js');

// Mock repositorios
const medicos = [
  { id: 1, especialidad: 'Cardio', nombre: 'Dr. A' },
  { id: 2, especialidad: 'Pediatria', nombre: 'Dr. B' }
];
const citas = [
  { id: 1, medicoId: 1, fecha: '2024-01-01', hora: '08:00', tipo: 'medico', activa: true },
  { id: 2, medicoId: 1, fecha: '2024-01-01', hora: '08:30', tipo: 'medico', activa: true },
  { id: 3, medicoId: 1, fecha: '2024-01-01', hora: '08:00', tipo: 'paciente', activa: true },
];

describe('CitaService', () => {
  beforeEach(() => {
    // Mock repos
    require('../src/model/MedicoRepository.js').MedicoRepository.getAll = jest.fn(() => medicos);
    require('../src/model/CitaRepository.js').CitaRepository.getAll = jest.fn(() => citas);
  });

  test('getMedicosPorEspecialidad filtra correctamente', () => {
    const result = CitaService.getMedicosPorEspecialidad('Cardio');
    expect(result.length).toBe(1);
    expect(result[0].nombre).toBe('Dr. A');
  });

  test('getBloquesDisponibles filtra bloques ocupados y pasados', () => {
    // fechaActual = fechaConsulta = '2024-01-01', horaActual = '08:00'
    const bloques = CitaService.getBloquesDisponibles(1, '2024-01-01', '08:00', '2024-01-01');
    expect(bloques).toContain('08:30'); // 08:00 está ocupado por paciente
    expect(bloques).not.toContain('08:00');
  });

  test('getBloquesDisponibles muestra todos si no es hoy', () => {
    const bloques = CitaService.getBloquesDisponibles(1, '2024-01-02', '08:00', '2024-01-01');
    expect(bloques).toContain('08:30');
  });
});
