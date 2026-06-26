import path from 'path';
import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import { ExitCode } from '../../constants';
import { errorHandler } from '../../utils/command';
import { compileHbc } from '../../utils/compileHbc';

export function hermesCommand() {
  return new Command('hermes')
    .description('지정한 번들을 Hermes 바이트 코드로 컴파일 합니다')
    .requiredOption('--jsbundle <path>', 'Hermes 바이트 코드로 컴파일 할 Javascript 파일 경로 입니다')
    .option('--sourcemap', '소스맵 파일을 생성합니다')
    .option('--no-sourcemap', '소스맵 파일을 생성하지 않습니다')
    .action(async ({ jsbundle, sourcemap = true }) => {
      process.exitCode = await executeHermes({ jsBundleFile: jsbundle, sourcemap });
    });
}

async function executeHermes({ jsBundleFile, sourcemap }: { jsBundleFile: string; sourcemap: boolean }) {
  try {
    const rootDir = process.cwd();
    const filePath = path.resolve(rootDir, jsBundleFile);

    const { outfile, sourcemapOutfile } = await compileHbc({ rootDir, filePath, sourcemap });

    console.log(`✅ Compiled successfully: ${chalk.gray(outfile)}`);

    if (sourcemapOutfile) {
      console.log(`✅ Source map generated successfully: ${chalk.gray(sourcemapOutfile)}`);
    }

    return ExitCode.SUCCESS;
  } catch (error: unknown) {
    return errorHandler(error);
  }
}
