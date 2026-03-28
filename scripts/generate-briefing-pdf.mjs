#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
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

function formatDateBR(date = new Date()) {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function buildBriefingLines() {
  return [
    'BRIEFING PROFISSIONAL - FORMATO CURRICULO EXECUTIVO',
    `Data de emissao: ${formatDateBR()}`,
    '',
    '1) Objetivo profissional',
    'Atuar como agente de IA para elevar a qualidade operacional de projetos Node.js',
    'com foco em previsibilidade, rastreabilidade e reducao de erros em execucao.',
    '',
    '2) Resumo da atuacao (escopo completo)',
    '- Revisao de scripts criticos, padronizando mensagens de erro e orientacao de correcao.',
    '- Alinhamento entre codigos de saida, exemplos de uso e documentacao publicada.',
    '- Implementacao de checks reutilizaveis para apoiar fluxos de CI/CD.',
    '- Estruturacao de testes automatizados para cobertura de cenarios-chave de operacao.',
    '- Registro objetivo de ganhos operacionais para comunicacao em PR e auditoria tecnica.',
    '',
    '3) Entregas tecnicas consolidadas',
    '- Script de health-check com niveis OK, WARN e ERRO + acoes corretivas.',
    '- Script para geracao automatizada de briefing em PDF sem dependencias externas.',
    '- Suite de testes automatizados para validacao de fluxos nominal e de erro.',
    '- README atualizado com instrucoes praticas, codigos de saida e exemplos validos.',
    '',
    '4) Competencias evidenciadas',
    '- Engenharia de automacao com Node.js e CLI.',
    '- Qualidade de software orientada por testes.',
    '- Documentacao tecnica clara e acionavel.',
    '- Comunicacao profissional com foco em resultado operacional.',
    '',
    '5) Ganhos operacionais esperados',
    '- Menor ambiguidade no diagnostico de falhas.',
    '- Menor tempo medio para recuperacao (MTTR) em incidentes simples.',
    '- Maior confiabilidade na execucao de pipelines.',
    '- Melhoria da governanca tecnica por padroes e evidencias.',
    '',
    '6) Proximos passos recomendados',
    '- Expandir cobertura de testes para cenarios de permissao e IO.',
    '- Publicar template de briefing para novos ciclos de entrega.',
    '- Integrar checklist de release com aprovacao automatica por status checks.',
  ];
}

function buildBriefingPdfBuffer() {
  const lines = buildBriefingLines();

  const content = [
    'BT',
    '/F1 10 Tf',
    '52 805 Td',
    '13 TL',
    ...lines.map((line) => `(${escapePdfText(line)}) Tj T*`),
    'ET',
  ].join('\n');

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
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
  console.log('Gera um briefing profissional em PDF (formato curriculo executivo).');
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
    await mkdir(dirname(args.outputPath), { recursive: true });
    await writeFile(args.outputPath, pdfBuffer);
    console.log(`OK: briefing gerado em ${args.outputPath}.`);
    process.exit(EXIT.OK);
  } catch (error) {
    console.error('ERRO: não foi possível gerar o arquivo PDF.');
    console.error('Ação corretiva: Verifique permissões e se o caminho de destino é válido.');
    console.error(`Detalhe técnico: ${error.message}`);
    process.exit(EXIT.EXECUTION_ERROR);
  }
}

await main();
