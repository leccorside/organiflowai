#!/bin/sh
# Executado pelo entrypoint do MySQL apenas na PRIMEIRA inicialização do volume.
# Cria bancos auxiliares com acesso restrito ao usuário da aplicação:
#   <MYSQL_DATABASE>_test   → testes de integração (TEST_DATABASE_URL)
#   <MYSQL_DATABASE>_shadow → shadow database do `prisma migrate dev` (SHADOW_DATABASE_URL)
set -eu

for suffix in test shadow; do
  db="${MYSQL_DATABASE}_${suffix}"
  mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<SQL
CREATE DATABASE IF NOT EXISTS \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
GRANT ALL PRIVILEGES ON \`${db}\`.* TO '${MYSQL_USER}'@'%';
SQL
done
