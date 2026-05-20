export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Configura ADMIN_KEY en las variables de entorno de tu Worker
    const ADMIN_KEY = env.ADMIN_KEY || "tu_clave_secreta_aqui";

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Manejo de preflight para CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/api/rsvp") {
      // GUARDAR DATOS (POST)
      if (request.method === "POST") {
        try {
          const data = await request.json();
          // Usamos el email como clave para evitar duplicados del mismo invitado
          const key = `rsvp:${data.email || Date.now()}`;
          await env.RSVP_DATA.put(key, JSON.stringify(data));
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: "Datos inválidos" }), { 
            status: 400, headers: corsHeaders 
          });
        }
      }

      // LEER DATOS (GET)
      if (request.method === "GET") {
        const auth = request.headers.get("Authorization");
        if (auth !== ADMIN_KEY) {
          return new Response("No autorizado", { status: 401, headers: corsHeaders });
        }

        const list = await env.RSVP_DATA.list({ prefix: "rsvp:" });
        const results = await Promise.all(
          list.keys.map(k => env.RSVP_DATA.get(k.name, { type: "json" }))
        );

        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};