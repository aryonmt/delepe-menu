# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
# Placeholder only: image build has no Postgres. Settings.get maps P1001/P2021
# to null. Runtime Compose supplies the real DATABASE_URL.
ENV DATABASE_URL="postgresql://delepe:delepe@127.0.0.1:1/delepe_build"
ENV SESSION_SECRET="docker-image-build-session-secret-32"
ENV STORAGE_ROOT="/tmp/storage"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV STORAGE_ROOT=/data/storage
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/* \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/package.json /app/pnpm-lock.yaml /app/tsconfig.json ./
COPY --from=build --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nextjs:nodejs /app/src ./src
COPY --from=build --chown=nextjs:nodejs /app/scripts/admin-reset.ts ./scripts/admin-reset.ts
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh /app/docker-entrypoint.sh

ENV HOME=/home/nextjs
ENV COREPACK_HOME=/home/nextjs/.cache/node/corepack
RUN mkdir -p /data/storage /home/nextjs/.cache/node/corepack \
  && chown nextjs:nodejs /data/storage \
  && chown -R nextjs:nodejs /home/nextjs \
  && chmod +x /app/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
