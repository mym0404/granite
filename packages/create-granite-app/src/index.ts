import { isCancel, intro, text, tasks, cancel, note, outro, select } from '@clack/prompts';
import { Command, Option } from '@commander-js/extra-typings';
import { kebabCase } from 'es-toolkit/string';
import { APP_TYPE_LIST, type AppType } from './appTypes';
import { applyTemplateModule, copyTemplate } from './copyTemplate';
import { getPackageManager } from './getPackageManager';
import { resolveFallback } from './resolveFallback';
import { APP_TYPE_TO_TEMPLATE_MODULE, TOOL_TYPE_TO_TEMPLATE_MODULE } from './templateModules';
import { TOOL_TYPE_LIST, type ToolType } from './toolTypes';

function getAppName(appPath: string) {
  return appPath.split('/').pop() || '';
}

function assertValidAppName(input: string) {
  const appName = getAppName(input);
  const kebabCaseAppName = kebabCase(appName);

  if (appName === '') {
    return;
  }

  if (kebabCaseAppName !== appName) {
    throw new Error(`Project name must be in kebab-case (e.g. ${kebabCaseAppName})`);
  }

  if (!appName.match(/^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?\/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$/)) {
    throw new Error('Invalid project name. Only lowercase letters, numbers, and hyphens (-) are allowed.');
  }
}

async function run() {
  const pkgInfo = getPackageManager();

  const cli = new Command('create-granite-app')
    .argument('[appPath]', 'Project name or path')
    .addOption(new Option('--tools <tool>', 'Select a development tool to include in the project').choices(TOOL_TYPE_LIST))
    .addOption(new Option('--type <type>', 'Select Granite app type').choices(APP_TYPE_LIST));

  cli.parse(process.argv);
  const options = cli.opts();

  intro('Create Granite App Project');

  const appPathFromArg = typeof cli.args[0] === 'string' ? cli.args[0] : null;

  const appPath = await resolveFallback(appPathFromArg, () =>
    text({
      message: 'Project name or path:',
      placeholder: 'my-granite-app',
      defaultValue: 'my-granite-app',
      validate: (value: string) => {
        try {
          assertValidAppName(value);
          return;
        } catch (e) {
          if (e instanceof Error) {
            return e.message;
          }
          return 'Invalid project name';
        }
      },
    })
  );

  if (isCancel(appPath)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  assertValidAppName(appPath);

  const appType = await resolveFallback((options.type as AppType | undefined) ?? null, async () =>
    select<AppType>({
      message: 'Select app type',
      initialValue: 'remote',
      options: [
        { value: 'remote', label: 'Remote or Apps In Toss' },
        { value: 'shared', label: 'Shared' },
      ],
    })
  );

  if (isCancel(appType)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  const toolType = await resolveFallback((options.tools as ToolType | undefined) ?? null, async () =>
    select<ToolType>({
      message: 'Select tool',
      options: [
        { value: 'eslint-prettier', label: 'ESLint + Prettier' },
        { value: 'biome', label: 'Biome' },
      ],
    })
  );

  if (isCancel(toolType)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  await tasks([
    {
      title: `Creating Granite App`,
      task: async () => {
        try {
          const templateOptions = {
            appPath,
            appName: getAppName(appPath),
            packageManager: pkgInfo.packageManager,
            needYarnrc: Boolean(pkgInfo.packageManager === 'yarn' && pkgInfo.version && pkgInfo?.version >= '2.0.0'),
          };

          await copyTemplate(templateOptions);
          await applyTemplateModule(APP_TYPE_TO_TEMPLATE_MODULE[appType], templateOptions);
          await applyTemplateModule(TOOL_TYPE_TO_TEMPLATE_MODULE[toolType], templateOptions);
        } catch (e) {
          console.error(e);
          throw e;
        }
        return `Created Granite App`;
      },
    },
  ]);

  const nextSteps = [`cd ${appPath}`, `${pkgInfo.packageManager} install`, `${pkgInfo.packageManager} run dev`];

  note(nextSteps.join('\n'), 'Next steps');
  outro('Done');
}

run();
