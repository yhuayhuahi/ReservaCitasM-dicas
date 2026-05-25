import { StorageHelper } from './storage.js';

const STORAGE_KEY = 'CITAS';

export class CitaRepository {
  static getAll() {
    return StorageHelper.getAll(STORAGE_KEY);
  }
  static getById(id) {
    return StorageHelper.getById(STORAGE_KEY, id);
  }
  static save(cita) {
    StorageHelper.save(STORAGE_KEY, cita);
  }
  static remove(id) {
    StorageHelper.remove(STORAGE_KEY, id);
  }
  static clear() {
    StorageHelper.clear(STORAGE_KEY);
  }
}
