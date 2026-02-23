# 🧪 Guia de Testes

## Testes Locais com Docker

### 1. Testar localmente (Windows)

#### Opção A: PowerShell Script (Mais Fácil)
```powershell
# Iniciar aplicação
.\start.ps1

# Aguardar ~30-60 segundos para build e inicialização
# Acessar: http://localhost
```

#### Opção B: Docker Compose Manual
```powershell
# Build e iniciar
docker-compose up -d --build

# Ver logs em tempo real
docker-compose logs -f

# Quando aparecer "Servidor rodando" e "ready started server", está pronto
# Ctrl+C para sair dos logs (containers continuam rodando)
```

### 2. Verificar se está funcionando

#### Verificação Rápida
```powershell
# Health check do Nginx
curl http://localhost/health
# Deve retornar: healthy

# Health check do Backend
curl http://localhost/api/
# Deve retornar: {"message":"API Fastify está funcionando! 🙏"}

# Health check do Frontend
curl http://localhost/
# Deve retornar HTML do Next.js
```

#### Verificar containers
```powershell
# Status dos containers
docker-compose ps

# Deve mostrar 3 containers rodando:
# - rubix-nginx
# - rubix-frontend  
# - rubix-backend

# Ver logs de cada serviço
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx
```

### 3. Testar a API

#### Usando PowerShell (Windows)
```powershell
# Listar livros (GET)
curl http://localhost/api/livros

# Criar livro (POST)
$body = @{
    titulo = "O Senhor dos Anéis"
    autor = "J.R.R. Tolkien"
    preco = 59.90
    data_publicacao = "1954-07-29"
    editora = "HarperCollins"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost/api/livros -Method POST -Body $body -ContentType "application/json"

# Buscar livro por ID (GET)
curl http://localhost/api/livros/1

# Atualizar livro (PUT)
$updateBody = @{
    titulo = "O Senhor dos Anéis - Edição Especial"
    autor = "J.R.R. Tolkien"
    preco = 79.90
    data_publicacao = "1954-07-29"
    editora = "HarperCollins"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost/api/livros/1 -Method PUT -Body $updateBody -ContentType "application/json"

# Deletar livro (DELETE)
Invoke-RestMethod -Uri http://localhost/api/livros/1 -Method DELETE
```

#### Usando arquivo test-api.ps1
Crie um arquivo `test-api.ps1` e execute:
```powershell
.\test-api.ps1
```

### 4. Testar o Frontend

Abra o navegador e acesse:

- **Página inicial**: http://localhost
- **Lista de livros**: http://localhost/livros
- **Novo livro**: http://localhost/livros/novo
- **Editar livro**: http://localhost/livros/1/editar

**Teste manual:**
1. Acesse http://localhost/livros/novo
2. Preencha o formulário
3. Clique em "Cadastrar"
4. Verifique se aparece na lista
5. Clique em "Editar"
6. Modifique os dados
7. Clique em "Salvar"
8. Clique em "Deletar" e confirme

### 5. Verificar Persistência de Dados

```powershell
# Parar containers
docker-compose down

# Iniciar novamente
docker-compose up -d

# Os dados devem continuar lá (volume persistente)
curl http://localhost/api/livros
```

---

## Testes após Deploy na AWS

### 1. Testar na EC2

Substitua `SEU-IP-EC2` pelo IP público da sua instância:

```powershell
# Health check
curl http://SEU-IP-EC2/health

# API
curl http://SEU-IP-EC2/api/

# Listar livros
curl http://SEU-IP-EC2/api/livros

# Frontend (no navegador)
# http://SEU-IP-EC2
```

### 2. Verificar logs remotamente

```powershell
# SSH na instância
ssh -i sua-chave.pem ec2-user@SEU-IP-EC2

# Ver logs
cd case_rubix
docker-compose logs -f

# Ver status
docker-compose ps
```

### 3. Teste de carga básico

```powershell
# Fazer múltiplas requisições
1..10 | ForEach-Object {
    curl http://localhost/api/livros
}
```

