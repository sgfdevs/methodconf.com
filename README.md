# MethodConf

The MethodConf frontend uses Svelte 5 and SvelteKit 3. Server-rendered conference pages, schedules, speakers, sponsors, and registration content come from the [Umbraco CMS](https://github.com/sgfdevs/cms.methodconf.com). Static assets and self-hosted fonts live in `static/`; CMS media uses the streaming proxy and image optimizer.

## Local development

Use the Node version in `.nvmrc`. Copy `.env.example` to `.env`, configure your local CMS, then run:

```bash
npm ci
npm run dev
```

Vite prints the development URL. To check the app:

```bash
npm run lint
npm run check
npm test
```

`npm test` runs unit tests, builds the app, and checks routes against local CMS and newsletter fixtures. `npm run test:unit` runs only unit tests.

## Runtime configuration

SvelteKit reads the private server variables declared in `src/env.ts` at runtime. Do not expose them through public environment variables.

- `UMBRACO_BASE_URL` must point to the Umbraco API used by page loaders and the media proxy.
- `CMS_PUBLIC_URL` is the public CMS URL for the `/umbraco/` redirect.
- `SITE_URL` is the canonical frontend URL, including its scheme.
- `SEARCH_INDEXING_ENABLED=true` allows indexing. Any other value disables it.
- `NEWSLETTER_ENDPOINT` and `NEWSLETTER_LIST_ID` configure the server-side newsletter subscription request. Without both, subscriptions return a configuration error. For local work, use a fake local endpoint and list ID so form submissions cannot reach the live service.

Keep credentials in local environment files or deployment configuration, not in Git. Production Node processes need these variables in their environment; `npm start` does not load `.env` automatically.

## Production and Docker

```bash
npm run build
npm start
```

The Node adapter writes the server and assets to `build/`. Set `HOST` and `PORT` for the listener and `ORIGIN` when needed behind a reverse proxy. These adapter settings are separate from the canonical `SITE_URL`.

```bash
docker build -t methodconf.com .
docker run --rm --env-file .env -p 3000:3000 methodconf.com
```

The Dockerfile builds the app, installs production dependencies, and runs `node build` as a non-root user on port 3000. Environment files stay outside the image. The `frontend-prod` Compose profile loads `.env`; `APP_PORT` controls the host port. The `frontend-dev` profile mounts the project for development commands inside the container.

## Umbraco schemas

With `UMBRACO_BASE_URL` pointing to the intended CMS, run:

```bash
npm run generate:umbraco-api-client
```

The script reads the delivery and default OpenAPI schemas and writes `src/lib/umbraco/deliveryApiSchema.d.ts` and `src/lib/umbraco/defaultApiSchema.d.ts`. Commit schema changes when the CMS contract changes.
