#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
  -- Crear usuario de lectura (APP_DB_USER)
  CREATE USER $APP_DB_USER WITH PASSWORD '$APP_DB_PASS';
  GRANT CONNECT ON DATABASE postgres TO $APP_DB_USER;
  
  -- Crear usuario de creación de tablas (CreacionTablas_user)
  CREATE USER $CreacionTablas_user WITH PASSWORD '$CreacionTablas_pass';
  GRANT CONNECT ON DATABASE postgres TO $CreacionTablas_user;
  
  -- Permitir crear bases de datos
  ALTER USER $CreacionTablas_user CREATEDB;

  \c postgres

  -- Permisos para APP_DB_USER en schema public
  GRANT USAGE ON SCHEMA public TO $APP_DB_USER;
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO $APP_DB_USER;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO $APP_DB_USER;

  -- Permisos para CreacionTablas_user en schema public
  GRANT CREATE, USAGE ON SCHEMA public TO $CreacionTablas_user;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $CreacionTablas_user;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $CreacionTablas_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO $CreacionTablas_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO $CreacionTablas_user;
  
  -- Timeout de seguridad
  ALTER ROLE $CreacionTablas_user SET statement_timeout = '15s';
  ALTER ROLE $APP_DB_USER SET statement_timeout = '15s';

EOSQL

echo "✅ Usuarios y permisos configurados correctamente"