
# ⚡ KanmiPerf Pro

> Advanced in-browser Core Web Vitals diagnostics – with exportable logs, timeline analysis, and more.

[![npm version](https://img.shields.io/npm/v/kanmi-perf-pro.svg)](https://www.npmjs.com/package/kanmi-perf-pro)
[![Live Demo](https://img.shields.io/badge/demo-pro--live-blue)](https://konfirmed.github.io/KanmiPerf/pro.html)

---

## 📦 Install

**CDN (IIFE)**

```html
<script src="https://cdn.jsdelivr.net/npm/kanmi-perf-pro@0.2.0/dist/kanmi-perf-pro.js" defer></script>
```

**CDN (ESM)**

```js
import KanmiPerfPro from "https://cdn.jsdelivr.net/npm/kanmi-perf-pro@0.2.0/dist/kanmi-perf-pro.esm.js";
KanmiPerfPro.init();
```

**NPM**

```bash
npm install kanmi-perf-pro
```

```js
import KanmiPerfPro from 'kanmi-perf-pro';
KanmiPerfPro.init();
```

---

## 🧪 Usage

```js
KanmiPerfPro.init();

console.log(KanmiPerfPro.metrics);
console.log(KanmiPerfPro.issues);
console.log(window.__kanmiVitalsLog);  // Full log
```

---

## 🔑 License Key Setup

To use **KanmiPerf Pro**, you must provide a valid license key. You can do this in two ways:

### 1. Pass it directly when initializing:

```js
KanmiPerfPro.init({
  licenseKey: 'YOUR_LICENSE_KEY'
});
```

### 2. Set it globally and initialize:

```js
window.KanmiPerfProLicenseKey = 'YOUR_LICENSE_KEY';
KanmiPerfPro.init();
```

Your license key is provided after purchase via:

- The `/success` page redirect
- Email confirmation (if configured)
- Future access via the License Dashboard

🔗 Get your key at [https://knfrmd.com/pricing](https://knfrmd.com/pricing)

---

---

## 🔬 What It Adds (over `kanmi-perf`)

| Feature                  | `kanmi-perf` | `kanmi-perf-pro` |
|--------------------------|--------------|------------------|
| CLS, LCP, INP            | ✅           | ✅               |
| DOM & `<head>` checks    | ✅           | ✅               |
| LoAF & Long Task support | ✅           | ✅               |
| Timeline logging         | ❌           | ✅               |
| Full metrics export      | ❌           | ✅               |
| Visual element outlines  | ❌           | ✅               |
| Timestamped diagnostics  | ❌           | ✅               |

---

## 🔁 Timeline Report

```txt
[KanmiPerf 🚀] ⚠️ Timeline Report
1. DOM Issues ➜ 2ms
2. LCP ➜ 1432ms
3. CLS ➜ 2588ms
```

---

## 📄 License

MIT – [Kanmi Obasa](https://www.konfirmed.com)
