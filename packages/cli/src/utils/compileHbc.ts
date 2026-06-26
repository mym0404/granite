import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { isNotNil } from 'es-toolkit';
import { $ } from 'zx';

interface CompileHbcOptions {
  rootDir: string;
  filePath: string;
  sourcemap?: boolean;
}

const binary = {
  Darwin: ['hermesc', 'osx-bin', 'hermesc'],
  Linux: ['hermesc', 'linux64-bin', 'hermesc'],
  Windows_NT: ['hermesc', 'win64-bin', 'hermesc.exe'],
} as const;

export async function compileHbc({ rootDir, filePath, sourcemap }: CompileHbcOptions) {
  const binary = getHermesc(rootDir);
  const outfile = path.resolve(rootDir, filePath.replace(new RegExp(`${path.extname(filePath)}$`), '.hbc'));

  const args = [
    // Disable warnings
    '-w',
    // Expensive optimizations
    '-O',
    // Emit binary
    '-emit-binary',
    // Emit source map
    sourcemap ? '-output-source-map' : null,
    // Output path
    '-out',
    outfile,
    filePath,
  ].filter(isNotNil);

  await $({ quiet: true })`${binary} ${args}`;

  return { outfile, sourcemapOutfile: sourcemap ? `${outfile}.map` : null };
}

function getHermesc(rootDir: string) {
  const os = getOs();
  const binaryParts = binary[os];

  assert(binaryParts, `지원하지 않는 OS 입니다: ${os}`);

  const reactNativePath = path.dirname(require.resolve('react-native/package.json', { paths: [rootDir] }));

  try {
    const hermesCompilerPath = path.dirname(require.resolve('hermes-compiler/package.json', { paths: [reactNativePath] }));
    const hermesCompilerBinary = path.join(hermesCompilerPath, ...binaryParts);

    if (fs.existsSync(hermesCompilerBinary)) {
      return hermesCompilerBinary;
    }
  } catch {
    // Use React Native bundled hermesc below.
  }

  return path.join(reactNativePath, 'sdks', ...binaryParts);
}

function getOs() {
  return os.type() as 'Darwin' | 'Linux' | 'Windows_NT';
}
