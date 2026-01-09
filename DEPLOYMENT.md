# Deployment Guide

This guide describes how to deploy the Ticketing application (Laravel Backend + Next.js Frontend) to a production server using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on the server.
- Git (optional, if pulling code).
- A domain name pointing to the server (for Nginx/SSL).

## Configuration

1.  **Environment Variables**:
    - Ensure `apps/backend/.env` exists and contains production values.
    - Set `APP_ENV=production`, `APP_DEBUG=false`, and configure `DB_*` to match the docker-compose service (`DB_HOST=postgres`, `DB_PASSWORD=password`, etc.).
    - Configure `REDIS_HOST=redis`.

2.  **Frontend Config**:
    - The frontend Dockerfile uses `NEXT_PUBLIC_API_URL` environment variable at BUILD time or RUN time.
    - In `docker-compose.prod.yml`, ensuring `NEXT_PUBLIC_API_URL` points to the public API URL (e.g., `https://api.tukutix.com` or `http://localhost/api` if simple proxy).
    - Checks `apps/frontend/next.config.ts` has `output: "standalone"`.

## Deploying

1.  **Build and Start Services**:
    Run the following command from the project root:

    ```bash
    docker compose -f docker-compose.prod.yml up -d --build
    ```

    This will:
    - Build the Backend image (PHP-FPM).
    - Build the Frontend image (Next.js Standalone).
    - Start Postgres, Redis, Backend, Frontend, and Nginx.

2.  **Run Migrations**:
    Once services are up, run the database migrations:

    ```bash
    docker compose -f docker-compose.prod.yml exec app php artisan migrate --force
    ```

    (Optional) Seed data if needed:
    ```bash
    docker compose -f docker-compose.prod.yml exec app php artisan db:seed --force
    ```

3.  **Storage Permissions**:
    Ensure storage is writable:
    ```bash
    docker compose -f docker-compose.prod.yml exec app chown -R www-data:www-data /var/www/storage
    ```

## Accessing the Application

- **Frontend**: Accessed via `http://localhost` (or your domain). Nginx proxies port 80 to Frontend:3000.
- **Backend API**: Accessed via `http://localhost/api`. Nginx proxies `/api` to Backend:9000 (FastCGI).

## SSL (Optional but Recommended)

For SSL, you can use Let's Encrypt with Certbot on the host machine and proxy to port 8000, or run a separate Nginx/Traefik container handling SSL termination.

## Troubleshooting

- **Logs**:
    ```bash
    docker compose -f docker-compose.prod.yml logs -f
    ```
- **Rebuild**:
    ```bash
    docker compose -f docker-compose.prod.yml up -d --build --force-recreate
    ```
