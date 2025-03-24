# 🚀 KanmiPerf

> Real-time in-browser Core Web Vitals diagnostics – no setup, just insights.

**KanmiPerf** helps developers **identify**, **understand**, and **fix** web performance issues directly in the browser console.

## 🔍 What It Detects

- 🖼️ **DOM issues** (e.g., images without width/height causing CLS)
- 📦 **Render-blocking scripts** in `<head>`
- 🌐 **Synchronous third-party scripts**
- 🧠 **Long tasks** blocking the main thread
- 🎞️ **LoAF (Long Animation Frames)**
- ⌛ **LCP (Largest Contentful Paint)**
- 🌀 **CLS (Cumulative Layout Shift)**
- 🖱️ **INP (Interaction to Next Paint)**

## 💾 Installation


Include it as a script tag:

```html
<script src="https://cdn.jsdelivr.net/gh/konfirmed/kanmi-perf/dist/kanmi-perf.js" defer></script>
```
Install via npm:

```bash
npm install kanmi-perf
```


## 🧪 Usage

In your development or staging environment, import the library:

```javascript
import 'kanmi-perf';
```

To manually trigger diagnostics after the page loads:

```javascript
KanmiPerf.run();
```

## 🛠️ Status

KanmiPerf is in active development. We welcome issues, feedback, and contributors!

## 📄 License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).
