#!/usr/bin/env tsx
import { globSync, readFileSync } from 'node:fs';

const files = globSync('{packages/create-granite-app/templates,services}/**/package.json');
const violations = files.filter((file) => readFileSync(file, 'utf8').includes('catalog:'));

if (violations.length > 0) {
  console.error(`catalog: is not allowed in these package.json files:\n${violations.join('\n')}`);
  process.exit(1);
}
