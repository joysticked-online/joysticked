FROM oven/bun:1.3.2-alpine

RUN apk --no-cache add curl

WORKDIR /app

COPY ./package.json ./package.json
COPY ./packages/igdb/package.json ./packages/igdb/package.json
COPY ./apps/api/package.json ./apps/api/package.json

RUN bun install --frozen-lockfile

COPY ./packages/igdb ./packages/igdb
COPY ./apps/api ./apps/api

EXPOSE 8080

WORKDIR /app/apps/api
RUN bun install --frozen-lockfile

RUN bun run build

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD curl -f http://localhost:8080/health || exit 1

CMD ["./server"]
