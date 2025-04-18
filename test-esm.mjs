import KanmiPerf from './packages/kanmi-perf/dist/kanmi-perf.esm.js';

console.log('Starting KanmiPerf ESM test...');
KanmiPerf.init();

setTimeout(() => {
  console.log('Metrics:', KanmiPerf.metrics || 'no metrics exposed');
  console.log('Issues:', KanmiPerf.issues || 'no issues exposed');
}, 5000);