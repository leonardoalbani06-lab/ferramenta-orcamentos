# Decisões

## 2026-08-17
Decisão: identificação do representante só por nome, sem senha.
Motivo: briefing original explícito — "fase 1, sem senha".
Impacto: cookie `representanteId` httpOnly guarda a sessão; qualquer
rota autenticada confere isolamento por esse id.
Arquivos relacionados: `src/lib/session.ts`, `src/middleware.ts`

## 2026-08-17
Decisão: primeiro client component do app (`OrcamentoBuilder.tsx`) só
na tela de montagem de orçamento; todo o resto é Server Component puro.
Motivo: montar/tirar itens e ver o total mudar na hora exige estado no
cliente; não faz sentido em nenhuma outra tela do app.
Impacto: preço/descrição nunca são confiados vindos do client — a
Server Action `criarOrcamento` rebusca o `Produto` no banco pelos
códigos recebidos e recalcula tudo.
Arquivos relacionados: `src/app/(app)/orcamentos/novo/OrcamentoBuilder.tsx`,
`src/app/actions.ts`

## 2026-08-18
Decisão: layout do PDF é uma grade contínua (bordas compartilhadas entre
seções), não caixas separadas com espaço entre si.
Motivo: bug real encontrado — bordas em formato shorthand string
(`border: "1pt solid #000"`) quebravam o layout do react-pdf de forma
silenciosa (conteúdo sumia ou virava rabisco). Trocado por propriedades
longhand (`borderTopWidth`/`borderTopColor`/etc) em todo o documento.
Impacto: qualquer nova seção/coluna no PDF deve seguir o mesmo padrão
longhand — não usar shorthand de borda no react-pdf.
Arquivos relacionados: `src/lib/pdf/OrcamentoDocument.tsx`

## 2026-08-18
Decisão: fotos de produto extraídas direto do JPEG embutido nos PDFs que
o usuário mandou (não renderizadas/rasterizadas), usando só a camada RGB
(ignorando o `/SMask` de transparência).
Motivo: os PDFs continham a imagem principal como stream `DCTDecode`
dentro de `FlateDecode` — dava pra extrair sem depender de nenhuma lib
de rasterização de PDF (evita repetir a dor de cabeça de dependência
nativa que já tivemos antes no projeto). Tentar recompor RGB + máscara
via `sharp().joinChannel()` corrompia a imagem; a camada RGB sozinha já
tinha o fundo branco "assado" nos pixels.
Impacto: qualquer foto nova no mesmo formato pode reusar
`scripts/extrair-fotos.mjs` como base.
Arquivos relacionados: `scripts/extrair-fotos.mjs`,
`scripts/ligar-fotos-catalogo.mjs`

## 2026-08-18
Decisão: `<Image>` do `@react-pdf/renderer` recebe um `Buffer` lido com
`fs.readFileSync`, não uma string de caminho.
Motivo: passar o caminho do arquivo como string falhava silenciosamente
(célula vazia, sem erro) — suspeita é o caminho do projeto ter acento
("Automação"). Ler o buffer manualmente resolveu.
Impacto: qualquer uso futuro de `<Image>` no PDF deve seguir esse
padrão.
Arquivos relacionados: `src/lib/pdf/OrcamentoDocument.tsx`

