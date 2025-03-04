
  /*
  This service worker implementation adds CORS headers to archive.today responses, enabling cross-origin access from the proxy page.

  Cross-Origin Resource Sharing (CORS)

  The same-origin policy presents challenges when fetching resources from archive.today. Several mitigation strategies exist:

  - Proxy Service: Implement server-side fetching through a CORS proxy
  - Content Rewriting: Process responses to rewrite same-origin URLs
  - Meta Tag Override: Use `<meta name="referrer" content="no-referrer">` to prevent referrer leakage

  A hybrid approach using service workers enables advanced caching and transformation.
  */

  self.addEventListener('fetch', (event) => {
    if (event.request.url.startsWith('https://archive.today/')) {
      event.respondWith(handleRequest(event.request));
    }
  });
  
  async function handleRequest(request) {
    const response = await fetch(request);
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  }