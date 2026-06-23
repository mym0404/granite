import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: './src/index.ts',
  format: 'esm',
  outDir: 'dist',
  dts: false,
  deps: {
    onlyBundle: false,
  },
  fixedExtension: false,
});
