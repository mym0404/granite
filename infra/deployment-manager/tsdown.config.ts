import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: './src/index.ts',
    format: ['esm', 'cjs'],
    outDir: 'dist',
    dts: true,
    shims: true,
    deps: {
      neverBundle: ['@aws-sdk/client-s3'],
    },
    fixedExtension: false,
    outputOptions: {
      codeSplitting: false,
    },
  },
]);
