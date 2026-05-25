import { StorageHelper } from './storage.js';

const STORAGE_KEY = 'MEDICOS';

export class MedicoRepository {
  static getAll() {
    return StorageHelper.getAll(STORAGE_KEY);
  }
  static getById(id) {
    return StorageHelper.getById(STORAGE_KEY, id);
  }
  static save(medico) {
    StorageHelper.save(STORAGE_KEY, medico);
  }
  static remove(id) {
    StorageHelper.remove(STORAGE_KEY, id);
  }
  static clear() {
    StorageHelper.clear(STORAGE_KEY);
  }
}
