"use client";

import { useState } from "react";

// Botões de "Compartilhar" e "Baixar PDF" do orçamento. Existem como
// componente client (em vez de um simples <a href>) por causa do PWA: com
// o app instalado em tela cheia no celular, um link direto pro PDF abre
// dentro da própria janela do app, sem a barra do navegador — e sem ela,
// não tem os botões nativos de compartilhar/baixar que o navegador dá de
// graça numa aba normal. Buscando o PDF aqui e usando a Web Share API (com
// arquivo) resolve isso: abre o menu nativo de compartilhamento do
// celular (WhatsApp, e-mail, etc.) mesmo dentro do app instalado.
export function AcoesPdf({ orcamentoId }: { orcamentoId: number }) {
  const [carregando, setCarregando] = useState<"compartilhar" | "baixar" | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function buscarArquivo(): Promise<File> {
    const resposta = await fetch(`/orcamentos/${orcamentoId}/pdf`);
    if (!resposta.ok) throw new Error("Não foi possível gerar o PDF.");
    const blob = await resposta.blob();
    return new File([blob], `orcamento-${orcamentoId}.pdf`, { type: "application/pdf" });
  }

  function baixarArquivo(arquivo: File) {
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");
    link.href = url;
    link.download = arquivo.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  async function compartilhar() {
    setErro(null);
    setCarregando("compartilhar");
    try {
      const arquivo = await buscarArquivo();
      const podeCompartilharArquivo =
        typeof navigator.canShare === "function" && navigator.canShare({ files: [arquivo] });
      if (podeCompartilharArquivo) {
        await navigator.share({ files: [arquivo], title: `Orçamento ${orcamentoId}` });
      } else {
        // Navegador sem suporte a compartilhar arquivo (ex: desktop) —
        // cai pro download direto, que é o que dava pra fazer antes.
        baixarArquivo(arquivo);
      }
    } catch (e) {
      // Usuário cancelando o menu de compartilhamento não é erro.
      if (e instanceof Error && e.name !== "AbortError") {
        setErro("Não foi possível compartilhar o PDF. Tente baixar.");
      }
    } finally {
      setCarregando(null);
    }
  }

  async function baixar() {
    setErro(null);
    setCarregando("baixar");
    try {
      baixarArquivo(await buscarArquivo());
    } catch {
      setErro("Não foi possível baixar o PDF.");
    } finally {
      setCarregando(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={compartilhar}
          disabled={carregando !== null}
          className="rounded-lg border border-brand-olive px-4 py-2.5 text-center text-sm font-medium text-brand-olive transition hover:bg-brand-cream/40 disabled:opacity-50"
        >
          {carregando === "compartilhar" ? "Preparando..." : "Compartilhar"}
        </button>
        <button
          type="button"
          onClick={baixar}
          disabled={carregando !== null}
          className="rounded-lg bg-brand-olive px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-brand-oliveDark disabled:opacity-50"
        >
          {carregando === "baixar" ? "Preparando..." : "Baixar PDF"}
        </button>
      </div>
      {erro && <p className="text-xs text-red-600">{erro}</p>}
    </div>
  );
}
