FROM oven/bun:1.3.2-alpine

WORKDIR /app

COPY ./package.json ./package.json
COPY ./packages/igdb/package.json ./packages/igdb/package.json
COPY ./apps/api/package.json ./apps/api/package.json

RUN bun install --frozen-lockfile

COPY ./packages/igdb ./packages/igdb
COPY ./apps/api ./apps/api

EXPOSE 3333

WORKDIR /app/apps/api
RUN bun install --frozen-lockfile

RUN bun run build

CMD ["./server"]
