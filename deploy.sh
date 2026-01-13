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
    
    echo "Running application with external services..."
    docker run -d \
        --name ticket-app \
        -e POSTGRES_HOST=${POSTGRES_HOST} \
        -e POSTGRES_PORT=${POSTGRES_PORT:-5432} \
        -e POSTGRES_DATABASE=${POSTGRES_DATABASE} \
        -e POSTGRES_USERNAME=${POSTGRES_USERNAME} \
        -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
        -e REDIS_HOST=${REDIS_HOST} \
        -e REDIS_PORT=${REDIS_PORT:-6379} \
        -e REDIS_PASSWORD=${REDIS_PASSWORD} \
        -e MAIL_HOST=${MAIL_HOST} \
        -e MAIL_PORT=${MAIL_PORT:-587} \
        -e MAIL_USERNAME=${MAIL_USERNAME} \
        -e MAIL_PASSWORD=${MAIL_PASSWORD} \
        -e MAIL_ENCRYPTION=${MAIL_ENCRYPTION:-tls} \
        -e MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS} \
        -e APP_URL=${APP_URL:-"https://tukutix.com"} \
        -e NEXT_PUBLIC_API_URL=${APP_URL:-"https://tukutix.com"} \
        -e ASSET_URL=${ASSET_URL:-"https://tukutix.com"} \
        -p 80:80 \
        $REGISTRY/ticket-app:$VERSION
}

# Function to stop existing container
stop_existing() {
    if docker ps -q -f name=ticket-app | grep -q .; then
        echo "Stopping existing container..."
        docker stop ticket-app
        docker rm ticket-app
    fi
}

# Main execution
stop_existing
build_and_run

echo "Deployment complete!"
echo "Application running on port 80 (serves both frontend and API)"
echo "API endpoints available at /api/*"
echo "Frontend SPA served at /*"