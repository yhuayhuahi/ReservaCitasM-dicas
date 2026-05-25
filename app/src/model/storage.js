// Helper genérico para CRUD en localStorage por colección (entidad)
export class StorageHelper {
  static getAll(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
  static getById(key, id) {
    const list = this.getAll(key);
    return list.find(item => item.id === id) || null;
  }
  static save(key, item) {
    let list = this.getAll(key);
    const idx = list.findIndex(i => i.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.push(item);
    }
    localStorage.setItem(key, JSON.stringify(list));
  }
  static remove(key, id) {
    let list = this.getAll(key);
    list = list.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(list));
  }
  static clear(key) {
    localStorage.removeItem(key);
  }
}
