
// Mock localStorage para entorno Node
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

const { StorageHelper } = require('../src/model/storage.js');

describe('StorageHelper', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('save and getAll', () => {
    StorageHelper.save('test', { id: 1, value: 'a' });
    StorageHelper.save('test', { id: 2, value: 'b' });
    const all = StorageHelper.getAll('test');
    expect(all.length).toBe(2);
    expect(all[0].value).toBe('a');
    expect(all[1].value).toBe('b');
  });

  test('getById returns correct item', () => {
    StorageHelper.save('test', { id: 1, value: 'a' });
    const item = StorageHelper.getById('test', 1);
    expect(item.value).toBe('a');
  });

  test('remove deletes item', () => {
    StorageHelper.save('test', { id: 1, value: 'a' });
    StorageHelper.remove('test', 1);
    expect(StorageHelper.getAll('test').length).toBe(0);
  });

  test('clear removes all items', () => {
    StorageHelper.save('test', { id: 1, value: 'a' });
    StorageHelper.save('test', { id: 2, value: 'b' });
    StorageHelper.clear('test');
    expect(StorageHelper.getAll('test').length).toBe(0);
  });
});
