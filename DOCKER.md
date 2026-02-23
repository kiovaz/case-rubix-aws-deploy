# 🐳 Docker Quick Start

## Arquivos Docker criados

Sua aplicação foi dockerizada com sucesso! Os seguintes arquivos foram criados:

- `backend/Dockerfile` - Dockerfile do backend
- `backend/.dockerignore` - Arquivos ignorados no build do backend
- `frontend/Dockerfile` - Dockerfile do frontend
- `frontend/.dockerignore` - Arquivos ignorados no build do frontend
- `nginx/nginx.conf` - Configuração do Nginx
- `nginx/Dockerfile` - Dockerfile do Nginx
- `docker-compose.yml` - Orquestração dos serviços
- `docker-compose.prod.yml` - Configuração para produção
- `.env` - Variáveis de ambiente
- `.env.example` - Exemplo de variáveis de ambiente
- `Makefile` - Comandos úteis

## Como usar

### 1. Rodar localmente com Docker

```bash
# Copiar variáveis de ambiente
cp .env.example .env

# Build e iniciar
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Acessar: http://localhost
```

### 2. Comandos úteis (Makefile)

```bash
make help          # Ver todos os comandos
make build         # Build das imagens
make up            # Iniciar containers
make down          # Parar containers
make logs          # Ver logs
make health        # Verificar saúde
make backup        # Backup do banco
```

### 3. Deploy na AWS

Consulte o arquivo `DEPLOY.md` para instruções completas de deploy.

**Deploy rápido EC2:**
```bash
# Do seu computador local
make deploy-ec2 SSH_HOST=ec2-user@seu-ip
```

## Arquitetura

```
Internet → Nginx (80) → Frontend (3000)
                     ↘ Backend (3333) → SQLite
```

- **Nginx**: Reverse proxy na porta 80
- **Frontend**: Next.js na porta 3000 (interno)
- **Backend**: Fastify na porta 3333 (interno)
- **SQLite**: Banco persistido em volume Docker
