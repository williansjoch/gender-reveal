/* ═══════════════════════════════════════════════════════
   GENDER REVEAL — APP.JS
   Erick & Maria · Miranda de Ebro · 30 Mayo 2026
══════════════════════════════════════════════════════ */

'use strict';

/* ─── CONFIG ─── */
const CONFIG = {
  eventDate:    new Date('2026-05-30T18:00:00+02:00'),
  whatsappLink: 'https://chat.whatsapp.com/CQIozJp5mdg8OFI29uAlIU',   // ← reemplaza con tu link real
  rsvpDeadline: new Date('2026-05-28T23:59:59+02:00'), // Fecha límite para RSVP
  apiEndpoint:  '/api/rsvp',
  audioOpenPath: 'assets/audio/open.mp3',
  loadDuration: 2600,   // ms
};

let state = {
  selectedTeam: null,
};

/* ─── HELPERS ─── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ═══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);
  lucide.createIcons();
  initParticles();
  runLoadingSequence();
});

/* ═══════════════════════════════════════════════════════
   LOADING SEQUENCE
══════════════════════════════════════════════════════ */
function runLoadingSequence() {
  const ball   = qs('#db-loader-ball');
  const subEl  = qs('#loading-sub');
  const screen = qs('#loading-screen');

  const labels = [
    'Preparando la magia…',
    'Convocando energías…',
    'Abriendo el universo…',
    '¡Casi listo!',
  ];

  let progress = 0;
  let labelIdx = 0;
  const step   = 100 / (CONFIG.loadDuration / 60);

  const tick = setInterval(() => {
    progress = Math.min(progress + step + (Math.random() * step * 0.5), 100);
    if (ball) {
      ball.style.left = progress + '%';
    }

    const nextLabel = Math.floor((progress / 100) * labels.length);
    if (nextLabel !== labelIdx && nextLabel < labels.length) {
      labelIdx = nextLabel;
      subEl.style.animation = 'none';
      void subEl.offsetWidth;
      subEl.textContent     = labels[labelIdx];
      subEl.style.animation = 'textFadeIn 0.4s ease';
    }

    if (progress >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        screen.classList.add('fade-out');
        setTimeout(() => {
          screen.style.display = 'none';
          showEnvelopeScene();
        }, 700);
      }, 300);
    }
  }, 60);
}

/* ═══════════════════════════════════════════════════════
   ENVELOPE SCENE
══════════════════════════════════════════════════════ */
function showEnvelopeScene() {
  const scene    = qs('#envelope-scene');
  const envelope = qs('#envelope');

  if (!scene || !envelope) return;

  scene.classList.remove('hidden');
  scene.style.opacity = '0';
  requestAnimationFrame(() => {
    scene.style.transition = 'opacity 0.8s ease';
    scene.style.opacity    = '1';
    // Apply blur to video when envelope scene is shown
    const bgVideo = qs('#bg-video');
    if (bgVideo) bgVideo.classList.remove('bg-video-focused');
  });

  setParticleTheme('envelope');

  // Bind open events
  envelope.addEventListener('click',   openEnvelope, { once: true });
  envelope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openEnvelope();
  }, { once: true });
}

