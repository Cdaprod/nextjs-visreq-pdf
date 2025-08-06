#!/usr/bin/env node
// Basic tests for crawl2pdf.mjs
// Usage: node --test scripts/crawl2pdf.test.mjs
// Example: npm test
import { test } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';

test('requires base URL', () => {
  const proc = spawnSync(process.execPath, ['scripts/crawl2pdf.mjs'], { encoding: 'utf8' });
  assert.notEqual(proc.status, 0);
  assert.match(proc.stderr, /Usage: node crawl2pdf\.mjs/);
});
