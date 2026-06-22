import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: {
      index: './src/index.ts',
    },
    format: ['esm', 'cjs'],
    outDir: 'dist',
    dts: true,
    shims: true,
    external: ['@granite-js/pulumi-aws'],
    copy: [{ from: './public/prebuilt-shared', to: './dist' }],
    fixedExtension: false,
    outputOptions: {
      codeSplitting: false,
    },
  },
  {
    entry: {
      'lambda/origin-request': './src/lambda/origin-request.ts',
    },
    format: ['esm', 'cjs'],
    outDir: 'dist',
    dts: true,
    fixedExtension: false,
    outputOptions: {
      codeSplitting: false,
    },
  },
  {
    entry: {
      'lambda/origin-response': './src/lambda/origin-response.ts',
    },
    format: ['esm', 'cjs'],
    outDir: 'dist',
    dts: true,
    fixedExtension: false,
    outputOptions: {
      codeSplitting: false,
    },
  },
  {
    entry: {
      'lambda/auto-cache-removal': './src/lambda/auto-cache-removal.ts',
    },
    format: ['esm', 'cjs'],
    outDir: 'dist',
    dts: true,
    fixedExtension: false,
    outputOptions: {
      codeSplitting: false,
    },
  },
]);
