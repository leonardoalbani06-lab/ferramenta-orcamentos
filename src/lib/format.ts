const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatMoney(centavos: number): string {
  return currencyFormatter.format(centavos / 100);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDate(date: Date): string {
  const dia = pad2(date.getDate());
  const mes = pad2(date.getMonth() + 1);
  const ano = pad2(date.getFullYear() % 100);
  return `${dia}/${mes}/${ano}`;
}

export function formatDateTime(date: Date): string {
  const hora = pad2(date.getHours());
  const minuto = pad2(date.getMinutes());
  return `${formatDate(date)} ${hora}:${minuto}`;
}

export function formatDecimal(n: number, decimals: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

// `previsaoEntrega` é gravado como string ISO "AAAA-MM-DD" (sem hora, vem
// do mini calendário em DatePickerField). Formata pra exibição em pt-BR
// sem passar por `new Date(iso)` — isso interpretaria como UTC e podia
// voltar um dia a menos no fuso do Brasil.
export function formatDateIso(iso: string | null | undefined): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}
