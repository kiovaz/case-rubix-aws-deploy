# Multi-stage build usando Debian (mais estável que Alpine)
FROM node:20-slim AS builder

# Instalar dependências para compilar módulos nativos
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Forçar rebuild do better-sqlite3 para garantir compilação nativa
RUN cd /app/node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3 && npm run build-release

# Copiar código fonte
COPY . .

# Build da aplicação
RUN pnpm build

# Imagem final de produção
FROM node:20-slim

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar arquivos de dependências para referência
COPY package.json pnpm-lock.yaml ./

# Copiar os node_modules compilados do builder (especialmente better-sqlite3)
# Isso garante que módulos nativos estão compilados para Linux
COPY --from=builder /app/node_modules ./node_modules

# Copiar código compilado do estágio anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/schema.sql ./dist/db/

# Criar diretório para o banco de dados
RUN mkdir -p /app/data

# Expor a porta da aplicação
EXPOSE 3333

# Variáveis de ambiente padrão
ENV PORT=3333
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["pnpm", "start"]
