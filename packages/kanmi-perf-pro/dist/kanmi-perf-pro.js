(function () {
  'use strict';

  const KanmiPerf = (() => {
    const perf = {};

    // Initialize persistent log and timeline arrays for export and debugging.
    window.__kanmiVitalsLog = window.__kanmiVitalsLog || [];
    perf.timeline = [];
    // Store final metrics and a short list of issues.
    perf.metrics = {
      LCP: 0,
      CLS: 0,
      INP: 0,
      TTFB: 0,
      FCP: 0, // Added FCP metric
      LongTasks: []
    };
    perf.issues = [];

    /** Utility Logger **/
    perf.log = (type, issues) => {
      const timestamp = new Date().toISOString();
      console.groupCollapsed(`[KanmiPerf 🚀] ⚠️ ${type} at ${timestamp}`);
      issues.forEach(issue => console.log(`- ${issue}`));
      console.groupEnd();

      // Store logs for export and timeline analysis.
      window.__kanmiVitalsLog.push({ type, issues, timestamp });
      perf.timeline.push({ type, issues, time: performance.now() });

      // Also, accumulate a short version in perf.issues.
      issues.forEach(msg => {
        perf.issues.push(`[${type}] ${msg}`);
      });
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
      const suggestions = [];
      const headScripts = [...document.head.querySelectorAll("script[src]")];
      const blockingScripts = headScripts.filter(script => !script.defer && !script.async);
      if (blockingScripts.length) {
        suggestions.push(
          `${blockingScripts.length} blocking script${blockingScripts.length > 1 ? "s" : ""} without async/defer`,
          ...blockingScripts.map(script => `Suggest moving ${script.src} lower or load it with async/defer`)
        );
      }
      const headHTML = document.head?.outerHTML || "";
      const headSizeKB = (headHTML.length / 1024).toFixed(1);
      if (headHTML.length > 10000) {
        suggestions.push(`The <head> section is large (${headSizeKB} KB)`, "→ Consider optimizing it.");
      }
      if (suggestions.length > 0) {
        perf.log("<head> Issues", suggestions);
      }
    };

    /** Third-party Script Detection **/
    perf.thirdPartyAnalysis = () => {
      const host = location.hostname;
      const scripts = [...document.scripts].filter(s => s.src && !s.src.includes(host));
      const syncScripts = scripts.filter(s => !s.defer && !s.async);
      if (syncScripts.length) {
        perf.log("Third-party Issues", syncScripts.map(script => {
          const hostname = new URL(script.src).hostname;
          return `${hostname} synchronously loaded, delays rendering → Suggest loading async/defer or using Partytown`;
        }));
      }
    };

    /** Long Task Monitoring **/
    perf.monitorLongTasks = () => {
      if (!("PerformanceObserver" in window)) return;
      const longTasks = [];
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.duration > 125) {
            const duration = Math.round(entry.duration);
            let verdict = "🟡 Minor";
            if (duration > 300) verdict = "🚨 Severe";
            else if (duration > 200) verdict = "⚠️ Moderate";
            perf.log("Long Task", [
              `${verdict} – Main thread blocked for ${duration}ms`,
              "→ Break into smaller functions, use requestIdleCallback or Web Workers for heavy work"
            ]);
            longTasks.push(duration);
          }
        });
      });
      observer.observe({ type: "longtask", buffered: true });
      perf.metrics.LongTasks = longTasks;
    };

    /** Long Animation Frame (LoAF) Monitoring **/
    perf.monitorLoAF = () => {
      if (!PerformanceObserver.supportedEntryTypes.includes("long-animation-frame")) return;
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          const { duration, blockingDuration, renderTime, styleAndLayoutDuration } = entry;
          const safeNumber = (num) => Number.isFinite(num) ? Math.round(num) : "N/A";
          let messages = [
            `Duration: ${safeNumber(duration)}ms, Blocking: ${safeNumber(blockingDuration)}ms`,
            `Render: ${safeNumber(renderTime)}ms, Layout: ${safeNumber(styleAndLayoutDuration)}ms`
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

    /** INP Monitoring **/
    perf.monitorINP = () => {
      if (!PerformanceObserver.supportedEntryTypes.includes("event")) return;
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.duration > 300) {
            let msg = [`${entry.name} delayed interaction response by ${Math.round(entry.duration)}ms`];
            if (entry.target) {
              try {
                const html = entry.target.outerHTML?.slice(0, 100) || `[${entry.target.nodeName}]`;
                msg.push(`Element: ${html}`);
                entry.target.style.outline = "2px solid purple";
                setTimeout(() => entry.target.style.outline = "", 2500);
              } catch (e) {
                msg.push("Element: [unreadable]");
              }
            }
            msg.push("→ Optimize interaction handlers. Avoid blocking JS, reflows, and heavy tasks.");
            perf.log("INP Interaction Issue", msg);
            perf.metrics.INP = Math.round(entry.duration);
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
        list.getEntries().forEach(entry => {
          lcpEntry = entry;
          console.debug("[KanmiPerf Debug] LCP entry captured:", entry);
        });
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && lcpEntry) {
          const lcpTime = Math.round(lcpEntry.renderTime || lcpEntry.loadTime);
          let elementInfo = lcpEntry.element ? lcpEntry.element.outerHTML.slice(0, 100) : "N/A";
          if (lcpEntry.element) {
            lcpEntry.element.style.outline = "2px solid red";
            setTimeout(() => { lcpEntry.element.style.outline = ""; }, 3000);
          }
          perf.log("LCP", [
            `Largest Contentful Paint: ${lcpTime}ms`,
            `Element: ${elementInfo}`,
            "→ Optimize images, text, and video content for faster loading"
          ]);
          perf.metrics.LCP = lcpTime;
        }
      });
    };

    /** Cumulative Layout Shift (CLS) Monitoring **/
    perf.monitorCLS = () => {
      if (!PerformanceObserver.supportedEntryTypes.includes("layout-shift")) return;
      let clsValue = 0;
      let clsSources = [];
      const shiftNodes = [];
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput && entry.value > 0) {
            clsValue += entry.value;
            (entry.sources || []).slice(0, 3).forEach(src => {
              try {
                if (src.node && src.node.outerHTML) {
                  clsSources.push(src.node.outerHTML.slice(0, 100));
                  shiftNodes.push(src.node);
                } else {
                  clsSources.push("[Unknown Source]");
                }
              } catch (e) {
                clsSources.push("[Error Reading Source]");
              }
            });
            console.debug("[KanmiPerf Debug] Layout shift entry:", entry);
          }
        });
      });
      observer.observe({ type: "layout-shift", buffered: true });
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          const roundedCLS = +clsValue.toFixed(3);
          let verdict = "Good";
          if (roundedCLS > 0.25) verdict = "Poor";
          else if (roundedCLS > 0.1) verdict = "Needs Improvement";
          const messages = [
            `Cumulative Layout Shift: ${roundedCLS} (${verdict})`,
            "→ Consider reserving space for images, ads, embeds, or dynamic content to reduce unexpected shifts."
          ];
          if (clsSources.length) {
            messages.push(`Top shifting elements: ${clsSources.join(" | ")}`);
          }
          perf.log("CLS", messages);
          perf.metrics.CLS = roundedCLS;
          shiftNodes.forEach(node => {
            if (node && node.style) {
              node.style.outline = "2px dashed orange";
              setTimeout(() => node.style.outline = "", 3000);
            }
          });
        }
      });
    };

    /** Merged TTFB & <head> Analysis **/
    perf.timingAnalysis = () => {
      const navEntry = performance.getEntriesByType("navigation")[0];
      if (navEntry) {
        const ttfb = Math.round(navEntry.responseStart);
        // Use configurable thresholds for TTFB if provided.
        const ttfbThresholds = (window.KanmiPerfConfig && window.KanmiPerfConfig.thresholds && window.KanmiPerfConfig.thresholds.TTFB) || { good: 200, needsImprovement: 600 };
        const suggestions = [`Time To First Byte: ${ttfb}ms`];
        if (ttfb <= ttfbThresholds.good) {
          suggestions.push("TTFB is in the Good range.");
        } else if (ttfb <= ttfbThresholds.needsImprovement) {
          suggestions.push("→ TTFB is slightly high. Review server response time and cache strategy.");
        } else {
          suggestions.push("→ TTFB is very high. Optimize backend performance, CDN, and server-side rendering.");
        }
        // Integrated head analysis:
        const headHTML = document.head?.outerHTML || "";
        const headSizeKB = (headHTML.length / 1024).toFixed(1);
        if (headHTML.length > 10000) {
          suggestions.push(`→ The <head> section is large (${headSizeKB} KB). Consider optimizing it.`);
        }
        // Further breakdown of <head> content:
        const scriptTags = document.head.querySelectorAll("script").length;
        const inlineScripts = document.head.querySelectorAll("script:not([src])").length;
        const stylesheets = document.head.querySelectorAll("link[rel='stylesheet']").length;
        const styleBlocks = document.head.querySelectorAll("style").length;
        const preloadLinks = document.head.querySelectorAll("link[rel='preload']").length;
        if (scriptTags > 5) {
          suggestions.push(`→ There are ${scriptTags} <script> tags in <head>. Consider deferring non-critical JS.`);
        }
        if (inlineScripts > 1) {
          suggestions.push(`→ Multiple inline <script> blocks found. Consider externalizing where possible.`);
        }
        if (stylesheets > 3) {
          suggestions.push(`→ ${stylesheets} stylesheets detected. Consolidate critical CSS to reduce requests.`);
        }
        if (styleBlocks > 1) {
          suggestions.push(`→ ${styleBlocks} <style> blocks found. Inline styles can delay parsing.`);
        }
        if (preloadLinks > 5) {
          suggestions.push(`→ ${preloadLinks} preload tags found. Verify they are used early to avoid wasted bytes.`);
        }
        perf.log("TTFB & <head> Analysis", suggestions);
        perf.metrics.TTFB = ttfb;
      }
    };

    /** First Contentful Paint (FCP) Monitoring **/
    perf.monitorFCP = () => {
      if (!PerformanceObserver.supportedEntryTypes.includes("paint")) return;
      let fcpEntry;
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.name === "first-contentful-paint") {
            fcpEntry = entry;
          }
        });
      });
      observer.observe({ type: "paint", buffered: true });
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && fcpEntry) {
          const fcpTime = Math.round(fcpEntry.startTime);
          perf.log("FCP", [
            `First Contentful Paint: ${fcpTime}ms`,
            "→ Ensure critical resources are loaded efficiently."
          ]);
          perf.metrics.FCP = fcpTime;
        }
      });
    };

    /** Timeline Debug **/
    perf.analyzeTimeline = () => {
      if (perf.timeline.length > 1) {
        const sorted = [...perf.timeline].sort((a, b) => a.time - b.time);
        const baseTime = sorted[0].time;
        const timelineReport = sorted.map((event, i) => {
          const delta = Math.round(event.time - baseTime);
          return `${i + 1}. ${event.type} ➜ ${delta}ms`;
        });
        perf.log("Timeline Report", timelineReport);
      } else {
        perf.log("Timeline Report", ["Insufficient data to generate timeline"]);
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
      perf.monitorFCP();
    };

    /** Initialization **/
    perf.init = () => {
      if (document.readyState === "complete") {
        perf.run();
      } else {
        window.addEventListener("load", perf.run);
      }
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          perf.analyzeTimeline();
        }
      });
    };

    // Optional: Global error monitoring to capture unhandled errors.
    window.onerror = (msg, url, lineNo, columnNo, error) => {
      const errorMessage = `${msg} at ${url}:${lineNo}:${columnNo}`;
      perf.log("JS Error", [errorMessage]);
      return false;
    };

    window.KanmiPerf = perf;
    return perf;
  })();

  // Initialize KanmiPerf immediately
  KanmiPerf.init();

})();
