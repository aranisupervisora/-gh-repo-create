# gh-repo-create

Projeto Node.js com duas rotinas utilitárias:
- validação operacional (`health-check`);
- geração de briefing profissional em PDF (`briefing:pdf`).

## Uso rápido

### Health check

```bash
npm run health:check
```

Modo estrito (qualquer aviso vira falha):

```bash
npm run health:check:strict
```

### Briefing em PDF

```bash
npm run briefing:pdf
```

Também é possível definir caminho de saída:

```bash
node scripts/generate-briefing-pdf.mjs ./saida/briefing-profissional.pdf
```

## Legenda de códigos de saída

### `health-check`

| Código | Significado | Ação esperada |
| --- | --- | --- |
| `0` | Execução sem problemas | Prosseguir com build/teste/deploy |
| `1` | Avisos encontrados em modo padrão | Corrigir alertas e repetir o comando |
| `2` | Uso inválido (flags não suportadas) | Revisar parâmetros (`--help`) |
| `3` | Falha em `--strict` ou erro de execução | Aplicar ação corretiva exibida e executar novamente |

### `briefing:pdf`

| Código | Significado | Ação esperada |
| --- | --- | --- |
| `0` | PDF gerado com sucesso | Compartilhar ou anexar o arquivo gerado |
| `2` | Uso inválido (argumentos em excesso) | Revisar parâmetros (`--help`) |
| `3` | Erro de execução ao salvar arquivo | Verificar caminho/permissão e repetir |

## Mensagens e ações corretivas

As saídas seguem o padrão abaixo:

- `OK: ...` para sucesso.
- `WARN: ...` para inconformidades tratáveis.
- `ERRO: ...` para falhas impeditivas.
- `Ação corretiva: ...` com próximo passo acionável para cada falha (`ERRO`) e para cada aviso (`WARN`).

Exemplos de ajuda:

```bash
node scripts/health-check.mjs --help
node scripts/generate-briefing-pdf.mjs --help
```

## Coerência entre exemplos e implementação

- `npm run health:check` executa `node scripts/health-check.mjs` (modo padrão, permite código `1` para aviso).
- `npm run health:check:strict` executa `node scripts/health-check.mjs --strict` (aviso passa a falha com código `3`).
- `npm run briefing:pdf` executa `node scripts/generate-briefing-pdf.mjs` e gera `briefing-atuacao-profissional.pdf` no diretório atual.
- `npm run build` e `npm run lint` validam sintaxe dos scripts e testes.
- `npm run test` executa testes automatizados de `health-check` e de geração de PDF.
