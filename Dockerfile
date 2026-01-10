FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY . .
RUN bun build --compile --minify --sourcemap \
    --target=bun \
    --outfile=server \
    ./src/index.ts

FROM oven/bun:1 AS runner
WORKDIR /app

COPY --from=builder /app/server /app/server
COPY --from=builder /app/node_modules /app/node_modules
COPY drizzle_sqlite /app/drizzle_sqlite
COPY drizzle_sqlite_memory /app/drizzle_sqlite_memory
COPY package.json /app/package.json

CMD ["./server"]
