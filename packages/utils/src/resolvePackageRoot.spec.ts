import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import { resolvePackageRoot } from './resolvePackageRoot';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(dirname, '..');

describe('resolvePackageRoot', () => {
  it('resolves a package from the given root directory', () => {
    const result = resolvePackageRoot({ rootDir: packageRoot, packageName: 'typescript' });

    expect(result).toBeDefined();
    expect(result?.endsWith('typescript')).toBe(true);
  });

  it('resolves a package root when package.json is not exported', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'granite-resolve-package-root-'));

    try {
      const packageRoot = path.join(rootDir, 'node_modules', 'fixture-package');
      fs.mkdirSync(packageRoot, { recursive: true });
      fs.writeFileSync(path.join(rootDir, 'package.json'), JSON.stringify({ name: 'fixture-root' }));
      fs.writeFileSync(
        path.join(packageRoot, 'package.json'),
        JSON.stringify({
          name: 'fixture-package',
          exports: {
            '.': './index.js',
          },
        })
      );
      fs.writeFileSync(path.join(packageRoot, 'index.js'), 'module.exports = {};');

      const result = resolvePackageRoot({ rootDir, packageName: 'fixture-package' });

      expect(result).toBe(fs.realpathSync(packageRoot));
    } finally {
      fs.rmSync(rootDir, { recursive: true, force: true });
    }
  });
});
