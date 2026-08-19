import Image from "next/image";
import { BrandLeaf } from "./BrandLeaf";

export function ProdutoThumb({
  imagemUrl,
  descricao,
  size = 40,
}: {
  imagemUrl: string | null;
  descricao: string;
  size?: number;
}) {
  if (imagemUrl) {
    return (
      <Image
        src={imagemUrl}
        alt={descricao}
        width={size}
        height={size}
        className="rounded-md border border-brand-cream object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-md border border-brand-cream bg-brand-limeLight/40 text-brand-olive/25"
      style={{ width: size, height: size }}
    >
      <BrandLeaf style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
}