---

## Troubleshooting

### Container não inicia

```powershell
# Ver logs detalhados
docker-compose logs

# Verificar se portas estão ocupadas
netstat -ano | findstr :80
netstat -ano | findstr :3000
netstat -ano | findstr :3333

# Rebuild sem cache
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Frontend não carrega

```powershell
# Ver logs do frontend
docker-compose logs frontend

# Verificar se o build foi concluído
docker-compose exec frontend ls -la .next
```

### Backend não responde

```powershell
# Ver logs do backend
docker-compose logs backend

# Entrar no container
docker-compose exec backend sh

# Verificar se o banco existe
ls -la /app/data/
```

### Nginx retorna 502

```powershell
# Verificar se backend e frontend estão UP
docker-compose ps

# Ver logs do nginx
docker-compose logs nginx

# Verificar configuração do nginx
docker-compose exec nginx cat /etc/nginx/conf.d/default.conf
```

---

## Testes Automatizados

### Criar Script de Teste Completo

Salve como `test-complete.ps1`:

```powershell
Write-Host "🧪 Iniciando testes completos..." -ForegroundColor Cyan

# 1. Health checks
Write-Host "`n1️⃣ Testando health checks..." -ForegroundColor Yellow
try {
    $health = curl http://localhost/health 2>$null
    Write-Host "✅ Nginx: OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Nginx: FALHOU" -ForegroundColor Red
}

try {
    $api = Invoke-RestMethod http://localhost/api/
    if ($api.message) {
        Write-Host "✅ Backend: OK" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend: FALHOU" -ForegroundColor Red
}

# 2. Testar CRUD
Write-Host "`n2️⃣ Testando operações CRUD..." -ForegroundColor Yellow

# CREATE
try {
    $livro = @{
        titulo = "Teste Automatizado"
        autor = "Robot"
        preco = 99.99
        data_publicacao = "2026-02-23"
        editora = "TestPress"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri http://localhost/api/livros -Method POST -Body $livro -ContentType "application/json"
    Write-Host "✅ CREATE: OK" -ForegroundColor Green
} catch {
    Write-Host "❌ CREATE: FALHOU" -ForegroundColor Red
}

# READ
try {
    $livros = Invoke-RestMethod http://localhost/api/livros
    Write-Host "✅ READ: OK ($($livros.Count) livros)" -ForegroundColor Green
} catch {
    Write-Host "❌ READ: FALHOU" -ForegroundColor Red
}

# 3. Containers
Write-Host "`n3️⃣ Status dos containers..." -ForegroundColor Yellow
docker-compose ps

Write-Host "`n✅ Testes concluídos!" -ForegroundColor Green
```

Execute:
```powershell
.\test-complete.ps1
```

---

## Checklist de Testes

- [ ] Containers iniciam sem erros
- [ ] Health check do Nginx retorna 200
- [ ] Health check do Backend retorna JSON
- [ ] Frontend carrega no navegador
- [ ] API lista livros
- [ ] Consegue criar novo livro
- [ ] Consegue editar livro
- [ ] Consegue deletar livro
- [ ] Dados persistem após restart
- [ ] Logs não mostram erros críticos
- [ ] Todos os 3 containers estão "healthy"

---

## Testes de Performance

```powershell
# Medir tempo de resposta
Measure-Command {
    Invoke-RestMethod http://localhost/api/livros
}

# Verificar uso de recursos
docker stats --no-stream
```

---

## Próximos Passos

Após validar localmente:

1. **Commit no Git**
   ```powershell
   git add .
   git commit -m "Adiciona configuração Docker para produção"
   git push
   ```

2. **Deploy na AWS**
   - Seguir guia em [DEPLOY.md](DEPLOY.md)
   - Testar na URL pública

3. **Configurar CI/CD**
   - GitHub Actions fará deploy automático
   - Configurar secrets no GitHub

4. **Monitoramento**
   - Configurar CloudWatch (AWS)
   - Alertas de saúde
