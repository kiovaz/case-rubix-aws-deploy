# Script para resolver problemas e rebuild do Docker
# Uso: .\fix-docker.ps1

Write-Host "🔧 Corrigindo problemas do Docker..." -ForegroundColor Cyan
Write-Host ""

# 1. Parar containers
Write-Host "1️⃣ Parando containers..." -ForegroundColor Yellow
docker-compose down -v 2>$null

# 2. Limpar cache do Docker
Write-Host "2️⃣ Limpando cache do Docker..." -ForegroundColor Yellow
docker system prune -f 2>$null

# 3. Rebuild sem cache
Write-Host "3️⃣ Fazendo rebuild completo (pode demorar 3-5 minutos)..." -ForegroundColor Yellow
docker-compose build --no-cache

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # 4. Iniciar containers
    Write-Host "4️⃣ Iniciando containers..." -ForegroundColor Yellow
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Containers iniciados!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⏳ Aguardando serviços ficarem prontos (30 segundos)..." -ForegroundColor Cyan
        Start-Sleep -Seconds 30
        
        Write-Host ""
        Write-Host "📊 Status dos containers:" -ForegroundColor Yellow
        docker-compose ps
        
        Write-Host ""
        Write-Host "🌐 Aplicação disponível em: http://localhost" -ForegroundColor Green
        Write-Host ""
        Write-Host "Comandos úteis:" -ForegroundColor Yellow
        Write-Host "  - Ver logs: docker-compose logs -f" -ForegroundColor White
        Write-Host "  - Testar API: .\test-api.ps1" -ForegroundColor White
        Write-Host "  - Testar tudo: .\test-complete.ps1" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Erro ao iniciar containers" -ForegroundColor Red
        Write-Host "Execute: docker-compose logs" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "❌ Erro no build" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis causas:" -ForegroundColor Yellow
    Write-Host "  1. Docker Desktop não está rodando" -ForegroundColor White
    Write-Host "  2. Falta de memória (configure 4GB+ no Docker Desktop)" -ForegroundColor White
    Write-Host "  3. Problemas de conexão com internet" -ForegroundColor White
    Write-Host ""
    Write-Host "Execute para ver o erro completo:" -ForegroundColor Yellow
    Write-Host "  docker-compose build" -ForegroundColor White
    exit 1
}
