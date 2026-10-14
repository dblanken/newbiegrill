const store = new TimerStore();

const presetGroups = document.getElementById("preset-groups");
const activeList = document.getElementById("active-list");
const activeEmpty = document.getElementById("active-empty");
const alertBanner = document.getElementById("alert-banner");
const notifyBtn = document.getElementById("notify-permission-btn");
const customForm = document.getElementById("custom-food-form");
const customDialog = document.getElementById("custom-food-dialog");
const addCustomBtn = document.getElementById("add-custom-btn");
const donenessDialog = document.getElementById("doneness-dialog");
const donenessFoodName = document.getElementById("doneness-food-name");
const donenessOptionsEl = document.getElementById("doneness-options");
const donenessCancelBtn = document.getElementById("doneness-cancel-btn");
const donenessNotes = document.getElementById("doneness-notes");

// Negative values are formatted with a leading "-" (used for overtime).
const FLIP_DUE_SECONDS = 60;
const PULSE_MS = 1200; // keep in sync with the pulse animations in style.css
const DONE_REPEAT_MS = 20000; // replay the done chime this often until stopped/paused

function fmtTime(totalSeconds) {
  const negative = totalSeconds < 0;
  const s = Math.round(Math.abs(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  const ss = String(sec).padStart(2, "0");
  const core = h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${mm}:${ss}`;
  return negative ? `-${core}` : core;
}

// "Target 135°F · pull at 130°F", or "" when the food has no target temp.
function tempLabel(t) {
  if (!t.targetTemp) return "";
  return t.pullTemp && t.pullTemp !== t.targetTemp
    ? `Target ${t.targetTemp}°F · pull at ${t.pullTemp}°F`
    : `Target ${t.targetTemp}°F`;
}

function renderPresets() {
  presetGroups.innerHTML = "";
  for (const [category, foods] of groupFoodsByCategory(getAllFoods())) {
    const section = document.createElement("div");
    section.className = "preset-category";

    const heading = document.createElement("h3");
    heading.className = "preset-category-heading";
    heading.textContent = category;
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "preset-grid";
    for (const food of foods) {
      const card = document.createElement("button");
      card.className = "food-card";
      const timeLabel = food.donenessOptions
        ? `${fmtTime(Math.min(...food.donenessOptions.map((o) => o.totalTime)))}–${fmtTime(
            Math.max(...food.donenessOptions.map((o) => o.totalTime))
          )}`
        : fmtTime(food.totalTime);
      card.innerHTML = `
        <span class="food-name">${food.name}</span>
        <span class="food-meta">${heatLabel(food.heat)} &middot; ${timeLabel}</span>
        ${food.donenessOptions ? `<span class="food-badge">Choose doneness</span>` : ""}
      `;
      card.addEventListener("click", () => {
        if (food.donenessOptions) {
          openDonenessPicker(food);
        } else {
          store.add(food);
        }
      });
      grid.appendChild(card);
    }
    section.appendChild(grid);
    presetGroups.appendChild(section);
  }
}

function openDonenessPicker(food) {
  donenessFoodName.textContent = `${food.name} — Choose Doneness`;
  donenessNotes.textContent = food.notes || "";
  donenessOptionsEl.innerHTML = "";
  for (const opt of food.donenessOptions) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn doneness-option";
    btn.innerHTML = `<span>${opt.label}</span><span class="doneness-time">${
      opt.targetTemp ? `${opt.targetTemp}°F &middot; ` : ""
    }${fmtTime(opt.totalTime)}</span>`;
    btn.addEventListener("click", () => {
      store.add({
        id: food.id,
        name: `${food.name} (${opt.label})`,
        category: food.category,
        heat: food.heat,
        totalTime: opt.totalTime,
        flipAt: opt.flipAt,
        targetTemp: opt.targetTemp,
        pullTemp: opt.pullTemp,
      });
      donenessDialog.close();
    });
    donenessOptionsEl.appendChild(btn);
  }
  donenessDialog.showModal();
}

donenessCancelBtn.addEventListener("click", () => donenessDialog.close());

function timerCard(t) {
  const elapsed = store.elapsedOf(t);
  const remaining = store.remainingOf(t);
  const overtime = t.started && remaining < 0;
  const pct = Math.min(100, (elapsed / t.duration) * 100);
  const nextFlip = t.flipAt.find((m) => !t.firedFlips.includes(m) && m > elapsed - 0.5);
  // A flip stays flagged until "Flipped" is tapped, or for FLIP_DUE_SECONDS
  // if it isn't, so a cook who flipped without touching the phone isn't left
  // with a pulsing card.
  const flipDue =
    t.started && !overtime && t.flipDueAt != null && elapsed - t.flipDueAt < FLIP_DUE_SECONDS;

  const el = document.createElement("div");
  el.className =
    "timer-card" +
    (t.started && !t.running ? " paused" : "") +
    (!t.started ? " pending" : "") +
    (overtime ? " overtime" : "") +
    (flipDue ? " flip-due" : "");
  el.dataset.id = t.id;
  // The list is rebuilt every second, which would restart the pulse
  // animation each tick; offsetting it by wall-clock time keeps it smooth.
  if (flipDue || overtime) el.style.animationDelay = `-${(Date.now() % PULSE_MS) / 1000}s`;
  el.innerHTML = `
    <div class="timer-head">
      <div>
        <div class="timer-name">${t.name}</div>
        <div class="timer-heat">${heatLabel(t.heat)}</div>
      </div>
      <div class="timer-right">
        <div class="timer-remaining${overtime ? " overtime-text" : ""}">${fmtTime(remaining)}</div>
        ${t.targetTemp ? `<div class="timer-temp">🌡️ ${tempLabel(t)}</div>` : ""}
      </div>
    </div>
    <div class="progress-track"><div class="progress-fill${overtime ? " overtime" : ""}" style="width:${pct}%"></div></div>
    <div class="timer-sub">
      ${
        !t.started
          ? "Ready — tap Start when it's on the grill."
          : overtime
          ? `<strong class="done-now">Done!</strong> Past done by ${fmtTime(Math.abs(remaining))} — stop or pause when ready.`
          : flipDue
          ? `<strong class="flip-now">Flip now!</strong>${
              nextFlip !== undefined ? ` Next flip in ${fmtTime(Math.max(0, nextFlip - elapsed))}` : ""
            }`
          : nextFlip !== undefined
          ? `Next flip in ${fmtTime(Math.max(0, nextFlip - elapsed))}`
          : "No more flips — waiting for done alert"
      }
    </div>
    <div class="timer-controls">
      ${
        !t.started
          ? `
            <button class="btn btn-primary" data-action="startTimer">Start</button>
            <button class="btn btn-remove" data-action="remove">Cancel</button>
          `
          : `
            ${flipDue ? `<button class="btn btn-primary" data-action="ackFlip">Flipped ✓</button>` : ""}
            <button class="btn" data-action="${t.running ? "pause" : "resume"}">${t.running ? "Pause" : "Resume"}</button>
            <button class="btn btn-remove" data-action="remove">Stop</button>
          `
      }
    </div>
  `;
  return el;
}

function renderActive() {
  const timers = [...store.timers].sort((a, b) => a.createdAt - b.createdAt);
  activeList.innerHTML = "";
  activeEmpty.style.display = timers.length ? "none" : "block";
  for (const t of timers) {
    activeList.appendChild(timerCard(t));
  }
}

activeList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.closest(".timer-card").dataset.id;
  const action = btn.dataset.action;
  if (action === "startTimer") store.startTimer(id);
  if (action === "pause") store.pause(id);
  if (action === "resume") store.resume(id);
  if (action === "ackFlip") store.ackFlip(id);
  if (action === "remove") store.remove(id);
});

store.onChange(() => renderActive());

store.onFlip = (t, mark) => {
  alertUser({
    title: `Flip the ${t.name}!`,
    body: `${fmtTime(t.duration - mark)} left — time to flip.`,
    kind: "flip",
  });
  flashBanner(`Flip the ${t.name}!`, "flip");
};

// Last time the done chime played, per timer id. In memory only: after a
// reload a still-overtime timer simply chimes again on the next tick.
const doneChimedAt = {};

store.onDone = (t) => {
  doneChimedAt[t.id] = Date.now();
  const check = t.targetTemp
    ? `Check the temp — ${t.pullTemp || t.targetTemp}°F or higher means pull it.`
    : "Timer finished — pull it off the grill.";
  alertUser({
    title: `${t.name} is done!`,
    body: `${check} It'll keep counting up until you stop it.`,
    kind: "done",
  });
  flashBanner(`${t.name} is done!`, "done");
};

