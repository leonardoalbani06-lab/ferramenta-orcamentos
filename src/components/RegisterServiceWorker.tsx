"use client";

import { useEffect } from "react";

// Registra o service worker do PWA assim que a página carrega no navegador.
// Fica isolado num componente client separado pra não transformar o layout
// inteiro (que é Server Component) em client.
export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Falha em registrar o service worker não deve quebrar o app —
        // o site continua funcionando normalmente, só sem o "instalável".
      });
    }
  }, []);

  return null;
}
