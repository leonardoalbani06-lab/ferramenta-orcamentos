import { cookies } from "next/headers";

const COOKIE_NAME = "representanteId";

export async function getRepresentanteId() {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function setRepresentanteId(id: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, id, { httpOnly: true, path: "/", sameSite: "lax" });
}

export async function clearRepresentanteId() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
