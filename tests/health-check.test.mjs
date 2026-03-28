import { spawnSync } from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';

function runHealthCheck(args = []) {
  return spawnSync('node', ['scripts/health-check.mjs', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

test('retorna código 0 no estado atual do projeto', () => {
  const result = runHealthCheck();
  assert.equal(result.status, 0);
  assert.match(result.stdout, /OK:/);
});

test('retorna código 0 em --strict quando não há avisos', () => {
  const result = runHealthCheck(['--strict']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /OK:/);
});

test('retorna código 2 para flag inválida e sugere ação corretiva', () => {
  const result = runHealthCheck(['--foo']);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /ERRO: Flags inválidas:/);
  assert.match(result.stderr, /Ação corretiva:/);
});

test('exibe legenda com código 3 associado a --strict ou erro de execução', () => {
  const result = runHealthCheck(['--help']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /3 = Falha em --strict ou erro de execução/);
});
