-- ════════════════════════════════════════════════════════
--  Revelación de Género — Estructura de datos (KV)
--  Almacenamiento: Cloudflare KV (binding: RSVP_DATA)
--
--  Formato de claves KV:
--    rsvp:<email>   →  objeto JSON con los campos abajo
--
--  Este archivo es REFERENCIA únicamente.
--  No se ejecuta — KV no usa SQL.
-- ════════════════════════════════════════════════════════

-- Estructura de cada entrada KV (JSON):
-- {
--   "name":      "string   — nombre completo",
--   "email":     "string   — email (lowercase, único, es la clave KV)",
--   "guests":    "number   — número de acompañantes (>= 1)",
--   "status":    "string   — attending | maybe | not-attending",
--   "teamVote":  "string   — Guerrero | Guerrera | null",
--   "timestamp": "string   — ISO 8601 (ej: 2026-05-30T18:00:00.000Z)"
-- }

-- Endpoint público (sin auth):
--   GET /api/rsvp  →  { guerrero: N, guerrera: N, total: N }

-- Endpoint admin (Authorization: ADMIN_KEY):
--   GET /api/rsvp  →  array completo de entradas

-- Guardar voto:
--   POST /api/rsvp  body JSON con los campos arriba
