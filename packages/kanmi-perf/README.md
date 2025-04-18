# KanmiPerf (Core)

Lightweight web performance diagnostics for real-world usage with minimal overhead.

---

## Features

- Tracks key metrics: LCP, CLS, FCP, INP, TTFB
- Works in any browser
- Lightweight: no timeline, no visual overlays
- Ideal for embedding in production apps
- Manual control over `init()` and `run()`

---

## Usage

### 1. Load via CDN or as module
```html
<script src="dist/kanmi-perf.js" defer></script>
```
or
```js
import KanmiPerf from 'kanmi-perf';

KanmiPerf.init();  // Start performance monitoring
```

### 2. Metrics are exposed on:
```js
KanmiPerf.metrics
KanmiPerf.issues
```

### 3. Designed for:
- Real user monitoring (RUM)
- Framework-agnostic deployment
- Lightweight performance checks