// Общие брони для обеих копий сайта (forlia.pages.dev и forlia.website.yandexcloud.net) — та же логика,
// что в functions/api/reservations.js (Cloudflare), только база — YDB. Функция вызывается напрямую по
// https://functions.yandexcloud.net/<id> с доменов сайта, поэтому сама отвечает на CORS.
const { Driver, TokenAuthService, TypedValues, TypedData, withRetries, RetryParameters } = require('ydb-sdk');

const MAX_PER_GUEST = 2;
const MAX_GIFT_ID = 99;
const ORIGINS = ['https://forlia.website.yandexcloud.net', 'https://forlia.pages.dev', 'http://localhost:8788'];

// В базу ходим IAM-токеном сервисного аккаунта функции: облако передаёт свежий токен в каждый вызов
// (context.token), и handler подставляет его сюда. Локально — токен из YDB_ACCESS_TOKEN_CREDENTIALS.
const auth = new TokenAuthService(process.env.YDB_ACCESS_TOKEN_CREDENTIALS || '');

// Драйвер живёт между вызовами, пока экземпляр функции не остыл.
let driver;
async function db() {
  if (!driver) {
    driver = new Driver({ connectionString: process.env.YDB_CONNECTION_STRING, authService: auth });
    if (!(await driver.ready(10000))) {
      driver = null;
      throw new Error('YDB is not ready');
    }
  }
  return driver.tableClient;
}

// Сессия с повтором: withSessionRetry повторяет только при потере сессии, а конфликт транзакций
// (Aborted) и временную недоступность повторяет withRetries.
const RETRY = new RetryParameters({ maxRetries: 8 });
const withSession = async (fn) => {
  const tables = await db();
  return withRetries(() => tables.withSession(fn), RETRY);
};

const header = (event, name) => {
  const key = Object.keys(event.headers || {}).find((k) => k.toLowerCase() === name);
  return key ? event.headers[key] : '';
};

function getToken(event) {
  const token = header(event, 'x-guest-token');
  return /^[A-Za-z0-9-]{16,64}$/.test(token) ? token : null;
}

function readGiftId(event) {
  let body = null;
  try {
    body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body);
  } catch {}
  const id = body && body.id;
  return Number.isInteger(id) && id >= 0 && id <= MAX_GIFT_ID ? id : null;
}

const params = (id, token) => ({ $id: TypedValues.int32(id), $token: TypedValues.utf8(token) });

async function rows(session, txControl) {
  const { resultSets } = await session.executeQuery('SELECT gift_id, token FROM reservations;', {}, txControl);
  return TypedData.createNativeObjects(resultSets[0]).map((r) => ({ id: r.gift_id, token: r.token }));
}

// Автор вишлиста видит только факт брони, поэтому токен гостя наружу не отдаём.
const snapshot = (list, token) => ({
  mine: list.filter((r) => r.token === token).map((r) => r.id),
  others: list.filter((r) => r.token !== token).map((r) => r.id)
});

// Проверка лимита и занятости и запись — один запрос в serializable-транзакции: если два гостя жмут
// одновременно, YDB отменит одну из транзакций (Aborted), а withSession повторит её уже с новыми данными.
const RESERVE = `DECLARE $id AS Int32; DECLARE $token AS Utf8;
  $ok = (SELECT COUNT(*) FROM reservations WHERE token = $token) < ${MAX_PER_GUEST}
    AND (SELECT COUNT(*) FROM reservations WHERE gift_id = $id) = 0;
  SELECT $ok AS ok;
  UPSERT INTO reservations (gift_id, token, created_at)
  SELECT $id AS gift_id, $token AS token, CurrentUtcTimestamp() AS created_at
  FROM AS_TABLE(AsList(AsStruct(1 AS one))) WHERE $ok;`;

async function reserve(token, id) {
  return withSession(async (session) => {
    const { resultSets } = await session.executeQuery(RESERVE, params(id, token), {
      beginTx: { serializableReadWrite: {} },
      commitTx: true
    });
    const ok = TypedData.createNativeObjects(resultSets[0])[0].ok;
    const state = snapshot(await rows(session, { beginTx: { onlineReadOnly: {} }, commitTx: true }), token);
    if (ok) return state;
    const error = state.mine.length >= MAX_PER_GUEST && !state.others.includes(id) ? 'limit' : 'taken';
    return { error, ...state };
  });
}

async function cancel(token, id) {
  return withSession(async (session) => {
    await session.executeQuery(
      `DECLARE $id AS Int32; DECLARE $token AS Utf8;
       DELETE FROM reservations WHERE gift_id = $id AND token = $token;`,
      params(id, token),
      { beginTx: { serializableReadWrite: {} }, commitTx: true }
    );
    return snapshot(await rows(session, { beginTx: { onlineReadOnly: {} }, commitTx: true }), token);
  });
}

async function current(token) {
  return withSession(async (session) =>
    snapshot(await rows(session, { beginTx: { onlineReadOnly: {} }, commitTx: true }), token)
  );
}

module.exports.handler = async (event, context) => {
  if (context && context.token) auth.token = context.token.access_token;
  const origin = header(event, 'origin');
  const cors = {
    'access-control-allow-origin': ORIGINS.includes(origin) ? origin : ORIGINS[0],
    'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
    'access-control-allow-headers': 'content-type, x-guest-token',
    'access-control-max-age': '86400',
    vary: 'origin'
  };
  const json = (body, statusCode = 200) => ({
    statusCode,
    headers: { ...cors, 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    body: JSON.stringify(body)
  });
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const token = getToken(event);
  if (event.httpMethod === 'GET') return token ? json(await current(token)) : json({ error: 'bad_token' }, 400);

  const id = readGiftId(event);
  if (!token || id === null) return json({ error: 'bad_request' }, 400);
  if (event.httpMethod === 'POST') {
    const result = await reserve(token, id);
    return json(result, result.error ? 409 : 200);
  }
  if (event.httpMethod === 'DELETE') return json(await cancel(token, id));
  return json({ error: 'method_not_allowed' }, 405);
};
