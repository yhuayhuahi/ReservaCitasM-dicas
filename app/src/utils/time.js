export function toDateTime(fecha, hora) {
  // fecha: 'YYYY-MM-DD', hora: 'HH:MM'
  return new Date(`${fecha}T${hora}:00`)
}

export function minutesUntil(fecha, hora, now = new Date()) {
  const target = toDateTime(fecha, hora)
  return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 60000))
}

export function formatRemaining(minutes) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

export function getTodayDateString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getCurrentTimeString() {
  const d = new Date()
  return d.toTimeString().slice(0, 5)
}
