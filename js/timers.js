// Timer engine. All timing is derived from absolute epoch timestamps so it
// stays correct across tab throttling, screen lock, or the page being
// reloaded/reopened later - never trust an interval tick's own drift.

const TIMERS_STORAGE_KEY = "grilltime.timers";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadTimers() {
  try {
    const raw = localStorage.getItem(TIMERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load timers", e);
    return [];
  }
}

function saveTimers(timers) {
  localStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify(timers));
}

class TimerStore {
  constructor() {
    this.timers = loadTimers();
    this.listeners = new Set();
    this.onFlip = null; // (timer, markSeconds) => void
    this.onDone = null; // (timer) => void
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _emit() {
    saveTimers(this.timers);
    this.listeners.forEach((fn) => fn(this.timers));
  }

  elapsedOf(timer) {
    if (!timer.started) return 0;
    if (timer.running) {
      return timer.accumulated + (Date.now() - timer.startedAt) / 1000;
    }
    return timer.accumulated;
  }

  remainingOf(timer) {
    return Math.max(timer.duration - this.elapsedOf(timer), 0);
  }

  // Adds a timer in a pending (not counting down) state. Nothing runs until
  // startTimer() is called on it - selecting a food should never start the
  // clock on its own.
  add(food) {
    const timer = {
      id: uid(),
      foodId: food.id,
      name: food.name,
      heat: food.heat,
      duration: food.totalTime,
      flipAt: [...(food.flipAt || [])],
      firedFlips: [],
      doneFired: false,
      finished: false,
      started: false,
      running: false,
      accumulated: 0,
      startedAt: null,
      createdAt: Date.now(),
    };
    this.timers.push(timer);
    this._emit();
    return timer;
  }

  startTimer(id) {
    const t = this.timers.find((t) => t.id === id);
    if (!t || t.started) return;
    t.started = true;
    t.running = true;
    t.startedAt = Date.now();
    this._emit();
  }

  pause(id) {
    const t = this.timers.find((t) => t.id === id);
    if (!t || !t.started || !t.running) return;
    t.accumulated = this.elapsedOf(t);
    t.running = false;
    this._emit();
  }

  resume(id) {
    const t = this.timers.find((t) => t.id === id);
    if (!t || !t.started || t.running || t.finished) return;
    t.startedAt = Date.now();
    t.running = true;
    this._emit();
  }

  remove(id) {
    this.timers = this.timers.filter((t) => t.id !== id);
    this._emit();
  }

  clearFinished() {
    this.timers = this.timers.filter((t) => !t.finished);
    this._emit();
  }

  // Advance state and fire callbacks for any thresholds crossed since the
  // last tick. Safe to call frequently; it's idempotent per threshold.
  tick() {
    let changed = false;
    for (const t of this.timers) {
      if (t.finished) continue;
      const elapsed = this.elapsedOf(t);

      for (const mark of t.flipAt) {
        if (elapsed >= mark && !t.firedFlips.includes(mark)) {
          t.firedFlips.push(mark);
          changed = true;
          this.onFlip && this.onFlip(t, mark);
        }
      }

      if (elapsed >= t.duration && !t.doneFired) {
        t.doneFired = true;
        t.finished = true;
        t.running = false;
        t.accumulated = t.duration;
        changed = true;
        this.onDone && this.onDone(t);
      }
    }
    if (changed) this._emit();
  }
}
