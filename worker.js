/**
 * Worker Reverse Proxy per yodaseo.club
 * 
 * Configurazione:
 * - Public Domain: yodaseo.club (Gestito dal Worker)
 * - Upstream Origin: yodas-eye.pages.dev (Dove risiede l'app reale)
 */

const UPSTREAM_ORIGIN = "https://yodas-eye.pages.dev";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const upstream = new URL(UPSTREAM_ORIGIN);

    // Mantiene il percorso e la query string originali
    upstream.pathname = url.pathname;
    upstream.search = url.search;

    // Clona gli header della richiesta originale
    const headers = new Headers(request.headers);
    
    // Rimuove gli header hop-by-hop che non devono essere inoltrati
    for (const h of HOP_BY_HOP) headers.delete(h);

    // Imposta gli header standard per indicare all'upstream che è dietro un proxy
    // Qui 'url.hostname' sarà 'yodaseo.club'
    headers.set("X-Forwarded-Host", url.hostname);
    headers.set("X-Forwarded-Proto", "https");
    
    // (Opzionale) Inoltra l'IP reale del visitatore
    const ip = request.headers.get("CF-Connecting-IP");
    if (ip) headers.set("X-Forwarded-For", ip);

    // IMPORTANTE: Non impostiamo manualmente l'header 'Host'.
    // Fetch userà automaticamente l'hostname di UPSTREAM_ORIGIN (yodas-eye.pages.dev)
    // per la connessione SSL/SNI, evitando l'errore "Privacy Error".
    
    const method = request.method.toUpperCase();
    const hasBody = !["GET", "HEAD"].includes(method);

    const newRequest = new Request(upstream.toString(), {
      method,
      headers,
      body: hasBody ? request.body : undefined,
      redirect: "follow",
    });

    try {
      const resp = await fetch(newRequest);

      // Pulisce gli header della risposta
      const respHeaders = new Headers(resp.headers);
      for (const h of HOP_BY_HOP) respHeaders.delete(h);

      return new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers: respHeaders,
      });
    } catch (e) {
      return new Response(`Errore Proxy Worker: ${e?.message || e}`, { status: 502 });
    }
  },
};