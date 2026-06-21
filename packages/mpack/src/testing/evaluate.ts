import { $ } from 'zx';

export async function evaluate(code: string) {
  const result = await $({ quiet: true })`node -p ${code}`;

  return result.stdout.trim();
}
