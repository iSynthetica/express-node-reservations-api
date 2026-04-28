#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3200}"
CSV_FILE="${CSV_FILE:-./data/Amenity.csv}"

log() {
  printf '\n==> %s\n' "$1"
}

require() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

assert_status() {
  local expected="$1"
  local actual="$2"
  local title="$3"
  if [[ "$expected" != "$actual" ]]; then
    echo "FAIL: $title (expected $expected, got $actual)" >&2
    exit 1
  fi
  echo "PASS: $title -> $actual"
}

run_request() {
  local expected="$1"
  local title="$2"
  shift 2

  local tmp_body
  tmp_body="$(mktemp)"
  local status
  status="$(curl -sS -o "$tmp_body" -w "%{http_code}" "$@")"
  assert_status "$expected" "$status" "$title"
  rm -f "$tmp_body"
}

require curl
require sed

log "Using BASE_URL=$BASE_URL"
log "Using CSV_FILE=$CSV_FILE"

if [[ ! -f "$CSV_FILE" ]]; then
  echo "CSV file not found: $CSV_FILE" >&2
  exit 1
fi

log "Public routes"
run_request 200 "GET /health" "$BASE_URL/health"
run_request 200 "GET /" "$BASE_URL/"
run_request 200 "GET /metrics" "$BASE_URL/metrics"

log "Required reservations routes"
run_request 200 "GET /amenities/:id/reservations" \
  "$BASE_URL/api/v1/amenities/10/reservations?date=1592179200000"
run_request 200 "GET /users/:id/reservations" \
  "$BASE_URL/api/v1/users/1/reservations"
run_request 404 "GET missing amenity" \
  "$BASE_URL/api/v1/amenities/999999/reservations?date=1592179200000"

USER_NAME="smoke-user-$(date +%s)"
PASSWORD="secret123"

log "Auth happy path"
run_request 201 "POST /auth/register" \
  -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER_NAME\",\"password\":\"$PASSWORD\"}"

login_body="$(mktemp)"
login_status="$(
  curl -sS -o "$login_body" -w "%{http_code}" \
    -X POST "$BASE_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USER_NAME\",\"password\":\"$PASSWORD\"}"
)"
assert_status 200 "$login_status" "POST /auth/login"
TOKEN="$(sed -n 's/.*"token":"\([^"]*\)".*/\1/p' "$login_body")"
rm -f "$login_body"
if [[ -z "$TOKEN" ]]; then
  echo "FAIL: token was not extracted from login response" >&2
  exit 1
fi
echo "PASS: token extracted"

log "Auth negative cases"
run_request 409 "POST /auth/register duplicate" \
  -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER_NAME\",\"password\":\"$PASSWORD\"}"
run_request 401 "POST /auth/login wrong password" \
  -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER_NAME\",\"password\":\"wrongpass\"}"
run_request 400 "POST /auth/register invalid payload" \
  -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"ab","password":"123"}'

log "CSV protected route"
run_request 401 "POST /csv/parse no token" \
  -X POST "$BASE_URL/api/v1/csv/parse" \
  -F "file=@$CSV_FILE;type=text/csv"
run_request 401 "POST /csv/parse bad token" \
  -X POST "$BASE_URL/api/v1/csv/parse" \
  -H "Authorization: Bearer bad.token.value" \
  -F "file=@$CSV_FILE;type=text/csv"
run_request 400 "POST /csv/parse missing file" \
  -X POST "$BASE_URL/api/v1/csv/parse" \
  -H "Authorization: Bearer $TOKEN"
run_request 200 "POST /csv/parse valid token + file" \
  -X POST "$BASE_URL/api/v1/csv/parse" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$CSV_FILE;type=text/csv"

log "Smoke E2E completed successfully"
