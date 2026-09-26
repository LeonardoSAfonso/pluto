#!/bin/sh
set -e

echo "=== [GEX API] Inicializando contêiner ==="

echo "[1/3] Executando migrações do PostgreSQL..."
until npx prisma migrate deploy; do
  echo "PostgreSQL ainda não está pronto para migrações, aguardando 3s..."
  sleep 3
done
echo "Migrações aplicadas com sucesso."

echo "[2/3] Executando seed de dados..."
node dist/prisma/seed.js
echo "Seed concluído com sucesso."

echo "[3/3] Iniciando servidor da API..."
exec node dist/main.js
