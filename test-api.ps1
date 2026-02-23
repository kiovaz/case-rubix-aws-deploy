# Script de testes da API
# Uso: .\test-api.ps1

$baseUrl = "http://localhost/api"

Write-Host "🧪 Testando API Rubix..." -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod "$baseUrl/"
    Write-Host "✅ API está online: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ API não está respondendo" -ForegroundColor Red
    exit 1
}

# 2. Listar livros
Write-Host "`n2. Listando livros..." -ForegroundColor Yellow
try {
    $livros = Invoke-RestMethod "$baseUrl/livros"
    Write-Host "✅ Encontrados $($livros.Count) livros" -ForegroundColor Green
    $livros | Format-Table -AutoSize
} catch {
    Write-Host "❌ Erro ao listar livros" -ForegroundColor Red
}

# 3. Criar novo livro
Write-Host "`n3. Criando novo livro..." -ForegroundColor Yellow
try {
    $novoLivro = @{
        titulo = "O Guia do Mochileiro das Galáxias"
        autor = "Douglas Adams"
        preco = 39.90
        data_publicacao = "1979-10-12"
        editora = "Arqueiro"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "$baseUrl/livros" -Method POST -Body $novoLivro -ContentType "application/json"
    Write-Host "✅ Livro criado: $($result.message)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Livro pode já existir ou erro ao criar" -ForegroundColor Yellow
}

# 4. Buscar livro por ID
Write-Host "`n4. Buscando livro ID=1..." -ForegroundColor Yellow
try {
    $livro = Invoke-RestMethod "$baseUrl/livros/1"
    Write-Host "✅ Livro encontrado:" -ForegroundColor Green
    $livro | Format-List
} catch {
    Write-Host "⚠️ Livro ID=1 não encontrado" -ForegroundColor Yellow
}

# 5. Atualizar livro
Write-Host "`n5. Atualizando livro ID=1..." -ForegroundColor Yellow
try {
    $updateLivro = @{
        titulo = "O Guia do Mochileiro das Galáxias - Edição Especial"
        autor = "Douglas Adams"
        preco = 49.90
        data_publicacao = "1979-10-12"
        editora = "Arqueiro"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "$baseUrl/livros/1" -Method PUT -Body $updateLivro -ContentType "application/json"
    Write-Host "✅ Livro atualizado: $($result.message)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erro ao atualizar livro" -ForegroundColor Yellow
}

# 6. Listar novamente para ver mudanças
Write-Host "`n6. Listando livros novamente..." -ForegroundColor Yellow
try {
    $livros = Invoke-RestMethod "$baseUrl/livros"
    Write-Host "✅ Lista atualizada:" -ForegroundColor Green
    $livros | Format-Table -AutoSize
} catch {
    Write-Host "❌ Erro ao listar livros" -ForegroundColor Red
}

Write-Host "`n✅ Testes concluídos!" -ForegroundColor Green
Write-Host ""
Write-Host "Para testar DELETE manualmente, execute:" -ForegroundColor Cyan
Write-Host 'Invoke-RestMethod -Uri "http://localhost/api/livros/1" -Method DELETE' -ForegroundColor White
