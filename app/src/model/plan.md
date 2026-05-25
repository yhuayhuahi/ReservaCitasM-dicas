# Planificación - Plataforma de Reservas de Citas Médicas

## 1. Roles

- **Paciente:**
  - Consulta médicos por especialidad
  - Ve horarios libres
  - Reserva una cita (por bloque, máximo una por vez)
  - Cancela reservas futuras (antes de que el bloque inicie)

- **Médico:**
  - Define en cuáles bloques de 30 minutos estará disponible para reserva
  - Puede marcar varios bloques disponibles en una sola acción
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
- pacienteId: string (null si sólo es “disponibilidad médica”)
- fecha: string
- hora: string
- tipo: "medico" | "paciente"
  - "medico": bloque de disponibilidad creado por el médico, aún no reservado.
  - "paciente": bloque reservado por un paciente con ese médico; ya no está disponible.
- activa: bool

---

## 3. Funcionamiento

- El médico define o actualiza sus bloques disponibles (para días futuros).
- El paciente elige médico/fecha/especialidad, ve bloques de disponibilidad y escoge uno para reservar.
- El sistema marca el bloque reservado como tipo: “paciente”.
- Solo se puede cancelar o modificar futuras reservas o disponibilidades, nunca las pasadas ni los bloques iniciados.
- Un bloque es visible para reserva si existe una entrada tipo: “medico” con activa=true y sin cruce de tipo: “paciente” y activa=true para el mismo bloque.

---

## 4. Restricciones
- Prohibido reservar/cancelar unidades de tiempo pasadas o en curso.
- El médico no puede remover bloques ya reservados (tipo: “paciente”).
- Un paciente no puede tener más de una cita activa en el mismo horario (fecha + hora), aunque sea con distinto médico.
- La agenda parte solo de los bloques disponibles definidos y de las citas (bloques reservados).

---

## 5. Autenticación Mini-Login

- Se añade un sistema simple de login local por email y contraseña.
- Pacientes y médicos pueden registrarse con email único, contraseña y sus datos básicos.
- Tras el login, se almacena (por ejemplo, en localStorage) el usuario y su rol en sesión para habilitar las funciones correspondientes.
- El login verifica credenciales sencillas (no sistema seguro, solo para demo/escolar).
- Solo un usuario puede estar logueado a la vez.
- Las contraseñas y emails son almacenados localmente, sin roles avanzados ni recuperación de contraseña.

---

## 6. Resumen
Este sistema permite máximamente personalizar las disponibilidades de cada médico, evitando solapamientos y asegurando integridad, bajo una estructura clara y fácil de consultar.
