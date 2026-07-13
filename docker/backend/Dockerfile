# syntax=docker/dockerfile:1
# Laravel 12 API — PHP 8.4
FROM php:8.4-cli-bookworm

# --- Debian mirror fix ---
# O'zbekistondan deb.debian.org CDN ba'zan 403 qaytaradi. Yandex mirror'ga o'tkazamiz.
# Bookworm deb822 formatini (debian.sources) ham, eski sources.list ni ham qamrab olamiz.
RUN set -eux; \
    if [ -f /etc/apt/sources.list.d/debian.sources ]; then \
        sed -i 's|deb.debian.org|mirror.yandex.ru|g; s|security.debian.org|mirror.yandex.ru|g' /etc/apt/sources.list.d/debian.sources; \
    fi; \
    if [ -f /etc/apt/sources.list ]; then \
        sed -i 's|deb.debian.org|mirror.yandex.ru|g; s|security.debian.org|mirror.yandex.ru|g' /etc/apt/sources.list; \
    fi

# --- System dependencies ---
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        git unzip zip curl \
        libpq-dev libzip-dev libxml2-dev \
        libpng-dev libjpeg62-turbo-dev libfreetype6-dev \
        libonig-dev; \
    rm -rf /var/lib/apt/lists/*

# --- PHP extensions ---
# pdo_pgsql/pgsql: PostgreSQL, zip/gd/mbstring: PhpSpreadsheet, bcmath, pcntl: queue worker
RUN set -eux; \
    docker-php-ext-configure gd --with-freetype --with-jpeg; \
    docker-php-ext-install -j"$(nproc)" pdo_pgsql pgsql zip gd mbstring bcmath pcntl; \
    pecl install redis; \
    docker-php-ext-enable redis

# --- Composer ---
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Build context = ./api (see docker-compose.yml)
# Install PHP deps first (better layer caching)
COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-scripts --no-autoloader --prefer-dist

# Copy application
COPY . ./

RUN set -eux; \
    composer dump-autoload --optimize; \
    mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache; \
    chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000

# Dev default: artisan serve. Prod (deploy.sh) runs php-fpm/nginx or a supervised worker.
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
