const { Paciente } = require('../src/model/Paciente.js');
const { Medico } = require('../src/model/Medico.js');
const { Cita } = require('../src/model/Cita.js');

describe('Model constructors', () => {
  test('Paciente constructor sets all fields', () => {
    const p = new Paciente({ id: 1, nombre: 'Juan', telefono: '123', email: 'a@mail.com', password: 'x' });
    expect(p.id).toBe(1);
    expect(p.nombre).toBe('Juan');
    expect(p.telefono).toBe('123');
    expect(p.email).toBe('a@mail.com');
    expect(p.password).toBe('x');
  });
  test('Medico constructor sets all fields', () => {
    const m = new Medico({ id: 2, nombre: 'Dr. B', especialidad: 'Cardio', email: 'b@mail.com', password: 'y' });
    expect(m.id).toBe(2);
    expect(m.nombre).toBe('Dr. B');
    expect(m.especialidad).toBe('Cardio');
    expect(m.email).toBe('b@mail.com');
    expect(m.password).toBe('y');
  });
  test('Cita constructor sets all fields', () => {
    const c = new Cita({ id: 3, medicoId: 1, pacienteId: 2, fecha: '2024-01-01', hora: '08:00', tipo: 'paciente', activa: false });
    expect(c.id).toBe(3);
    expect(c.medicoId).toBe(1);
    expect(c.pacienteId).toBe(2);
    expect(c.fecha).toBe('2024-01-01');
    expect(c.hora).toBe('08:00');
    expect(c.tipo).toBe('paciente');
    expect(c.activa).toBe(false);
  });
});
