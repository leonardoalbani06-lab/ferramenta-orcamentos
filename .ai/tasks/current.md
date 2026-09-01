# Tarefas em andamento

## Reatribuição de representante + campos de orçamento — implementado, falta validar/deployar

Código escrito (schema, migration, painéis /admin/clientes e
/admin/orcamentos, DatePickerField, selects fixos, cálculo automático
de volumes/peso bruto) numa sessão sem rede pra `binaries.prisma.sh`,
então **não foi testado rodando de verdade** — ver seção no topo de
`.ai/context/current-state.md` pro que falta antes de dar como pronto:

1. `npm install && npx prisma generate` em ambiente com rede normal.
2. `npx prisma migrate deploy` (produção) ou `migrate dev` (local) —
   aplica a migration `20260901130000_produto_peso` (só adiciona a
   coluna `peso`, não apaga nada).
3. `npm run build` pra confirmar que compila.
4. Dar push pro GitHub — mesma trava de antes, esta sessão só tem
   clone público de leitura. Patch salvo no projeto Claude em
   `claude/reassign-representante-e-orcamento-campos.patch`.
5. Testar manualmente: admin reatribuindo representante de um cliente
   em `/admin/clientes` e em `/admin/orcamentos/[id]`, e confirmando
   que o representante antigo continua vendo os orçamentos que ele já
   tinha criado; montar um orçamento novo testando o calendário de
   previsão de entrega, os selects de forma/condição de pagamento e
   frete, e conferir que volumes/peso bruto batem com os itens
   selecionados; baixar PDF de um orçamento de outro representante
   logado como admin.

## Configurar backup automático do volume (Railway)

Combinado com o usuário, ainda não confirmado como feito. Fazer nos
dois projetos (`ferramenta-orcamentos` e o Gerenciador de Catálogo):
serviço → Settings → aba **Backups** → ativar schedule Daily. Só dá
pra fazer pelo site (não tem no CLI da Railway).

## Preencher peso unitário dos produtos

Campo `Produto.peso` (kg) existe no schema mas nenhum produto tem
valor ainda — usuário vai informar depois. Peso bruto do orçamento
calcula como 0 até lá.

(Ao concluir uma tarefa, remova daqui. Ao iniciar uma nova, adicione.)
