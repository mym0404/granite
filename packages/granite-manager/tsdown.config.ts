import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/index.tsx',
  format: 'esm',
  outDir: 'dist',
  fixedExtension: false,
});
