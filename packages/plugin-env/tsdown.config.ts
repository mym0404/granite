import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    deps: {
      neverBundle: ['./plugins/babel.cjs'],
    },
    fixedExtension: false,
  },
  {
    entry: ['src/plugins/babel.ts'],
    format: ['cjs'],
    outDir: 'dist/plugins',
    dts: false,
    fixedExtension: false,
  },
]);
