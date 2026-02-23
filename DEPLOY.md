# 🐳 Deploy Docker na AWS

Este guia explica como fazer o deploy da aplicação Rubix na AWS usando Docker e Nginx.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Conta AWS ativa
- Conhecimento básico de EC2 ou ECS

## 🏗️ Arquitetura

A aplicação é composta por 3 serviços Docker:

- **Frontend**: Next.js (porta 3000 interna)
- **Backend**: Fastify + SQLite (porta 3333 interna)
- **Nginx**: Reverse proxy (porta 80 exposta)

```
Internet → Nginx (80) → Frontend (3000)
                     ↘ Backend (3333) via /api
```

## 🚀 Opções de Deploy na AWS

### Opção 1: EC2 (Mais Simples)

#### 1. Criar Instância EC2

1. Acesse o Console AWS → EC2
2. Lance uma instância:
   - AMI: Amazon Linux 2023 ou Ubuntu 22.04
   - Tipo: t2.micro (Free Tier) ou t3.small (recomendado)
   - Security Group: Liberar portas 22 (SSH), 80 (HTTP), 443 (HTTPS)

#### 2. Conectar via SSH

```bash
ssh -i sua-chave.pem ec2-user@seu-ip-publico
```

#### 3. Instalar Docker

```bash
# Amazon Linux 2023
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Sair e entrar novamente para aplicar permissões
exit
```

#### 4. Clonar/Transferir o Projeto

```bash
# Opção 1: Git
git clone seu-repositorio.git
cd case_rubix

# Opção 2: SCP (do seu computador)
scp -i sua-chave.pem -r ./case_rubix ec2-user@seu-ip:/home/ec2-user/
```

#### 5. Configurar Variáveis de Ambiente

```bash
cd case_rubix
cp .env.example .env
nano .env
```

Ajuste o arquivo `.env`:
```bash
NGINX_PORT=80
NEXT_PUBLIC_API_URL=/api
CORS_ORIGIN=*  # ou seu domínio específico
```

#### 6. Iniciar Aplicação

```bash
docker-compose up -d --build
```

#### 7. Verificar Status

```bash
docker-compose ps
docker-compose logs -f
```

Acesse: `http://seu-ip-publico`

---

### Opção 2: ECS (Elastic Container Service)

#### 1. Preparar Imagens Docker

```bash
# Build das imagens
docker-compose build

# Login no ECR (Elastic Container Registry)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin SEU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Criar repositórios ECR
aws ecr create-repository --repository-name rubix-frontend
aws ecr create-repository --repository-name rubix-backend
aws ecr create-repository --repository-name rubix-nginx

# Tag e push das imagens
docker tag case_rubix-frontend:latest SEU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rubix-frontend:latest
docker push SEU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rubix-frontend:latest

docker tag case_rubix-backend:latest SEU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rubix-backend:latest
docker push SEU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rubix-backend:latest

# Para o nginx, precisamos criar uma imagem customizada
docker build -t rubix-nginx -f nginx/Dockerfile.nginx nginx/
docker tag rubix-nginx:latest SEU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rubix-nginx:latest
docker push SEU_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rubix-nginx:latest
```

#### 2. Criar Task Definition no ECS

Use o arquivo `ecs-task-definition.json` incluído no projeto.

```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

#### 3. Criar Cluster e Service

```bash
# Criar cluster
aws ecs create-cluster --cluster-name rubix-cluster

# Criar service
aws ecs create-service --cluster rubix-cluster --service-name rubix-service --task-definition rubix-app --desired-count 1
```

---

### Opção 3: Lightsail (Mais Econômico)

1. Acesse AWS Lightsail
2. Crie uma instância de container
3. Configure usando o `docker-compose.yml`
4. Deploy automático

---

## 🔧 Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f

# Reiniciar serviços
docker-compose restart

# Parar tudo
docker-compose down

# Rebuild sem cache
docker-compose build --no-cache

# Ver uso de recursos
docker stats

# Limpar volumes e rebuild
docker-compose down -v
docker-compose up -d --build
```

## 🔒 Segurança

### 1. SSL/HTTPS com Let's Encrypt

Instale o Certbot:

```bash
sudo yum install -y certbot python3-certbot-nginx  # Amazon Linux
sudo apt install -y certbot python3-certbot-nginx  # Ubuntu
```

Obtenha certificado:

```bash
sudo certbot --nginx -d seu-dominio.com
```

### 2. Firewall

```bash
# Amazon Linux / RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Ubuntu
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 📊 Monitoramento

### CloudWatch (AWS)

Configure logs do Docker para CloudWatch:

```bash
# Instalar CloudWatch Agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```

### Health Checks

O Nginx expõe um endpoint de health check:

```bash
curl http://localhost/health
# Deve retornar: healthy
```

## 🔄 CI/CD com GitHub Actions

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ec2-user/case_rubix
            git pull
            docker-compose down
            docker-compose up -d --build
```

## 💾 Backup do Banco de Dados

O SQLite está em um volume Docker persistente. Para backup:

```bash
# Backup manual
docker-compose exec backend cp /app/data/livros.db /app/backup-$(date +%Y%m%d).db

# Script de backup automático (crontab)
0 2 * * * docker-compose -f /home/ec2-user/case_rubix/docker-compose.yml exec -T backend cp /app/data/livros.db /app/backup-$(date +\%Y\%m\%d).db
```

## 🐛 Troubleshooting

### Containers não iniciam
```bash
docker-compose logs
docker-compose ps
```

### Porta 80 já em uso
```bash
sudo lsof -i :80
sudo systemctl stop apache2  # ou nginx, httpd
```

### Problemas de permissão
```bash
sudo chown -R $(whoami):$(whoami) .
```

### Frontend não conecta ao Backend
Verifique as variáveis de ambiente e o CORS no backend.

## 📞 Suporte

Para problemas ou dúvidas:
- Verifique os logs: `docker-compose logs`
- Revise o arquivo `.env`
- Confirme que as portas estão liberadas no Security Group da AWS

---

**Última atualização**: Fevereiro 2026
