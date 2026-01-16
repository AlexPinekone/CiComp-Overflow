#!/bin/bash

# -----------------------------------------------------------------------------
# Load environment variables
# -----------------------------------------------------------------------------

sed -i 's/\r$//' .env # This cleans the output if the .env file has Windows-style line endings

set -a 
source ".env" 
set +a

POSTGRES_USER="$POSTGRES_USER"
POSTGRES_NAME="$POSTGRES_DB"
POSTGRES_HOST="$POSTGRES_HOST"
POSTGRES_PORT="$POSTGRES_PORT"
export PGPASSWORD="$POSTGRES_PASSWORD"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-postgres}"

# Directory that contains the SQL files
SQL_DIR="src/database/migrations"

# -----------------------------------------------------------------------------
# Verify required environment variables
# -----------------------------------------------------------------------------
if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_NAME" ] || [ -z "$POSTGRES_HOST" ] || [ -z "$POSTGRES_PORT" ] || [ -z "$PGPASSWORD" ]; then
    echo "Error: Some required environment variables are not set."
    echo "Please set POSTGRES_USER, POSTGRES_NAME, POSTGRES_HOST, POSTGRES_PORT, and PGPASSWORD."
    exit 1
fi

# -----------------------------------------------------------------------------
# Verify if the directory exists
# -----------------------------------------------------------------------------
if [ ! -d "$SQL_DIR" ]; then
    echo "Error: The directory '$SQL_DIR' does not exist."
    exit 1
fi

# -----------------------------------------------------------------------------
# Function to execute SQL file with fallback
# -----------------------------------------------------------------------------
run_psql() {
    local file="$1"

    # Try with local psql
    if command -v psql >/dev/null 2>&1; then
        echo "Local psql command found."
        echo "Trying local psql command..."
        psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_NAME"
        echo "Local psql command found."
        if psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_NAME" -c '\q' >/dev/null 2>&1; then
        echo "Local psql can connect to the database. Using local psql to run the migration."
            psql \
                -v ON_ERROR_STOP=1 \
                -h "$POSTGRES_HOST" \
                -p "$POSTGRES_PORT" \
                -U "$POSTGRES_USER" \
                -d "$POSTGRES_NAME" \
                -f "$file"
            return $?
        fi
    fi

    # Fallback: use docker exec
    echo "Falling back to docker exec on container: $POSTGRES_CONTAINER"
    docker exec -i \
    -e PGPASSWORD="$PGPASSWORD" \
    "$POSTGRES_CONTAINER" psql \
        -v ON_ERROR_STOP=1 \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_NAME" \
        -f - < "$file" 
}

# -----------------------------------------------------------------------------
# Loop to execute each SQL file
# -----------------------------------------------------------------------------
echo "Starting execution of SQL files in '$SQL_DIR'..."

for file in $(find "$SQL_DIR" -maxdepth 1 -name "*.sql" | sort); do
    echo "Executing: $file"

    if ! run_psql "$file"; then
        echo "❌ Error: Execution of '$file' failed. Aborting."
        exit 1
    fi

    echo "Success: '$file' executed."
done

echo "All SQL files have been executed successfully."