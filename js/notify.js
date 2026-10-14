// Alerting: system notification (via service worker when available) + sound +
// vibration + on-screen flash. Multiple channels because iOS Safari's
// background notification delivery is unreliable, especially when the app
// hasn't been added to the home screen - sound/vibrate are the fallback that
// actually works while the tab is open.

let audioCtx = null;

function getAudioCtx() {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  // iOS also parks the context in "interrupted" after the app is backgrounded
  // or a call/Siri takes the audio, so resume from anything but running.
  if (audioCtx.state !== "running") audioCtx.resume();
  return audioCtx;
}

// iOS only lets Web Audio make sound once it has been started inside a user
// gesture, and alerts fire from a timer tick, not a tap. So start (and keep
// resuming) the context on any tap. audioSession "playback" (Safari 16.4+)
// lets alerts play with the ringer switch on silent, like a media app.
function unlockAudio() {
  try {
    if (navigator.audioSession) navigator.audioSession.type = "playback";
    const ctx = getAudioCtx();
    const src = ctx.createBufferSource();
    src.buffer = ctx.createBuffer(1, 1, 22050);
    src.connect(ctx.destination);
    src.start(0);
  } catch (e) {
    console.warn("Audio unlock failed", e);
  }
}
document.addEventListener("pointerdown", unlockAudio);
document.addEventListener("touchend", unlockAudio);

function tone(ctx, freq, start, dur, type = "sine", peak = 0.4) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

// Two distinct sounds so you can tell them apart without looking:
// flip = two short, high rising chirps; done = a longer four-note rising
// chime, played twice.
const SOUNDS = {
  flip(ctx, t) {
    tone(ctx, 880, t, 0.12, "triangle", 0.5);
    tone(ctx, 1320, t + 0.15, 0.18, "triangle", 0.5);
  },
  done(ctx, t) {
    for (let rep = 0; rep < 2; rep++) {
      [523, 659, 784, 1047].forEach((f, i) => tone(ctx, f, t + i * 0.18, i === 3 ? 0.7 : 0.3));
      t += 1.3;
    }
  },
};

const VIBRATE = {
  flip: [150, 80, 150],
  done: [400, 150, 400, 150, 400],
};

function playSound(kind) {
  try {
    const ctx = getAudioCtx();
    SOUNDS[kind](ctx, ctx.currentTime + 0.05);
  } catch (e) {
    console.warn("Audio alert failed", e);
  }
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "default") {
    return Notification.permission = await Notification.requestPermission();
  }
  return Notification.permission;
}

async function showSystemNotification(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon: "icons/icon-192.png",
        badge: "icons/icon-192.png",
        tag: `grilltime-${Date.now()}`,
        vibrate: [200, 100, 200],
      });
      return;
    }
    new Notification(title, { body, icon: "icons/icon-192.png" });
  } catch (e) {
    console.warn("System notification failed", e);
  }
}

// kind is "flip" or "done" and picks the sound and vibration pattern.
function alertUser({ title, body, kind }) {
  showSystemNotification(title, body);
  playSound(kind);
  if (navigator.vibrate) navigator.vibrate(VIBRATE[kind]);
  document.dispatchEvent(new CustomEvent("grilltime:alert", { detail: { title, body, kind } }));
}
