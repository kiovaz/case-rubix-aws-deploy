# Script PowerShell para iniciar a aplicação com Docker
# Uso: .\start.ps1

Write-Host "🚀 Iniciando aplicação Rubix com Docker..." -ForegroundColor Green

# Verificar se Docker está instalado
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker não encontrado. Por favor, instale o Docker Desktop." -ForegroundColor Red
    Write-Host "   Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar se Docker está rodando
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker Desktop." -ForegroundColor Red
    exit 1
}

# Criar arquivo .env se não existir
if (-not (Test-Path .env)) {
    Write-Host "📝 Criando arquivo .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
}

# Parar containers antigos se existirem
Write-Host "🛑 Parando containers antigos..." -ForegroundColor Yellow
docker-compose down 2>$null

# Build e iniciar
Write-Host "🔨 Building e iniciando containers..." -ForegroundColor Cyan
docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Aplicação iniciada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Acesse: http://localhost" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Comandos úteis:" -ForegroundColor Yellow
    Write-Host "  - Ver logs:        docker-compose logs -f" -ForegroundColor White
    Write-Host "  - Parar:           docker-compose down" -ForegroundColor White
    Write-Host "  - Reiniciar:       docker-compose restart" -ForegroundColor White
    Write-Host "  - Status:          docker-compose ps" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Erro ao iniciar a aplicação" -ForegroundColor Red
    Write-Host "   Execute: docker-compose logs" -ForegroundColor Yellow
    exit 1
}