let bannerTimeout = null;
function flashBanner(text, kind) {
  alertBanner.textContent = text;
  alertBanner.classList.toggle("done", kind === "done");
  alertBanner.classList.add("show");
  clearTimeout(bannerTimeout);
  bannerTimeout = setTimeout(() => alertBanner.classList.remove("show"), 6000);
}

// Custom food dialog
addCustomBtn.addEventListener("click", () => customDialog.showModal());

customForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(customForm);
  const name = data.get("name").trim();
  const minutes = parseFloat(data.get("minutes"));
  const flipMinutes = data.get("flipMinutes");
  const heat = data.get("heat").trim() || "Medium";
  const category = data.get("category") || "Meat";
  const targetTemp = parseFloat(data.get("targetTemp"));
  if (!name || !minutes || minutes <= 0) return;

  const flipAt = flipMinutes
    ? flipMinutes
        .split(",")
        .map((s) => parseFloat(s.trim()) * 60)
        .filter((n) => !isNaN(n) && n > 0 && n < minutes * 60)
    : [];

  addCustomFood({
    id: `custom-${uid()}`,
    name,
    category,
    heat,
    totalTime: Math.round(minutes * 60),
    flipAt,
    targetTemp: targetTemp > 0 ? Math.round(targetTemp) : null,
    notes: "",
  });

  customForm.reset();
  customDialog.close();
  renderPresets();
});

