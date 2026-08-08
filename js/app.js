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

// Negative values are formatted with a leading "-" (used for overtime).
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
        <span class="food-meta">${food.heat} &middot; ${timeLabel}</span>
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
  donenessOptionsEl.innerHTML = "";
  for (const opt of food.donenessOptions) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn doneness-option";
    btn.innerHTML = `<span>${opt.label}</span><span class="doneness-time">${fmtTime(opt.totalTime)}</span>`;
    btn.addEventListener("click", () => {
      store.add({
        id: food.id,
        name: `${food.name} (${opt.label})`,
        category: food.category,
        heat: food.heat,
        totalTime: opt.totalTime,
        flipAt: opt.flipAt,
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

  const el = document.createElement("div");
  el.className =
    "timer-card" +
    (t.started && !t.running ? " paused" : "") +
    (!t.started ? " pending" : "") +
    (overtime ? " overtime" : "");
  el.dataset.id = t.id;
  el.innerHTML = `
    <div class="timer-head">
      <div>
        <div class="timer-name">${t.name}</div>
        <div class="timer-heat">${t.heat}</div>
      </div>
      <div class="timer-remaining${overtime ? " overtime-text" : ""}">${fmtTime(remaining)}</div>
    </div>
    <div class="progress-track"><div class="progress-fill${overtime ? " overtime" : ""}" style="width:${pct}%"></div></div>
    <div class="timer-sub">
      ${
        !t.started
          ? "Ready — tap Start when it's on the grill."
          : overtime
          ? `Past done by ${fmtTime(Math.abs(remaining))} — stop or pause when ready.`
          : nextFlip !== undefined
          ? `Next flip at ${fmtTime(nextFlip)}`
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
  if (action === "remove") store.remove(id);
});

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
    body: "Timer finished — pull it off the grill. It'll keep counting up until you stop it.",
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
  const category = data.get("category") || "Meat";
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
