// Alerting: system notification (via service worker when available) + beep +
// vibration + on-screen flash. Multiple channels because iOS Safari's
// background notification delivery is unreliable, especially when the app
// hasn't been added to the home screen - sound/vibrate are the fallback that
// actually works while the tab is open.

let audioCtx = null;

function beep(times = 1) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    let t = audioCtx.currentTime;
    for (let i = 0; i < times; i++) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
      t += 0.4;
    }
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

function alertUser({ title, body, beeps = 2 }) {
  showSystemNotification(title, body);
  beep(beeps);
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  document.dispatchEvent(new CustomEvent("grilltime:alert", { detail: { title, body } }));
}
