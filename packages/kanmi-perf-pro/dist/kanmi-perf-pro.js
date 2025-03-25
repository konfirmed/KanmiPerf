(function () {
  'use strict';

  (() => {
    const perf = {};

    // Global log export array
    window.__kanmiVitalsLog = window.__kanmiVitalsLog || [];
    // Timeline events to track ordering of vital metrics
    perf.timeline = [];

    /** Utility Logger **/
    perf.log = (type, issues) => {
      const timestamp = new Date().toISOString();

      // Log to console in a developer-friendly format:
      console.groupCollapsed(`[KanmiPerf 🚀] ⚠️ ${type} at ${timestamp}`);
      issues.forEach((issue) => console.log(`- ${issue}`));
      console.groupEnd();

      // Export the log entry for later inspection, e.g. exporting to JSON
      window.__kanmiVitalsLog.push({ type, issues, timestamp });
      // Also record this event in a timeline array for ordering/debug analysis
      perf.timeline.push({ type, issues, time: performance.now() });
    };

    /** DOM Analysis (Detect images missing explicit dimensions causing CLS) **/
    perf.domAnalysis = () => {
      const imgs = [...document.querySelectorAll("img:not([width]), img:not([height])")];
      if (imgs.length) {
        perf.log("DOM Issues", [
          `${imgs.length} image${imgs.length > 1 ? "s" : ""} missing dimensions (causes CLS)`,
        ]);
      }
    };

    /** <head> Analysis (Check for render-blocking scripts) **/
    perf.headAnalysis = () => {
      const headScripts = [...document.head.querySelectorAll("script[src]")];
      const blockingScripts = headScripts.filter((script) => !script.defer && !script.async);
      if (blockingScripts.length) {
        perf.log("<head> Issues", [
          `${blockingScripts.length} blocking script${blockingScripts.length > 1 ? "s" : ""} without async/defer`,
          ...blockingScripts.map((script) => `Suggest moving ${script.src} lower or load it with async/defer`),
        ]);
      }
    };

    /** Third-party Script Detection **/
    perf.thirdPartyAnalysis = () => {
      const host = location.hostname;
      const scripts = [...document.scripts].filter((s) => s.src && !s.src.includes(host));
      const syncScripts = scripts.filter((s) => !s.defer && !s.async);
      if (syncScripts.length) {
        perf.log(
          "Third-party Issues",
          syncScripts.map((script) => {
            const hostname = new URL(script.src).hostname;
            return `${hostname} synchronously loaded, delays rendering → Suggest loading async/defer or using Partytown`;
          })
        );
      }
    };

    /** Long Task Monitoring (using PerformanceObserver API) **/
    perf.monitorLongTasks = () => {
      if (!("PerformanceObserver" in window)) return;
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 125) {
            perf.log("Long Task", [
              `Duration: ${Math.round(entry.duration)}ms`,
              `→ Consider breaking into smaller tasks or deferring heavy JS`,
            ]);
          }
        });
      });
      observer.observe({ type: "longtask", buffered: true });
    };

    /** Long Animation Frame (LoAF) Monitoring **/
    perf.monitorLoAF = () => {
      if (!PerformanceObserver.supportedEntryTypes.includes("long-animation-frame")) return;
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const { duration, blockingDuration, renderTime, styleAndLayoutDuration } = entry;
          const safeNumber = (num) => (Number.isFinite(num) ? Math.round(num) : "N/A");

          let messages = [
            `Duration: ${safeNumber(duration)}ms, Blocking: ${safeNumber(blockingDuration)}ms`,
            `Render: ${safeNumber(renderTime)}ms, Layout: ${safeNumber(styleAndLayoutDuration)}ms`,
          ];
          if (renderTime === undefined || styleAndLayoutDuration === undefined) {
            messages.push("Note: Browser does not support detailed render/layout metrics for LoAF entries.");
          }
          messages.push("→ Investigate heavy scripts or CSS causing recalculations");
          perf.log("LoAF Detected", messages);
        });
      });
      observer.observe({ type: "long-animation-frame", buffered: true });
    };

    /** INP Correlation (Basic Event Monitoring for slow interactions with element attribution) **/
    perf.monitorINP = () => {
      if (!PerformanceObserver.supportedEntryTypes.includes("event")) return;
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 300) {
            // indicative of slow INP
            let msg = [`${entry.name} delayed interaction response by ${Math.round(entry.duration)}ms`];
            // Adding element attribution if available:
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

    /** Largest Contentful Paint (LCP) Monitoring with Element-level Attribution & UI Overlay **/
    perf.monitorLCP = () => {
      if (!PerformanceObserver.supportedEntryTypes.includes("largest-contentful-paint")) return;
      let lcpEntry;
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => (lcpEntry = entry));
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && lcpEntry) {
          const elementInfo = lcpEntry.element
            ? lcpEntry.element.outerHTML.slice(0, 100)
            : "N/A";
          perf.log("LCP", [
            `Largest Contentful Paint: ${
            lcpEntry.renderTime ? Math.round(lcpEntry.renderTime) : Math.round(lcpEntry.loadTime)
          }ms`,
            `Element: ${elementInfo}`,
            `→ Optimize images, text, and video content for faster loading`,
          ]);
          // Optional UI Overlay: Highlight the LCP element for visual debugging.
          if (lcpEntry.element) {
            lcpEntry.element.style.outline = "2px solid red";
            setTimeout(() => {
              lcpEntry.element.style.outline = "";
            }, 3000);
          }
        }
      });
    };

    /** Cumulative Layout Shift (CLS) Monitoring with Source Attribution **/
    perf.monitorCLS = () => {
      if (!PerformanceObserver.supportedEntryTypes.includes("layout-shift")) return;
      let clsValue = 0;
      let clsSources = [];
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            // Capture layout shift sources if available (limit to top 3):
            if (entry.sources && entry.sources.length) {
              entry.sources.slice(0, 3).forEach((src) => {
                if (src.node) {
                  clsSources.push(src.node.outerHTML.slice(0, 100));
                }
              });
            }
          }
        });
      });
      observer.observe({ type: "layout-shift", buffered: true });

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          const messages = [
            `Cumulative Layout Shift: ${clsValue.toFixed(2)}`,
            `→ Consider adding size attributes to images/videos, reserving space for ads/embeds, or avoiding dynamic content injection`,
          ];
          if (clsSources.length) {
            messages.push(`Top layout shift sources: ${clsSources.join(" | ")}`);
          }
          perf.log("CLS", messages);
        }
      });
    };

    /** Time To First Byte (TTFB) Analysis **/
    perf.timingAnalysis = () => {
      const navEntry = performance.getEntriesByType("navigation")[0];
      if (navEntry) {
        const ttfb = navEntry.responseStart;
        perf.log("TTFB", [
          `Time To First Byte: ${ttfb}ms`,
          `→ Consider optimizing backend response times and CDN performance`,
        ]);
      }
    };

    /** First Input Delay (FID) Monitoring with Element Attribution **/
    perf.monitorFID = () => {
      if (!PerformanceObserver.supportedEntryTypes.includes("first-input")) return;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime;
            if (fid > 1) {
              perf.log("FID", [
                `First Input Delay: ${Math.round(fid)}ms`,
                entry.target ? `Element: ${entry.target.outerHTML.slice(0, 100)}` : "",
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
        // Sort events by recording time:
        const sorted = perf.timeline.sort((a, b) => a.time - b.time);
        const timelineReport = sorted.map((event) => `${event.type} at ${Math.round(event.time)}ms`);
        perf.log("Timeline Report", timelineReport);
      }
    };

    /** Run All Analyses Manually **/
    perf.run = () => {
      perf.domAnalysis();
      perf.headAnalysis();
      perf.thirdPartyAnalysis();
      perf.monitorLongTasks();
      perf.monitorLoAF();
      perf.monitorINP();
      perf.monitorLCP();
      perf.monitorCLS();
      perf.timingAnalysis();
      perf.monitorFID();
    };

    /** Initialization: Run on page load or immediately if already loaded **/
    perf.init = () => {
      if (document.readyState === "complete") {
        perf.run();
      } else {
        window.addEventListener("load", perf.run);
      }
      // When the page is hidden, analyze and log the timeline of events.
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          perf.analyzeTimeline();
        }
      });
    };

    return perf;
  })();

})();
