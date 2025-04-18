# KanmiPerf Pro

Advanced Web Vitals diagnostics for devtools, CI/CD pipelines, and real-time in-browser performance monitoring.

> See, debug, and ship fast experiences.

![npm](https://img.shields.io/npm/v/kanmi-perf-pro)  
[View on NPM](https://www.npmjs.com/package/kanmi-perf-pro)

---

## Features

- LCP/CLS tracking with DOM overlay
- Timeline logging for key performance events
- Long Tasks, LoAF, FCP, INP detection
- Exportable logs via `window.__kanmiVitalsLog`
- Third-party + script audit (e.g., sync scripts)
- Works in-browser or via CI (e.g., Puppeteer/Playwright)

---

## Changes & Architecture

- `kanmi-perf-pro` is now built using a factory pattern. It no longer auto-initializes.
- Developers must call `KanmiPerf.init()` to begin collecting metrics.
- Metrics tracked include:
  - LCP, CLS, FCP, TTFB, INP, Long Tasks, and LoAF
- `window.__kanmiVitalsLog` stores all log entries:
  - Issue type, timestamp, and suggestions
- Performance scoring uses thresholds and weights defined in `config.js`
- The module exports a `KanmiPerfInstance` exposing:
  - `init()` – Starts performance monitoring
  - `run()` – Triggers manual analysis
  - `analyzeTimeline()` – Outputs a timeline of captured events

---

## Usage

### 1. Load via HTML or CDN
```html
<script src="dist/kanmi-perf-pro.js" defer></script>
```

### 2. Use in JavaScript
```js
import KanmiPerf from 'kanmi-perf-pro';

KanmiPerf.init();  // Setup observers
KanmiPerf.run();   // Optional: run manually
```

### 3. Access Logs
```js
console.log(window.__kanmiVitalsLog);
```