function openEnvelope() {
  const envelope = qs('#envelope');
  const envText  = qs('#env-text');
  const tapHint  = qs('#tap-hint');
  const kiExplosion = qs('#ki-explosion-effect');
  const envFlap = qs('#env-flap');
  const envLetter = qs('#env-letter');
  const envelopeScene = qs('#envelope-scene');

  const bgVideo = qs('#bg-video');
  if (!envelope || !envFlap || !envLetter || !envelopeScene) return;

  // Trigger ki explosion effect
  // Play open sound effect
  const soundEffect = new Audio(CONFIG.audioOpenPath);
  soundEffect.volume = 0.5;
  soundEffect.play().catch(e => console.log("Audio play blocked or missing:", e));

  // Start background music if not playing (muted by browser policy often)
  tryStartMusic();

  // GSAP Timeline for envelope opening
  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" }
  });

  // 1. Shake & Explosion
  tl.to(envelope, { 
    keyframes: [
      { x: -10, y: 0, rotation: -2, duration: 0.08 }, { x: 10, y: 0, rotation: 2, duration: 0.08 },
      { x: -7, y: 0, rotation: -1.5, duration: 0.08 }, { x: 7, y: 0, rotation: 1.5, duration: 0.08 },
      { x: -3, y: 0, rotation: -0.5, duration: 0.08 }, { x: 3, y: 0, rotation: 0.5, duration: 0.08 },
      { x: 0, y: 0, rotation: 0, duration: 0.08 }
    ],
    ease: "power1.out",
    onComplete: () => {
      // Trigger ki explosion effect after shake
      if (kiExplosion) {
        kiExplosion.classList.add('active');
        kiExplosion.addEventListener('animationend', () => {
          kiExplosion.classList.remove('active');
        }, { once: true });
      }
    }
  }, 0); // Start at the beginning of the timeline

  // 2. Open the flap and slide out the letter
  tl.to(envFlap, {
    rotationX: -180, 
    duration: 0.6, // Más rápido
    transformOrigin: "top center" 
  }, ">-0.2");

  tl.to(envLetter, {
    y: -180, 
    scale: 1.1, 
    duration: 0.8, // Más rápido
    zIndex: 10,
    ease: "power2.out",
  }, "-=0.2"); // Inicia antes

  // 3. Unblur video and transition out
  tl.to(bgVideo, { 
    onStart: () => bgVideo?.classList.add('bg-video-focused'),
    duration: 0.7 // Más rápido
  }, "-=0.4"); // Inicia antes

  if (tapHint) {
    tl.to(tapHint, { opacity: 0, duration: 0.3 }, 0);
  }

  tl.to(envelopeScene, { 
    opacity: 0, 
    duration: 0.6, // Más rápido
    delay: 0.5, // Retraso reducido
    onComplete: () => {
      envelopeScene.style.display = 'none';
      showMainInvitation();
    }
  });

  // 4. Change and animate envelope text
  if (envText) {
    tl.to(envText, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
    envText.textContent   = '¡Tu invitación está aquí!';
      }
    }, "-=1.0"); // Inicia antes

    tl.to(envText, { opacity: 1, duration: 0.4 }, "-=0.5"); // Más rápido
  }
}

/* ─── MUSIC AUTOSTART HELPER ─── */
function tryStartMusic() {
  const audio = qs('#bg-music');
  const btn = qs('#music-toggle');
  if (audio && audio.paused) {
    audio.play().then(() => {
      if (btn) btn.classList.add('playing');
      const iconOff = qs('.music-off');
      const iconOn  = qs('.music-on');
      if (iconOff) iconOff.classList.add('hidden');
      if (iconOn) iconOn.classList.remove('hidden');
    }).catch(e => console.warn("Music auto-play prevented by browser:", e));
  }
}

/* ═══════════════════════════════════════════════════════
   MAIN INVITATION
══════════════════════════════════════════════════════ */
function showMainInvitation() {
  const app = qs('#app');

  app.classList.remove('hidden');
  app.style.opacity    = '0';
  app.style.transform  = 'translateY(30px)';
  app.style.transition = 'opacity 0.9s ease, transform 0.9s ease';

  requestAnimationFrame(() => {
    app.style.opacity   = '1';
    app.style.transform = 'translateY(0)';
  });

  setParticleTheme('hero');
  initGSAPAnimations(); // Nueva función de animaciones premium
  initCountdown();
  checkRSVPDeadline(); // Verificar fecha límite al cargar la invitación principal
  initRSVP();
  initMusicToggle();
  
}

function selectTeam(team) {
  state.selectedTeam = team;
  qsa('.team-card').forEach(card => {
    card.classList.remove('selected', 'spark-guerrero', 'glow-guerrera');
  });
  
  const selectedEl = qs(`#team-${team}`);
  if (selectedEl) {
    selectedEl.classList.add('selected');
    if (team === 'Guerrero') {
      selectedEl.classList.add('spark-guerrero');
      gsap.to(selectedEl, { x: 4, repeat: 5, yoyo: true, duration: 0.05, onComplete: () => gsap.set(selectedEl, {x:0}) });
    } else {
      selectedEl.classList.add('glow-guerrera');
    }
    qs('#rsvp')?.scrollIntoView({ behavior: 'smooth' });
  }
}

/* ═══════════════════════════════════════════════════════
   PARTICLE SYSTEM
══════════════════════════════════════════════════════ */
const Particles = {
  canvas:  null,
  ctx:     null,
  list:    [],
  theme:   'envelope',
  raf:     null,
  w:       0,
  h:       0,
};

const THEMES = {
  envelope: ['rgba(255,215,0,', 'rgba(200,150,255,', 'rgba(255,255,255,'],
  hero:     ['rgba(255,109,0,',  'rgba(255,214,0,',   'rgba(0,100,255,', 'rgba(233,30,140,', 'rgba(0,188,212,'],
};

