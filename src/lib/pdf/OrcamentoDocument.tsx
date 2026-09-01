import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import type { Cliente, ItemOrcamento, Orcamento, Produto, Representante } from "@prisma/client";
import { formatDateIso, formatDateTime, formatDecimal, formatMoney } from "@/lib/format";

function lerImagemProduto(imagemUrl: string | null): Buffer | undefined {
  if (!imagemUrl) return undefined;
  const caminho = path.join(process.cwd(), "public", imagemUrl);
  if (!existsSync(caminho)) return undefined;
  return readFileSync(caminho);
}

const LOGO_OLIVAPEL = readFileSync(
  path.join(process.cwd(), "public/brand/olivapel-mark-olive.png")
);

export type OrcamentoCompleto = Orcamento & {
  cliente: Cliente;
  representante: Representante;
  itens: (ItemOrcamento & { produto: Produto })[];
};

const BORDA = "#000000";

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 8, fontFamily: "Helvetica", color: "#111111" },
  documentBox: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: BORDA,
  },
  row: { flexDirection: "row" },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: BORDA,
  },
  headerLeft: { flex: 1, padding: 8, alignItems: "flex-start", justifyContent: "center" },
  headerRight: {
    width: 130,
    padding: 8,
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftStyle: "solid",
    borderLeftColor: BORDA,
  },
  logo: { width: 54, height: 55 },
  orcamentoLabel: { fontSize: 8, color: "#333333" },
  orcamentoNumero: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    backgroundColor: "#e5e5e5",
    padding: 3,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: BORDA,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: BORDA,
  },
  cell: {
    flex: 1,
    padding: 3,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: BORDA,
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: BORDA,
  },
  cellLast: {
    flex: 1,
    padding: 3,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: BORDA,
  },
  label: { fontSize: 6, color: "#555555", marginBottom: 1 },
  value: { fontSize: 8 },
  valueBold: { fontSize: 9, fontWeight: 700 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#e5e5e5",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: BORDA,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomStyle: "solid",
    borderBottomColor: "#999999",
  },
  th: {
    padding: 3,
    fontSize: 7,
    fontWeight: 700,
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: BORDA,
  },
  thLast: { padding: 3, fontSize: 7, fontWeight: 700 },
  td: {
    padding: 3,
    fontSize: 7,
    borderRightWidth: 0.5,
    borderRightStyle: "solid",
    borderRightColor: "#cccccc",
  },
  tdLast: { padding: 3, fontSize: 7 },
  tdDescricao: {
    flex: 3,
    padding: 3,
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: BORDA,
  },
  tdFoto: {
    width: 36,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: BORDA,
  },
});

function cellFixed(width: number, last = false) {
  return {
    width,
    padding: 3,
    borderTopWidth: 1,
    borderTopStyle: "solid" as const,
    borderTopColor: BORDA,
    ...(last
      ? {}
      : {
          borderRightWidth: 1,
          borderRightStyle: "solid" as const,
          borderRightColor: BORDA,
        }),
  };
}

function Campo({
  label,
  valor,
  width,
  last = false,
}: {
  label: string;
  valor: string;
  width?: number;
  last?: boolean;
}) {
  const style = width ? cellFixed(width, last) : last ? styles.cellLast : styles.cell;
  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{valor || " "}</Text>
    </View>
  );
}

