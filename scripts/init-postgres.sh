#!/bin/bash
set -e

# Create multiple databases for microservices
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE esports_nexus_users;
    CREATE DATABASE esports_nexus_tournaments;
    CREATE DATABASE esports_nexus_teams;
    CREATE DATABASE esports_nexus_games;
    CREATE DATABASE esports_nexus_analytics;
    CREATE DATABASE esports_nexus_payments;
    
    GRANT ALL PRIVILEGES ON DATABASE esports_nexus_users TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE esports_nexus_tournaments TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE esports_nexus_teams TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE esports_nexus_games TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE esports_nexus_analytics TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE esports_nexus_payments TO postgres;
EOSQL

echo "Multiple databases created successfully!"