import { Command } from '@commander-js/extra-typings';
import { buildCommand, hermesCommand, devCommand } from './commands';

export async function initialize() {
  const program = new Command('granite');

  program.addCommand(buildCommand());
  program.addCommand(hermesCommand());
  program.addCommand(devCommand());

  await program.parseAsync(process.argv);
}