function initParticles() {
  Particles.canvas = qs('#particles-canvas');
  if (!Particles.canvas) return; // Evita error si no existe el canvas

  Particles.ctx    = Particles.canvas.getContext('2d');
  if (!Particles.ctx) return;

  resizeParticles();
  window.addEventListener('resize', resizeParticles);

  for (let i = 0; i < 70; i++) spawnParticle(true);
  renderParticles();
}

function resizeParticles() {
  Particles.w = Particles.canvas.width  = window.innerWidth;
  Particles.h = Particles.canvas.height = window.innerHeight;
}

function setParticleTheme(theme) {
  Particles.theme = theme;
}

function spawnParticle(initial = false) {
  const colors = THEMES[Particles.theme] || THEMES.hero;
  const color  = colors[Math.floor(Math.random() * colors.length)];
  return {
    x:       Math.random() * Particles.w,
    y:       initial ? Math.random() * Particles.h : Particles.h + 10,
    vx:      (Math.random() - 0.5) * 0.5,
    vy:      -(0.25 + Math.random() * 0.6),
    r:       0.8 + Math.random() * 2.5,
    alpha:   0,
    maxAlpha:0.2 + Math.random() * 0.45,
    color,
    phase:   Math.random() * Math.PI * 2,
    speed:   0.008 + Math.random() * 0.012,
    life:    0,
    maxLife: 180 + Math.random() * 240,
  };
}

function renderParticles() {
  const { canvas, ctx, list, w, h } = Particles;
  ctx.clearRect(0, 0, w, h);

  // Spawn ~1 particle per frame stochastically
  if (Math.random() < 0.55) list.push(spawnParticle());

  for (let i = list.length - 1; i >= 0; i--) {
    const p = list[i];
    p.life++;
    p.x += p.vx + Math.sin(p.phase + p.life * p.speed) * 0.4;
    p.y += p.vy;
    p.phase += 0.012;

    const t = p.life / p.maxLife;
    if (t < 0.12)       p.alpha = p.maxAlpha * (t / 0.12);
    else if (t > 0.78)  p.alpha = p.maxAlpha * (1 - (t - 0.78) / 0.22);
    else                p.alpha = p.maxAlpha;

    if (p.life >= p.maxLife || p.y < -10) {
      list.splice(i, 1);
      continue;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color + p.alpha + ')';
    ctx.fill();
  }

  Particles.raf = requestAnimationFrame(renderParticles);
}

/* ═══════════════════════════════════════════════════════
   GSAP ANIMATIONS
══════════════════════════════════════════════════════ */
function initGSAPAnimations() {
  // Animación de los personajes (PNGs)
  gsap.fromTo('.char-img',
    { opacity: 0, y: 30, scale: 0.9 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.5,
      ease: "back.out(1.7)",
      stagger: 0.2, // Aparición escalonada
      onComplete: () => {
        // Una vez que aparecen, inician la animación de flotación
        gsap.to('.char-img', {
          y: -15,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          stagger: 0.5
        });
      }
    });

  // Revelado general de elementos (títulos, textos y tarjetas)
  gsap.utils.toArray('.reveal-up, .reveal-left, .reveal-right, .glass-card').forEach((el) => {
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 95%",
      },
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0.7, // Reducido para una aparición más rápida
      ease: "power3.out"
    });
  });

  // Animación de cambio de aura con ScrollTrigger
  gsap.to('.aura-saiyan', {
    scrollTrigger: {
      trigger: '#teams', // Se activa al entrar en la sección de equipos
      start: 'top center', // Empieza cuando la parte superior de #teams llega al centro de la ventana
      end: 'bottom center', // Termina cuando la parte inferior de #teams llega al centro de la ventana
      scrub: true, // Vincula la animación al scroll
    },
    background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,109,0,0.2) 50%, transparent 70%)', // Más dorado
    ease: 'none'
  });

  gsap.to('.aura-capsule', {
    scrollTrigger: {
      trigger: '#teams',
      start: 'top center',
      end: 'bottom center',
      scrub: true,
    },
    background: 'radial-gradient(circle, rgba(0,188,212,0.4) 0%, rgba(233,30,140,0.2) 50%, transparent 70%)', // Más cian
    ease: 'none'
  });
}

