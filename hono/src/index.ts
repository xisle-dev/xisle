import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static'; // Not for Workers, see note below

// Define your environment variables/bindings
type Bindings = {
  ASSETS: { fetch: typeof fetch }; // Cloudflare's assets binding
};

const app = new Hono<{ Bindings: Bindings }>();

// Basic API route (handled by Hono)
app.get('/map.html', (c) => {
  return c.html('Hello from Hono API!');
});

app.get('/pin.json', (c) => {
  return c.json({ message: 'Hello from Hono API!' });
});

// Serve static assets as a fallback
// This is crucial: if Cloudflare's static asset serving (via `wrangler.toml`)
// doesn't find a match, the request falls through to your Worker.
// In that case, you can explicitly try to serve the asset using env.ASSETS.fetch(request).
// Hono's `serveStatic` middleware from `@hono/node-server/serve-static`
// is *not* for Cloudflare Workers. It's for Node.js environments.
// For Cloudflare Workers, you directly use `env.ASSETS.fetch(request)`.

app.get('*', async (c) => {
  try {
    const response = await c.env.ASSETS.fetch(c.req.raw);
    // You might want to add some logic here if response.status is 404
    // and you want to serve a custom 404 page or redirect
    if (response.status === 404 && c.req.url.endsWith('/') && !c.req.url.includes('.')) {
      // If it's a directory and no index.html was found by ASSETS,
      // you could redirect to a specific SPA fallback, or serve a generic 404.
      // For single-page applications, you'd typically set `not_found_handling = "single-page-application"`
      // in `wrangler.toml` which usually returns `index.html` for all unmatched routes.
    }
    return response;
  } catch (e) {
    console.error("Error serving static asset:", e);
    return c.text('Internal Server Error', 500);
  }
});

export default app;