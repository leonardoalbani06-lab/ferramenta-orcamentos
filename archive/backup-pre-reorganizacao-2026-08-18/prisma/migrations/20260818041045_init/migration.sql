-- CreateTable
CREATE TABLE "representantes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "representanteId" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cnpj" TEXT NOT NULL,
    "inscricaoEstadual" TEXT,
    "endereco" TEXT,
    "bairro" TEXT,
    "cep" TEXT,
    "municipio" TEXT,
    "uf" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "clientes_representanteId_fkey" FOREIGN KEY ("representanteId") REFERENCES "representantes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "produtos" (
    "codigo" TEXT NOT NULL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "ncm" TEXT,
    "unidade" TEXT,
    "codigoBarras" TEXT,
    "precoTabelaA" INTEGER NOT NULL DEFAULT 0,
    "precoTabelaB" INTEGER NOT NULL DEFAULT 0,
    "ipiPercentual" REAL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "orcamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clienteId" TEXT NOT NULL,
    "representanteId" TEXT NOT NULL,
    "tabelaUsada" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valorProdutos" INTEGER NOT NULL DEFAULT 0,
    "descontoPercentual" REAL,
    "descontoValor" INTEGER NOT NULL DEFAULT 0,
    "ipiValor" INTEGER NOT NULL DEFAULT 0,
    "stValor" INTEGER NOT NULL DEFAULT 0,
    "freteValor" INTEGER NOT NULL DEFAULT 0,
    "valorTotal" INTEGER NOT NULL DEFAULT 0,
    "previsaoEntrega" TEXT,
    "condicaoPagamento" TEXT,
    "formaPagamento" TEXT,
    "transportadora" TEXT,
    "volumes" INTEGER,
    "pesoBruto" REAL,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "orcamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orcamentos_representanteId_fkey" FOREIGN KEY ("representanteId") REFERENCES "representantes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "itens_orcamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orcamentoId" INTEGER NOT NULL,
    "produtoCodigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorUnitario" INTEGER NOT NULL,
    "ipiPercentual" REAL DEFAULT 0,
    "valorTotal" INTEGER NOT NULL,
    CONSTRAINT "itens_orcamento_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "orcamentos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "itens_orcamento_produtoCodigo_fkey" FOREIGN KEY ("produtoCodigo") REFERENCES "produtos" ("codigo") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "representantes_nome_key" ON "representantes"("nome");

-- CreateIndex
CREATE INDEX "clientes_representanteId_idx" ON "clientes"("representanteId");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_representanteId_cnpj_key" ON "clientes"("representanteId", "cnpj");

-- CreateIndex
CREATE INDEX "produtos_categoria_idx" ON "produtos"("categoria");

-- CreateIndex
CREATE INDEX "orcamentos_clienteId_idx" ON "orcamentos"("clienteId");

-- CreateIndex
CREATE INDEX "orcamentos_representanteId_idx" ON "orcamentos"("representanteId");

-- CreateIndex
CREATE INDEX "itens_orcamento_orcamentoId_idx" ON "itens_orcamento"("orcamentoId");
