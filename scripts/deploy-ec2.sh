#!/bin/bash

# Script para deploy rápido na EC2 via SSH
# Uso: ./scripts/deploy-ec2.sh usuario@ip-publico

set -e

if [ -z "$1" ]; then
    echo "Uso: $0 usuario@ip-ec2"
    echo "Exemplo: $0 ec2-user@52.123.45.67"
    exit 1
fi

EC2_HOST=$1
PROJECT_DIR="case_rubix"

echo "🚀 Iniciando deploy para $EC2_HOST..."

# Sincronizar arquivos (exceto node_modules, .git, etc)
echo "📦 Sincronizando arquivos..."
rsync -avz --exclude 'node_modules' \
           --exclude '.git' \
           --exclude 'backend/dist' \
           --exclude 'frontend/.next' \
           --exclude '*.db' \
           --exclude '*.log' \
           ./ $EC2_HOST:~/$PROJECT_DIR/

# Executar comandos remotos
echo "🐳 Executando deploy no servidor..."
ssh $EC2_HOST << 'EOF'
    cd case_rubix
    
    # Parar containers antigos
    docker-compose down
    
    # Rebuild e iniciar
    docker-compose up -d --build
    
    # Aguardar inicialização
    echo "⏳ Aguardando serviços iniciarem..."
    sleep 10
    
    # Verificar status
    docker-compose ps
    
    echo "✅ Deploy concluído!"
    echo "🌐 Aplicação disponível em: http://$(curl -s ifconfig.me)"
EOF

echo "🎉 Deploy finalizado com sucesso!"
