import path from 'path';
import { resolveHermesBinaryPath } from '@granite-js/utils';
import { isNotNil } from 'es-toolkit';
import { $ } from 'zx';

interface CompileHbcOptions {
  rootDir: string;
  filePath: string;
  sourcemap?: boolean;
}

export async function compileHbc({ rootDir, filePath, sourcemap }: CompileHbcOptions) {
  const binary = resolveHermesBinaryPath({ rootDir });
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