/* ═══════════════════════════════════════════════════════
   COUNTDOWN TIMER
══════════════════════════════════════════════════════ */
function initCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const now  = Date.now();
  const diff = CONFIG.eventDate.getTime() - now;

  const daysEl  = qs('#cd-days');
  const hoursEl = qs('#cd-hours');
  const minEl   = qs('#cd-min');
  const secEl   = qs('#cd-sec');
  const sub     = qs('#cd-sublabel');

  if (!daysEl || !hoursEl || !minEl || !secEl) return; // Evita error si faltan contadores

  if (diff <= 0) {
    [daysEl, hoursEl, minEl, secEl].forEach((el) => { if(el) el.textContent = '00'; });
    if (sub) {
      sub.textContent = '¡El momento ha llegado! 🎊';
      sub.classList.add('event-today');
    }
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const pad = (n) => String(n).padStart(2, '0');

  // Tick animation on seconds change
  if (secEl.textContent !== pad(s)) {
    tickAnim(secEl);
    if (s === 59) tickAnim(minEl);
    if (s === 59 && m === 59) tickAnim(hoursEl);
    if (s === 59 && m === 59 && h === 23) tickAnim(daysEl);
  }

  daysEl.textContent  = pad(d);
  hoursEl.textContent = pad(h);
  minEl.textContent   = pad(m);
  secEl.textContent   = pad(s);

  if (sub) {
    const days = d;
    if (days === 0)      sub.textContent = '¡Hoy es el gran día! 🎊';
    else if (days === 1) sub.textContent = '¡Mañana es el momento! ⚡';
    else                 sub.textContent = `¡Faltan ${days} días para la revelación!`;
  }
}

function tickAnim(el) {
  el.classList.remove('tick');
  void el.offsetWidth;
  el.classList.add('tick');
  setTimeout(() => el.classList.remove('tick'), 200);
}

/* ═══════════════════════════════════════════════════════
   RSVP
══════════════════════════════════════════════════════ */
function initRSVP() {
  qsa('.rsvp-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      handleRSVP(btn.dataset.status);
    });
  });
}

function checkRSVPDeadline() {
  const now = new Date();
  const deadline = CONFIG.rsvpDeadline;
  const rsvpFormWrap = qs('#rsvp-form-wrap');
  const rsvpDeadlineText = qs('#rsvp-deadline-text');

  if (now > deadline) {
    if (rsvpFormWrap) {
      rsvpFormWrap.classList.add('hidden'); // Oculta el formulario
    }
    if (rsvpDeadlineText) {
      rsvpDeadlineText.textContent = '¡La fecha límite para confirmar ha pasado!';
      rsvpDeadlineText.style.color = '#FF6B6B'; // Color de error
      rsvpDeadlineText.style.fontWeight = 'bold';
    }
    // Podrías mostrar un mensaje alternativo aquí si el formulario está oculto
    qs('#rsvp .section-title').textContent = 'Confirmaciones cerradas';
    qs('#rsvp .rsvp-sub').textContent = 'Gracias por tu interés. ¡Esperamos verte allí!';
  }
}

