#!/bin/bash
set -e

# Create Nginx HTTPS certs
NGINX_CERT_DIR="./nginx/certs"
mkdir -p "$NGINX_CERT_DIR"

# Protect the certs from github push
if [ ! -f "$NGINX_CERT_DIR/.gitkeep" ]; then
  touch "$NGINX_CERT_DIR/.gitkeep"
fi

if [ ! -f "$NGINX_CERT_DIR/localhost.pem" ]; then
  echo "Generating Nginx self-signed certs..."
  openssl req -x509 -newkey rsa:4096 -nodes -days 365 \
    -keyout "$NGINX_CERT_DIR/localhost-key-rsa.pem" \
    -out "$NGINX_CERT_DIR/localhost.pem" \
    -subj "/C=US/ST=Dev/L=42/O=Transcendence/OU=Dev/CN=localhost"
fi

# Create authserver JWT keys
AUTH_CERT_DIR="./authserver/certs"
mkdir -p "$AUTH_CERT_DIR"

# Protect the certs from github push
if [ ! -f "$AUTH_CERT_DIR/.gitkeep" ]; then
  touch "$AUTH_CERT_DIR/.gitkeep"
fi

if [ ! -f "$AUTH_CERT_DIR/private.pem" ]; then
  echo "Generating authserver key pair..."
  openssl genrsa -out "$AUTH_CERT_DIR/private.pem" 2048
  openssl rsa -in "$AUTH_CERT_DIR/private.pem" -pubout -out "$AUTH_CERT_DIR/public.pem"
fi

# Protect cert directories and private keys
chmod 700 "$NGINX_CERT_DIR"
chmod 700 "$AUTH_CERT_DIR"

# If keys exist, make sure they aren't world-readable
[ -f "$NGINX_CERT_DIR/localhost-key-rsa.pem" ] && chmod 600 "$NGINX_CERT_DIR/localhost-key-rsa.pem"
[ -f "$AUTH_CERT_DIR/private.pem" ] && chmod 600 "$AUTH_CERT_DIR/private.pem"

# Docker compose, build the containers
docker compose -f docker-compose.dev.yaml up --build #-d
