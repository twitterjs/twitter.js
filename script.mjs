#!/usr/bin/env zx

import { $ } from 'zx';

if (process.platform === 'win32') {
  await $`echo { "type": "commonjs" } > dist/cjs/package.json`;
  await $`echo { "type": "module" } > dist/esm/package.json`;
} else if (process.platform === 'linux') {
  await $`echo { \\"type\\": \\"commonjs\\" } > dist/cjs/package.json`;
  await $`echo { \\"type\\": \\"module\\" } > dist/esm/package.json`;
}
