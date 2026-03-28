# gh-repo-create

Projeto Node.js mínimo com rotina de validação operacional (`health-check`) para padronizar diagnósticos de configuração.

## Uso rápido

```bash
npm run health:check
```

Modo estrito (qualquer aviso vira falha):

```bash
npm run health:check:strict
```

## Legenda de códigos de saída

| Código | Significado | Ação esperada |
| --- | --- | --- |
| `0` | Execução sem problemas | Prosseguir com build/teste/deploy |
| `1` | Avisos encontrados em modo padrão | Corrigir alertas e repetir o comando |
| `2` | Uso inválido (flags não suportadas) | Revisar parâmetros (`--help`) |
| `3` | Erro de execução ou falha em `--strict` | Aplicar ação corretiva exibida e executar novamente |

## Mensagens e ações corretivas

Todas as saídas seguem o padrão:

- `OK: ...` para sucesso.
- `WARN: ...` para inconformidades tratáveis.
- `ERRO: ...` para falhas impeditivas.
- `Ação corretiva: ...` com próximo passo acionável.

Exemplo de ajuda do comando:

```bash
node scripts/health-check.mjs --help
```

## Coerência entre exemplos e implementação

- `npm run health:check` executa `node scripts/health-check.mjs` (modo padrão, permite código `1` para aviso).
- `npm run health:check:strict` executa `node scripts/health-check.mjs --strict` (aviso passa a falha com código `3`).
- `npm run build`, `npm run lint` e `npm run test` permanecem como trilha base de qualidade.
