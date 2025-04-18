import { defineConfig } from 'rollup';
import terser from '@rollup/plugin-terser';

export default defineConfig([
  {
    input: 'src/kanmi-perf-pro.js',
    output: {
      file: 'dist/kanmi-perf-pro.js',
      format: 'iife',
      name: 'KanmiPerfPro',
      sourcemap: true
    },
    plugins: [terser()]
  },
  {
    input: 'src/kanmi-perf-pro.js',
    output: {
      file: 'dist/kanmi-perf-pro.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [terser()]
  }
]);
