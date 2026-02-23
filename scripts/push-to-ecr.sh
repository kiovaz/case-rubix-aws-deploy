#!/bin/bash

# Script para fazer push das imagens para ECR
# Configurar AWS CLI antes: aws configure

set -e

# Configurações (AJUSTAR CONFORME SEU AMBIENTE)
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "❌ Defina a variável AWS_ACCOUNT_ID"
    echo "Exemplo: export AWS_ACCOUNT_ID=123456789012"
    exit 1
fi

echo "🔐 Fazendo login no ECR..."
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $ECR_REGISTRY

echo "📦 Criando repositórios ECR (se não existirem)..."
aws ecr describe-repositories --repository-names rubix-frontend --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name rubix-frontend --region $AWS_REGION

aws ecr describe-repositories --repository-names rubix-backend --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name rubix-backend --region $AWS_REGION

aws ecr describe-repositories --repository-names rubix-nginx --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name rubix-nginx --region $AWS_REGION

echo "🏗️ Buildando imagens..."
docker-compose build

echo "🏷️ Tagueando imagens..."
docker tag case_rubix-backend:latest $ECR_REGISTRY/rubix-backend:latest
docker tag case_rubix-frontend:latest $ECR_REGISTRY/rubix-frontend:latest

# Build da imagem customizada do nginx
docker build -t rubix-nginx nginx/
docker tag rubix-nginx:latest $ECR_REGISTRY/rubix-nginx:latest

echo "⬆️ Fazendo push das imagens..."
docker push $ECR_REGISTRY/rubix-backend:latest
docker push $ECR_REGISTRY/rubix-frontend:latest
docker push $ECR_REGISTRY/rubix-nginx:latest

echo "✅ Imagens enviadas com sucesso!"
echo ""
echo "📝 Próximos passos:"
echo "1. Atualizar ecs-task-definition.json com o ID da conta: $AWS_ACCOUNT_ID"
echo "2. Registrar task definition: aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json"
echo "3. Criar/atualizar serviço ECS"
