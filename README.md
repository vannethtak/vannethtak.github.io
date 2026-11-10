# Portfolio website

React, TypeScript, Vite, and Tailwind CSS.

## Development

Copy `.env.example` to `.env` and set `VITE_PROXY_TARGET` to the backend origin.
The Vite development server forwards `/api` requests to this target, preserving
the request path. Restart the development server after changing `.env`.

```sh
npm install
npm run dev
npm run typecheck
npm run build
npm run preview
```

For production, configure the hosting server to forward `/api` to the backend.
The Vite development proxy is not included in the static build.
