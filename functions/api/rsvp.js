const ADMIN_KEY = 'gordito1234';

export async function onRequestGet({ request, env }) {
  const auth = (request.headers.get('Authorization') || '').trim();

  const { results } = await env.DB.prepare(
    'SELECT * FROM asistencias ORDER BY id DESC'
  ).all();

  // Sin clave → resumen público de votos (barra de porcentajes del formulario)
  if (auth !== ADMIN_KEY) {
    const guerrero = results.filter(r => r.equipo === 'Guerrero').length;
    const guerrera = results.filter(r => r.equipo === 'Guerrera').length;
    return Response.json({ guerrero, guerrera });
  }

  // Con clave admin → array completo para el dashboard
  const data = results.map(r => ({
    name:      r.nombre,
    email:     r.email,
    guests:    r.cantidad,
    status:    r.asistencia,
    teamVote:  r.equipo,
    timestamp: r.fecha,
  }));

  return Response.json(data);
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { name, email, guests, status, teamVote, timestamp } = body;

  await env.DB.prepare(
    'INSERT INTO asistencias (nombre, email, cantidad, asistencia, equipo, fecha) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(
    name      || '',
    email     || '',
    parseInt(guests) || 1,
    status    || '',
    teamVote  || '',
    timestamp || new Date().toISOString()
  ).run();

  return Response.json({ ok: true }, { status: 201 });
}
