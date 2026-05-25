# Documentacion - Plataforma de Reservas de Citas Medicas

Esta documentacion consolida la planificacion y la guia de uso de la logica para la interfaz.

---

## 1. Roles

- **Paciente:**
  - Consulta medicos por especialidad
  - Ve horarios libres
  - Reserva una cita (por bloque, maximo una por vez)
  - Cancela reservas futuras (antes de que el bloque inicie)

- **Medico:**
  - Define en cuales bloques de 30 minutos estara disponible para reserva
  - Puede marcar varios bloques disponibles en una sola accion
  - Solo modifica disponibilidad futura (no puede modificar bloques ya reservados ni pasados)

---

## 2. Estructura de Datos

### Paciente
- id: string
- nombre: string
- telefono: string
- email: string

### Medico
- id: string
- nombre: string
- especialidad: string

### Cita
- id: string
- medicoId: string
- pacienteId: string (null si solo es "disponibilidad medica")
- fecha: string
- hora: string
- tipo: "medico" | "paciente"
  - "medico": bloque de disponibilidad creado por el medico, aun no reservado.
  - "paciente": bloque reservado por un paciente con ese medico; ya no esta disponible.
- activa: bool

---

## 3. Funcionamiento

- El medico define o actualiza sus bloques disponibles (para dias futuros).
- El paciente elige medico/fecha/especialidad, ve bloques de disponibilidad y escoge uno para reservar.
- El sistema marca el bloque reservado como tipo: "paciente".
- Solo se puede cancelar o modificar futuras reservas o disponibilidades, nunca las pasadas ni los bloques iniciados.
- Un bloque es visible para reserva si existe una entrada tipo: "medico" con activa=true y sin cruce de tipo: "paciente" y activa=true para el mismo bloque.

---

## 4. Restricciones
- Prohibido reservar/cancelar unidades de tiempo pasadas o en curso.
- El medico no puede remover bloques ya reservados (tipo: "paciente").
- Un paciente no puede tener mas de una cita activa en el mismo horario (fecha + hora), aunque sea con distinto medico.
- La agenda parte solo de los bloques disponibles definidos y de las citas (bloques reservados).

---

## 5. Autenticacion Mini-Login

- Se anade un sistema simple de login local por email y contrasena.
- Pacientes y medicos pueden registrarse con email unico, contrasena y sus datos basicos.
- Tras el login, se almacena (por ejemplo, en localStorage) el usuario y su rol en sesion para habilitar las funciones correspondientes.
- El login verifica credenciales sencillas (no sistema seguro, solo para demo/escolar).
- Solo un usuario puede estar logueado a la vez.
- Las contrasenas y emails son almacenados localmente, sin roles avanzados ni recuperacion de contrasena.

---

## 6. Guia de uso de la logica desde la interfaz

### 6.1 Consultas de datos basicos (listados)

#### a. Listar medicos por especialidad
```js
import { CitaService } from './app/src/model/citaService.js';

const medicos = CitaService.getMedicosPorEspecialidad('Cardiologia');
// Devuelve: [{id, nombre, especialidad}, ...]
```

#### b. Listar especialidades (si haces un menu dinamico, mapea todos los medicos)
```js
import { MedicoRepository } from './app/src/model/MedicoRepository.js';

// Ejemplo
const especialidades = [...new Set(MedicoRepository.getAll().map(m => m.especialidad))];
// Devuelve: array de strings con nombres de especialidades
```

### 6.2 Mostrar bloques disponibles para un medico en una fecha

```js
// Necesitas la fecha actual y la hora actual (en formato string)
// fechaActual = 'YYYY-MM-DD', horaActual = 'HH:MM'
// fechaConsulta = fecha del calendario seleccionada
const bloques = CitaService.getBloquesDisponibles(
  medicoId,           // string
  fechaActual,        // string 'YYYY-MM-DD' (por ej.: hoy)
  horaActual,         // string 'HH:MM' (por ej.: '10:00')
  fechaConsulta       // string 'YYYY-MM-DD' (puede ser hoy o dia futuro)
);
// Devuelve: array de strings ['08:00', '08:30', ...] para saber que slots esta ofreciendo ese medico
```

### 6.3 Mostrar todos los bloques posibles (para que el medico pueda elegir cuales habilitar)
```js
const bloques = CitaService.getBloquesHorario(); // array de ['07:00', '07:30', ..., '20:30']
```

---

## 7. Operaciones realizadas por el MEDICO

### a. Declarar bloques disponibles (uno o mas) para un dia
```js
CitaService.medicoDeclaraDisponibilidad({
  medicoId: 'M123',
  fecha: '2026-05-29',
  horas: ['15:00', '15:30', '16:00'] // seleccionados en la UI
});
// No hay retorno, pero solo se aceptan bloques futuros que esten libres
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

## 8. Operaciones realizadas por el PACIENTE

### a. Reservar un bloque especifico para si mismo
```js
const result = CitaService.pacienteReserva({
  medicoId: 'M123',
  pacienteId: 'P321', // quien reservo
  fecha: '2026-05-29',
  hora: '15:30'
});
if (!result.ok) {
  alert(result.error); // O mostrarlo en la interfaz
}
```
// Nota: no se permite reservar otra cita activa en el mismo horario (fecha+hora),
// aunque sea con distinto medico.

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
// Como obtengo citaId?
// Puedes listar todas las citas del paciente por dia con:
```js
import { CitaRepository } from './app/src/model/CitaRepository.js';
const misCitas = CitaRepository.getAll()
  .filter(c => c.pacienteId === 'P321' && c.activa);
