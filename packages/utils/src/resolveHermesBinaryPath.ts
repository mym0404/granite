import fs from 'fs';
import path from 'path';
import { resolvePackageRoot } from './resolvePackageRoot';

/**
 * Returns the Hermes OS binary folder name for the current platform.
 */
function getHermesOSBin() {
  switch (process.platform) {
    case 'win32':
      return 'win64-bin';
    case 'darwin':
      return 'osx-bin';
    default:
      return 'linux64-bin';
  }
}

/**
 * Returns the Hermes executable name for the current platform.
 */
function getHermesOSExe() {
  return process.platform === 'win32' ? 'hermesc.exe' : 'hermesc';
}

function fileExists(file: string) {
  try {
    return fs.statSync(file).isFile();
  } catch {
    return false;
  }
}

function getReactNativePackagePath(rootDir: string) {
  try {
    return resolvePackageRoot({ rootDir, packageName: 'react-native' });
  } catch {
    return path.join('node_modules', 'react-native');
  }
}

function getPackagePath(rootDir: string, packageName: string) {
  try {
    return resolvePackageRoot({ rootDir, packageName });
  } catch {
    return null;
  }
}

export function resolveHermesBinaryPath({ rootDir }: { rootDir: string }) {
  const reactNativePath = getReactNativePackagePath(rootDir);

  // 1) RN 0.83+: prefer hermes-compiler package
  const hermesCompilerPath = getPackagePath(reactNativePath, 'hermes-compiler');
  if (hermesCompilerPath != null) {
    const engine = path.join(hermesCompilerPath, 'hermesc', getHermesOSBin(), getHermesOSExe());
    if (fileExists(engine)) {
      return engine;
    }
  }

  // 2) RN 0.69+: bundled hermesc inside react-native
  const bundledHermesEngine = path.join(reactNativePath, 'sdks', 'hermesc', getHermesOSBin(), getHermesOSExe());
  if (fileExists(bundledHermesEngine)) {
    return bundledHermesEngine;
  }

  // 3) hermes-engine package
  const hermesEnginePath = getPackagePath(rootDir, 'hermes-engine');
  if (hermesEnginePath != null) {
    const engine = path.join(hermesEnginePath, getHermesOSBin(), getHermesOSExe());
    if (fileExists(engine)) {
      return engine;
    }
  }

  // 4) hermesvm package (final fallback)
  const hermesVmPath = getPackagePath(rootDir, 'hermesvm');
  if (hermesVmPath != null) {
    const engine = path.join(hermesVmPath, getHermesOSBin(), 'hermes');
    if (fileExists(engine)) {
      return engine;
    }
  }

  // Fallback: return legacy bundled path to keep previous behavior
  return bundledHermesEngine;
}
