FROM node:26.9-alpine AS base

FROM base AS dependencies
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS production-dependencies
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 sveltekit
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=builder --chown=sveltekit:nodejs /app/build ./build
LABEL org.opencontainers.image.description="MethodConf Frontend - SvelteKit"
LABEL org.opencontainers.image.licenses=MIT
USER sveltekit
EXPOSE 3000
CMD ["node", "build"]
