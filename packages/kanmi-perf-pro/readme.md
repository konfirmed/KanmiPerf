# ⚡️ KanmiPerf Pro

**Advanced Web Vitals diagnostics for devtools, CI/CD pipelines, and real-time in-browser performance monitoring.**

> Built by [Kanmi Obasa](https://github.com/konfirmed) — empowering developers to *see*, *debug*, and *ship* fast experiences.

![npm](https://img.shields.io/npm/v/kanmi-perf-pro)  
[🔗 View on NPM](https://www.npmjs.com/package/kanmi-perf-pro)

---

## 🚀 Features

- 📉 **LCP/CLS tracking** with DOM overlay
- 🕒 **Timeline logging** for key performance events
- ⚠️ **Long Tasks**, **LoAF**, **FID**, **INP** detection
- 📦 **Exportable logs** via `window.__kanmiVitalsLog`
- 🌐 **Third-party + script audit** (e.g. sync scripts)
- 📄 Works in-browser or via CI (e.g. Puppeteer/Playwright)

---

## 📦 Installation

```bash
npm install kanmi-perf-pro
# or
yarn add kanmi-perf-pro
```

---

## 📜 Usage
1. Load it in your HTML:
```
<script src="node_modules/kanmi-perf-pro/dist/kanmi-perf-pro.js" defer></script>
```
Or via CDN (e.g. unpkg):

```
<script src="https://unpkg.com/kanmi-perf-pro/dist/kanmi-perf-pro.js" defer></script>
```
2. It auto-runs on page load — or trigger manually:
```
KanmiPerf.init(); // Optional, in case you want to delay it
KanmiPerf.run();  // Trigger analysis on demand
```
## 📊 Exporting Performance Logs
All logs are stored in:

```
window.__kanmiVitalsLog
```
You can export to JSON or analyze inside Chrome DevTools.

## 🔍 Example Output
```
[
  {
    "type": "LCP",
    "issues": [
      "Largest Contentful Paint: 1467ms",
      "Element: <img src='banner.jpg' ...>",
      "→ Optimize images, text, and video content for faster loading"
    ],
    "timestamp": "2025-03-25T02:20:00.123Z"
  }
]
```
## 🧪 Ideal For
Performance debugging

Regression testing

Chrome DevTools integration

CI-based perf budgets

Teaching Core Web Vitals in practice

## 📘 Related
kanmi-perf – lightweight diagnostics, zero timeline/log export

commitvitals-core – coming soon...

## 🛠 Roadmap
 JSON export via UI button

 Auto-upload to dashboard

 CLI bundle for Lighthouse CI pipelines

 Rollup/Vite plugin for dev overlay

## 👤 Author
Built by Kanmi Obasa

📄 License
MIT – Free to use and modify.
If you found this useful, consider starring ⭐ the repo!