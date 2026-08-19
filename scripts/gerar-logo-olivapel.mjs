import sharp from "sharp";
import path from "node:path";

const ORIGEM = path.join(process.cwd(), "public/brand/source/olivapel-master.png");
const SAIDA_DIR = path.join(process.cwd(), "public/brand");

const CORES = {
  "olivapel-mark-olive.png": { r: 0x3e, g: 0x46, b: 0x33 },
  "olivapel-mark-cream.png": { r: 0xed, g: 0xe9, b: 0xd8 },
};

async function gerar() {
  const img = sharp(ORIGEM).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  for (const [nomeArquivo, cor] of Object.entries(CORES)) {
    const saida = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const r = data[i * channels];
      const g = data[i * channels + 1];
      const b = data[i * channels + 2];
      const luminancia = 0.299 * r + 0.587 * g + 0.114 * b;
      const alpha = Math.round(255 - luminancia);
      saida[i * 4] = cor.r;
      saida[i * 4 + 1] = cor.g;
      saida[i * 4 + 2] = cor.b;
      saida[i * 4 + 3] = alpha;
    }
    await sharp(saida, { raw: { width, height, channels: 4 } })
      .trim()
      .png()
      .toFile(path.join(SAIDA_DIR, nomeArquivo));
    console.log("gerado:", nomeArquivo);
  }
}

gerar();
