.PHONY: help build up down logs restart clean test backup

# Variáveis
COMPOSE_FILE=docker-compose.yml
COMPOSE_PROD_FILE=docker-compose.prod.yml

help: ## Mostra esta mensagem de ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Comandos de desenvolvimento
build: ## Build das imagens Docker
	docker-compose -f $(COMPOSE_FILE) build

up: ## Inicia os containers em modo development
	docker-compose -f $(COMPOSE_FILE) up -d

down: ## Para e remove os containers
	docker-compose -f $(COMPOSE_FILE) down

logs: ## Mostra logs dos containers
	docker-compose -f $(COMPOSE_FILE) logs -f

restart: ## Reinicia os containers
	docker-compose -f $(COMPOSE_FILE) restart

ps: ## Lista os containers em execução
	docker-compose -f $(COMPOSE_FILE) ps

# Comandos de produção
build-prod: ## Build das imagens para produção
	docker-compose -f $(COMPOSE_PROD_FILE) build --no-cache

up-prod: ## Inicia os containers em modo produção
	docker-compose -f $(COMPOSE_PROD_FILE) up -d

down-prod: ## Para os containers de produção
	docker-compose -f $(COMPOSE_PROD_FILE) down

logs-prod: ## Mostra logs dos containers de produção
	docker-compose -f $(COMPOSE_PROD_FILE) logs -f

# Manutenção
clean: ## Remove containers, volumes e imagens
	docker-compose -f $(COMPOSE_FILE) down -v
	docker system prune -f

clean-all: ## Remove TUDO (cuidado!)
	docker-compose -f $(COMPOSE_FILE) down -v --rmi all
	docker system prune -af --volumes

backup: ## Faz backup do banco de dados
	@echo "Criando backup do banco de dados..."
	@mkdir -p backups
	docker-compose exec -T backend cp /app/data/livros.db /app/backups/backup-$$(date +%Y%m%d-%H%M%S).db
	@echo "Backup criado em backups/"

# Testes
test-backend: ## Executa testes do backend
	cd backend && pnpm test

test-frontend: ## Executa testes do frontend
	cd frontend && pnpm test

# Deploy
deploy-ec2: ## Deploy para EC2 (requer SSH_HOST configurado)
	@bash scripts/deploy-ec2.sh $(SSH_HOST)

push-ecr: ## Push das imagens para ECR (requer AWS_ACCOUNT_ID)
	@bash scripts/push-to-ecr.sh

# Utilitários
shell-backend: ## Abre shell no container do backend
	docker-compose exec backend sh

shell-frontend: ## Abre shell no container do frontend
	docker-compose exec frontend sh

shell-nginx: ## Abre shell no container do nginx
	docker-compose exec nginx sh

health: ## Verifica health dos serviços
	@echo "Verificando health dos serviços..."
	@curl -f http://localhost/health && echo "✅ Nginx OK" || echo "❌ Nginx falhou"
	@curl -f http://localhost/api/ && echo "✅ Backend OK" || echo "❌ Backend falhou"
	@curl -f http://localhost/ && echo "✅ Frontend OK" || echo "❌ Frontend falhou"