## 2026-08-18
Decisão: paleta/tipografia da marca vieram do site real da Olivapel
(uma das marcas do grupo D'Classe), não inventadas do zero.
Motivo: usuário indicou o site como referência de estilo depois de achar
a primeira versão "sem sal"; cores/fontes extraídas via inspeção do CSS
computado do site real.
Impacto: qualquer novo elemento visual deve usar os tokens `brand.*` já
definidos, não cores novas ad-hoc.
Arquivos relacionados: `tailwind.config.ts`, `src/app/layout.tsx`

## 2026-08-18
Decisão: 7 códigos de produto com foto mas sem preço/descrição
(0610, 1981, 1982, 2602, 2907, 2909, 3009) NÃO foram cadastrados como
`Produto` — só a foto foi salva em `public/produtos/`.
Motivo: escolha do usuário — cadastrar sem preço geraria risco de
orçamento errado; melhor esperar os dados reais.
Impacto: se o usuário mandar preço/descrição desses códigos, criar o
`Produto` e a foto já vai estar pronta em `public/produtos/{codigo}.jpg`.
Arquivos relacionados: `prisma/seed-data/produtos.json`

## 2026-08-19
Decisão: Tabela A/B passou de escolha única por orçamento
(`Orcamento.tabelaUsada`) pra escolha por item (`ItemOrcamento.tabelaUsada`).
`Orcamento.tabelaUsada` foi removido do schema via migration manual
(SQL escrito à mão — `prisma migrate dev` normal travava por causa de
dados de teste já existentes; aplicado com `prisma migrate deploy`,
seguro pra ambiente não-interativo).
Motivo: briefing atualizado do usuário — na prática cada produto de um
mesmo pedido pode vir de tabela diferente.
Impacto: telas de detalhe/lista de orçamento resumem as tabelas usadas
a partir dos itens (`resumirTabelas()`), não de um campo único; o PDF
ganhou coluna "TAB." por item.
Arquivos relacionados: `prisma/schema.prisma`,
`src/app/(app)/orcamentos/novo/OrcamentoBuilder.tsx`,
`src/app/(app)/orcamentos/[id]/page.tsx`, `src/lib/pdf/OrcamentoDocument.tsx`

## 2026-08-19
Decisão: redesign mobile-first (barra de navegação inferior fixa,
tabelas viram cards, barra de ação fixa com total no orçamento) — não
só "responsivo" mas pensado pra uso real em campo pelo representante.
Motivo: app é usado no celular no dia a dia, não só no desktop; um bug
real de header estourando em 375px foi encontrado e corrigido nesse
trabalho.
Impacto: padrão daqui pra frente é sempre entregar telas novas já
pensando primeiro no celular (Server Component renderiza tabela desktop
`hidden sm:block` e cards mobile `sm:hidden` a partir dos mesmos dados,
sem JS extra).
Arquivos relacionados: `src/components/BottomNav.tsx`,
`src/app/(app)/layout.tsx`, `src/app/(app)/catalogo/page.tsx`,
`src/app/(app)/orcamentos/novo/OrcamentoBuilder.tsx`

## 2026-08-19
Decisão: hooks do Claude Code (`PreCompact` + `SessionStart`) criados
em `.claude/settings.json` (arquivo não existia antes). No Windows, o
`bash.exe` do Git precisa ser chamado com `-l` (login shell) — sem
isso `/usr/bin` não entra no PATH e comandos como `mkdir`/`cat`/`cp`/`date`
falham dentro do script. `jq` (instalado via winget nesta sessão) é
referenciado por caminho absoluto no script de backup, não pelo nome
bare — processo filho não confiava em PATH atualizado na mesma sessão.
Motivo: comportamento específico do Git Bash + winget no Windows,
descoberto por tentativa e erro nesta sessão.
Impacto: qualquer hook novo neste projeto deve seguir o mesmo padrão
(`bash.exe -l <script>` + caminhos absolutos pra ferramentas recém-instaladas).
Arquivos relacionados: `.claude/settings.json`,
`.claude/hooks/backup-before-compact.sh`,
`.claude/hooks/remind-update-context.sh`

## 2026-08-19
Decisão: ferramenta "Gerenciador de Catálogo" criada como projeto
totalmente separado (`C:\Users\leona\Desktop\Gerenciador Catalogo DClasse`),
não como parte deste repositório.
Motivo: pedido explícito do usuário — ele quer organizar
categoria/marca/unidade dos produtos nessa ferramenta avulsa antes de
decidir o que trazer de volta; não deveria arriscar tocar no projeto
principal enquanto isso é iterado.
Impacto: a única ponte entre os dois projetos é leitura do
`produtos.json` (import inicial, somente leitura) e, futuramente, um
JSON exportado que o usuário vai devolver manualmente pra eu migrar o
schema principal (`Produto.categoria` → `Categoria`/`Marca`
muitos-para-muitos + `unidade`).
Arquivos relacionados: nenhum neste projeto ainda — ver
`.ai/context/project-overview.md` seção "Ferramenta relacionada".

## 2026-08-19
Decisão: rebrand completo do app pra usar a marca **Olivapel** de
verdade (nome + logo oficial), não só como referência de estilo.
Aplicado em: título/metadata (`layout.tsx`), tela de login, cabeçalho
autenticado, e no PDF do orçamento — inclusive o texto que antes dizia
"D'Classe Ind e Com de Papeis" no cabeçalho do documento virou
"Olivapel" (confirmado explicitamente com o usuário antes de mudar,
por ser texto de documento comercial/fiscal real).
Motivo: pedido direto do usuário, que trouxe o logo oficial (arquivo
`0001_Identidade Visual_*.png`, 4 variações de cor) da pasta Downloads.
Implementação: logo original só vem com fundo sólido opaco (sem
transparência) em 4 combinações de cor; gerei duas versões
recoloridas com fundo transparente de verdade via script próprio
(`scripts/gerar-logo-olivapel.mjs`) que usa a luminância de cada pixel
do master (fundo branco/tinta preta) como canal alpha e repinta com a
cor de marca desejada — permite gerar qualquer cor de tinta a partir
de um único master, sem depender de chroma-key manual.
Impacto: `BrandLeaf.tsx` (ícone SVG genérico criado antes de termos o
logo real) não é mais usado pra identidade de marca — só sobrou como
placeholder em `ProdutoThumb.tsx` pra produto sem foto, sem relação
com o rebrand.
Arquivos relacionados: `public/brand/`, `scripts/gerar-logo-olivapel.mjs`,
`src/app/layout.tsx`, `src/app/page.tsx`, `src/app/(app)/layout.tsx`,
`src/lib/pdf/OrcamentoDocument.tsx`, `README.md`, `CLAUDE.md`

## 2026-08-19
Decisão: cabeçalho do PDF ajustado depois do rebrand inicial — logo
alinhado à esquerda (não mais centralizado) e maior, sem texto
"Olivapel" nem nome do representante ali. O nome do representante
virou um campo "REPRESENTANTE" no corpo do documento (início da seção
OUTRAS INFORMAÇÕES), não no cabeçalho.
Motivo: feedback direto do usuário depois de ver o PDF gerado.
Arquivos relacionados: `src/lib/pdf/OrcamentoDocument.tsx`

## 2026-08-19
Decisão: busca em `/clientes` (razão social, nome fantasia, CNPJ) e
`/orcamentos` (número do orçamento, nome do cliente) — filtro
instantâneo client-side, sem botão nem Enter.
Motivo: pedido do usuário pra representantes acharem cliente/orçamento
mais rápido em campo. Perguntei sobre um "código do cliente" citado
pelo usuário — não existe esse campo no schema hoje; ele confirmou que
por enquanto a busca deve cobrir só razão social/nome fantasia/CNPJ, e
que código de cliente fica pra uma futura integração via API (fora de
escopo agora).
Implementação: lista inteira já vem do Server Component (como sempre
foi); um client component (`ClientesList.tsx` / `OrcamentosList.tsx`)
filtra em memória a cada tecla — não refaz query no banco. Busca de
texto ignora acento/maiúscula (`normalizar` em `src/lib/search.ts`);
busca de CNPJ/número ignora pontuação e compara só dígitos
(`contemBuscaNumerica`).
Arquivos relacionados: `src/lib/search.ts`,
`src/app/(app)/clientes/ClientesList.tsx`,
`src/app/(app)/orcamentos/OrcamentosList.tsx`
