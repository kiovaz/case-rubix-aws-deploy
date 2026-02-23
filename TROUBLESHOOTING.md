# 🔧 Soluções para Problemas Comuns do Docker

## ❌ Erro: Failed to fetch fonts from Google Fonts

**Problema**: Timeout ao baixar fontes durante o build do Docker

**Solução**: ✅ Já corrigido! As fontes do Google foram removidas do layout.

---

## 🚀 Como testar novamente

```powershell
# 1. Limpar tudo
docker-compose down -v
docker system prune -f

# 2. Rebuild completo
docker-compose build --no-cache

# 3. Iniciar
docker-compose up -d

# 4. Ver logs
docker-compose logs -f
```

Ou simplesmente:
```powershell
.\start.ps1
```

---

## 📋 Outros Problemas Comuns

### Erro: Port 80 already in use

```powershell
# Ver o que está usando a porta
netstat -ano | findstr :80

# Parar o processo (substitua PID)
Stop-Process -Id PID -Force

# Ou mudar a porta no .env
NGINX_PORT=8080
```

### Erro: Docker daemon not running

```powershell
# Inicie o Docker Desktop
# Aguarde alguns segundos e tente novamente
```

### Build muito lento

```powershell
# Aumentar memória do Docker Desktop:
# Settings > Resources > Memory: 4GB ou mais
```

### Container unhealthy

```powershell
# Ver logs detalhados
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx

# Reiniciar serviço específico
docker-compose restart backend
```

### Erro de permissão no volume

```powershell
# Remover volumes e recriar
docker-compose down -v
docker volume prune -f
docker-compose up -d
```

### Frontend não carrega

```powershell
# Verificar se o build terminou
docker-compose logs frontend | Select-String "ready"

# Pode levar 1-2 minutos no primeiro build
```

### API retorna 502

```powershell
# Verificar se backend está rodando
docker-compose ps

# Ver logs
docker-compose logs backend

# Verificar health
curl http://localhost/api/
```

---

## 🧹 Reset Completo

Se nada funcionar, reset total:

```powershell
# Parar tudo
docker-compose down -v

# Limpar tudo do Docker
docker system prune -af --volumes

# Rebuild do zero
docker-compose build --no-cache
docker-compose up -d
```

---

## 💡 Dicas

1. **Aguarde o build terminar**: Primeiro build pode levar 3-5 minutos
2. **Verifique o Docker Desktop**: Deve estar rodando
3. **Memória RAM**: Docker precisa de pelo menos 2GB disponível
4. **Internet**: Necessária para baixar dependências no primeiro build
5. **Antivírus**: Pode bloquear o Docker, adicione exceção se necessário

---

## 🆘 Se ainda não funcionar

Execute o diagnóstico completo:

```powershell
# Informações do sistema
docker version
docker-compose version
docker info

# Status dos containers
docker-compose ps

# Logs completos
docker-compose logs > logs.txt

# Envie o arquivo logs.txt para análise
```
