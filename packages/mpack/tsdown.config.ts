import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/**/*.{ts,js}',
    '!**/*.{spec,test,stories,d}.*',
    '!**/fixtures/**',
    '!**/__snapshots__/**',
  ],
  format: ['cjs'],
  external: ['pnpapi', 'metro-babel-register'],
  dts: false,
  unbundle: true,
  skipNodeModulesBundle: true,
  clean: true,
  fixedExtension: false,
});
