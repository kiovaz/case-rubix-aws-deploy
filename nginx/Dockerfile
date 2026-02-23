# Dockerfile customizado para Nginx com configuração embutida
FROM nginx:alpine

# Copiar configuração customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Comando padrão do nginx
CMD ["nginx", "-g", "daemon off;"]
