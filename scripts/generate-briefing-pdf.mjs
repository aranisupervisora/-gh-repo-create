#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';
import process from 'node:process';

const EXIT = {
  OK: 0,
  INVALID_USAGE: 2,
  EXECUTION_ERROR: 3,
};

const DEFAULT_OUTPUT = 'briefing-atuacao-profissional.pdf';

function parseArgs(argv) {
  const args = argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    return { mode: 'help' };
  }

  if (args.length > 1) {
    return { mode: 'invalid', reason: 'Forneça no máximo um caminho de saída.' };
  }

  return { mode: 'run', outputPath: args[0] ?? DEFAULT_OUTPUT };
}

function escapePdfText(text) {
  return text.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
}

function buildBriefingPdfBuffer() {
  const lines = [
    'BRIEFING PROFISSIONAL - RESUMO DE ATUACAO',
    'Data: 28/03/2026',
    '',
    'Objetivo',
    'Apresentar atuacao tecnica com foco em qualidade operacional e automacao.',
    '',
    'Resumo de atuacao',
    '- Revisao final de scripts e documentacao com padrao de mensagens acionaveis.',
    '- Padronizacao de codigos de saida e alinhamento com exemplos operacionais.',
    '- Estruturacao de testes automatizados para reduzir regressao em CI/CD.',
    '- Registro de ganhos operacionais com foco em previsibilidade de diagnostico.',
    '',
    'Competencias evidenciadas',
    '- Confiabilidade de tooling Node.js',
    '- Qualidade de documentacao tecnica',
    '- Testes e validacao automatizada',
    '- Comunicacao tecnica orientada a acao',
    '',
    'Proximos passos recomendados',
    '- Evoluir cobertura de testes para cenarios de erro adicionais.',
    '- Integrar checks no pipeline de pull request.',
    '- Versionar checklist operacional no repositorio.',
  ];

  const content = [
    'BT',
    '/F1 12 Tf',
    '72 770 Td',
    '16 TL',
    ...lines.map((line) => `(${escapePdfText(line)}) Tj T*`),
    'ET',
  ].join('\n');

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += object;
  }

  const xrefPosition = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefPosition}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf8');
}

function printHelp() {
  console.log('Uso: node scripts/generate-briefing-pdf.mjs [caminho-de-saida.pdf]');
  console.log('');
  console.log('Gera um briefing profissional em formato PDF.');
  console.log(`Saida padrao: ${DEFAULT_OUTPUT}`);
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.mode === 'help') {
    printHelp();
    process.exit(EXIT.OK);
  }

  if (args.mode === 'invalid') {
    console.error(`ERRO: ${args.reason}`);
    console.error('Ação corretiva: Use --help para consultar o formato correto do comando.');
    process.exit(EXIT.INVALID_USAGE);
  }

  try {
    const pdfBuffer = buildBriefingPdfBuffer();
    await writeFile(args.outputPath, pdfBuffer);
    console.log(`OK: briefing gerado em ${args.outputPath}.`);
    process.exit(EXIT.OK);
  } catch (error) {
    console.error('ERRO: não foi possível gerar o arquivo PDF.');
    console.error('Ação corretiva: Verifique permissão de escrita no diretório de destino.');
    console.error(`Detalhe técnico: ${error.message}`);
    process.exit(EXIT.EXECUTION_ERROR);
  }
}

await main();
