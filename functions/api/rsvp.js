const ADMIN_KEY = 'gordito1234';

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

  const auth = (request.headers.get('Authorization') || '').trim();
  const isAdmin = auth === ADMIN_KEY;

  // ── POST: guardar RSVP en D1 ──────────────────────────────
  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch {
      return Response.json({ error: 'JSON inválido' }, { status: 400, headers: cors });
    }
    const { name, email, guests, status, teamVote, timestamp } = body;
    if (!name || !email) {
      return Response.json({ error: 'Nombre y email son obligatorios' }, { status: 400, headers: cors });
    }
    try {
      await env.DB.prepare(
        'INSERT INTO asistencias (nombre, email, cantidad, asistencia, equipo, fecha) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(
        name,
        email.toLowerCase().trim(),
        parseInt(guests) || 1,
        status    || 'attending',
        teamVote  || '',
        timestamp || new Date().toISOString()
      ).run();
      return Response.json({ ok: true }, { status: 201, headers: cors });
    } catch (err) {
      return Response.json({ error: 'Error al guardar: ' + err.message }, { status: 500, headers: cors });
    }
  }

  // ── GET: stats públicos o lista completa (admin) ──────────
  if (request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT * FROM asistencias ORDER BY id DESC'
    ).all();

    if (!isAdmin) {
      const guerrero = results.filter(r => r.equipo === 'Guerrero').length;
      const guerrera = results.filter(r => r.equipo === 'Guerrera').length;
      return Response.json({ guerrero, guerrera, total: results.length }, { headers: cors });
    }

    const data = results.map(r => ({
      name:      r.nombre,
      email:     r.email,
      guests:    r.cantidad,
      status:    r.asistencia,
      teamVote:  r.equipo,
      timestamp: r.fecha,
    }));
    return Response.json(data, { headers: cors });
  }

  // ── DELETE: borrar registro por email o todos ─────────────
  if (request.method === 'DELETE') {
    if (!isAdmin) {
      return Response.json({ error: 'No autorizado' }, { status: 401, headers: cors });
    }
    const url   = new URL(request.url);
    const email = url.searchParams.get('email');

    if (email) {
      await env.DB.prepare('DELETE FROM asistencias WHERE email = ?')
        .bind(email.toLowerCase().trim()).run();
      return Response.json({ ok: true, deleted: email }, { headers: cors });
    } else {
      await env.DB.prepare('DELETE FROM asistencias').run();
      return Response.json({ ok: true, deleted: 'all' }, { headers: cors });
    }
  }

  return new Response('Not Found', { status: 404, headers: cors });
}
