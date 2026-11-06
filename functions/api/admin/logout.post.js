export async function onRequestPost(context) {
  const cookie = context.request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|; )session=([^;]+)/);
  if (match) await context.env.SESSIONS.delete(`session:${match[1]}`);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'session=; Path=/; HttpOnly; Max-Age=0',
    },
  });
}