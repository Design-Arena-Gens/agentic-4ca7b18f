const CONFIG = {
  avatarUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
  name: 'Nova Drift',
  subtitle: 'developer | gamer | creator',
  socials: {
    steam: 'https://steamcommunity.com/id/example',
    spotify: 'https://open.spotify.com/user/example',
    discordUser: 'https://discordapp.com/users/000000000000000000',
    discordServer: 'https://discord.gg/example'
  },
  music: 'https://cdn.pixabay.com/download/audio/2022/03/30/audio_3ca0165d66.mp3?filename=ambient-112054.mp3'
};

const avatarEl = document.getElementById('avatar');
const nameEl = document.getElementById('name');
const subtitleEl = document.getElementById('subtitle');
const socialLinks = {
  steam: document.getElementById('link-steam'),
  spotify: document.getElementById('link-spotify'),
  discordUser: document.getElementById('link-discord-user'),
  discordServer: document.getElementById('link-discord-server')
};
const audioToggleEl = document.getElementById('audio-toggle');
const audioEl = document.getElementById('bg-music');

function applyConfig() {
  avatarEl.src = CONFIG.avatarUrl;
  avatarEl.alt = `${CONFIG.name} avatar`;
  nameEl.textContent = CONFIG.name;
  subtitleEl.textContent = CONFIG.subtitle;
  audioEl.src = CONFIG.music;
  audioEl.volume = 0.55;

  Object.entries(socialLinks).forEach(([key, el]) => {
    const href = CONFIG.socials[key];
    if (href) {
      el.href = href;
      el.style.display = 'flex';
    } else {
      el.style.display = 'none';
    }
  });
}

applyConfig();

let audioInitialized = false;
let audioPlaying = false;

async function startAudio() {
  if (!audioEl.src) return;
  try {
    await audioEl.play();
    audioPlaying = true;
    audioToggleEl.classList.add('playing');
    audioToggleEl.classList.remove('paused');
  } catch (error) {
    audioPlaying = false;
    audioToggleEl.classList.add('paused');
    audioToggleEl.classList.remove('playing');
  }
}

function pauseAudio() {
  audioEl.pause();
  audioPlaying = false;
  audioToggleEl.classList.add('paused');
  audioToggleEl.classList.remove('playing');
}

function ensureAudioInitialized() {
  if (audioInitialized) return;
  audioInitialized = true;
  startAudio();
}

audioToggleEl.addEventListener('click', event => {
  event.stopPropagation();
  ensureAudioInitialized();
  if (audioPlaying) {
    pauseAudio();
  } else {
    startAudio();
  }
});

document.addEventListener(
  'pointerdown',
  () => {
    ensureAudioInitialized();
  },
  { once: true }
);

document.addEventListener(
  'keydown',
  event => {
    if (!audioInitialized && !event.metaKey && !event.ctrlKey) {
      ensureAudioInitialized();
    }
  },
  { once: true }
);

audioEl.addEventListener('ended', () => {
  audioEl.currentTime = 0;
  startAudio();
});

audioEl.addEventListener('pause', () => {
  audioPlaying = false;
  audioToggleEl.classList.add('paused');
  audioToggleEl.classList.remove('playing');
});

audioEl.addEventListener('play', () => {
  audioPlaying = true;
  audioToggleEl.classList.add('playing');
  audioToggleEl.classList.remove('paused');
});

/**
 * Starfield + network background.
 */
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');
const PARTICLE_COUNT = 70;
const CONNECTION_DISTANCE = 160;

const pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  targetX: window.innerWidth / 2,
  targetY: window.innerHeight / 2
};

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle());

function createParticle() {
  const speed = 0.15 + Math.random() * 0.25;
  const direction = Math.random() * Math.PI * 2;
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: Math.cos(direction) * speed,
    vy: Math.sin(direction) * speed,
    radius: 1.2 + Math.random() * 1.8,
    parallax: 0.015 + Math.random() * 0.035,
    drift: 0
  };
}

function updatePointerPosition(event) {
  pointer.targetX = event.clientX;
  pointer.targetY = event.clientY;
}

document.addEventListener('pointermove', updatePointerPosition);
document.addEventListener('pointerleave', () => {
  pointer.targetX = window.innerWidth / 2;
  pointer.targetY = window.innerHeight / 2;
});

function updateParticles(delta) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  pointer.x += (pointer.targetX - pointer.x) * 0.08;
  pointer.y += (pointer.targetY - pointer.y) * 0.08;

  particles.forEach(particle => {
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;

    particle.drift += 0.0015 * delta;
    particle.x += Math.cos(particle.drift) * 0.12;
    particle.y += Math.sin(particle.drift) * 0.12;

    const offsetX = (pointer.x - width / 2) * particle.parallax;
    const offsetY = (pointer.y - height / 2) * particle.parallax;

    particle.renderX = particle.x + offsetX;
    particle.renderY = particle.y + offsetY;

    if (particle.x < -50) particle.x = width + 50;
    if (particle.x > width + 50) particle.x = -50;
    if (particle.y < -50) particle.y = height + 50;
    if (particle.y > height + 50) particle.y = -50;
  });
}

let lastTimestamp = performance.now();

function animate(timestamp) {
  const delta = Math.min((timestamp - lastTimestamp) / (1000 / 60), 3);
  lastTimestamp = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateParticles(delta);
  renderBackground();

  requestAnimationFrame(animate);
}

function renderBackground() {
  ctx.save();
  ctx.lineCap = 'round';

  for (let i = 0; i < particles.length; i += 1) {
    const a = particles[i];

    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(102, 170, 255, 0.4)';
    ctx.arc(a.renderX, a.renderY, a.radius, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < particles.length; j += 1) {
      const b = particles[j];
      const dx = a.renderX - b.renderX;
      const dy = a.renderY - b.renderY;
      const dist = Math.hypot(dx, dy);

      if (dist < CONNECTION_DISTANCE) {
        const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.35;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.moveTo(a.renderX, a.renderY);
        ctx.lineTo(b.renderX, b.renderY);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

requestAnimationFrame(animate);