// Notification permission
async function refreshNotifyBtn() {
  if (!("Notification" in window)) {
    notifyBtn.style.display = "none";
    return;
  }
  if (Notification.permission === "granted") {
    notifyBtn.style.display = "none";
  } else {
    notifyBtn.style.display = "inline-flex";
  }
}

notifyBtn.addEventListener("click", async () => {
  await requestNotificationPermission();
  refreshNotifyBtn();
});

// Recompute + re-render once a second. A full DOM rebuild is cheap enough at
// 1Hz and a per-second countdown reads fine to the eye; rebuilding on every
// animation frame (60Hz) was overkill and could even swap a button out from
// under a click mid-tap. store.tick() fires flip/done alerts as thresholds
// are crossed, using elapsed wall-clock time so a throttled background tab
// still lands on the right second once it's rendered again.
function loop() {
  store.tick();
  repeatDoneChimes();
  syncWakeLock();
  renderActive();
}

// A single chime is easy to miss over a grill, so keep chiming while a done
// timer is still running; pausing or stopping it silences it.
function repeatDoneChimes() {
  const now = Date.now();
  for (const t of store.timers) {
    if (!t.doneFired || !t.running) continue;
    if (now - (doneChimedAt[t.id] || 0) < DONE_REPEAT_MS) continue;
    doneChimedAt[t.id] = now;
    playSound("done");
    if (navigator.vibrate) navigator.vibrate(VIBRATE.done);
  }
}

// Keep the screen from dimming/locking while any timer has been started, since
// iOS suspends the page (no sounds, no alerts) once it locks. The OS drops the
// lock whenever the app is hidden; this runs every tick, so it's re-taken as
// soon as the app is visible again.
let wakeLock = null;
let wakeLockPending = false;
async function syncWakeLock() {
  if (!("wakeLock" in navigator)) return;
  const want = store.timers.some((t) => t.started);
  if (want && !wakeLock && !wakeLockPending && document.visibilityState === "visible") {
    wakeLockPending = true;
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => (wakeLock = null));
    } catch (e) {
      console.warn("Wake lock failed", e);
    } finally {
      wakeLockPending = false;
    }
  } else if (!want && wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
}

setInterval(loop, 1000);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch((e) => console.warn("SW registration failed", e));
}

renderPresets();
renderActive();
refreshNotifyBtn();
loop();
