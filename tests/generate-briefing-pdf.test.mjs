import { mkdtempSync, readFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';

function runGenerator(args = [], cwd = process.cwd()) {
  return spawnSync('node', ['scripts/generate-briefing-pdf.mjs', ...args], {
    cwd,
    encoding: 'utf8',
  });
}

test('gera PDF com assinatura válida', async () => {
  const baseDir = mkdtempSync(join(tmpdir(), 'briefing-pdf-'));
  const outputFile = join(baseDir, 'briefing.pdf');

  try {
    const result = runGenerator([outputFile]);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /OK: briefing gerado em/);

    const content = readFileSync(outputFile);
    assert.match(content.toString('utf8', 0, 8), /^%PDF-1\./);
  } finally {
    await rm(baseDir, { recursive: true, force: true });
  }
});

test('retorna 2 em uso inválido', () => {
  const result = runGenerator(['a.pdf', 'b.pdf']);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Ação corretiva:/);
});