export function OrcamentoDocument({ orcamento }: { orcamento: OrcamentoCompleto }) {
  const c = orcamento.cliente;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.documentBox}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Image src={LOGO_OLIVAPEL} style={styles.logo} />
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.orcamentoLabel}>Orçamento</Text>
              <Text style={styles.orcamentoNumero}>{orcamento.id}</Text>
              <Text style={styles.orcamentoLabel}>
                Emitido em {formatDateTime(new Date())}
              </Text>
              <Text
                style={styles.orcamentoLabel}
                render={({ pageNumber }) => `Folha ${pageNumber}`}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>CLIENTE</Text>
          <View style={styles.row}>
            <Campo label="NOME / RAZÃO SOCIAL" valor={c.razaoSocial} />
            <Campo label="CNPJ" valor={c.cnpj} width={110} last />
          </View>
          <View style={styles.row}>
            <Campo label="NOME FANTASIA" valor={c.nomeFantasia ?? ""} />
            <Campo label="INSCRIÇÃO ESTADUAL" valor={c.inscricaoEstadual ?? ""} width={110} last />
          </View>
          <View style={styles.row}>
            <Campo label="ENDEREÇO" valor={c.endereco ?? ""} />
            <Campo label="BAIRRO" valor={c.bairro ?? ""} width={110} />
            <Campo label="CEP" valor={c.cep ?? ""} width={70} last />
          </View>
          <View style={styles.row}>
            <Campo label="MUNICÍPIO" valor={c.municipio ?? ""} />
            <Campo label="FONE" valor={c.telefone ?? ""} width={110} />
            <Campo label="UF" valor={c.uf ?? ""} width={70} last />
          </View>

          <Text style={styles.sectionTitle}>VALORES</Text>
          <View style={styles.row}>
            <Campo label="VALOR TOTAL DOS PRODUTOS" valor={formatMoney(orcamento.valorProdutos)} />
            <Campo
              label="DESC. EM PERCENTUAL"
              valor={
                orcamento.descontoPercentual ? `${formatDecimal(orcamento.descontoPercentual, 2)}%` : ""
              }
            />
            <Campo label="DESC. EM VALOR" valor={formatMoney(orcamento.descontoValor)} />
            <Campo label="VALOR TOTAL DO IPI" valor={formatMoney(orcamento.ipiValor)} />
            <Campo label="VALOR TOTAL DA ST" valor={formatMoney(orcamento.stValor)} />
            <Campo label="VALOR DO FRETE" valor={formatMoney(orcamento.freteValor)} />
            <View style={styles.cellLast}>
              <Text style={styles.label}>VALOR TOTAL DO PEDIDO</Text>
              <Text style={styles.valueBold}>{formatMoney(orcamento.valorTotal)}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>OUTRAS INFORMAÇÕES</Text>
          <View style={styles.row}>
            <Campo label="REPRESENTANTE" valor={orcamento.representante.nome} last />
          </View>
          <View style={styles.row}>
            <Campo label="PREVISÃO DE ENTREGA" valor={formatDateIso(orcamento.previsaoEntrega)} />
            <Campo label="ORDEM DE COMPRA" valor={orcamento.ordemCompra ?? ""} />
            <Campo label="FRETE POR CONTA" valor={orcamento.fretePorConta ?? ""} />
            <Campo label="TRANSPORTADORA" valor={orcamento.transportadora ?? ""} last />
          </View>
          <View style={styles.row}>
            <Campo label="FORMA DE PAGAMENTO" valor={orcamento.formaPagamento ?? ""} />
            <Campo label="VOLUMES" valor={orcamento.volumes?.toString() ?? ""} width={70} />
            <Campo label="ITENS" valor={String(orcamento.itens.length)} width={50} />
            <Campo
              label="PESO BRUTO EM KG"
              valor={orcamento.pesoBruto ? formatDecimal(orcamento.pesoBruto, 3) : ""}
              width={90}
              last
            />
          </View>
          <View style={styles.row}>
            <Campo label="CONDIÇÃO DE PAGAMENTO" valor={orcamento.condicaoPagamento ?? ""} last />
          </View>
          <View style={styles.row}>
            <Campo label="OBSERVAÇÃO" valor={orcamento.observacoes ?? ""} last />
          </View>
          <View style={styles.row}>
            <Campo label="E-MAIL CÓPIA DO PEDIDO" valor={orcamento.emailCopiaPedido ?? ""} />
            <Campo label="E-MAIL XML DA NFE" valor={orcamento.emailXmlNfe ?? ""} last />
          </View>

          <Text style={styles.sectionTitle}>DADOS DOS PRODUTOS</Text>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: 36 }]}></Text>
            <Text style={[styles.th, { flex: 3 }]}>DESCRIÇÃO DO PRODUTO</Text>
            <Text style={[styles.th, { width: 50 }]}>NCM</Text>
            <Text style={[styles.th, { width: 32 }]}>UNID.</Text>
            <Text style={[styles.th, { width: 42 }]}>QUANT.</Text>
            <Text style={[styles.th, { width: 26 }]}>TAB.</Text>
            <Text style={[styles.th, { width: 50 }]}>VALOR UNIT.</Text>
            <Text style={[styles.th, { width: 55 }]}>VALOR TOTAL</Text>
            <Text style={[styles.th, { width: 30 }]}>% IPI</Text>
            <Text style={[styles.thLast, { width: 85 }]}>CÓDIGO DE BARRA</Text>
          </View>
          {orcamento.itens.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <View style={styles.tdFoto}>
                {(() => {
                  const buffer = lerImagemProduto(item.produto.imagemUrl);
                  return buffer ? (
                    <Image src={buffer} style={{ width: 30, height: 30, objectFit: "contain" }} />
                  ) : null;
                })()}
              </View>
              <View style={styles.tdDescricao}>
                <Text style={{ fontSize: 6, color: "#555555" }}>Código: {item.produtoCodigo}</Text>
                <Text style={styles.value}>{item.descricao}</Text>
              </View>
              <Text style={[styles.td, { width: 50 }]}>{item.produto.ncm || "-"}</Text>
              <Text style={[styles.td, { width: 32 }]}>{item.produto.unidade || "-"}</Text>
              <Text style={[styles.td, { width: 42 }]}>{formatDecimal(item.quantidade, 0)}</Text>
              <Text style={[styles.td, { width: 26 }]}>{item.tabelaUsada}</Text>
              <Text style={[styles.td, { width: 50 }]}>{formatDecimal(item.valorUnitario / 100, 2)}</Text>
              <Text style={[styles.td, { width: 55 }]}>{formatDecimal(item.valorTotal / 100, 2)}</Text>
              <Text style={[styles.td, { width: 30 }]}>{formatDecimal(item.ipiPercentual ?? 0, 2)}</Text>
              <Text style={[styles.tdLast, { width: 85 }]}>
                {item.produto.codigoBarras || "-"}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
