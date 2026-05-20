# 📁 Carpeta de Assets

Coloca aquí todos tus archivos multimedia.
El proyecto los referencia desde `public/assets/`.

---

## 🎵 audio/

| Archivo              | Propósito                             | Formato recomendado |
|----------------------|---------------------------------------|---------------------|
| `ambient.mp3`        | Música de fondo (loop continuo)       | MP3 · max 3MB       |
| `open.mp3`           | Efecto sonido al abrir el sobre       | MP3 · corto ~0.5s   |

**Cómo conectar la música:**
En `public/index.html`, busca:
```html
<!-- Coloca tu archivo de audio aquí: <source src="audio/ambient.mp3" ... /> -->
```
Descomenta esa línea y cámbiala a:
```html
<source src="assets/audio/ambient.mp3" type="audio/mpeg" />
```
El botón de música aparecerá automáticamente.

**Música recomendada gratuita:**
- https://pixabay.com/music/ (busca: "cinematic ambient", "epic orchestral")
- https://freemusicarchive.org
- https://incompetech.filmmusic.io

---

## 🖼️ images/

| Archivo              | Propósito                             | Tamaño ideal        |
|----------------------|---------------------------------------|---------------------|
| `og/preview.jpg`     | Preview al compartir en WhatsApp/redes| 1200×630px          |
| `favicon.ico`        | Icono del navegador                   | 32×32px             |

**Cómo activar el preview de WhatsApp:**
En el `<head>` de `index.html` añade:
```html
<meta property="og:image" content="assets/images/og/preview.jpg" />
<meta property="og:title" content="💫 Revelación de Género · Erick & Maria" />
<meta property="og:description" content="¡Estás invitado! Descubre si será Guerrero o Prodigio." />
```

---

## Estructura final esperada

```
public/assets/
├── audio/
│   ├── ambient.mp3     ← música de fondo
│   └── open.mp3        ← efecto al abrir sobre
└── images/
    ├── og/
    │   └── preview.jpg ← imagen para redes sociales
    └── favicon.ico     ← icono del navegador
```
