# Estado atual — 2026-09-01

## Funcionando

Fluxo principal completo e no ar em produção (Railway):
- Ferramenta de Orçamentos: https://ferramenta-orcamentos-production.up.railway.app
- Gerenciador de Catálogo: https://gerenciador-catalogo-production.up.railway.app

Login real por usuário/senha (NextAuth v5, Credentials) — contas só
criadas pelo admin, sem autocadastro. `role` é `"ADMIN"` ou
`"REPRESENTANTE"` (String, não enum — SQLite não suporta enum nativo
no Prisma). `trustHost: true` obrigatório em `auth.config.ts` fora da
Vercel (Railway aqui), senão todo login falha com "UntrustedHost".

**Painel admin, 3 seções (`AdminNav`)**:
- `/admin/representantes` — criar conta, ativar/desativar, redefinir
  senha, **trocar o papel (ADMIN/REPRESENTANTE) direto num select**
  (trava: não deixa remover o admin do último admin ativo), e ver o
  **último login** de cada um (`Representante.ultimoLoginEm`,
  atualizado no `authorize()` do NextAuth a cada login bem-sucedido).
- `/admin/clientes` — todos os clientes de todos os representantes,
  com busca, **filtro por representante** (mostra um resumo de
  quantidade quando filtrado, sincronizado com `?representanteId=` na
  URL), reatribuir representante responsável inline, e link "Editar"
  pra `/admin/clientes/[id]` (formulário completo — todos os campos do
  cliente, não só o representante).
- `/admin/orcamentos` + `/admin/orcamentos/[id]` — todos os orçamentos,
  mesmo filtro por representante (aqui o resumo mostra: orçamentos
  deste mês, total geral, e soma em R$ deste mês), reatribuir
  representante no detalhe, admin baixa PDF de qualquer orçamento.

**Cliente**:
- CNPJ é único **globalmente** agora (antes era só por representante —
  dois representantes podiam cadastrar o mesmo CNPJ achando cada um
  que era "seu" cliente). Tentar cadastrar/editar pra um CNPJ já
  existente bloqueia e mostra o nome do representante dono.
- Ganhou `codigoCliente` (texto livre, preenchido pelo representante —
  obrigatório no cadastro novo, opcional em cadastros antigos/edição).
- Tela de detalhe pro representante comum: `/clientes/[id]` — dados do
  cliente + histórico de orçamentos dele (componente compartilhado
  `HistoricoOrcamentosCliente`, reusado também no admin).
- "Capa" do orçamento (nos cards de `/orcamentos`, `/admin/orcamentos`
  e no histórico) mostra: código do cliente, nome fantasia (cai pra
  razão social), telefone, número do orçamento.

Orçamento: calendário próprio pra previsão de entrega
(`DatePickerField`, sem lib externa), listas fixas pra forma/condição
de pagamento e frete por conta, volumes/peso bruto calculados a partir
dos itens e sempre recalculados no servidor. Tabela A/B por item.
Fotos de produto: 42/51 SKUs. Busca instantânea em clientes/orçamentos.

## Pendente / conhecido

- **Backup automático do volume NÃO configurado ainda** (Railway,
  Settings → Backups → Daily, só pelo site). Combinado com o usuário,
  ainda não confirmado como feito.
- **Peso unitário dos produtos**: `Produto.peso` existe mas nenhum
  produto tem valor ainda — peso bruto calcula como 0 até isso ser
  informado.
- **9 SKUs sem foto**: 1065, 1071, 1053, 1076, VER-24, VER-28, 1052,
  1078, 1078/1.
- **7 códigos com foto mas sem cadastro no catálogo**: 0610, 1981,
  1982, 2602, 2907, 2909, 3009. Fotos já em `public/produtos/`.
- **Gerenciador de Catálogo → integração de volta**: quando o usuário
  terminar de organizar categoria/marca/unidade lá e exportar o JSON,
  falta migrar `Produto.categoria` (hoje texto único) pra
  `Categoria`/`Marca` muitos-para-muitos + `unidade` neste projeto.
- Nota de produto (não implementada, só documentada por pedido do
  usuário): hoje qualquer representante que tentar cadastrar um CNPJ
  duplicado vê o nome do representante dono do cliente. Se isso virar
  problema de "caça de carteira" entre representantes, considerar
  restringir essa informação só pro admin.

## Próximo passo recomendado

1. Configurar backup automático do volume nos dois projetos Railway.
2. Cadastrar os representantes reais (hoje a base tem só contas de
   teste em produção, mais a conta admin).
3. Aguardar o JSON do Gerenciador de Catálogo pra migrar
   categoria/marca.
4. Quando o usuário informar, preencher `Produto.peso` unitário.
