set -a 
source ".env" 
set +a

echo "Starting PostgreSQL container..."
#Print PostgreSQL environment variables from env

docker run --name postgres -e POSTGRES_DB=${POSTGRES_DB} -e POSTGRES_USER=${POSTGRES_USER} -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} -e POSTGRES_INITDB_ARGS="--auth-local=scram-sha-256 --auth-host=scram-sha-256" -d -p 5432:5432 postgres

echo "PostgreSQL container started."