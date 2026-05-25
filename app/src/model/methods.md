# Guía de uso de la lógica desde la interfaz

## 1. Consultas de datos básicos (listados)

### a. Listar médicos por especialidad
```js
import { CitaService } from './app/src/model/citaService.js';

const medicos = CitaService.getMedicosPorEspecialidad('Cardiología');
// Devuelve: [{id, nombre, especialidad}, ...]
```

### b. Listar especialidades (si haces un menú dinámico, mapea todos los médicos)
```js
import { MedicoRepository } from './app/src/model/MedicoRepository.js';

// Ejemplo
const especialidades = [...new Set(MedicoRepository.getAll().map(m => m.especialidad))];
// Devuelve: array de strings con nombres de especialidades
```

## 2. Mostrar bloques disponibles para un médico en una fecha

```js
// Necesitas la fecha actual y la hora actual (en formato string)
// fechaActual = 'YYYY-MM-DD', horaActual = 'HH:MM'
// fechaConsulta = fecha del calendario seleccionada
const bloques = CitaService.getBloquesDisponibles(
  medicoId,           // string
  fechaActual,        // string 'YYYY-MM-DD' (por ej.: hoy)
  horaActual,         // string 'HH:MM' (por ej.: '10:00')
  fechaConsulta       // string 'YYYY-MM-DD' (puede ser hoy o día futuro)
);
// Devuelve: array de strings ['08:00', '08:30', ...] para saber qué slots está ofreciendo ese médico
```

## 3. Mostrar todos los bloques posibles (para que el médico pueda elegir cuáles habilitar)
```js
const bloques = CitaService.getBloquesHorario(); // array de ['07:00', '07:30', ..., '20:30']
```

---

## 4. Operaciones realizadas por el MÉDICO

### a. Declarar bloques disponibles (uno o más) para un día
```js
CitaService.medicoDeclaraDisponibilidad({
  medicoId: 'M123',
  fecha: '2026-05-29',
  horas: ['15:00', '15:30', '16:00'] // seleccionados en la UI
});
// No hay retorno, pero solo se aceptan bloques futuros que estén libres
```

### b. Eliminar/bloquear disponibilidad de 1 bloque (siempre futura y no tiene reserva)
```js
const resultado = CitaService.medicoDeshabilitaBloque({
  medicoId: 'M123',
  fecha: '2026-05-29',
  hora: '15:30'
});
if (!resultado.ok) {
  alert(resultado.error); // O mostrarlo en la interfaz
}
```

---

## 5. Operaciones realizadas por el PACIENTE

### a. Reservar un bloque específico para sí mismo
```js
const result = CitaService.pacienteReserva({
  medicoId: 'M123',
  pacienteId: 'P321', // quien reservó
  fecha: '2026-05-29',
  hora: '15:30'
});
if (!result.ok) {
  alert(result.error); // O mostrarlo en la interfaz
}
```
// Nota: no se permite reservar otra cita activa en el mismo horario (fecha+hora),
// aunque sea con distinto médico.

### b. Cancelar una reserva futura
```js
const result = CitaService.cancelarCitaPaciente({
  citaId: 'idDeLaCita',
  pacienteId: 'P321'
});
if (!result.ok) {
  alert(result.error);
}
```
// ¿Cómo obtengo citaId?
Puedes listar todas las citas del paciente por día con:
```js
import { CitaRepository } from './app/src/model/CitaRepository.js';
const misCitas = CitaRepository.getAll()
  .filter(c => c.pacienteId === 'P321' && c.activa);
```

---

## 6. Mostrar citas del paciente o del médico (listado)

### a. Paciente: mostrar próximas citas
```js
const nowFecha = new Date().toISOString().slice(0, 10);
import { CitaRepository } from './app/src/model/CitaRepository.js';
const misCitas = CitaRepository.getAll()
  .filter(c =>
    c.pacienteId === 'P321' &&
    c.activa &&
    ((c.fecha > nowFecha) || (c.fecha === nowFecha)) &&
    c.tipo === 'paciente'
  );
```
### b. Médico: mostrar agenda completa (reservadas y libres de un día)
```js
const agendaDia = CitaRepository.getAll()
  .filter(c =>
    c.medicoId === 'M123' &&
    c.fecha === '2026-05-29' &&
    c.activa
  );
// Separa por tipo para mostrar: los bloques de disponibilidad (“medico”) y los ocupados (“paciente”)
```

---

## 7. Mini-Login y autenticación

### a. Login de usuario (paciente o médico)
```js
import { AuthService } from './app/src/model/authService.js';

const result = AuthService.login({ email: 'ejemplo@email.com', password: '1234' });
if (result.ok) {
  // result.rol es 'paciente' o 'medico'
  // result.user tiene el objeto usuario
  // Se guarda sesión automáticamente
} else {
  alert(result.error); // O mostrar en la interfaz
}
```

### b. Registro de paciente
```js
const resultado = AuthService.registrarPaciente({
  id: 'IDPAC',
  nombre: 'Juan',
  telefono: '5551234',
  email: 'pacj@example.com',
  password: '1234'
});
if (!resultado.ok) alert(resultado.error);
```

### c. Registro de médico
```js
const resultado = AuthService.registrarMedico({
  id: 'IDMED',
  nombre: 'Dr. House',
  especialidad: 'Clínica',
  email: 'drhouse@example.com',
  password: 'clave'
});
if (!resultado.ok) alert(resultado.error);
```

### d. Obtener usuario en sesión y su rol
```js
const userSession = AuthService.getSession();
// userSession = {id, email, rol} o null
```

### e. Logout (cerrar sesión)
```js
AuthService.logout();
```

---

## 8. Notas para la interfaz

- Siempre valida los `.ok` y `.error` de los resultados de reserva/cancelación y muestra feedback adecuado.
- Las horas se manejan como strings, compara usando operadores de strings por formato ('HH:MM' lexicográficamente da orden correcto).
- Usa los métodos auxiliares de CitaService para obtener bloques del día y validar estados.

---

## Resumen de métodos de interfaz más usados

| Uso        | Método Lógica / Repo        | Componente de UI que lo llama                 |
|------------|----------------------------|------------------------------------------------|
| Listar médicos por especialidad | `CitaService.getMedicosPorEspecialidad` | Pantalla/buscador de médicos                   |
| Ver slots disponibles           | `CitaService.getBloquesDisponibles`     | Detalle de agenda por médico                   |
| Reservar bloque                 | `CitaService.pacienteReserva`           | Botón de reservar slot                         |
| Cancelar cita propia            | `CitaService.cancelarCitaPaciente`      | Botón de cancelar en la lista de citas         |
| Declarar slots disponibles (med) | `CitaService.medicoDeclaraDisponibilidad` | Selector múltiple de bloques de horario (médico) |
| Bloquear/no ofrecer bloque (med) | `CitaService.medicoDeshabilitaBloque`  | Icono/toggle para médicos en su agenda         |
