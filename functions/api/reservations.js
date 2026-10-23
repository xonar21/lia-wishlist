const MAX_PER_GUEST = 2;
const MAX_GIFT_ID = 99;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });

function getToken(request) {
  const token = request.headers.get('x-guest-token') || '';
  return /^[A-Za-z0-9-]{16,64}$/.test(token) ? token : null;
}

async function readGiftId(request) {
  const body = await request.json().catch(() => null);
  const id = body && body.id;
  return Number.isInteger(id) && id >= 0 && id <= MAX_GIFT_ID ? id : null;
}

// Автор вишлиста видит только факт брони, поэтому токен гостя наружу не отдаём.
async function snapshot(db, token) {
  const { results } = await db.prepare('SELECT gift_id, token FROM reservations').all();
  return {
    mine: results.filter((row) => row.token === token).map((row) => row.gift_id),
    others: results.filter((row) => row.token !== token).map((row) => row.gift_id)
  };
}

export async function onRequestGet({ request, env }) {
  const token = getToken(request);
  if (!token) return json({ error: 'bad_token' }, 400);
  return json(await snapshot(env.DB, token));
}

export async function onRequestPost({ request, env }) {
  const token = getToken(request);
  const id = await readGiftId(request);
  if (!token || id === null) return json({ error: 'bad_request' }, 400);

  // Один атомарный INSERT: проверка лимита и занятости подарка не может разъехаться при гонке.
  const result = await env.DB
    .prepare(
      `INSERT INTO reservations (gift_id, token)
       SELECT ?1, ?2 WHERE (SELECT COUNT(*) FROM reservations WHERE token = ?2) < ?3
       ON CONFLICT(gift_id) DO NOTHING`
    )
    .bind(id, token, MAX_PER_GUEST)
    .run();

  if (result.meta.changes === 0) {
    const state = await snapshot(env.DB, token);
    const error = state.mine.length >= MAX_PER_GUEST && !state.others.includes(id) ? 'limit' : 'taken';
    return json({ error, ...state }, 409);
  }
  return json(await snapshot(env.DB, token));
}

export async function onRequestDelete({ request, env }) {
  const token = getToken(request);
  const id = await readGiftId(request);
  if (!token || id === null) return json({ error: 'bad_request' }, 400);

  await env.DB.prepare('DELETE FROM reservations WHERE gift_id = ?1 AND token = ?2').bind(id, token).run();
  return json(await snapshot(env.DB, token));
}
