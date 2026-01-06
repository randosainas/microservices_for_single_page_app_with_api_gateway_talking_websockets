export type Listener<T extends any[] = any[]> = (...args: T) => void;

export class Emitter {
  private listeners = new Map<string, Set<Listener>>();

  on<T extends any[]>(event: string, listener: Listener<T>): void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as Listener);
  }

  off<T extends any[]>(event: string, listener: Listener<T>): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(listener as Listener);
    if (set.size === 0) this.listeners.delete(event);
  }

  once<T extends any[]>(event: string, listener: Listener<T>): void {
    const wrapper = (...args: T) => {
      this.off(event, wrapper as Listener);
      (listener as Listener<T>)(...args);
    };
    this.on(event, wrapper as Listener);
  }

  emit<T extends any[]>(event: string, ...args: T): void {
    const set = this.listeners.get(event);
    if (!set) return;
    // copy to avoid mutation issues
    const items = Array.from(set);
    for (const fn of items) {
      try {
        (fn as Listener<T>)(...args);
      } catch (err) {
        // swallow so one bad listener doesn't break others
        // optionally log in host environment
        // console.error('Emitter listener error', err);
      }
    }
  }
}
