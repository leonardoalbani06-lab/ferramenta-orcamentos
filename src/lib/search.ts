const DIACRITICOS = /[̀-ͯ]/g;

export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(DIACRITICOS, "").toLowerCase();
}

export function contemBusca(campo: string | null | undefined, termo: string): boolean {
  if (!termo) return true;
  if (!campo) return false;
  return normalizar(campo).includes(normalizar(termo));
}

export function contemBuscaNumerica(campo: string | number, termo: string): boolean {
  if (!termo) return true;
  const soDigitos = termo.replace(/\D/g, "");
  if (!soDigitos) return contemBusca(String(campo), termo);
  return String(campo).replace(/\D/g, "").includes(soDigitos);
}
