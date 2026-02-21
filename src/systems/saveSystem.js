const SAVE_KEY = 'skylands-foundation-v1';

export class SaveSystem {
  static save(state) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  static load() {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
