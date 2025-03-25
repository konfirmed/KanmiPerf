const KanmiPerf = (() => {
  const perf = {};
  // Debug flag for development environments
  perf.debug = true;

  // Global log array and timeline for events
  window.__kanmiVitalsLog = window.__kanmiVitalsLog || [];
  perf.timeline = [];

  /** Utility Logger **/
  perf.log = (type, issues) => {
    const timestamp = new Date().toISOString();
    console.groupCollapsed(`[KanmiPerf 🚀] ⚠️ ${type} at ${timestamp}`);
    issues.forEach(issue => console.log(`- ${issue}`));
    console.groupEnd();
    window.__kanmiVitalsLog.push({ type, issues, timestamp });
    perf.timeline.push({ type, issues, time: performance.now() });
  };

  /** DOM Analysis **/
  perf.domAnalysis = () => {
    const imgs = [...document.querySelectorAll("img:not([width]), img:not([height])")];
    if (imgs.length) {
      perf.log("DOM Issues", [
        `${imgs.length} image${imgs.length > 1 ? "s" : ""} missing dimensions (causes CLS)`
      ]);
    }
  };

  /** <head> Analysis **/
  perf.headAnalysis = () => {
    const blockingScripts = [...document.head.querySelectorAll("script[src]:not([async]):not([defer])")];
    if (blockingScripts.length) {
      perf.log("<head> Issues", [
        `${blockingScripts.length} blocking script${blockingScripts.length > 1 ? "s" : ""} without async/defer`,
        ...blockingScripts.map(script =>
          `Suggest moving ${script.src} lower or load it with async/defer`
        )
      ]);
    }
  };

  /** Third-party Script Detection **/
  perf.thirdPartyAnalysis = () => {
    const host = location.hostname;
    const scripts = [...document.scripts].filter(s => s.src && !s.src.includes(host));
    const syncScripts = scripts.filter(s => !s.defer && !s.async);
    if (syncScripts.length) {
      perf.log("Third-party Issues", syncScripts.map(script => {
        return `${new URL(script.src).hostname} synchronously loaded, delays rendering → Suggest async/defer`;
      }));
    }
  };

  /** Long Task Monitoring **/
  perf.monitorLongTasks = () => {
    if (!("PerformanceObserver" in window)) return;
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.duration > 125) {
          perf.log("Long Task", [
            `Duration: ${Math.round(entry.duration)}ms`,
            `→ Consider breaking into smaller tasks or deferring heavy JS`
          ]);
        }
      });
    });
    observer.observe({ type: "longtask", buffered: true });
  };

  /** INP Monitoring **/
  perf.monitorINP = () => {
    if (!PerformanceObserver.supportedEntryTypes.includes("event")) return;
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.duration > 300) {
          const msg = [
            `${entry.name} delayed interaction response by ${Math.round(entry.duration)}ms`
          ];
          if (entry.target) {
            msg.push(`Element: ${entry.target.outerHTML.slice(0, 100)}`);
          }
          msg.push("→ Consider simplifying event handlers or deferring tasks");
          perf.log("INP Interaction Issue", msg);
        }
      });
    });
    observer.observe({ type: "event", durationThreshold: 300, buffered: true });
  };

  /** Largest Contentful Paint (LCP) Monitoring **/
  perf.monitorLCP = () => {
    if (!PerformanceObserver.supportedEntryTypes.includes("largest-contentful-paint")) return;
    let lcpEntry;
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => (lcpEntry = entry));
    });
    observer.observe({ type: "largest-contentful-paint", buffered: true });

    // Store a function to log LCP when visibility changes
    perf._logLCP = () => {
      if (document.visibilityState === "hidden" && lcpEntry) {
        const elementInfo = lcpEntry.element
          ? lcpEntry.element.outerHTML.slice(0, 100)
          : "N/A";
        perf.log("LCP", [
          `Largest Contentful Paint: ${
            lcpEntry.renderTime ? Math.round(lcpEntry.renderTime) : Math.round(lcpEntry.loadTime)
          }ms`,
          `Element: ${elementInfo}`,
          `→ Optimize images, text, and video content for faster loading`
        ]);
        // Highlight the LCP element in debug mode
        if (perf.debug && lcpEntry.element) {
          lcpEntry.element.style.outline = "2px solid red";
          setTimeout(() => { lcpEntry.element.style.outline = ""; }, 3000);
        }
      }
    };
  };

  /** Cumulative Layout Shift (CLS) Monitoring **/
  perf.monitorCLS = () => {
    if (!PerformanceObserver.supportedEntryTypes.includes("layout-shift")) return;
    let clsValue = 0;
    let clsSources = [];
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          if (entry.sources && entry.sources.length) {
            entry.sources.slice(0, 3).forEach(src => {
              if (src.node) clsSources.push(src.node.outerHTML.slice(0, 100));
            });
          }
        }
      });
    });
    observer.observe({ type: "layout-shift", buffered: true });

    // Store a function to log CLS on visibility change
    perf._logCLS = () => {
      if (document.visibilityState === "hidden") {
        const messages = [
          `Cumulative Layout Shift: ${clsValue.toFixed(2)}`,
          `→ Consider adding size attributes to images/videos or reserving space for dynamic content`
        ];
        if (clsSources.length) {
          messages.push(`Top layout shift sources: ${clsSources.join(" | ")}`);
        }
        perf.log("CLS", messages);
      }
    };
  };

  /** Time To First Byte (TTFB) Analysis **/
  perf.timingAnalysis = () => {
    const navEntry = performance.getEntriesByType("navigation")[0];
    if (navEntry) {
      const ttfb = navEntry.responseStart;
      perf.log("TTFB", [
        `Time To First Byte: ${ttfb}ms`,
        `→ Consider optimizing backend response times and CDN performance`
      ]);
    }
  };

  /** First Input Delay (FID) Monitoring **/
  perf.monitorFID = () => {
    if (!PerformanceObserver.supportedEntryTypes.includes("first-input")) return;
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.processingStart && entry.startTime) {
          const fid = entry.processingStart - entry.startTime;
          if (fid > 1) {
            perf.log("FID", [
              `First Input Delay: ${Math.round(fid)}ms`,
              entry.target ? `Element: ${entry.target.outerHTML.slice(0, 100)}` : ""
            ]);
          }
        }
      }
    });
    observer.observe({ type: "first-input", buffered: true });
  };

  /** Timeline Debug: Compare Metrics Chronologically **/
  perf.analyzeTimeline = () => {
    if (perf.timeline.length > 1) {
      const sorted = perf.timeline.sort((a, b) => a.time - b.time);
      const report = sorted.map(event => `${event.type} at ${Math.round(event.time)}ms`);
      perf.log("Timeline Report", report);
    }
  };

  /** Combined Visibility Change Handler **/
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      if (perf._logLCP) perf._logLCP();
      if (perf._logCLS) perf._logCLS();
      perf.analyzeTimeline();
    }
  };

  /** Export Logs Button (only in debug mode) **/
  perf.addExportButton = () => {
    const btn = document.createElement("button");
    btn.innerText = "Export Kanmi Logs";
    Object.assign(btn.style, { position: "fixed", bottom: "10px", right: "10px", zIndex: 9999 });
    btn.onclick = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.__kanmiVitalsLog, null, 2));
      const dl = document.createElement("a");
      dl.setAttribute("href", dataStr);
      dl.setAttribute("download", "kanmi-vitals.json");
      dl.click();
    };
    document.body.appendChild(btn);
  };

  /** Initialization Logic **/
  perf.init = () => {
    if (document.readyState === "complete") {
      perf.run();
    } else {
      window.addEventListener("load", perf.run);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (perf.debug) perf.addExportButton();
  };

  /** Manual Trigger of All Analyses **/
  perf.run = () => {
    const runAnalysis = () => {
      perf.domAnalysis();
      perf.headAnalysis();
      perf.thirdPartyAnalysis();
      perf.monitorLongTasks();
      perf.monitorINP();
      perf.monitorLCP();
      perf.monitorCLS();
      perf.timingAnalysis();
      perf.monitorFID();
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(runAnalysis);
    } else {
      runAnalysis();
    }
  };

  return perf;
})();

// Initialize the performance monitoring
KanmiPerf.init();