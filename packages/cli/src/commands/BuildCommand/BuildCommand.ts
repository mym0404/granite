import { Command } from '@commander-js/extra-typings';
import { BuildUtils } from '@granite-js/mpack';
import { statusPlugin } from '@granite-js/mpack/plugins';
import { loadConfig } from '@granite-js/plugin-core';
import { ExitCode } from '../../constants';
import { errorHandler } from '../../utils/command';

export function buildCommand() {
  return new Command('build')
    .description('Build Granite App')
    .option('--config <path>', 'Path to config file')
    .option('--dev', 'Build in development mode')
    .option('--metafile', 'Generate metafile')
    .option('--cache', 'Enable cache')
    .option('--no-cache', 'Disable cache')
    .action(async ({ config: configFile, cache = true, metafile = false, dev = false }) => {
      process.exitCode = await executeBuild({ configFile, cache, metafile, dev });
    });
}

async function executeBuild({
  configFile,
  cache,
  metafile,
  dev,
}: {
  configFile?: string;
  cache: boolean;
  metafile: boolean;
  dev: boolean;
}) {
  try {
    const config = await loadConfig({ configFile });
    const options = (['android', 'ios'] as const).map((platform) => ({
      dev,
      cache,
      metafile,
      platform,
      outfile: `bundle.${platform}.js`,
    }));

    await BuildUtils.buildAll(options, { config, plugins: [statusPlugin] });

    return ExitCode.SUCCESS;
  } catch (error: unknown) {
    return errorHandler(error);
  }
}
