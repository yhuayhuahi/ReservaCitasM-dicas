import { StorageHelper } from './storage.js';

const STORAGE_KEY = 'PACIENTES';

export class PacienteRepository {
  static getAll() {
    return StorageHelper.getAll(STORAGE_KEY);
  }
  static getById(id) {
    return StorageHelper.getById(STORAGE_KEY, id);
  }
  static save(paciente) {
    StorageHelper.save(STORAGE_KEY, paciente);
  }
  static remove(id) {
    StorageHelper.remove(STORAGE_KEY, id);
  }
  static clear() {
    StorageHelper.clear(STORAGE_KEY);
  }
}
