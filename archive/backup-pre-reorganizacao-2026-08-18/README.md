# D'Classe Papéis — Ferramenta de Orçamentos

Estrutura inicial do projeto (Next.js + Prisma/SQLite), conforme o briefing.

## O que já está pronto

- Scaffold do Next.js (App Router + TypeScript + Tailwind)
- Schema do banco de dados (`prisma/schema.prisma`) com os 5 modelos do
  briefing: `Representante`, `Cliente`, `Produto`, `Orcamento`, `ItemOrcamento`
- Script de seed do catálogo (`prisma/seed.ts` + `prisma/seed-data/produtos.json`)
  com os **51 produtos reais** enviados (código, descrição, categoria,
  preço tabela A e B). NCM, unidade e código de barras não vieram na
  planilha original e ficaram em branco — dá pra preencher depois direto
  no banco ou me mandando outra planilha.

> Este ambiente de execução não tem acesso à internet para baixar pacotes
> npm (nem o container nem a ponte com o seu computador têm acesso à
> rede para instalação de pacotes), então não deu pra rodar `npm install`
> / `prisma migrate` aqui. Os comandos abaixo precisam ser rodados na sua
> máquina — é rápido, 3 comandos.

## Como rodar localmente

```bash
cd dclasse-orcamentos
npm install
npx prisma migrate dev --name init   # cria o dev.db (SQLite) e as tabelas
npm run db:seed                       # popula o catálogo de produtos
npm run dev                           # http://localhost:3000
```

Para inspecionar o banco visualmente:

```bash
npm run db:studio
```

## Decisões de modelagem

- **Valores monetários em centavos (Int)**: evita erro de arredondamento
  com ponto flutuante. R$ 12,34 é armazenado como `1234`. Ao exibir,
  dividir por 100 e formatar.
- **Categoria como texto livre** (`Produto.categoria`): mais simples de
  editar/adicionar categoria nova sem migração. As 5 categorias do
  briefing (Linha Olivapel, Rolão Higiênico, Interfolhas, Bobinas Toalhas
  Auto Corte, Higiênico Doméstico) são valores de exemplo, não um enum
  fixo no banco.
- **`ItemOrcamento` guarda um "snapshot"** de descrição e preço unitário
  no momento da venda — assim, se o preço do produto mudar depois, os
  orçamentos antigos não são afetados.
- **`Orcamento.id` é autoincremento** e serve diretamente como "número do
  orçamento" que aparece no PDF (igual ao nº 3811 do exemplo aprovado).
- **`Cliente` é isolado por representante** (`@@unique([representanteId, cnpj])`),
  batendo com a regra "só os clientes que ELE cadastrou".

## Catálogo

`prisma/seed-data/produtos.json` tem os 51 produtos reais (planilha
original preservada em `prisma/seed-data/catalogo_dclasse_original.csv`
para referência). Campos que faltam e podem ser preenchidos depois:

- `ncm` (nenhum produto tem, hoje)
- `unidade` (não veio na planilha — ex: fardo, pacote, rolo, caixa)
- `codigoBarras` (nenhum produto tem, hoje)

Se quiser, me manda uma planilha só com código + essas 3 colunas que eu
atualizo o seed.

## Estrutura de pastas

```
dclasse-orcamentos/
├── prisma/
│   ├── schema.prisma          # modelo de dados
│   ├── seed.ts                # script que popula o catálogo
│   └── seed-data/
│       ├── produtos.json      # dados do catálogo (51 produtos reais)
│       └── catalogo_dclasse_original.csv  # planilha original enviada
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # tela inicial (placeholder)
│   │   └── globals.css
│   └── lib/
│       └── db.ts               # cliente Prisma (singleton)
├── package.json
└── ...
```

## Próximas etapas sugeridas (fora deste escopo inicial)

1. Tela de identificação do representante (nome, sem senha)
2. Cadastro/listagem de clientes (filtrado por representante)
3. Catálogo navegável (categoria/busca) + seleção de tabela A/B
4. Montagem e revisão do orçamento
5. Geração do PDF (layout baseado no orçamento nº 3811)
