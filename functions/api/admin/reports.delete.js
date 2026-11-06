export async function onRequestDelete(context) {
  const cookie = context.request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|; )session=([^;]+)/);

  if (!match) return unauthorized();
  const session = await context.env.SESSIONS.get(`session:${match[1]}`);
  if (session !== 'valid') return unauthorized();

  const { id } = await context.request.json();
  await context.env.DB.prepare('DELETE FROM reports WHERE id = ?').bind(id).run();

  return new Response(JSON.stringify({ success: true }), {
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