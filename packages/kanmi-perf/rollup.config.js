// packages/kanmi-perf/rollup.config.js
import { defineConfig } from 'rollup';
import terser from '@rollup/plugin-terser';

export default defineConfig([
  {
    input: 'src/kanmi-perf.js',
    output: {
      file: 'dist/kanmi-perf.js',
      format: 'iife',
      name: 'KanmiPerf',
      sourcemap: true
    },
    plugins: [terser()]
  },
  {
    input: 'src/kanmi-perf.js',
    output: {
      file: 'dist/kanmi-perf.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [terser()]
  }
]);