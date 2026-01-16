#!/bin/bash

# Directory where migration files will be saved
MIGRATIONS_DIR="src/database/migrations"

# -----------------------------------------------------------------------------
# Function to create the directory if it doesn't exist
# -----------------------------------------------------------------------------
create_migrations_dir() {
    if [ ! -d "$MIGRATIONS_DIR" ]; then
        echo "Migration directory does not exist. Creating: $MIGRATIONS_DIR"
        mkdir -p "$MIGRATIONS_DIR"
    fi
}

# -----------------------------------------------------------------------------
# Function to generate the filename
# -----------------------------------------------------------------------------
generate_filename() {
    # Prompt the user for the migration name
    read -p "Enter a name for the migration (e.g. create_users_table): " MIGRATION_NAME

    # Check if a name was provided
    if [ -z "$MIGRATION_NAME" ]; then
        echo "Migration name cannot be empty. Aborting."
        exit 1
    fi

    # Generate a timestamp in YYYYMMDDHHMMSS format
    TIMESTAMP=$(date +"%Y%m%d%H%M%S")

    # Combine the timestamp and name to create the filename
    FILENAME="${TIMESTAMP}_${MIGRATION_NAME}.sql"
    echo "Generating migration file: $FILENAME"
}

# -----------------------------------------------------------------------------
# Main function
# -----------------------------------------------------------------------------
main() {
    create_migrations_dir
    generate_filename

    FILE_PATH="$MIGRATIONS_DIR/$FILENAME"

    # Create the migration file with a basic template
    cat << EOF > "$FILE_PATH"
-- SQL Migration: $MIGRATION_NAME

--
-- "Up" Migration: changes to apply
--
-- Use this section to create tables, add columns, etc.
--
-- For example:
-- CREATE TABLE users (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL
-- );

---

--
-- "Down" Migration: changes to revert
--
-- Use this section to revert the changes from the "up" migration.
-- For example:
-- DROP TABLE users;
--
EOF

    echo "Migration file successfully created at: $FILE_PATH"
}

# Run the main function
main