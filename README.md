# GrillTime

A GrillTime Pro-inspired grill timer. Pick a food preset (or add your own),
start as many timers as you're grilling at once, and get alerted when it's
time to flip and when each one's done.

Runs as a static PWA — no backend, no build step. All data (custom foods,
active timers) lives in your browser's `localStorage`.

## Use it

Hosted via GitHub Pages: enable it in **Settings → Pages → Source: Deploy
from branch → `main` / `(root)`**, then visit
`https://<your-username>.github.io/newbiegrill/`.

On iPhone, open that URL in Safari and use **Share → Add to Home Screen** —
this is required for background notifications to have any chance of firing
reliably (see Limitations below), and it makes the app open full-screen like
a native app.

## Features

- Preset foods with default heat setting, total time, and flip point(s)
  (`js/foods.js`) — burgers, steaks, chicken, ribs, corn, and more
- Add your own custom foods; saved locally and persist across visits
- Run multiple timers at once, each independently pausable/resumable
- Flip alerts and a done alert per timer: system notification + sound +
  vibration + on-screen banner
- Timers survive a page reload or the tab being closed and reopened — time
  is tracked from an absolute start timestamp, not a running countdown, so
  it's always correct
- Installable as a home-screen PWA with offline support (service worker
  caches the app shell)

## Limitations

- **Background notifications are best-effort.** Browsers (especially iOS
  Safari) throttle or suspend JavaScript in backgrounded/closed tabs, so a
  timer's alert may fire late, or not until you reopen the app. Installing
  to the home screen (see above) is the biggest lever you have — this is a
  platform constraint, not something a static site can fully work around.
- Keep the phone unlocked/app open near the grill for the most reliable
  alerts, or rely on the sound/vibration when you check back in.

## Local development

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. No dependencies, no build step.

## Structure

```
index.html          App shell / markup
css/style.css        Styling
js/foods.js          Built-in presets + custom food storage
js/timers.js          Timer state engine (start/pause/resume/tick)
js/notify.js          Notification + sound + vibration alerts
js/app.js             UI wiring
manifest.json          PWA manifest
sw.js                  Service worker (offline cache, notification click)
icons/                 App icons
```
