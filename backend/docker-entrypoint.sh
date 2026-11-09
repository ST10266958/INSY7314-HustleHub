#!/bin/sh
# Creates a self-signed HTTPS certificate on first start (stored in the "certs" volume), then starts the API.
set -e

KEY="${SSL_KEY_PATH:-certificates/privatekey.pem}"
CRT="${SSL_CERT_PATH:-certificates/certificate.pem}"

if [ ! -f "$KEY" ] || [ ! -f "$CRT" ]; then
  echo "No TLS certificate found, generating a self-signed one for local use..."
  mkdir -p "$(dirname "$KEY")" "$(dirname "$CRT")"
  openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
    -keyout "$KEY" -out "$CRT" \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:backend,IP:127.0.0.1"
fi

exec "$@"
