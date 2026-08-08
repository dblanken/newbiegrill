const store = new TimerStore();

const presetGrid = document.getElementById("preset-grid");
const activeList = document.getElementById("active-list");
const activeEmpty = document.getElementById("active-empty");
const alertBanner = document.getElementById("alert-banner");
const notifyBtn = document.getElementById("notify-permission-btn");
const clearFinishedBtn = document.getElementById("clear-finished-btn");
const customForm = document.getElementById("custom-food-form");
const customDialog = document.getElementById("custom-food-dialog");
const addCustomBtn = document.getElementById("add-custom-btn");

function fmtTime(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${mm}:${ss}`;
}

function renderPresets() {
  presetGrid.innerHTML = "";
  for (const food of getAllFoods()) {
    const card = document.createElement("button");
    card.className = "food-card";
    card.innerHTML = `
      <span class="food-name">${food.name}</span>
      <span class="food-meta">${food.heat} &middot; ${fmtTime(food.totalTime)}</span>
    `;
    card.addEventListener("click", () => {
      store.start(food);
    });
    presetGrid.appendChild(card);
  }
}

function timerCard(t) {
  const remaining = store.remainingOf(t);
  const pct = Math.min(100, (store.elapsedOf(t) / t.duration) * 100);
  const nextFlip = t.flipAt.find((m) => !t.firedFlips.includes(m) && m > store.elapsedOf(t) - 0.5);

  const el = document.createElement("div");
  el.className = "timer-card" + (t.finished ? " finished" : "") + (!t.running && !t.finished ? " paused" : "");
  el.dataset.id = t.id;
  el.innerHTML = `
    <div class="timer-head">
      <div>
        <div class="timer-name">${t.name}</div>
        <div class="timer-heat">${t.heat}</div>
      </div>
      <div class="timer-remaining">${t.finished ? "Done" : fmtTime(remaining)}</div>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    <div class="timer-sub">
      ${
        t.finished
          ? "Alerted — remove when pulled off the grill."
          : nextFlip !== undefined
          ? `Next flip at ${fmtTime(nextFlip)}`
          : "No more flips — waiting for done alert"
      }
    </div>
    <div class="timer-controls">
      ${
        t.finished
          ? `<button class="btn btn-remove" data-action="remove">Remove</button>`
          : `
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
  clearFinishedBtn.style.display = timers.some((t) => t.finished) ? "inline-flex" : "none";
  for (const t of timers) {
    activeList.appendChild(timerCard(t));
  }
}

activeList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.closest(".timer-card").dataset.id;
  const action = btn.dataset.action;
  if (action === "pause") store.pause(id);
  if (action === "resume") store.resume(id);
  if (action === "remove") store.remove(id);
});

clearFinishedBtn.addEventListener("click", () => store.clearFinished());

store.onChange(() => renderActive());

store.onFlip = (t, mark) => {
  alertUser({
    title: `Flip the ${t.name}!`,
    body: `${fmtTime(mark)} elapsed — time to flip.`,
  });
  flashBanner(`Flip the ${t.name}!`);
};

store.onDone = (t) => {
  alertUser({
    title: `${t.name} is done!`,
    body: "Timer finished — pull it off the grill.",
    beeps: 3,
  });
  flashBanner(`${t.name} is done!`);
};

let bannerTimeout = null;
function flashBanner(text) {
  alertBanner.textContent = text;
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
    heat,
    totalTime: Math.round(minutes * 60),
    flipAt,
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
  renderActive();
}

setInterval(loop, 1000);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch((e) => console.warn("SW registration failed", e));
}

renderPresets();
renderActive();
refreshNotifyBtn();
loop();
