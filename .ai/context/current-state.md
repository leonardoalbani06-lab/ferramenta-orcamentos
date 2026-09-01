# Estado atual — 2026-09-01

## Funcionando

Todo o fluxo principal está de pé e testado: login → clientes →
catálogo → montagem de orçamento → detalhe → PDF. Visual com a
identidade de marca Olivapel (verde-oliva/dourado/Cinzel, logo oficial)
aplicada em todas as telas.

**O app está no ar de verdade, em produção, na Railway** (não só
localhost):
- Ferramenta de Orçamentos: https://ferramenta-orcamentos-production.up.railway.app
- Gerenciador de Catálogo: https://gerenciador-catalogo-production.up.railway.app

Cada um é um projeto Railway próprio (`ferramenta-orcamentos` /
`artistic-contentment` — nome aleatório, é o Gerenciador de Catálogo),
com volume persistente `/data` pro SQLite e deploy automático a cada
`git push` pro respectivo repositório GitHub
(`leonardoalbani06-lab/ferramenta-orcamentos` e
`leonardoalbani06-lab/gerenciador-catalogo`). Railway CLI instalado e
autenticado nesta máquina (`railway login` já feito) — dá pra rodar
`railway logs`, `railway ssh`, `railway variables` etc. direto do
terminal sem precisar abrir o site.

**Login real por usuário/senha** (substituiu a identificação por nome
sem senha da fase 1) — NextAuth.js (Auth.js) v5, Credentials provider:
- `Representante` ganhou `username` (único), `passwordHash` (bcrypt),
  `role` (`"ADMIN"` ou `"REPRESENTANTE"` — String, não enum, porque
  **SQLite não suporta enum nativo no Prisma**), `ativo`.
- Painel `/admin/representantes` (só pra quem é admin): criar conta
  (sem autocadastro), ativar/desativar, redefinir senha.
- `src/auth.config.ts` precisa de `trustHost: true` — sem isso o
  NextAuth v5 rejeita todo login em produção com "UntrustedHost"
  (confia automaticamente só na Vercel; qualquer outro host, incluindo
  Railway, precisa desse flag). Foi um bug real encontrado testando em
  produção, não aparece em dev local.
- Testado de ponta a ponta em produção: login certo, senha errada
  rejeitada, bloqueio de `/admin` pra quem não é admin, admin criando
  representante novo e esse representante logando e usando o app.
- Conta admin de produção: usuário `admin` (senha só com o usuário —
  gerada nesta sessão, recomendação é trocar pelo painel assim que
  possível, já que não existe fluxo de "esqueci minha senha").

`/clientes` e `/orcamentos` têm busca com filtro instantâneo
(razão social/nome fantasia/CNPJ; número do orçamento ou nome do
cliente) — `ClientesList.tsx`, `OrcamentosList.tsx`, `src/lib/search.ts`.

Interface é mobile-first (BottomNav, cards no mobile, barra de ação
fixa no orçamento). Tabela A/B é por item do orçamento, não mais
escolha única. Fotos de produto: 42/51 SKUs.

## Pendente / conhecido

- **Backup automático do volume NÃO configurado ainda** — foi
  combinado com o usuário (Railway tem backup Daily/Weekly/Monthly por
  volume, configurado na aba "Backups" das Settings do serviço, só
  pelo site) mas a conversa pivotou pro login antes de confirmar que
  foi feito. **Próximo passo prioritário.**
- **9 SKUs sem foto**: 1065, 1071, 1053, 1076, VER-24, VER-28, 1052,
  1078, 1078/1.
- **7 códigos com foto mas sem cadastro no catálogo**: 0610, 1981,
  1982, 2602, 2907, 2909, 3009. Fotos já em `public/produtos/`.
- **Gerenciador de Catálogo → integração de volta**: quando o usuário
  terminar de organizar categoria/marca/unidade lá e exportar o JSON,
  falta migrar `Produto.categoria` (hoje texto único) pra
  `Categoria`/`Marca` muitos-para-muitos + `unidade` neste projeto.
- Hooks do Claude Code (`PreCompact`/`SessionStart`) configurados em
  `.claude/settings.json` — já confirmados funcionando (o próprio hook
  de lembrete disparou numa compactação desta sessão).

## Próximo passo recomendado

1. Configurar backup automático do volume nos dois projetos Railway
   (Daily é suficiente).
2. Avisar o usuário a trocar a senha da conta admin de produção pelo
   painel `/admin/representantes` assim que possível.
3. Cadastrar os representantes reais (hoje só existe a conta admin em
   produção).
4. Aguardar o JSON do Gerenciador de Catálogo pra migrar
   categoria/marca.
