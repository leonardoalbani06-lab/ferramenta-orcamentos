// Service worker mínimo do PWA Olivapel.
//
// Existe só pra satisfazer o requisito de instalação (Android/Chrome só
// oferecem "Adicionar à tela inicial" como app se existir um service worker
// registrado com um handler de fetch). De propósito, ele NÃO guarda nada em
// cache: este app depende de dados sempre atualizados do servidor (login,
// clientes, orçamentos — informação real de clientes), então cachear
// respostas aqui só arriscaria mostrar dado desatualizado ou guardar
// informação sensível no dispositivo sem necessidade.
//
// Se no futuro quisermos acelerar o carregamento, dá pra evoluir isso pra
// cachear só arquivos estáticos (ícones, fontes) — nunca páginas ou respostas
// de API que carregam dado de cliente.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Não intercepta nada — toda requisição segue normal, direto pra rede.
});
