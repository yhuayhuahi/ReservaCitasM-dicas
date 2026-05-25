import { MedicoRepository } from './MedicoRepository.js';
import { PacienteRepository } from './PacienteRepository.js';
import { CitaRepository } from './CitaRepository.js';
import { Cita } from './Cita.js';

// Utilidad: devuelve bloques de 30 min entre 07:00 y 20:30
function getBloquesHorario() {
  const bloques = [];
  const inicio = 7 * 60; // en minutos (7:00 AM)
  const fin = 21 * 60; // en minutos (9:00 PM)
  for (let min = inicio; min < fin; min += 30) {
    const h = Math.floor(min / 60).toString().padStart(2, '0');
    const m = (min % 60).toString().padStart(2, '0');
    bloques.push(`${h}:${m}`);
  }
  return bloques;
}

export class CitaService {
  // Listar médicos por especialidad
  static getMedicosPorEspecialidad(especialidad) {
    return MedicoRepository.getAll().filter(m => m.especialidad === especialidad);
  }

  // Devuelve los bloques disponibles de un médico para un día específico (solo futuro)
  static getBloquesDisponibles(medicoId, fechaActual, horaActual, fechaConsulta) {
    // Todos los bloques declarados por el médico en fechaConsulta (tipo 'medico', activa)
    const bloques = CitaRepository.getAll().filter(c =>
      c.medicoId === medicoId &&
      c.fecha === fechaConsulta &&
      c.tipo === 'medico' &&
      c.activa
    );
    // Filtra fuera los bloques ya reservados
    const ocupados = new Set(
      CitaRepository.getAll()
        .filter(c => c.medicoId === medicoId && c.fecha === fechaConsulta && c.tipo === 'paciente' && c.activa)
        .map(c => c.hora)
    );
    // Oculta los bloques pasados o en progreso (bloques antes de fechaActual+horaActual)
    const esHoy = fechaActual === fechaConsulta;
    return bloques
      .map(b => b.hora)
      .filter(hora => !ocupados.has(hora))
      .filter(hora => {
        if (!esHoy) return true;
        return hora >= horaActual;
      });
  }

  // Permite a un médico declarar sus bloques disponibles para un día
  static medicoDeclaraDisponibilidad({ medicoId, fecha, horas }) {
    // Solo acepta bloques futuros que no estén reservados
    const hoy = this._getFechaHoy();
    const ahora = this._getHoraActual();
    horas.forEach(hora => {
      if (
        fecha < hoy ||
        (fecha === hoy && hora < ahora) ||
        this._isBloqueOcupado(medicoId, fecha, hora)
      ) {
        // No permitir bloque en el pasado o ya reservado
        return;
      }
      // Verifica que no exista ya el bloque de disponibilidad activa
      const yaExiste = CitaRepository.getAll().some(c =>
        c.medicoId === medicoId &&
        c.fecha === fecha &&
        c.hora === hora &&
        c.tipo === 'medico' &&
        c.activa
      );
      if (!yaExiste) {
        const citaBloque = new Cita({
          id: 'bq_' + medicoId + '_' + fecha + '_' + hora,
          medicoId,
          pacienteId: null,
          fecha,
          hora,
          tipo: 'medico',
          activa: true
        });
        CitaRepository.save(citaBloque);
      }
    });
  }

  // Permite a un paciente reservar un bloque libre
  static pacienteReserva({ medicoId, pacienteId, fecha, hora }) {
    // Chequeos temporales
    const hoy = this._getFechaHoy();
    const ahora = this._getHoraActual();
    if (fecha < hoy || (fecha === hoy && hora < ahora)) {
      return { ok: false, error: 'No se puede reservar en el pasado o bloque actual.' };
    }
    // Un paciente no puede tener dos citas activas en el mismo horario
    const conflictoPaciente = CitaRepository.getAll().some(c =>
      c.pacienteId === pacienteId &&
      c.fecha === fecha &&
      c.hora === hora &&
      c.tipo === 'paciente' &&
      c.activa
    );
    if (conflictoPaciente) {
      return { ok: false, error: 'Ya tienes una cita activa en ese horario.' };
    }
    // El bloque debe existir como disponibilidad médica y estar libre
    const existeBloque = CitaRepository.getAll().some(c =>
      c.medicoId === medicoId &&
      c.fecha === fecha &&
      c.hora === hora &&
      c.tipo === 'medico' &&
      c.activa
    );
    if (!existeBloque || this._isBloqueOcupado(medicoId, fecha, hora)) {
      return { ok: false, error: 'Bloque no disponible.' };
    }
    // Guardar cita paciente y desactivar bloque de disponibilidad
    const id = 'cita_' + Date.now() + '_' + Math.floor(Math.random()*10000);
    const cita = new Cita({
      id,
      medicoId,
      pacienteId,
      fecha,
      hora,
      tipo: 'paciente',
      activa: true
    });
    CitaRepository.save(cita);
    return { ok: true };
  }

  // Cancelar reserva de paciente (antes del inicio)
  static cancelarCitaPaciente({ citaId, pacienteId }) {
    const cita = CitaRepository.getById(citaId);
    if (!cita || cita.tipo !== 'paciente' || cita.pacienteId !== pacienteId) {
      return { ok: false, error: 'Cita no encontrada o no permitida.' };
    }
    const hoy = this._getFechaHoy();
    const ahora = this._getHoraActual();
    if (cita.fecha < hoy || (cita.fecha === hoy && cita.hora <= ahora)) {
      return { ok: false, error: 'No se puede cancelar bloques pasados o en curso.' };
    }
    cita.activa = false;
    CitaRepository.save(cita);
    return { ok: true };
  }

  // Permite al médico deshabilitar disponibilidad (solo futura/no reservada)
  static medicoDeshabilitaBloque({ medicoId, fecha, hora }) {
    // Solo bloques de tipo 'medico', sin reserva activa de paciente
    const bloque = CitaRepository.getAll().find(c =>
      c.medicoId === medicoId &&
      c.fecha === fecha &&
      c.hora === hora &&
      c.tipo === 'medico' &&
      c.activa
    );
    if (!bloque) return { ok: false, error: 'Bloque no existe o ya está reservado.' };
    const reservado = this._isBloqueOcupado(medicoId, fecha, hora);
    const hoy = this._getFechaHoy();
    const ahora = this._getHoraActual();
    if (reservado || fecha < hoy || (fecha === hoy && hora < ahora)) {
      return { ok: false, error: 'No puede modificar bloques pasados o reservados.' };
    }
    bloque.activa = false;
    CitaRepository.save(bloque);
    return { ok: true };
  }

  // Auxiliar: retorna array de strings ['HH:MM', ...] para los bloques
  static getBloquesHorario() {
    return getBloquesHorario();
  }

  // Auxiliar: saber si el bloque ya fue reservado por paciente
  static _isBloqueOcupado(medicoId, fecha, hora) {
    return CitaRepository.getAll().some(c =>
      c.medicoId === medicoId &&
      c.fecha === fecha &&
      c.hora === hora &&
      c.tipo === 'paciente' &&
      c.activa
    );
  }
  static _getFechaHoy() {
    return new Date().toISOString().slice(0, 10);
  }
  static _getHoraActual() {
    const d = new Date();
    return d.toTimeString().slice(0, 5);
  }
}