async function handleRSVP(status) {
  const nameInput  = qs('#rsvp-name');
  const emailInput = qs('#rsvp-email');
  const guestsInput = qs('#rsvp-guests');
  const errorEl    = qs('#form-error');

  if (!nameInput || !emailInput || !guestsInput || !errorEl) return;

  const name  = nameInput.value.trim();
  const email = emailInput.value.trim();
  const guests = guestsInput.value;

  // Validate
  if (!name || !email || !isValidEmail(email)) {
    errorEl.textContent = name
      ? 'Por favor, introduce un correo válido.'
      : 'Por favor, rellena todos los campos.';
    errorEl.classList.remove('hidden');
    shakeElement(qs('#rsvp-form-wrap'));
    return;
  }

  errorEl.classList.add('hidden');

  // Optimistic UI: hide form, show state immediately
  showRSVPState(status);

  // Fire API (non-blocking — UI already updated)
  try {
    await fetch(CONFIG.apiEndpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        name,
        email,
        guests,
        status,
        teamVote: state.selectedTeam,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (_) {
    // Silent fail — UI already shown, data not critical for UX
  }

  // Confetti for attending
  if (status === 'attending') {
    setTimeout(() => launchConfetti(), 400);
  }
}

function showRSVPState(status) {
  qs('#rsvp-form-wrap').classList.add('hidden');

  const stateMap = {
    'attending':     '#state-attending',
    'maybe':         '#state-maybe',
    'not-attending': '#state-not-attending',
  };

  const stateEl = qs(stateMap[status]);
  if (stateEl) {
    stateEl.classList.remove('hidden');
    // Actualizar resumen del voto
    const voteDisplay = stateEl.querySelector('.rs-vote-summary');
    if (voteDisplay && state.selectedTeam) {
      voteDisplay.textContent = `¡Has votado por Team ${state.selectedTeam}!`;
    }

    // Si el estado es "attending", hacer que el botón de WhatsApp parpadee
    if (status === 'attending') {
      const whatsappBtn = qs('#whatsapp-btn');
      if (whatsappBtn) whatsappBtn.classList.add('pulsing');
    }

    // Animar las barras de votación
    animateVotingResults(stateEl);
  }
}

async function animateVotingResults(container) {
  const barGuerrero = container.querySelector('.vote-fill.guerrero');
  const barGuerrera = container.querySelector('.vote-fill.guerrera');

  if (!barGuerrero || !barGuerrera) return;

  let guerreroPercent = 50;
  let guerreraPercent = 50;

  try {
    const res = await fetch(CONFIG.apiEndpoint);
    if (res.ok) {
      const data = await res.json();
      const total = (data.guerrero || 0) + (data.guerrera || 0);
      if (total > 0) {
        guerreroPercent = Math.round((data.guerrero / total) * 100);
        guerreraPercent = 100 - guerreroPercent;
      }
    }
  } catch (_) {
    // Si la API falla, mostrar 50/50 hasta que haya datos
  }

  setTimeout(() => {
    barGuerrero.style.width = guerreroPercent + '%';
    barGuerrera.style.width = guerreraPercent + '%';
    barGuerrero.querySelector('span').textContent = guerreroPercent + '%';
    barGuerrera.querySelector('span').textContent = guerreraPercent + '%';
    barGuerrero.classList.toggle('winning', guerreroPercent > guerreraPercent);
    barGuerrera.classList.toggle('winning', guerreraPercent > guerreroPercent);
  }, 400);
}

function resetRSVP() {
  qsa('.rsvp-state').forEach((el) => el.classList.add('hidden'));
  qs('#rsvp-form-wrap').classList.remove('hidden');
}

// Exported for inline onclick
window.resetRSVP = resetRSVP;
window.handleRSVP = handleRSVP;
window.selectTeam = selectTeam;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function shakeElement(el) {
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'shake 0.4s ease';
  el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
}

// Shake keyframe (injected once)
(function injectShakeKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-8px); }
      40%       { transform: translateX(8px); }
      60%       { transform: translateX(-5px); }
      80%       { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
})();

/* ═══════════════════════════════════════════════════════
   CONFETTI
══════════════════════════════════════════════════════ */
function launchConfetti() {
  const canvas = qs('#confetti-canvas');
  const ctx    = canvas.getContext('2d');

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = [
    '#FF6D00', '#FFD600', '#0066FF',
    '#E91E8C', '#FF69B4', '#00BCD4',
    '#FFFFFF', '#FFD700', '#9B59B6',
  ];

  const pieces = Array.from({ length: 160 }, () => ({
    x:      Math.random() * canvas.width,
    y:      -10 - Math.random() * 200,
    vx:     (Math.random() - 0.5) * 3.5,
    vy:     2 + Math.random() * 4,
    rot:    Math.random() * 360,
    rotV:   (Math.random() - 0.5) * 8,
    w:      6 + Math.random() * 9,
    h:      3 + Math.random() * 5,
    color:  COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha:  1,
    shape:  Math.random() > 0.5 ? 'rect' : 'circle',
  }));

  let alive  = true;
  let frames = 0;

  function drawConfetti() {
    if (!alive) return;
    frames++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let count = 0;
    pieces.forEach((p) => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.rotV;
      p.vy  += 0.06; // gravity
      p.vx  *= 0.999;

      if (frames > 120) p.alpha = Math.max(0, p.alpha - 0.012);

      if (p.y < canvas.height + 30 && p.alpha > 0) {
        count++;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }
    });

    if (count > 0) {
      requestAnimationFrame(drawConfetti);
    } else {
      alive = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  drawConfetti();
}

/* ═══════════════════════════════════════════════════════
   MUSIC TOGGLE
══════════════════════════════════════════════════════ */
function initMusicToggle() {
  const btn   = qs('#music-toggle');
  const audio = qs('#bg-music');
  const iconOff = qs('.music-off');
  const iconOn  = qs('.music-on');

  if (!btn) return;

  if (!audio || !audio.src) {
    // No audio source configured — hide button
    btn.style.display = 'none';
    return;
  }

  audio.volume = 0.35;

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        btn.classList.add('playing');
        iconOff.classList.add('hidden');
        iconOn.classList.remove('hidden');
        btn.setAttribute('aria-label', 'Silenciar música');
      }).catch(() => {
        btn.style.display = 'none';
      });
    } else {
      audio.pause();
      btn.classList.remove('playing');
      iconOff.classList.remove('hidden');
      iconOn.classList.add('hidden');
      btn.setAttribute('aria-label', 'Activar música');
    }
  });
}
