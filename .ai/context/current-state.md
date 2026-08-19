# Estado atual — 2026-08-19

## Funcionando

Todo o fluxo principal está de pé e testado: identificação →
clientes → catálogo → montagem de orçamento → detalhe → PDF. Visual
com a identidade de marca (verde-oliva/dourado/Cinzel) aplicada em
**todas** as telas (login, cabeçalho/nav, clientes, catálogo,
orçamentos novo/detalhe/lista) — o refinamento visual que antes
faltava em catálogo/orçamentos foi concluído.

O app usa o logo oficial da **Olivapel** de verdade agora (não só a
paleta como referência) — login, cabeçalho e cabeçalho do PDF do
orçamento. Ver `.ai/memory/decisions.md` (2026-08-19).

`/clientes` e `/orcamentos` têm busca com filtro instantâneo (sem
apertar Enter): clientes por razão social/nome fantasia/CNPJ,
orçamentos por número ou nome do cliente. Filtra no client-side sobre
a lista já carregada (`ClientesList.tsx`, `OrcamentosList.tsx`,
`src/lib/search.ts`) — não busca de novo no banco a cada tecla.

Interface é mobile-first: `BottomNav` fixo embaixo no celular (vira
nav horizontal no topo em telas largas), tabelas viram cards no
mobile, barra de ação fixa com total corrente no formulário de
orçamento. Bug real de header estourando em viewport de 375px foi
corrigido nesse trabalho.

**Tabela A/B agora é por item**, não mais uma escolha única pro
orçamento inteiro — cada linha de produto no orçamento escolhe A ou B
independentemente (`ItemOrcamento.tabelaUsada`; `Orcamento.tabelaUsada`
foi removido do schema).

Fotos de produto: 42 dos 51 SKUs do catálogo têm foto (extraída dos PDFs
que o usuário mandou), aparecendo no catálogo, na montagem do orçamento,
no detalhe e no PDF gerado. Rótulo na UI é "SKU" (o PDF mantém
"Código:" pra bater com o documento real de referência).

Hooks do Claude Code configurados em `.claude/settings.json`:
`PreCompact` (matchers `manual` e `auto`) roda
`.claude/hooks/backup-before-compact.sh` (backup da transcrição da
sessão antes de compactar); `SessionStart` (matcher `compact`) roda
`.claude/hooks/remind-update-context.sh` (lembrete pra reler o código e
atualizar `.ai/context` antes de continuar). Ambos testados
manualmente e validados com `jq -e`.

## Pendente / conhecido

- **9 SKUs sem foto** (sem arquivo-fonte disponível): 1065, 1071, 1053,
  1076, VER-24, VER-28, 1052, 1078, 1078/1.
- **7 códigos com foto mas sem cadastro no catálogo** (faltam
  preço/descrição/categoria): 0610, 1981, 1982, 2602, 2907, 2909, 3009.
  Fotos já estão em `public/produtos/{codigo}.jpg`, só falta criar o
  `Produto` quando o usuário mandar os dados.
- **Gerenciador de Catálogo** (ferramenta avulsa, projeto separado em
  `C:\Users\leona\Desktop\Gerenciador Catalogo DClasse`) está
  funcional: usuário está organizando categoria(s)/marca(s)/unidade dos
  51 produtos lá, com auto-save e exportação em JSON. Quando ele devolver
  o JSON exportado, falta migrar `Produto.categoria` (hoje campo texto
  único neste projeto) pra relação muitos-para-muitos com
  `Categoria`/`Marca`, e adicionar `unidade`.
- Ativação dos hooks: `.claude/settings.json` foi criado nesta sessão
  (não existia antes) — pode ser necessário reiniciar o Claude Code ou
  rodar `/hooks` numa sessão interativa pra garantir que o watcher de
  config pegou o arquivo novo.
- Nenhuma autenticação real (representante só digita o nome, fase 1 —
  decisão deliberada do briefing original, não uma lacuna).

## Próximo passo recomendado

Aguardar o usuário devolver o JSON exportado do Gerenciador de
Catálogo e então migrar o schema deste projeto (`Produto.categoria` →
`Categoria`/`Marca` muitos-para-muitos + `unidade`), atualizando
catálogo e PDF pra refletir a nova estrutura. Fora isso, o app está
funcionalmente completo pro fluxo principal — próximos pedidos tendem
a ser refinamento pontual ou os 7 SKUs pendentes de cadastro.