```

---

## 9. Mostrar citas del paciente o del medico (listado)

### a. Paciente: mostrar proximas citas
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

### b. Medico: mostrar agenda completa (reservadas y libres de un dia)
```js
const agendaDia = CitaRepository.getAll()
  .filter(c =>
    c.medicoId === 'M123' &&
    c.fecha === '2026-05-29' &&
    c.activa
  );
// Separa por tipo para mostrar: los bloques de disponibilidad ("medico") y los ocupados ("paciente")
```

---

## 10. Mini-Login y autenticacion (API basica)

### a. Login de usuario (paciente o medico)
```js
import { AuthService } from './app/src/model/authService.js';

const result = AuthService.login({ email: 'ejemplo@email.com', password: '1234' });
if (result.ok) {
  // result.rol es 'paciente' o 'medico'
  // result.user tiene el objeto usuario
  // Se guarda sesion automaticamente
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

### c. Registro de medico
```js
const resultado = AuthService.registrarMedico({
  id: 'IDMED',
  nombre: 'Dr. House',
  especialidad: 'Clinica',
  email: 'drhouse@example.com',
  password: 'clave'
});
if (!resultado.ok) alert(resultado.error);
```

### d. Obtener usuario en sesion y su rol
```js
const userSession = AuthService.getSession();
// userSession = {id, email, rol} o null
```

### e. Logout (cerrar sesion)
```js
AuthService.logout();
```

---

## 11. Notas para la interfaz

- Siempre valida los `.ok` y `.error` de los resultados de reserva/cancelacion y muestra feedback adecuado.
- Las horas se manejan como strings, compara usando operadores de strings por formato ('HH:MM' lexicograficamente da orden correcto).
- Usa los metodos auxiliares de CitaService para obtener bloques del dia y validar estados.

---

## 12. Resumen de metodos de interfaz mas usados

| Uso        | Metodo Logica / Repo        | Componente de UI que lo llama                 |
|------------|----------------------------|------------------------------------------------|
| Listar medicos por especialidad | `CitaService.getMedicosPorEspecialidad` | Pantalla/buscador de medicos                   |
| Ver slots disponibles           | `CitaService.getBloquesDisponibles`     | Detalle de agenda por medico                   |
| Reservar bloque                 | `CitaService.pacienteReserva`           | Boton de reservar slot                         |
| Cancelar cita propia            | `CitaService.cancelarCitaPaciente`      | Boton de cancelar en la lista de citas         |
| Declarar slots disponibles (med) | `CitaService.medicoDeclaraDisponibilidad` | Selector multiple de bloques de horario (medico) |
| Bloquear/no ofrecer bloque (med) | `CitaService.medicoDeshabilitaBloque`  | Icono/toggle para medicos en su agenda         |

---

## 13. Valor agregado

### 13.1 Como iniciar la aplicacion (servidor estatico)

La aplicacion es estatica y vive en `app/`. Debes levantar un servidor estatico desde `LAB05/ReservaCitasMedicas/app` y abrir la URL en el navegador.

**Opcion A: Python (rapido y disponible en casi todos los SO)**

- Windows (PowerShell):
  - `cd LAB05\ReservaCitasMedicas\app`
  - `py -m http.server 5173`
- macOS / Linux:
  - `cd LAB05/ReservaCitasMedicas/app`
  - `python3 -m http.server 5173`

Luego abrir: `http://localhost:5173`

**Opcion B: Node.js (si ya usas npm)**

- Windows / macOS / Linux:
  - `cd LAB05/ReservaCitasMedicas/app`
  - `npx serve -l 5173 .`

Luego abrir: `http://localhost:5173`

**Opcion C: VS Code Live Server**

- Abre la carpeta `LAB05/ReservaCitasMedicas/app`.
- Click derecho en `index.html` -> "Open with Live Server".

---

### 13.2 Flujo recomendado de la UI
1. Login o registro del usuario.
2. Segun rol, renderizar panel de paciente o medico.
3. En paciente: seleccionar especialidad, medico y fecha, luego elegir un bloque.
4. En medico: seleccionar fecha, marcar bloques disponibles y guardar.
5. Mostrar listados con estados actualizados y mensajes de error claros.

### 13.3 Manejo de errores sugerido
- "Bloque no disponible": mostrar alerta y refrescar slots.
- "No se puede reservar en el pasado": bloquear UI para horas pasadas.
- "Ya tienes una cita activa en ese horario": avisar y sugerir otro bloque.

### 13.4 Persistencia de datos
- La data se almacena localmente (localStorage). Si se limpia el almacenamiento del navegador, se reinician usuarios y citas.

### 13.5 Buenas practicas de tiempo
- Normalizar fecha y hora en formato ISO simple (YYYY-MM-DD y HH:MM).
- Comparar strings de hora/fecha en el mismo formato para evitar errores.
