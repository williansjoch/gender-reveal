export async function onRequest(context) {
  const { request, env } = context;
  const ADMIN_KEY = env.ADMIN_KEY;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // POST /api/rsvp — guardar voto en KV
  if (request.method === "POST") {
    try {
      const data = await request.json();
      if (!data.email || !data.name) {
        return new Response(JSON.stringify({ error: "Datos incompletos" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const key = `rsvp:${data.email.toLowerCase().trim()}`; // Usamos el email como clave para evitar duplicados
      await env.RSVP_DATA.put(key, JSON.stringify({
        name:      data.name,
        email:     data.email.toLowerCase().trim(),
        guests:    data.guests   || 1,
        status:    data.status   || "attending",
        teamVote:  data.teamVote || null,
        timestamp: data.timestamp || new Date().toISOString(),
      }));
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Error al guardar o datos inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // GET /api/rsvp — sin auth: solo stats públicos | con auth: lista completa
  if (request.method === "GET") {
    const auth = request.headers.get("Authorization");

    const list = await env.RSVP_DATA.list({ prefix: "rsvp:" });
    const entries = await Promise.all(
      list.keys.map(k => env.RSVP_DATA.get(k.name, { type: "json" }))
    );
    const valid = entries.filter(Boolean);

    // Sin clave de admin → devolver solo conteos agregados (sin datos personales)
    if (!auth || auth !== ADMIN_KEY) { // Si no hay auth o no coincide, devuelve solo conteos
      const counts = { guerrero: 0, guerrera: 0, total: valid.length };
      for (const e of valid) {
        if (e.teamVote === "Guerrero") counts.guerrero++;
        if (e.teamVote === "Guerrera") counts.guerrera++;
      }
      return new Response(JSON.stringify(counts), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Con clave de admin → lista completa
    return new Response(JSON.stringify(valid), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response("Not Found", { status: 404, headers: corsHeaders });
}
