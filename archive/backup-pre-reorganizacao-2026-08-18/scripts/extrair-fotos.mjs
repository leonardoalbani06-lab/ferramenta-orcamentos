// Extrai a imagem principal (RGB + máscara de transparência) embutida em
// cada PDF exportado em "Imagens - Produtos" e gera um JPEG (fundo branco)
// por SKU em public/produtos/. Uso: node scripts/extrair-fotos.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { inflateSync } from "node:zlib";
import path from "node:path";
import sharp from "sharp";

const PASTA_ORIGEM = "C:\\Users\\leona\\Desktop\\Imagens - Produtos";
const PASTA_DESTINO = path.join(process.cwd(), "public", "produtos");
const TAMANHO_MAX = 640;

// arquivo (sem extensão/sufixo) -> lista de códigos de catálogo que devem
// usar essa foto (um arquivo pode alimentar mais de um SKU: variantes "/1",
// "/2" da mesma embalagem, e o SKU combinado "1012/1013").
const MAPA = {
  "0106": ["0106"],
  "0701": ["0701"],
  "1001": ["1001"],
  "1002": ["1002"],
  "1003": ["1003"],
  "1004": ["1004"],
  "1005": ["1005"],
  "1012": ["1012/1013"],
  "1013": [], // existe, mas o SKU combinado usa a foto do 1012 (vermelha)
  "1014": ["1014"],
  "1030": ["1030"],
  "1031": ["1031"],
  "1032": ["1032"],
  "1033": ["1033"],
  "1037": ["1037"],
  "1050": ["1050"],
  "1051": ["1051"],
  "1054": ["1054"],
  "1055": ["1055"],
  "1056": ["1056"],
  "1060": ["1060"],
  "1061": ["1061"],
  "1062": ["1062", "1062/1", "1062/2"],
  "1063": ["1063", "1063/1", "1063/2"],
  "1064": ["1064"],
  "1070": ["1070", "1070/1"],
  "1072": ["1072", "1072/1"],
  "1073": ["1073", "1073/1"],
  "1074": ["1074", "1074/1"],
  "1075": ["1075"],
  "1080": ["1080"],
  "1304": ["1304"],
  "1605": ["1605"],
  "2108": ["2108"],
  "2707": ["2707"],
  // códigos que ainda não existem no catálogo — só extrai e guarda o
  // arquivo, não fica associado a nenhum Produto por enquanto.
  "0610": [],
  "1981": [],
  "1982": [],
  "2602": [],
  "2907": [],
  "2909": [],
  "3009": [],
};

function sanitizaCodigo(codigo) {
  return codigo.replace(/\//g, "-");
}

/** Acha objetos /Subtype /Image no PDF (texto latin1, 1 byte = 1 char). */
function acharImagens(buffer) {
  const texto = buffer.toString("latin1");
  const imagens = [];
  const regexObj = /(\d+)\s+0\s+obj\s*<</g;
  let m;
  while ((m = regexObj.exec(texto))) {
    const objNum = m[1];
    const inicioDict = m.index;
    const streamIdx = texto.indexOf("stream", inicioDict);
    if (streamIdx === -1 || streamIdx - inicioDict > 2000) continue; // não é o objeto certo / muito longe
    const header = texto.slice(inicioDict, streamIdx);
    if (!/\/Subtype\s*\/Image/.test(header)) continue;

    const lengthMatch = header.match(/\/Length\s+(\d+)/);
    const colorSpaceMatch = header.match(/\/ColorSpace\s*\/(\w+)/);
    const smaskMatch = header.match(/\/SMask\s+(\d+)\s+0\s+R/);
    const temFlate = /\/FlateDecode/.test(header);
    if (!lengthMatch) continue;

    let dataStart = streamIdx + "stream".length;
    if (texto[dataStart] === "\r") dataStart++;
    if (texto[dataStart] === "\n") dataStart++;

    const length = Number(lengthMatch[1]);
    let dados = buffer.subarray(dataStart, dataStart + length);
    if (temFlate) dados = inflateSync(dados);

    imagens.push({
      objNum,
      colorSpace: colorSpaceMatch?.[1] ?? null,
      smaskObj: smaskMatch?.[1] ?? null,
      jpeg: dados,
    });
  }
  return imagens;
}

async function processarArquivo(nomeArquivo) {
  const caminho = path.join(PASTA_ORIGEM, nomeArquivo);
  const buffer = readFileSync(caminho);
  const imagens = acharImagens(buffer);

  // a imagem RGB principal já vem com fundo branco "assado" nos pixels
  // (o objeto /SMask irmão é só uma máscara auxiliar do PDF, não precisa
  // dela pra nada aqui — tentar recompor RGB+máscara via joinChannel
  // corrompia a imagem).
  const principal = imagens.find((i) => i.colorSpace === "DeviceRGB") ?? imagens[0];
  if (!principal) {
    console.warn(`  [aviso] nenhuma imagem encontrada em ${nomeArquivo}`);
    return null;
  }

  const final = await sharp(principal.jpeg)
    .resize({ width: TAMANHO_MAX, height: TAMANHO_MAX, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  return final;
}

async function main() {
  mkdirSync(PASTA_DESTINO, { recursive: true });
  const arquivos = readdirSync(PASTA_ORIGEM).filter((f) => f.toLowerCase().endsWith(".pdf"));

  const resultado = { gerados: [], semMapa: [], erros: [] };

  for (const arquivo of arquivos) {
    const chave = arquivo.replace(/\s*\(\d+\)/, "").replace(/\.pdf$/i, "").trim();
    const alvos = MAPA[chave];
    if (alvos === undefined) {
      resultado.semMapa.push(arquivo);
      continue;
    }

    let jpegBuffer;
    try {
      jpegBuffer = await processarArquivo(arquivo);
    } catch (e) {
      resultado.erros.push(`${arquivo}: ${e.message}`);
      continue;
    }
    if (!jpegBuffer) {
      resultado.erros.push(`${arquivo}: sem imagem extraível`);
      continue;
    }

    // sempre salva pelo código "base" do arquivo (útil mesmo sem SKU
    // associado ainda, ex: os 7 códigos novos).
    const nomeBase = `${sanitizaCodigo(chave)}.jpg`;
    writeFileSync(path.join(PASTA_DESTINO, nomeBase), jpegBuffer);
    resultado.gerados.push({ arquivo, salvoComo: nomeBase, alvos });

    // além disso, salva uma cópia por cada SKU de catálogo que usa essa
    // foto (variantes "/1", "/2", SKU combinado etc).
    for (const codigo of alvos) {
      const nomeAlvo = `${sanitizaCodigo(codigo)}.jpg`;
      if (nomeAlvo === nomeBase) continue;
      writeFileSync(path.join(PASTA_DESTINO, nomeAlvo), jpegBuffer);
    }
  }

  console.log(JSON.stringify(resultado, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
