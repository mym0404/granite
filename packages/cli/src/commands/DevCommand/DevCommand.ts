import { Command } from '@commander-js/extra-typings';
import { runServer, EXPERIMENTAL__server } from '@granite-js/mpack';
import { loadConfig } from '@granite-js/plugin-core';
import Debug from 'debug';
import { ExitCode } from '../../constants';
import { errorHandler } from '../../utils/command';

const debug = Debug('cli');

export function devCommand() {
  return new Command('dev')
    .description('Run Granite development server')
    .option('--config <path>', 'Path to config file')
    .option('--host <host>')
    .option('--port <port>')
    .option('--disable-embedded-react-devtools')
    .option('--experimental-mode')
    .action(async (options) => {
      process.exitCode = await executeDev(options);
    });
}

async function executeDev({
  config: configFile,
  host,
  port,
  disableEmbeddedReactDevTools,
  experimentalMode,
}: {
  config?: string;
  host?: string;
  port?: string;
  disableEmbeddedReactDevTools?: boolean;
  experimentalMode?: boolean;
}) {
  try {
    process.env.MPACK_DEV_SERVER = 'true';

    const config = await loadConfig({ configFile });
    const serverOptions = {
      host,
      port: port ? parseInt(port, 10) : undefined,
    };

    debug('StartCommand', {
      ...serverOptions,
      disableEmbeddedReactDevTools,
      experimentalMode,
    });

    if (experimentalMode) {
      /**
       * @TODO Invoke pre and post handlers of devServer plugin hooks in experimental mode
       */
      await EXPERIMENTAL__server({ config, ...serverOptions });
    } else {
      await runServer({
        config,
        ...serverOptions,
      });
    }

    return ExitCode.SUCCESS;
  } catch (error: unknown) {
    return errorHandler(error);
  }
}
