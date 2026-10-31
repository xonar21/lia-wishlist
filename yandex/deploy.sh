#!/usr/bin/env bash
# Выкладка версии сайта в Yandex Cloud: ./yandex/deploy.sh [site|api] — без аргумента выкладываются обе части.
#   site — dist/ в бакет forlia (https://forlia.website.yandexcloud.net)
#   api  — yandex/function как новая версия функции forlia-api (https://functions.yandexcloud.net/<FUNCTION_ID>)
# Нужен настроенный yc (yc init). Функция выкладывается через REST API, а не через yc serverless:
# в yc 1.41 эти команды ходят на служебный сервер по IPv6 и в сети без IPv6 не работают.
set -euo pipefail
cd "$(dirname "$0")/.."
YC=${YC:-$(command -v yc || echo ~/yandex-cloud/bin/yc)}
BUCKET=forlia
FUNCTION_ID=d4e7cj924hm5bo1cl0pk
SERVICE_ACCOUNT_ID=ajem56fpmr3geiidh191
YDB='grpcs://ydb.serverless.yandexcloud.net:2135?database=/ru-central1/b1gp4r298ippaa8kbjhe/etn0unlbuf7idmmlroiu'

site() {
  # тип файла выставляем сами: без этого css, js и svg уходят как text/plain и браузер их не применяет
  (cd dist && find . -type f | sed 's|^\./||') | while read -r f; do
    case "$f" in
      *.html) t='text/html; charset=utf-8'; c='no-cache' ;;
      *.css) t='text/css; charset=utf-8'; c='no-cache' ;;
      *.js) t='text/javascript; charset=utf-8'; c='no-cache' ;;
      *.svg) t='image/svg+xml'; c='max-age=3600' ;;
      *.webp) t='image/webp'; c='max-age=3600' ;;
      *.png) t='image/png'; c='max-age=3600' ;;
      *.ico) t='image/x-icon'; c='max-age=3600' ;;
      *) echo "неизвестный тип файла: $f" >&2; exit 1 ;;
    esac
    "$YC" storage s3 cp "dist/$f" "s3://$BUCKET/$f" --content-type "$t" --cache-control "$c" >/dev/null
    echo "  $f"
  done
}

api() {
  local dir zip token op
  dir=$(mktemp -d); zip="$dir/function.zip"
  (cd yandex/function && python3 -m zipfile -c "$zip" index.js package.json package-lock.json)
  token=$("$YC" iam create-token)
  # зависимости (ydb-sdk) облако ставит само по package-lock.json
  op=$(python3 - "$zip" "$FUNCTION_ID" "$SERVICE_ACCOUNT_ID" "$YDB" <<'EOF' | curl -sS -X POST -H "Authorization: Bearer $token" -H 'content-type: application/json' -d @- https://serverless-functions.api.cloud.yandex.net/functions/v1/versions
import base64, json, sys
zip, fn, sa, ydb = sys.argv[1:5]
print(json.dumps({
    'functionId': fn, 'runtime': 'nodejs22', 'entrypoint': 'index.handler',
    'resources': {'memory': 128 * 1024 * 1024}, 'executionTimeout': '10s', 'serviceAccountId': sa,
    'environment': {'YDB_CONNECTION_STRING': ydb},
    'content': base64.b64encode(open(zip, 'rb').read()).decode(),
}))
EOF
  )
  rm -rf "$dir"
  op=$(python3 -c 'import json,sys; d=json.loads(sys.argv[1]); print(d.get("id") or sys.exit(sys.argv[1]))' "$op")
  echo "  сборка версии, операция $op"
  for _ in $(seq 1 60); do
    local res; res=$(curl -sS -H "Authorization: Bearer $token" "https://operation.api.cloud.yandex.net/operations/$op")
    if python3 -c 'import json,sys; sys.exit(0 if json.loads(sys.argv[1]).get("done") else 1)' "$res"; then
      python3 -c 'import json,sys; d=json.loads(sys.argv[1]); print("  ошибка:", d["error"]) if "error" in d else print("  версия", d["response"]["id"], "готова")' "$res"
      return
    fi
    sleep 5
  done
  echo "  сборка не закончилась за 5 минут, проверь операцию $op" >&2
}

case "${1:-all}" in
  site) site ;;
  api) api ;;
  all) api; site ;;
  *) echo "использование: $0 [site|api]" >&2; exit 1 ;;
esac
