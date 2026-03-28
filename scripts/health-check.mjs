#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import process from 'node:process';

const EXIT_CODES = {
  OK: 0,
  WARNINGS: 1,
  INVALID_USAGE: 2,
  EXECUTION_ERROR: 3,
};

const VALID_FIX_ACTIONS = {
  'add-script': 'Adicione o script ausente em package.json > scripts.',
  'set-type-module': 'Defina "type": "module" no package.json.',
  'set-private-true': 'Defina "private": true no package.json para evitar publicação acidental.',
  'resolve-strict-warnings': 'Corrija os avisos acima e execute novamente (ou rode sem --strict para diagnóstico incremental).',
};

function parseArgs(argv) {
  const flags = new Set(argv.slice(2));

  if (flags.has('--help') || flags.has('-h')) {
    return { mode: 'help' };
  }

  const allowedFlags = new Set(['--strict']);
  const invalidFlags = [...flags].filter((flag) => !allowedFlags.has(flag));
  if (invalidFlags.length > 0) {
    return { mode: 'invalid', invalidFlags };
  }

  return { mode: 'run', strict: flags.has('--strict') };
}

function emitIssue(level, message, fixAction) {
  console.error(`${level}: ${message}`);
  if (fixAction) {
    console.error(`Ação corretiva: ${fixAction}`);
  }
}

function printHelp() {
  console.log('Uso: node scripts/health-check.mjs [--strict]');
  console.log('');
  console.log('Legenda de códigos de saída:');
  console.log(`  ${EXIT_CODES.OK} = OK (nenhum problema encontrado)`);
  console.log(`  ${EXIT_CODES.WARNINGS} = Avisos encontrados (modo padrão)`);
  console.log(`  ${EXIT_CODES.INVALID_USAGE} = Uso inválido (flag desconhecida)`);
  console.log(`  ${EXIT_CODES.EXECUTION_ERROR} = Falha em --strict ou erro de execução`);
  console.log('');
  console.log('Exemplos:');
  console.log('  node scripts/health-check.mjs');
  console.log('  node scripts/health-check.mjs --strict');
}

async function runHealthCheck(strict) {
  const content = await readFile(new URL('../package.json', import.meta.url), 'utf8');
  const pkg = JSON.parse(content);
  const warnings = [];

  if (pkg.type !== 'module') {
    warnings.push({
      message: 'Campo "type" diferente de "module".',
      fixAction: VALID_FIX_ACTIONS['set-type-module'],
    });
  }

  if (pkg.private !== true) {
    warnings.push({
      message: 'Campo "private" deve ser true.',
      fixAction: VALID_FIX_ACTIONS['set-private-true'],
    });
  }

  const expectedScripts = ['build', 'lint', 'test'];
  for (const scriptName of expectedScripts) {
    if (!pkg.scripts?.[scriptName]) {
      warnings.push({
        message: `Script obrigatório ausente: scripts.${scriptName}.`,
        fixAction: VALID_FIX_ACTIONS['add-script'],
      });
    }
  }

  if (warnings.length === 0) {
    console.log('OK: verificação de saúde concluída sem problemas.');
    return EXIT_CODES.OK;
  }

  warnings.forEach((issue) => emitIssue('WARN', issue.message, issue.fixAction));

  if (strict) {
    emitIssue(
      'ERRO',
      'Modo --strict ativo; avisos tratados como falha.',
      VALID_FIX_ACTIONS['resolve-strict-warnings'],
    );
    return EXIT_CODES.EXECUTION_ERROR;
  }

  return EXIT_CODES.WARNINGS;
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.mode === 'help') {
    printHelp();
    process.exit(EXIT_CODES.OK);
  }

  if (args.mode === 'invalid') {
    emitIssue(
      'ERRO',
      `Flags inválidas: ${args.invalidFlags.join(', ')}.`,
      'Use --help para visualizar as opções suportadas.',
    );
    process.exit(EXIT_CODES.INVALID_USAGE);
  }

  try {
    const code = await runHealthCheck(args.strict);
    process.exit(code);
  } catch (error) {
    emitIssue(
      'ERRO',
      'Não foi possível concluir a verificação de saúde.',
      'Confirme se package.json existe e contém JSON válido.',
    );
    console.error(`Detalhe técnico: ${error.message}`);
    process.exit(EXIT_CODES.EXECUTION_ERROR);
  }
}

await main();
