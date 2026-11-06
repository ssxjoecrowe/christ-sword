export async function onRequestPost(context) {
  try {
    const { password } = await context.request.json();

    if (password && password === context.env.ADMIN_PASSWORD) {
      const token = crypto.randomUUID();
      await context.env.SESSIONS.put(`session:${token}`, 'valid', { expirationTtl: 86400 });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid password' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}