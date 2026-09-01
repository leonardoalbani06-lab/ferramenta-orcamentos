"use client";

import { useEffect, useRef, useState } from "react";

// Campo de data com mini calendário próprio (sem lib externa — projeto
// mantém dependências enxutas, e esta sessão não conseguiu validar
// `npm install`/build de pacotes novos de UI). Valor trafega como string
// "AAAA-MM-DD" (ISO, sem hora) via input escondido, pra bater com o campo
// `previsaoEntrega` (String?) no banco.

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function paraIso(data: Date): string {
  return `${data.getFullYear()}-${pad2(data.getMonth() + 1)}-${pad2(data.getDate())}`;
}

// Faz o parse manual (em vez de `new Date(iso)`) pra não cair no fuso UTC
// e voltar um dia errado dependendo do horário local.
function deIso(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const data = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(data.getTime()) ? null : data;
}

function formatarBr(data: Date): string {
  return `${pad2(data.getDate())}/${pad2(data.getMonth() + 1)}/${data.getFullYear()}`;
}

function mesmoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Grade de semanas do mês, com dias do mês anterior/seguinte pra completar
// as semanas (cinza, ainda clicáveis pra facilitar navegar perto da virada
// do mês).
function gradeDoMes(ano: number, mes: number): Date[][] {
  const primeiroDia = new Date(ano, mes, 1);
  const inicioGrade = new Date(ano, mes, 1 - primeiroDia.getDay());

  const semanas: Date[][] = [];
  const cursor = new Date(inicioGrade);
  for (let semana = 0; semana < 6; semana++) {
    const dias: Date[] = [];
    for (let dia = 0; dia < 7; dia++) {
      dias.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    semanas.push(dias);
  }
  return semanas;
}

export function DatePickerField({
  label,
  name,
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  const valorInicial = deIso(defaultValue);
  const [valor, setValor] = useState<Date | null>(valorInicial);
  const [aberto, setAberto] = useState(false);
  const [mesVisivel, setMesVisivel] = useState(() => valorInicial ?? new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(evento: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    }
    function aoApertarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoApertarTecla);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoApertarTecla);
    };
  }, []);

  function selecionar(dia: Date) {
    setValor(dia);
    setAberto(false);
  }

  function abrir() {
    setMesVisivel(valor ?? new Date());
    setAberto((v) => !v);
  }

  function mudarMes(delta: number) {
    setMesVisivel((atual) => new Date(atual.getFullYear(), atual.getMonth() + delta, 1));
  }

  const hoje = new Date();
  const semanas = gradeDoMes(mesVisivel.getFullYear(), mesVisivel.getMonth());

  return (
    <div className="relative flex flex-col gap-1" ref={containerRef}>
      <label className="text-sm font-medium text-brand-olive" htmlFor={`${name}-botao`}>
        {label}
      </label>

      <input type="hidden" name={name} value={valor ? paraIso(valor) : ""} required={required} />

      <button
        id={`${name}-botao`}
        type="button"
        onClick={abrir}
        className="flex items-center justify-between gap-2 rounded-lg border border-brand-olive/20 bg-white px-3 py-2.5 text-left outline-none transition focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/20"
      >
        <span className={valor ? "text-brand-oliveDark" : "text-gray-400"}>
          {valor ? formatarBr(valor) : "Selecionar data"}
        </span>
        <svg
          className="h-4 w-4 shrink-0 text-brand-olive/60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>

      {aberto && (
        <div className="absolute top-full z-20 mt-1 w-72 rounded-xl border border-brand-gold/30 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => mudarMes(-1)}
              aria-label="Mês anterior"
              className="flex h-8 w-8 items-center justify-center rounded-md text-brand-olive transition hover:bg-brand-limeLight"
            >
              ‹
            </button>
            <p className="text-sm font-medium text-brand-oliveDark">
              {MESES[mesVisivel.getMonth()]} {mesVisivel.getFullYear()}
            </p>
            <button
              type="button"
              onClick={() => mudarMes(1)}
              aria-label="Próximo mês"
              className="flex h-8 w-8 items-center justify-center rounded-md text-brand-olive transition hover:bg-brand-limeLight"
            >
              ›
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 text-center text-xs text-brand-olive/50">
            {DIAS_SEMANA.map((d, i) => (
              <span key={i} className="py-1">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
            {semanas.flat().map((dia, i) => {
              const foraDoMes = dia.getMonth() !== mesVisivel.getMonth();
              const selecionado = valor ? mesmoDia(dia, valor) : false;
              const eHoje = mesmoDia(dia, hoje);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selecionar(dia)}
                  className={[
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full transition",
                    selecionado
                      ? "bg-brand-olive text-white"
                      : eHoje
                        ? "border border-brand-gold text-brand-oliveDark"
                        : "text-brand-oliveDark hover:bg-brand-limeLight",
                    foraDoMes && !selecionado ? "text-gray-300" : "",
                  ].join(" ")}
                >
                  {dia.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-brand-cream pt-2 text-xs">
            <button
              type="button"
              onClick={() => selecionar(new Date())}
              className="font-medium text-brand-olive hover:underline"
            >
              Hoje
            </button>
            {valor && (
              <button
                type="button"
                onClick={() => {
                  setValor(null);
                  setAberto(false);
                }}
                className="text-gray-500 hover:underline"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
