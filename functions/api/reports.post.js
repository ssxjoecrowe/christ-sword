export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    if (!body.details) {
      return json({ error: 'Details required' }, 400);
    }

    await context.env.DB.prepare(
      `INSERT INTO reports (name, email, type, location, details, created_at, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`
    ).bind(
      body.name || null,
      body.email || null,
      body.type,
      body.location || null,
      body.details,
      new Date().toISOString()
    ).run();

    const key = context.env.RESEND_API_KEY;
    const to = context.env.ALERT_EMAIL;

    if (key && to) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Christ Sword <onboarding@resend.dev>',
          to: [to],
          subject: `New Watch Report: ${body.type}`,
          html: `<div style="font-family:Georgia,serif;background:#1a1a2e;color:#f0e6d2;padding:2rem;">
            <h2 style="color:#c5a059;">Christ Sword — New Report</h2>
            <p><strong>Type:</strong> ${esc(body.type)}</p>
            <p><strong>Location:</strong> ${esc(body.location || 'Not specified')}</p>
            <p><strong>Name:</strong> ${esc(body.name || 'Anonymous')}</p>
            <p><strong>Email:</strong> ${esc(body.email || 'Not provided')}</p>
            <p style="background:#16213e;padding:1rem;border-left:3px solid #c5a059;">${esc(body.details)}</p>
          </div>`,
        }),
      });
    }

    return json({ success: true });
  } catch (e) {
    return json({ error: 'Failed to save report' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}