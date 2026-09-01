# Estado atual — 2026-09-01 (ver seção "Reatribuição de representante..."
abaixo pro que mudou nesta sessão; o resto deste arquivo reflete a sessão
anterior do mesmo dia, que deixou o login em produção)

## Reatribuição de representante + campos de orçamento (implementado nesta sessão, ainda não em produção)

Pedido do usuário: admin poder ver/trocar qual representante é
responsável por cada cliente, e travar em opções fixas (em vez de texto
livre) vários campos de "Outras informações" do orçamento. Ver
`.ai/memory/decisions.md` (duas entradas de 2026-09-01) pro raciocínio
completo e as perguntas que foram feitas ao usuário antes de implementar.

**O que foi feito:**
- `Cliente.representanteId` agora pode ser trocado pelo admin — painéis
  novos `/admin/clientes` (lista todos os clientes de todos os
  representantes, com select de reatribuição inline) e
  `/admin/orcamentos` + `/admin/orcamentos/[id]` (mesma ideia pros
  orçamentos; o detalhe mostra e deixa trocar o representante
  responsável pelo CLIENTE daquele orçamento). `/admin/representantes`
  continua existindo como antes. Nova nav (`AdminNav.tsx`) alterna entre
  os três.
- Trocar o representante NÃO mexe em orçamentos já criados (cada um
  guarda seu próprio `representanteId` de quem montou na hora) — só o
  cadastro do cliente e os orçamentos futuros passam a ser do
  representante novo. Decisão explícita do usuário.
- `/orcamentos/[id]/pdf` (rota compartilhada com o app normal) passou a
  liberar admin baixar PDF de qualquer orçamento, não só os próprios.
- No formulário de "Novo orçamento": "Previsão de entrega" virou um mini
  calendário próprio (`DatePickerField.tsx`, sem lib externa, cores da
  marca); "Forma de pagamento", "Condição de pagamento" e "Frete por
  conta" viraram `<select>` com opções fixas (Boletos/Cheque/Dinheiro/
  Pix; à vista/21-28-35/.../21-28-35-42-49-56; CIF/FOB — o pedido
  original só citava CIF, o usuário confirmou incluir FOB também).
  "Volumes" e "Peso bruto" pararam de ser digitáveis — calculados a
  partir dos itens (volumes = soma das quantidades; peso bruto = soma
  de quantidade × peso unitário) e SEMPRE recalculados no servidor
  (nunca confia no valor vindo do form, mesma regra já usada pra preço).
- `Produto` ganhou `peso Float?` (nullable) — estrutura pronta pro
  cálculo de peso bruto, mas nenhum produto tem peso preenchido ainda
  (usuário vai informar depois). Até lá, peso bruto calcula como 0.

**Bloqueio conhecido desta sessão (mesmo da sessão anterior — container
cloud sem rede pra `binaries.prisma.sh`)**: de novo não deu pra rodar
`prisma generate`/`migrate dev`/`next build` aqui — confirmado tentando
(`npm install` funciona normal, mas o download do engine do Prisma dá
403 Forbidden). Validação possível nesta sessão: `tsc --noEmit`
comparado com um baseline tirado ANTES das mudanças (só sobraram os
mesmos erros esperados de Prisma Client não gerado, com números de
linha deslocados + as mesmas categorias de erro nos arquivos novos) e
`eslint` limpo (zero erros/warnings novos) em todos os arquivos
criados/alterados. **Antes de considerar isso pronto, alguém com rede
boa (local ou o build do Railway) precisa rodar**: `npx prisma generate`,
`npx prisma migrate deploy` (ou `dev` local) e `npm run build`, e só
então testar o fluxo de admin (reatribuir representante, novo orçamento
com os campos novos) de verdade.

**Git**: código commitado localmente nesta sessão, mas **esta sessão
também não tem permissão de push** pro repositório (mesmo bloqueio da
sessão do login — só clone público de leitura). Patch completo
(`git format-patch`) salvo no projeto Claude em
`claude/reassign-representante-e-orcamento-campos.patch`, igual foi
feito com o login.

---

# Estado em 2026-09-01 (sessão anterior, login em produção)

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

- **Validar e dar push nas mudanças desta sessão (reatribuição de
  representante + campos de orçamento)** — ver seção no topo deste
  arquivo. Bloqueia produção.
- **Backup automático do volume NÃO configurado ainda** — foi
  combinado com o usuário (Railway tem backup Daily/Weekly/Monthly por
  volume, configurado na aba "Backups" das Settings do serviço, só
  pelo site) mas a conversa pivotou pro login antes de confirmar que
  foi feito. **Próximo passo prioritário.**
- **9 SKUs sem foto**: 1065, 1071, 1053, 1076, VER-24, VER-28, 1052,
  1078, 1078/1.
- **7 códigos com foto mas sem cadastro no catálogo**: 0610, 1981,
  1982, 2602, 2907, 2909, 3009. Fotos já em `public/produtos/`.
- **Peso unitário dos produtos**: nenhum produto tem `peso` preenchido
  ainda (campo novo desta sessão) — peso bruto do orçamento calcula
  como 0 até isso ser informado.
- **Gerenciador de Catálogo → integração de volta**: quando o usuário
  terminar de organizar categoria/marca/unidade lá e exportar o JSON,
  falta migrar `Produto.categoria` (hoje texto único) pra
  `Categoria`/`Marca` muitos-para-muitos + `unidade` neste projeto.
- Hooks do Claude Code (`PreCompact`/`SessionStart`) configurados em
  `.claude/settings.json` — já confirmados funcionando (o próprio hook
  de lembrete disparou numa compactação desta sessão).

## Próximo passo recomendado

1. Rodar `prisma generate`/`migrate`/`build` num ambiente com rede
   normal, dar push, e testar de ponta a ponta o que foi feito nesta
   sessão (ver seção no topo).
2. Configurar backup automático do volume nos dois projetos Railway
   (Daily é suficiente).
3. Avisar o usuário a trocar a senha da conta admin de produção pelo
   painel `/admin/representantes` assim que possível.
4. Cadastrar os representantes reais (hoje só existe a conta admin em
   produção).
5. Aguardar o JSON do Gerenciador de Catálogo pra migrar
   categoria/marca.
