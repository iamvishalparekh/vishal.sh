# vishal.sh — personal website

A cinematic, single-page personal website with a drivable car, working SQL playground, fake REST API, 2048 with leaderboard, and 5 small interactions to discover.

Built as plain HTML / CSS / JS / JSX. No build step — open `index.html` in any modern browser.

## What's in here

- **Hero** — interactive 3D orb (Three.js icosahedron + orbiting moons) with drag-to-rotate
- **Try-these panel** — 5 visible interactions with progress tracking (all local-only)
- **🚗 Drive mode** — press `/` or click the floating button to spawn a car. WASD or arrows to drive. Collect floating tech logos for points. Mobile gets a touch D-pad.
- **About** — written copy with a side card of identity / kit / off-hours
- **Playground**
  - Fake REST API explorer (`/api/skills`, `/api/experience`, `/api/uptime`, `/api/status`, `/api/coffee`)
  - SQL playground running a real (tiny) in-memory database — `SHOW TABLES`, `SELECT`, `WHERE`, `DESCRIBE`
  - 2048 with a top-5 local leaderboard
- **Journey** — career timeline with dots that light up as you scroll past
- **Stack** — 27 tech flip cards across 5 categories (Daily driver / Comfortable / Familiar / Curious / Not today) with honest take on each
- **Guestbook** — sign it. Stays in your browser only.
- **Contact** — email, LinkedIn, GitHub

## Extras

- Particle burst on every click
- Cursor trail
- Starfield background with parallax on scroll
- Count-up stat numbers
- Konami code → confetti
- Console payload (`window.sayhi()`, `window.coffee()`, `window.score()`)
- DevTools-open detection

## File map

```
index.html         — the page
cinematic-fx.js    — starfield, hero 3D, click bursts, cursor trail, scroll reveal,
                     count-up, tilt cards, konami, confetti, console payload
drive-mode.js      — the drivable car: physics, collectibles, HUD, touch D-pad
playground.jsx     — React components: SQL, API explorer, 2048, Guestbook
                     (also exports RegexGolf and BigO, unused on this page but
                     kept for re-use)
README.md          — this file
```

## Run locally

No build needed. Either:

```sh
# open directly
open index.html

# or serve with any static server
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Tech

- **HTML / CSS / vanilla JS** for everything except the React components
- **Three.js** (CDN UMD build) for the hero orb
- **React 18 + Babel Standalone** (CDN) for the playground components — transpiled in-browser, no bundler
- Fonts: Inter, JetBrains Mono, Instrument Serif via Google Fonts
- Storage: `localStorage` only (no cookies, no trackers, no server)

## License

MIT — do what you like with the code. Don't pretend you're me.

— Vishal Parekh · [hello@vishal.sh](mailto:hello@vishal.sh) · [linkedin](https://www.linkedin.com/in/iamvishalparekh) · [github](https://github.com/iamvishalparekh)
