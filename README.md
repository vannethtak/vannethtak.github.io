# Portfolio website

React, TypeScript, Vite, and Tailwind CSS.

## Development

Copy `.env.example` to `.env` and set `VITE_PROXY_TARGET` to the backend origin.
Leave `VITE_API_BASE_URL` empty to use the proxy. The Vite development server
forwards `/api/v1` requests to `VITE_PROXY_TARGET`, preserving the request path.
Restart the development server after changing `.env`.

```sh
npm install
npm run dev
npm run typecheck
npm run build
npm run preview
```

## GitHub Pages deployment

GitHub Pages serves static files and cannot run the Vite development proxy.
Requests to `/api/v1` on `vannethtak.github.io` therefore return 404.

The deployment workflow builds with `VITE_API_BASE_URL=https://140.245.35.136`,
so portfolio and analytics requests go directly to the backend. Override the
origin using the `VITE_API_BASE_URL` GitHub Actions repository or `github-pages`
environment variable. Use an HTTPS origin without `/api/v1` or a trailing path.
This value is public and embedded in the build; changing it requires rebuilding
and redeploying. `VITE_PROXY_TARGET` only controls the development proxy.

The backend must have a trusted HTTPS certificate and allow CORS from
`https://vannethtak.github.io`. Analytics also requires OPTIONS preflight support
for POST requests with the `Content-Type` header.

Push to `main` or manually run **Deploy to GitHub Pages** to deploy. To reproduce
the production build locally:

```sh
VITE_API_BASE_URL=https://140.245.35.136 npm run build
npm run preview
```

For hosting behind your own reverse proxy, leave `VITE_API_BASE_URL` empty and
configure that server to forward `/api/v1` to the backend.
