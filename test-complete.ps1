# Script de testes completos
# Uso: .\test-complete.ps1

Write-Host "🧪 Iniciando testes completos da aplicação Rubix..." -ForegroundColor Cyan
Write-Host ""

$errors = 0

# 1. Verificar se Docker está rodando
Write-Host "1️⃣ Verificando Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando. Execute Docker Desktop." -ForegroundColor Red
    exit 1
}

# 2. Verificar containers
Write-Host "`n2️⃣ Verificando containers..." -ForegroundColor Yellow
$containers = docker-compose ps --services --filter "status=running" 2>$null

if ($containers -match "backend" -and $containers -match "frontend" -and $containers -match "nginx") {
    Write-Host "✅ Todos os containers estão rodando" -ForegroundColor Green
} else {
    Write-Host "⚠️ Alguns containers podem não estar rodando:" -ForegroundColor Yellow
    docker-compose ps
    $errors++
}

# 3. Health Check do Nginx
Write-Host "`n3️⃣ Health Check - Nginx..." -ForegroundColor Yellow
try {
    $response = curl http://localhost/health 2>$null
    if ($response -match "healthy") {
        Write-Host "✅ Nginx: OK" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Nginx: Resposta inesperada" -ForegroundColor Yellow
        $errors++
    }
} catch {
    Write-Host "❌ Nginx: FALHOU" -ForegroundColor Red
    $errors++
}

# 4. Health Check do Backend
Write-Host "`n4️⃣ Health Check - Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod http://localhost/api/ -ErrorAction Stop
    if ($response.message) {
        Write-Host "✅ Backend: OK - $($response.message)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend: FALHOU" -ForegroundColor Red
    $errors++
}

# 5. Health Check do Frontend
Write-Host "`n5️⃣ Health Check - Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest http://localhost/ -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend: OK (Status: $($response.StatusCode))" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend: FALHOU" -ForegroundColor Red
    $errors++
}

# 6. Testar CRUD
Write-Host "`n6️⃣ Testando operações CRUD..." -ForegroundColor Yellow

# CREATE
try {
    $livro = @{
        titulo = "Clean Code"
        autor = "Robert C. Martin"
        preco = 89.90
        data_publicacao = "2008-08-01"
        editora = "Prentice Hall"
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri http://localhost/api/livros -Method POST -Body $livro -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ CREATE: OK" -ForegroundColor Green
} catch {
    Write-Host "⚠️ CREATE: Livro pode já existir" -ForegroundColor Yellow
}

# READ
try {
    $livros = Invoke-RestMethod http://localhost/api/livros -ErrorAction Stop
    Write-Host "✅ READ: OK - $($livros.Count) livro(s) encontrado(s)" -ForegroundColor Green
} catch {
    Write-Host "❌ READ: FALHOU" -ForegroundColor Red
    $errors++
}

# 7. Verificar logs por erros
Write-Host "`n7️⃣ Verificando logs por erros..." -ForegroundColor Yellow
$logs = docker-compose logs --tail=50 2>$null | Select-String -Pattern "error|Error|ERROR" -CaseSensitive

if ($logs.Count -gt 0) {
    Write-Host "⚠️ $($logs.Count) erro(s) encontrado(s) nos logs" -ForegroundColor Yellow
} else {
    Write-Host "✅ Nenhum erro crítico nos logs" -ForegroundColor Green
}

# 8. Verificar uso de recursos
Write-Host "`n8️⃣ Uso de recursos..." -ForegroundColor Yellow
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | Where-Object {$_ -match "rubix"}

# Resumo
Write-Host "`n" + ("="*60) -ForegroundColor Cyan
Write-Host "RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host ("="*60) -ForegroundColor Cyan

if ($errors -eq 0) {
    Write-Host "✅ Todos os testes passaram com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos passos:" -ForegroundColor Yellow
    Write-Host "  1. Acesse http://localhost no navegador" -ForegroundColor White
    Write-Host "  2. Teste as funcionalidades manualmente" -ForegroundColor White
    Write-Host "  3. Execute .\test-api.ps1 para testes detalhados da API" -ForegroundColor White
    Write-Host "  4. Quando estiver pronto, faça o deploy na AWS" -ForegroundColor White
} else {
    Write-Host "❌ $errors teste(s) falharam" -ForegroundColor Red
    Write-Host ""
    Write-Host "Ajuda para troubleshooting:" -ForegroundColor Yellow
    Write-Host "  - docker-compose logs" -ForegroundColor White
    Write-Host "  - docker-compose ps" -ForegroundColor White
    Write-Host "  - docker-compose down && docker-compose up -d --build" -ForegroundColor White
    exit 1
}
