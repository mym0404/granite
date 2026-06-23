import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/**/*.{ts,js}',
    '!**/*.{spec,test,stories,d}.*',
    '!**/fixtures/**',
    '!**/__snapshots__/**',
  ],
  format: ['cjs'],
  deps: {
    neverBundle: ['pnpapi', 'metro-babel-register'],
    skipNodeModulesBundle: true,
  },
  dts: false,
  unbundle: true,
  clean: true,
  fixedExtension: false,
});
