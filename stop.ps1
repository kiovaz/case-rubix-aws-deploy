# Script PowerShell para parar a aplicação
# Uso: .\stop.ps1

Write-Host "🛑 Parando aplicação Rubix..." -ForegroundColor Yellow

docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Aplicação parada com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao parar a aplicação" -ForegroundColor Red
    exit 1
}
