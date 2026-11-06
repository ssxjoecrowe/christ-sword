export async function onRequestGet(context) {
  const cookie = context.request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|; )session=([^;]+)/);

  if (!match) return unauthorized();
  const session = await context.env.SESSIONS.get(`session:${match[1]}`);
  if (session !== 'valid') return unauthorized();

  const { results } = await context.env.DB.prepare(
    'SELECT * FROM reports ORDER BY created_at DESC'
  ).all();

  return new Response(JSON.stringify({ reports: results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function unauthorized() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}