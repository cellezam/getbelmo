// Standalone bundler for the public repo (cellezam/getbelmo).
//
// Mirrors what the Nx esbuild target produces in the monorepo: a single CJS
// entry `main.cjs` with a node shebang, where the three runtime dependencies
// are left EXTERNAL (declared in package.json `dependencies`, installed by npm
// at the user's machine) rather than inlined. This keeps the bundle tiny and
// the published artifact identical in shape to the monorepo build.
import * as esbuild from 'esbuild';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');
const external = Object.keys(pkg.dependencies ?? {});

await esbuild.build({
  entryPoints: ['src/main.ts'],
  outfile: 'main.cjs',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  external,
  banner: { js: '#!/usr/bin/env node' },
  logLevel: 'info',
});

console.log('Built main.cjs');
