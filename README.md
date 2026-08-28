# theMENTOR — Sofia

Hungarian-language, voice-first AI advisor **prototype**. A React + Vite port of the
single-file prototype `sofia-roster-tier2-animalt-hu.html`, which remains the source of
truth for all visuals, copy, and timing.

Everything Sofia and the experts "say" is a **pre-written script**. There is no LLM, no
speech-to-text, and no database — the site is static files on GitHub Pages.

---

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |

Requires Node 20.19+ or 22.12+ (Vite 8). CI builds on Node 22.

## The demo control panel

The amber **DEMO VEZÉRLŐ** panel in the bottom-right drives the whole state machine for
live walkthroughs. It is *not* part of the product UI, so ordinary visitors never see it.
Two ways to turn it on:

**1. Per-visit, via the URL** — append `?demo=1`:

```
https://your-domain.example/?demo=1
```

Nothing is remembered; dropping the query string hides the panel again. This is the one
to use in a pitch meeting.

**2. Per-build, via an env var** — set `VITE_SHOW_DEMO=true` at build time:

```bash
VITE_SHOW_DEMO=true npm run build
```

The panel is then always visible on that build, for every visitor, with no query string.
Vite inlines the value at build time, so this must be set when `npm run build` runs — for
the deployed site that means adding it to the `build` job in
`.github/workflows/deploy.yml`. It is **off** by default, and the default build is what
CI deploys.

You can also drive the demo without the panel: the "Igen / Nem, köszi" follow-up buttons
in the call screen are real product UI and advance the same state machine.

## Footer disclaimer

Every visitor sees this line in the page footer, regardless of demo mode:

> Ez egy korai prototípus — Sofia és a szakértők válaszai előre elkészített forgatókönyvek, nem élő AI.

The URL is public and may be shared beyond a controlled demo, so this stays visible.

---

## Project layout

```
index.html                  Vite entry — carries the Google Fonts <link> tags
vite.config.js              base: '/' (custom domain at the root, not a project subpath)
src/
  main.jsx                  React root
  App.jsx                   Layout + the demo-panel gate
  data/experts.js           SOFIA + EXPERTS, ported verbatim from the prototype
  hooks/useCallState.js     The entire state machine and its timers
  components/
    Lights.jsx              Red / amber / green confidence lights
    Presence.jsx            Sofia's orb, or the active expert's head
    PersonaHead.jsx         The illustrated SVG head, as real JSX
    Caption.jsx             Spoken-caption line
    Followup.jsx            "Van még kérdésed?" Igen / Nem, köszi
    ChatButton.jsx          Floating Chat button + unread badge
    ChatPanel.jsx           Transcript, sources, escalation, live hand-off
    ConfidenceCard.jsx      Percentage, bar meter, score breakdown
    DemoPanel.jsx           DEMO VEZÉRLŐ (gated)
  styles/global.css         The prototype's stylesheet, byte-identical plus `.footnote`
.claude/launch.json         Optional dev-server config for editor tooling
```

State lives in component state plus the one `useCallState` hook — no Redux/Zustand, and
no router, since there is a single view.

### Notes for anyone editing this

- The scripted numbers are deliberate. Anna's breakdown contains a **−6** penalty line
  ("Helyi szabály, amit nem ellenőrzök"); it is intentional, not a bug.
- Only Tibor has `allowEscalation: true`, so only his flow reaches "no more content →
  ping the expert → live join succeeds or fails".
- Timing constants in `useCallState.js` (`1100ms` think, `1700ms` say, `1800ms` hand-off)
  come straight from the prototype. Every `setTimeout` is tracked and cancelled on reset
  and unmount, so nothing from a previous call fires into a new one.
- Adding a real LLM, real speech-to-text, or a database is **out of scope for this repo**.
  It needs a server-side secret key, which cannot live in a static site — that would be a
  separate project with its own API layer (e.g. a Cloudflare Worker).

---

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which:

1. checks out the repo and installs Node 22,
2. runs `npm ci` (this is why `package-lock.json` is committed) and `npm run build`,
3. uploads `dist/` as a Pages artifact,
4. deploys it with `actions/deploy-pages`.

This is the "deploy from GitHub Actions" method — no `gh-pages` branch and no personal
access token; the built-in `GITHUB_TOKEN` is enough. You can also run it by hand from the
Actions tab (`workflow_dispatch`).

### One-time repository setup

After the first successful Actions run:

1. **Settings → Pages → Build and deployment → Source**: set to **GitHub Actions**
   (not "Deploy from a branch").
2. **Settings → Pages → Custom domain**: enter the domain and save.
   Do **not** add a `public/CNAME` file — when publishing via a GitHub Actions workflow,
   GitHub ignores any CNAME file in the repo. The domain is configured only through this
   field.

   There *is* a `CNAME` file in the repo root. GitHub committed it automatically when the
   custom domain was first set, while Pages was still on "Deploy from a branch". It is
   inert now that the source is GitHub Actions, and is kept only so the domain survives if
   anyone ever switches the source back.
3. **DNS**, at the domain registrar. This is already done for `sofiai.hu` — recorded
   here so it can be rebuilt or checked. `sofiai.hu` is an apex domain, so it uses A
   records rather than a CNAME:

   | Type | Name | Value |
   | --- | --- | --- |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | AAAA | `@` | `2606:50c0:8000::153` |
   | AAAA | `@` | `2606:50c0:8001::153` |
   | AAAA | `@` | `2606:50c0:8002::153` |
   | AAAA | `@` | `2606:50c0:8003::153` |
   | CNAME | `www` | `meruem5.github.io.` |

   The AAAA records are optional (IPv6); the `www` CNAME is what makes
   `www.sofiai.hu` work alongside the apex. Verify with:

   ```bash
   dig +short sofiai.hu A && dig +short www.sofiai.hu CNAME
   ```

4. **Enforce HTTPS** in Settings → Pages. Already enabled — the certificate covers both
   `sofiai.hu` and `www.sofiai.hu`. This checkbox only becomes available after GitHub
   verifies the domain, so on a fresh setup it may need a retry.

### Action versions

`actions/checkout@v7` and `actions/setup-node@v7` are pinned deliberately: v4 of both is
being deprecated as GitHub migrates runners to Node 24, losing support around September
2026. `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4` are current —
don't downgrade them.
