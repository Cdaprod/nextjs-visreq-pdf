import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dockerfile = readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8');
const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');

// Prevent accidental regression to the unsupported Node 20 runtime.
test('Docker action uses the patched Node 24.22.3 runtime', () => {
  assert.match(dockerfile, /^FROM node:24\.22\.3-bookworm\s*$/m);
});

test('CI exercises the same patched Node version', () => {
  assert.match(workflow, /^\s+node-version:\s*['\"]?24\.22\.3['\"]?\s*$/m);
});
