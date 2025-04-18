export const KanmiPerfConfig = {
    thresholds: {
      LCP: { good: 2500, needsImprovement: 4000 },
      CLS: { good: 0.1, needsImprovement: 0.25 },
      TTFB: { good: 800, needsImprovement: 1800 },
      INP: { good: 200, needsImprovement: 500 },
      FCP: { good: 1800, needsImprovement: 3000 },
      LongTasks: { good: 150, needsImprovement: 300 }
    },
    weights: {
      LCP: 0.25,
      CLS: 0.2,
      TTFB: 0.2,
      INP: 0.2,
      FCP: 0.15
    }
  };