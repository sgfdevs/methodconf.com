# MethodConf

The MethodConf frontend is being migrated to SvelteKit. This branch only contains the temporary SvelteKit shell and tooling base. The old Next.js source stays in the repo as reference until the page migration layers replace it.

The Umbraco CMS lives in [`sgfdevs/cms.methodconf.com`](https://github.com/sgfdevs/cms.methodconf.com).

## Local development

1. Copy `.env.example` to `.env` when working on routes that need CMS or newsletter configuration.
2. Install dependencies and start the development server:

```bash
npm ci
npm run dev
```

Useful checks for this foundation layer:

```bash
npm run lint
npm run check
npm run test
npm run build
```

The production smoke image can be built locally with:

```bash
docker build -t methodconf.com .
```
