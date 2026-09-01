"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECOES = [
  { href: "/admin/representantes", label: "Representantes" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/orcamentos", label: "Orçamentos" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {SECOES.map((secao) => {
        const ativo = pathname === secao.href || pathname.startsWith(`${secao.href}/`);
        return (
          <Link
            key={secao.href}
            href={secao.href}
            className={
              ativo
                ? "text-brand-gold"
                : "text-brand-cream/80 transition hover:text-brand-gold"
            }
          >
            {secao.label}
          </Link>
        );
      })}
    </>
  );
}
