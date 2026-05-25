export class Cita {
  constructor({ id, medicoId, pacienteId = null, fecha, hora, tipo = "medico", activa = true }) {
    this.id = id;
    this.medicoId = medicoId;
    this.pacienteId = pacienteId;
    this.fecha = fecha; // 'YYYY-MM-DD'
    this.hora = hora;   // 'HH:MM'
    this.tipo = tipo;   // "medico" | "paciente"
    this.activa = activa;
  }
}
