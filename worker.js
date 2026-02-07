/**
 * Worker Reverse Proxy per yodaseo.club
 * 
 * FIX SSL & HOST:
 * - Gestisce correttamente SNI e Host header per Cloudflare Pages.
 * - Risolve problemi di routing dell'upstream.
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

    // 1. Replica percorso e query string
    upstream.pathname = url.pathname;
    upstream.search = url.search;

    // 2. Clona gli header originali
    const headers = new Headers(request.headers);
    
    // 3. Rimuove header hop-by-hop (non necessari per il proxy)
    for (const h of HOP_BY_HOP) headers.delete(h);

    // 4. FIX CRITICO: Sovrascrivi l'header 'Host'
    // La richiesta originale ha Host: yodaseo.club.
    // L'upstream (Pages) si aspetta Host: yodas-eye.pages.dev.
    // Se non lo cambiamo, Pages rifiuterà la connessione (404 o 522).
    headers.set("Host", upstream.hostname);

    // 5. Header informativi per l'applicazione
    headers.set("X-Forwarded-Host", url.hostname);
    headers.set("X-Forwarded-Proto", "https");
    
    const ip = request.headers.get("CF-Connecting-IP");
    if (ip) headers.set("X-Forwarded-For", ip);

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

      // Pulisce header risposta
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
