import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';

export function resolvePackageRoot({ rootDir, packageName }: { rootDir: string; packageName: string }) {
  const require = createRequire(path.resolve(rootDir, 'package.json'));
  let packageJsonResolveError: unknown;

  // First, try `require` simply.
  try {
    return path.dirname(require.resolve(`${packageName}/package.json`));
  } catch (error) {
    packageJsonResolveError = error;
  }

  // After then, search package root manually.
  const packageRoot = findPackageRoot(require.resolve(packageName), packageName);
  if (packageRoot != null) {
    return packageRoot;
  }

  throw packageJsonResolveError;
}

function findPackageRoot(filePath: string, packageName: string) {
  let currentPath = path.dirname(filePath);
  const rootPath = path.parse(currentPath).root;

  while (currentPath !== rootPath) {
    const packageJsonPath = path.join(currentPath, 'package.json');

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as { name?: string };
      if (packageJson.name === packageName) {
        return currentPath;
      }
    } catch {
      // Keep walking up until the package root is found.
    }

    currentPath = path.dirname(currentPath);
  }

  return undefined;
}

// Simple helper for searching react-native package root
export function resolveReactNativePackageRoot({ rootDir }: { rootDir: string }) {
  return resolvePackageRoot({ rootDir, packageName: 'react-native' });
}
