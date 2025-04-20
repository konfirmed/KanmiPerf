# 🚀 KanmiPerf

> Real-time in-browser Core Web Vitals diagnostics – no setup, just insights.

[![npm version](https://img.shields.io/npm/v/kanmi-perf.svg)](https://www.npmjs.com/package/kanmi-perf)
[![Live Demo](https://img.shields.io/badge/demo-online-green)](https://konfirmed.github.io/KanmiPerf/)

**KanmiPerf** helps developers **identify**, **understand**, and **fix** web performance issues directly in the browser console.

---

## 📸 Visual Output

```txt
[KanmiPerf 🚀] ⚠️ LCP
- Largest Contentful Paint: 2300ms
- Element: IMG
→ Optimize images, text, and video content for faster loading
```

---

## 📦 Installation

**CDN (IIFE)**

```html
<script src="https://cdn.jsdelivr.net/npm/kanmi-perf@0.2.0/dist/kanmi-perf.js" defer></script>
```

**ESM Module**

```js
import KanmiPerf from "https://cdn.jsdelivr.net/npm/kanmi-perf@0.2.0/dist/kanmi-perf.esm.js";
KanmiPerf.init();
```

**NPM**

```bash
npm install kanmi-perf
```

```js
import KanmiPerf from 'kanmi-perf';
KanmiPerf.init();
```

---

## 🧪 Usage

- Use `.init()` to auto-run on load.
- Or call `.run()` manually for immediate analysis.

```js
KanmiPerf.run();

console.log(KanmiPerf.metrics);
console.log(KanmiPerf.issues);
```

---

## 🔬 What It Detects

- 🖼️ Images missing dimensions (CLS)
- 📦 Blocking `<script>` in `<head>`
- 🌐 Sync third-party scripts
- 🧠 Long Tasks
- 🎞️ LoAF (Long Animation Frames)
- ⌛ LCP (Largest Contentful Paint)
- 🌀 CLS (Cumulative Layout Shift)
- 🖱️ INP (Interaction to Next Paint)

---

## 🔗 Related

Check out the enhanced [KanmiPerf Pro](https://www.npmjs.com/package/kanmi-perf-pro) with full logs, outlines, exportable data, and timeline overlays.

---

## 📄 License

MIT – [Kanmi Obasa](https://www.konfirmed.com)