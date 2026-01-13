#!/bin/bash

# Build and run script for single container deployment with SPA
# Usage: ./deploy.sh

set -e

REGISTRY=${REGISTRY:-"your-registry.com"}
VERSION=${VERSION:-"latest"}

echo "Building and deploying single container with external services..."
echo "Registry: $REGISTRY"
echo "Version: $VERSION"

# Function to build and run application
build_and_run() {
    echo "Building application (backend + frontend SPA)..."
    docker build -t $REGISTRY/ticket-app:$VERSION .
    
    if [ ! -z "$PUSH_REGISTRY" ]; then
        echo "Pushing to registry..."
        docker push $REGISTRY/ticket-app:$VERSION
    fi
    
    # Determine DB_HOST if not set (default to Docker host IP on Linux)
    DB_HOST=${DB_HOST:-"172.17.0.1"}

    echo "Running application with external services..."
    docker run -d \
        --name ticket-app \
        -e DB_CONNECTION=pgsql \
        -e DB_HOST=${DB_HOST} \
        -e DB_PORT=${DB_PORT:-5440} \
        -e DB_DATABASE=${POSTGRES_DATABASE:-"ticketing"} \
        -e DB_USERNAME=${POSTGRES_USERNAME:-"postgres"} \
        -e DB_PASSWORD=${POSTGRES_PASSWORD:-"password"} \
        -e REDIS_HOST=${REDIS_HOST:-"172.17.0.1"} \
        -e REDIS_PORT=${REDIS_PORT:-6380} \
        -e REDIS_PASSWORD=${REDIS_PASSWORD} \
        -e MAIL_HOST=${MAIL_HOST} \
        -e MAIL_PORT=${MAIL_PORT:-587} \
        -e MAIL_USERNAME=${MAIL_USERNAME} \
        -e MAIL_PASSWORD=${MAIL_PASSWORD} \
        -e MAIL_ENCRYPTION=${MAIL_ENCRYPTION:-tls} \
        -e MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS} \
        -e LOG_CHANNEL=stderr \
        -e APP_URL=${APP_URL:-"https://tukutix.com"} \
        -e NEXT_PUBLIC_API_URL=${APP_URL:-"https://tukutix.com"} \
        -e ASSET_URL=${ASSET_URL:-"https://tukutix.com"} \
        -p 8081:80 \
        $REGISTRY/ticket-app:$VERSION
}

# Function to stop existing container
stop_existing() {
    if [ "$(docker ps -aq -f name=ticket-app)" ]; then
        echo "Removing existing container..."
        docker rm -f ticket-app
    fi
}

# Main execution
stop_existing
build_and_run

echo "Deployment complete!"
echo "Application running on port 80 (serves both frontend and API)"
echo "API endpoints available at /api/*"
echo "Frontend SPA served at /*"