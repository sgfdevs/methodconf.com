# MethodConf

The Next.js frontend for [MethodConf](https://www.methodconf.com/). The Umbraco CMS lives in [`sgfdevs/cms.methodconf.com`](https://github.com/sgfdevs/cms.methodconf.com).

## Local Development

1. Copy `.env.example` to `.env` and configure the CMS and site URLs.
2. Install dependencies and start the development server:

```bash
npm ci
npm run dev
```

The production image can be built locally with:

```bash
docker build \
  --build-arg NEXT_PUBLIC_UMBRACO_BASE_URL=https://cms.methodconf.com/ \
  --build-arg NEXT_PUBLIC_SITE_URL=https://www.methodconf.com/ \
  -t methodconf.com .
```
