(function () {
  'use strict';

  const KanmiPerf = (() => {
      const perf = {};
    
      /** Utility Logger **/
      perf.log = (type, issues) => {
        console.groupCollapsed(`[KanmiPerf 🚀] ⚠️ ${type}`);
        issues.forEach(issue => console.log(`- ${issue}`));
        console.groupEnd();
      };
    
      /** DOM Analysis (Detect images missing explicit dimensions causing CLS) **/
      perf.domAnalysis = () => {
        const imgs = [...document.querySelectorAll('img:not([width]), img:not([height])')];
        if (imgs.length) {
          perf.log('DOM Issues', [
            `${imgs.length} image${imgs.length > 1 ? 's' : ''} missing dimensions (causes CLS)`
          ]);
        }
      };
    
      /** <head> Analysis (Check for render-blocking scripts) **/
      perf.headAnalysis = () => {
        const headScripts = [...document.head.querySelectorAll('script[src]')];
        const blockingScripts = headScripts.filter(script => !script.defer && !script.async);
        if (blockingScripts.length) {
          perf.log('<head> Issues', [
            `${blockingScripts.length} blocking script${blockingScripts.length > 1 ? 's' : ''} without async/defer`,
            ...blockingScripts.map(script => `Suggest moving ${script.src} lower or load it with async/defer`)
          ]);
        }
      };
    
      /** Third-party Script Detection **/
      perf.thirdPartyAnalysis = () => {
        const host = location.hostname;
        const scripts = [...document.scripts].filter(s => s.src && !s.src.includes(host));
        const syncScripts = scripts.filter(s => !s.defer && !s.async);
        if (syncScripts.length) {
          perf.log('Third-party Issues', syncScripts.map(script => {
            const hostname = new URL(script.src).hostname;
            return `${hostname} synchronously loaded, delays rendering → Suggest loading async/defer or using Partytown`;
          }));
        }
      };
    
      /** Long Task Monitoring (using PerformanceObserver API) **/
      perf.monitorLongTasks = () => {
        if (!('PerformanceObserver' in window)) return;
        const observer = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            if (entry.duration > 125) {
              perf.log('Long Task', [
                `Duration: ${Math.round(entry.duration)}ms`,
                `→ Consider breaking into smaller tasks or deferring heavy JS`
              ]);
            }
          });
        });
        observer.observe({ type: 'longtask', buffered: true });
      };
    
      /** Long Animation Frame (LoAF) Monitoring **/
      perf.monitorLoAF = () => {
        if (!PerformanceObserver.supportedEntryTypes.includes('long-animation-frame')) return;
        const observer = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            const { duration, blockingDuration, renderTime, styleAndLayoutDuration } = entry;
            const safeNumber = (num) => Number.isFinite(num) ? Math.round(num) : 'N/A';
            
            let messages = [
              `Duration: ${safeNumber(duration)}ms, Blocking: ${safeNumber(blockingDuration)}ms`,
              `Render: ${safeNumber(renderTime)}ms, Layout: ${safeNumber(styleAndLayoutDuration)}ms`
            ];
            // Inform when render/layout metrics are unavailable.
            if (renderTime === undefined || styleAndLayoutDuration === undefined) {
              messages.push('Note: Browser does not support detailed render/layout metrics for LoAF entries.');
            }
            messages.push('→ Investigate heavy scripts or CSS causing recalculations');
            
            perf.log('LoAF Detected', messages);
          });
        });
        observer.observe({ type: 'long-animation-frame', buffered: true });
      };
    
      /** INP Correlation (Basic Event Monitoring for slow interactions) **/
      perf.monitorINP = () => {
        if (!PerformanceObserver.supportedEntryTypes.includes('event')) return;
        const observer = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            if (entry.duration > 300) { // indicative of slow INP
              perf.log('INP Interaction Issue', [
                `${entry.name} delayed interaction response by ${Math.round(entry.duration)}ms`,
                `→ Consider simplifying event handlers or deferring tasks`
              ]);
            }
          });
        });
        observer.observe({ type: 'event', durationThreshold: 300, buffered: true });
      };
    
      /** Largest Contentful Paint (LCP) Monitoring **/
      perf.monitorLCP = () => {
        if (!PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) return;
        let lcpEntry;
        const observer = new PerformanceObserver(list => {
          // Keep updating the latest LCP entry.
          list.getEntries().forEach(entry => lcpEntry = entry);
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Log LCP when page visibility changes (common practice to capture the final value)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden' && lcpEntry) {
            perf.log('LCP', [
              `Largest Contentful Paint: ${lcpEntry.renderTime ? Math.round(lcpEntry.renderTime) : Math.round(lcpEntry.loadTime)}ms`,
              `Element: ${lcpEntry.element ? lcpEntry.element.tagName : 'N/A'}`,
              `→ Optimize images, text, and video content for faster loading`
            ]);
          }
        });
      };
    
      /** Cumulative Layout Shift (CLS) Monitoring **/
      perf.monitorCLS = () => {
        if (!PerformanceObserver.supportedEntryTypes.includes('layout-shift')) return;
        let clsValue = 0;
        const observer = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            // Only count layout shifts not triggered by user input.
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        
        // Log CLS on page hide
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            perf.log('CLS', [
              `Cumulative Layout Shift: ${clsValue.toFixed(2)}`,
              `→ Add size attributes to images and videos, reserve space for ads/embeds, and avoid dynamic content injection`
            ]);
          }
        });
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
      };
    
      /** Initialization: Run on page load or immediately if already loaded **/
      perf.init = () => {
        if (document.readyState === 'complete') {
          // If the page is already loaded, run analysis immediately.
          perf.run();
        } else {
          window.addEventListener('load', perf.run);
        }
      };
    
      return perf;
    })();
    
    // Initialize KanmiPerf
    KanmiPerf.init();
    
    // Expose KanmiPerf for manual triggering in console if needed:
    // e.g., open your console and run: KanmiPerf.run();

})();
