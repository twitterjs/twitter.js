#!/usr/bin/env zx

import { $ } from 'zx';

await $`echo { \"type\": \"commonjs\" } > dist/cjs/package.json`;
await $`echo { \"type\": \"module\" } > dist/esm/package.json`;
