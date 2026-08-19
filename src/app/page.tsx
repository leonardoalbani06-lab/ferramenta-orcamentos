import Image from "next/image";
import { identificarRepresentante } from "./actions";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-oliveDark p-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#6E7C5A_0%,_#445039_45%,_#242B1E_100%)]"
        aria-hidden
      />
      <div className="bg-grain pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative w-full max-w-md rounded-2xl border border-brand-gold/50 bg-brand-cream p-10 shadow-2xl shadow-black/50">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/brand/olivapel-mark-olive.png"
            alt="Olivapel"
            width={337}
            height={344}
            priority
            className="h-28 w-auto"
          />
        </div>

        <p className="mb-6 text-center text-sm text-brand-oliveDark/70">
          Identifique-se para montar orçamentos
        </p>

        {erro && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
        )}

        <form action={identificarRepresentante} className="flex flex-col gap-3">
          <label className="text-sm font-medium text-brand-olive" htmlFor="nome">
            Seu nome
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            required
            autoFocus
            className="rounded-lg border border-brand-olive/20 bg-white px-3 py-2 outline-none transition focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20"
            placeholder="Ex: João Silva"
          />
          <button
            type="submit"
            className="mt-2 rounded-lg bg-brand-olive px-4 py-2.5 font-medium text-white transition hover:bg-brand-oliveDark"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
