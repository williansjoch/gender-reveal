# 🚀 Guía de Despliegue — Cloudflare Pages

## Requisitos previos
- Node.js ≥ 18 instalado
- Cuenta de Cloudflare activa
- Wrangler CLI instalado globalmente

```bash
npm install -g wrangler
wrangler login   # abre el navegador para autenticarte
```

---

## Paso 1 — Crear la base de datos D1

```bash
cd ~/gender-reveal
wrangler d1 create gender-reveal-db
```

Copia el `database_id` que aparece en la salida y **pégalo en `wrangler.toml`**:
```toml
database_id = "PEGA_TU_ID_AQUÍ"
```

---

## Paso 2 — Aplicar el esquema de base de datos

```bash
# Entorno de producción
wrangler d1 execute gender-reveal-db --file=schema.sql --remote

# Entorno local (para pruebas)
wrangler d1 execute gender-reveal-db --file=schema.sql
```

---

## Paso 3 — Prueba local

```bash
wrangler pages dev ./public --d1=DB=gender-reveal-db
```

Abre http://localhost:8788 en el móvil o en Chrome DevTools (modo responsive).

---

## Paso 4 — Subir a Cloudflare Pages (primera vez)

```bash
wrangler pages deploy ./public --project-name=gender-reveal
```

Wrangler te pedirá crear el proyecto si no existe.
Al terminar te dará una URL del tipo: `https://gender-reveal.pages.dev`

---

## Paso 5 — Conectar el D1 al proyecto Pages en producción

En el **Dashboard de Cloudflare** (no en CLI):
1. Ve a **Workers & Pages → gender-reveal → Settings → Functions**
2. Sección **D1 database bindings**
3. Añade: Variable = `DB`, Database = `gender-reveal-db`
4. Guarda y **redeploya**

---

## Paso 6 — Dominio personalizado (opcional)

```bash
# Si tienes un dominio en Cloudflare:
wrangler pages domain add gender-reveal revelacion.tudominio.com
```

O desde el Dashboard: **Pages → gender-reveal → Custom domains → Add domain**

---

## Despliegues posteriores (actualizaciones)

```bash
wrangler pages deploy ./public --project-name=gender-reveal
```

---

## Ver respuestas RSVP

```bash
# Ver todas las respuestas
wrangler d1 execute gender-reveal-db \
  --command="SELECT * FROM rsvps ORDER BY submitted_at DESC" \
  --remote

# Contar por estado
wrangler d1 execute gender-reveal-db \
  --command="SELECT status, COUNT(*) as total FROM rsvps GROUP BY status" \
  --remote
```

---

## Checklist pre-lanzamiento

- [ ] Reemplazar `https://chat.whatsapp.com/XXXXX` con el link real en `public/js/app.js` (`CONFIG.whatsappLink`)
- [ ] Añadir el archivo de música en `public/assets/audio/ambient.mp3` y descomentarlo en `index.html`
- [ ] Añadir imagen OG en `public/assets/images/og/preview.jpg`
- [ ] Probar el RSVP en local (`wrangler pages dev`)
- [ ] Probar en iOS Safari y Android Chrome antes de publicar
- [ ] Confirmar que el D1 binding está activo en el Dashboard de Cloudflare

---

## Estructura del proyecto

```
gender-reveal/
├── public/
│   ├── index.html          ← Toda la invitación
│   ├── css/
│   │   └── styles.css      ← Estilos completos
│   ├── js/
│   │   └── app.js          ← Lógica: partículas, sobre, countdown, RSVP, confetti
│   └── assets/
│       ├── audio/          ← Música y efectos (añádelos tú)
│       └── images/         ← Favicon, preview redes sociales
├── functions/
│   └── api/
│       └── rsvp.js         ← Cloudflare Pages Function (API backend)
├── schema.sql              ← Esquema D1
├── wrangler.toml           ← Configuración Cloudflare
└── DEPLOY.md               ← Esta guía
```
