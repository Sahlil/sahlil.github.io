// Preloader — sinkron dengan loading web sungguhan
const progressEl = document.getElementById("preloader-progress");
const preloader = document.getElementById("preloader");

function setProgress(val) {
  if (!progressEl) return;
  const v = Math.max(0, Math.min(100, Math.round(val)));
  progressEl.textContent = v + "%";
}

function finishLoading() {
  if (document.body.classList.contains("loaded")) return;
  setProgress(100);
  document.body.classList.add("loaded");
  // Hapus preloader setelah animasi slideUp selesai
  setTimeout(() => preloader?.remove(), 450);
}

// Stage 1: DOM ready (bukan tunggu load penuh)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => setProgress(30));
} else {
  setProgress(30);
}

// Stage 2: Pantau resource loading real-time
const trackResources = performance.getEntriesByType("resource");
const totalResources = trackResources.length || 1;
let loadedCount = 0;

if ("PerformanceObserver" in window) {
  const obs = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      loadedCount++;
      // Resource loaded: 30% → 85%
      const pct = 30 + Math.min(55, (loadedCount / totalResources) * 55);
      setProgress(pct);
    }
  });
  try {
    obs.observe({ type: "resource", buffered: true });
  } catch (e) {
    // Fallback: observer tidak support
  }
}

// Stage 3: Window load = 95%
window.addEventListener("load", () => {
  setProgress(95);
  // Kasih sedikit waktu untuk render pertama
  requestAnimationFrame(() => {
    setTimeout(finishLoading, 100);
  });
});

// Safety net: max 3 detik (bukan 5)
setTimeout(finishLoading, 3000);

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

function setMenuState(isOpen) {
  if (!menuToggle || !siteNav) return;
  menuToggle.classList.toggle("is-open", isOpen);
  siteNav.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Tutup menu navigasi" : "Buka menu navigasi");
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => setMenuState(!siteNav.classList.contains("is-open")));
  siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenuState(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenuState(false); });
  window.addEventListener("resize", () => { if (window.innerWidth > 720) setMenuState(false); });
}

document.querySelectorAll("[data-scroll]").forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("data-scroll"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
      target.focus({ preventScroll: true });
    }
  });
});

const scrollProgress = document.getElementById("scrollProgress");
if (scrollProgress) {
  const sections = document.querySelectorAll("section.section");
  const updateProgress = () => {
    const progress = (document.documentElement.scrollHeight - window.innerHeight) > 0
      ? window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
    const viewportMid = window.innerHeight * 0.4;
    let active = null;
    sections.forEach((s) => { const r = s.getBoundingClientRect(); if (r.top <= viewportMid && r.bottom >= viewportMid) active = s; });
    if (active) scrollProgress.style.background = active.classList.contains("alt") ? "var(--accent-strong)" : "var(--accent)";
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
}

const projectSlider = document.querySelector(".project-slider");
if (projectSlider) {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let paused = false, timer = null;
  const pause = () => { paused = true; if (timer) clearTimeout(timer); timer = null; };
  const resume = () => { if (!prefersReduced) paused = false; };
  const resumeDelay = () => { if (prefersReduced) return; if (timer) clearTimeout(timer); timer = setTimeout(resume, 1600); };
  projectSlider.addEventListener("wheel", (e) => {
    const max = projectSlider.scrollWidth - projectSlider.clientWidth;
    if (max <= 0) return;
    if ((e.deltaY < 0 && projectSlider.scrollLeft <= 0) || (e.deltaY > 0 && projectSlider.scrollLeft >= max)) return;
    pause(); e.preventDefault(); projectSlider.scrollLeft += e.deltaY; resumeDelay();
  }, { passive: false });
  projectSlider.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") projectSlider.scrollBy({ left: -300, behavior: "smooth" }); else if (e.key === "ArrowRight") projectSlider.scrollBy({ left: 300, behavior: "smooth" }); });
  ["mouseenter", "focusin", "touchstart"].forEach(evt => projectSlider.addEventListener(evt, pause));
  ["mouseleave", "focusout", "touchend"].forEach(evt => projectSlider.addEventListener(evt, resumeDelay));
}

const revealItems = document.querySelectorAll(".reveal");
function animateCounter(el) {
  const target = parseInt(el.getAttribute("data-target") || el.textContent, 10);
  if (isNaN(target)) return;
  const dur = 2000, start = performance.now(), suf = el.getAttribute("data-suffix") || "";
  const tick = (now) => { const p = Math.min((now - start) / dur, 1), e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); el.textContent = Math.floor(e * target) + suf; if (p < 1) requestAnimationFrame(tick); else el.textContent = target + suf; };
  requestAnimationFrame(tick);
}
if ("IntersectionObserver" in window) {
  const obs = new IntersectionObserver((entries, o) => { entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-visible"); if (en.target.classList.contains("hero-stats")) en.target.querySelectorAll(".stat-value").forEach(animateCounter); o.unobserve(en.target); } }); }, { threshold: 0.15 });
  revealItems.forEach(el => obs.observe(el));
} else { revealItems.forEach(el => el.classList.add("is-visible")); }

function typeSectionTexts(section) {
  const els = section.querySelectorAll(".section-header h2, .section-header p, .about-grid > p");
  els.forEach(el => {
    if (el.dataset.typed) return;
    el.dataset.typed = "1";
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    // ponytail: aria-label di elemen generik diabaikan sebagian screen reader; upgrade -> span sr-only
    el.textContent = "";
    el.classList.add("is-typing");
    let i = 0;
    const len = text.length;
    // Untuk teks panjang, ketik 2-3 karakter sekaligus (burst) agar tidak lambat
    const burst = len > 120 ? 3 : (len > 60 ? 2 : 1);
    const timer = setInterval(() => {
      i = Math.min(i + burst, len);
      el.textContent = text.slice(0, i);
      if (i >= len) { clearInterval(timer); el.classList.remove("is-typing"); }
    }, 12);
  });
}

const typeSections = document.querySelectorAll("#about, #skills, #experience, #projects, #documentation, #contact");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion && "IntersectionObserver" in window && typeSections.length) {
  const typeObs = new IntersectionObserver((entries, o) => {
    entries.forEach(en => {
      if (en.isIntersecting) { typeSectionTexts(en.target); o.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  typeSections.forEach(sec => typeObs.observe(sec));
}

document.querySelectorAll(".skill-tag[data-desc]").forEach(tag => {
  tag.addEventListener("click", e => { if (window.innerWidth <= 720) { e.preventDefault(); e.stopPropagation(); document.querySelectorAll(".skill-tag.tooltip-visible").forEach(t => t.classList.remove("tooltip-visible")); tag.classList.toggle("tooltip-visible"); } });
});
document.addEventListener("click", e => { document.querySelectorAll(".skill-tag.tooltip-visible").forEach(t => { if (!t.contains(e.target)) t.classList.remove("tooltip-visible"); }); });

const SKILL_SLUGS = {
  "html": "html5", "css": "css3", "javascript": "javascript", "typescript": "typescript",
  "react.js": "react", "vue.js": "vuedotjs", "react native": "reactnative", "expo": "expo",
  "php": "php", "golang": "go", "python": "python", "node.js": "nodedotjs",
  "mysql": "mysql", "postgresql": "postgresql", "sqlite": "sqlite",
  "docker": "docker", "ubuntu": "ubuntu", "nginx": "nginx", "graphql": "graphql",
  "git": "git", "laravel": "laravel", "codeigniter": "codeigniter",
  "gofiber": "gofiber", "gin": "gin", "flask": "flask", "whatsapp api": "whatsapp"
};
document.querySelectorAll(".skill-tag[data-desc]").forEach(tag => {
  const slug = SKILL_SLUGS[tag.textContent.trim().toLowerCase()];
  if (!slug) return;
  const inject = () => {
    if (tag.querySelector(".skill-logo-pop")) return;
    const img = document.createElement("img");
    img.className = "skill-logo-pop";
    img.alt = "";
    img.src = `https://cdn.simpleicons.org/${slug}/e87d4a`;
    img.onerror = () => img.remove();
    tag.appendChild(img);
  };
  tag.addEventListener("pointerenter", inject);
  tag.addEventListener("click", inject);
});

const tagline = document.querySelector(".tagline-rotator");
if (tagline) {
  let roles;
  try { roles = JSON.parse(tagline.getAttribute("data-roles") || "[]"); } catch { roles = []; }
  if (roles.length) {
    let idx = 0, ci = 0, del = false;
    const prefRed = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const T = 60, D = 35, H = 1800, P = 300;
    let sr = tagline.querySelector(".sr-only") || Object.assign(document.createElement("span"), { className: "sr-only" });
    if (!sr.parentNode) tagline.parentNode.insertBefore(sr, tagline.nextSibling);
    const loop = () => {
      const r = roles[idx];
      if (prefRed) { tagline.textContent = r; sr.textContent = r; setTimeout(() => { idx = (idx + 1) % roles.length; loop(); }, H); return; }
      if (!del) {
        if (ci < r.length) { tagline.textContent = r.slice(0, ++ci); setTimeout(loop, T); }
        else { sr.textContent = r; del = true; setTimeout(loop, H); }
      } else {
        if (ci > 0) { tagline.textContent = r.slice(0, --ci); setTimeout(loop, D); }
        else { del = false; idx = (idx + 1) % roles.length; setTimeout(loop, P); }
      }
    };
    loop();
  }
}

// tsParticles - Hero Background
async function initTsParticles() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  if (!window.tsParticles) {
    console.error("tsParticles SDK tidak tersedia — cek CDN");
    return;
  }

  const isMobile = window.innerWidth <= 768;
  const particleCount = isMobile ? 120 : 200;
  const container = document.getElementById("tsparticles");
  if (!container) {
    console.error("#tsparticles container tidak ditemukan");
    return;
  }

  await tsParticles.load("tsparticles", {
    fpsLimit: 60,
    pauseOnOutsideViewport: true,
    background: { color: "transparent" },
    fullScreen: { enable: false },
    particles: {
      number: { value: particleCount, density: { enable: true, area: 800 } },
      color: { value: ["#e87d4a", "#f5a56b", "#d45d2e", "#ffb36b"] },
      shape: { type: "circle" },
      opacity: { value: { min: 0.15, max: 0.5 }, animation: { enable: true, speed: 0.3, minimumValue: 0.1, sync: false } },
      size: { value: { min: 1, max: 3 }, animation: { enable: true, speed: 2, minimumValue: 0.5, sync: false } },
      links: { enable: false },
      move: {
        enable: true,
        speed: 0.4,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "bounce" },
        drift: 0.02,
        attract: { enable: false }
      }
    },
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: { enable: !isMobile, mode: "repulse" },
        onClick: { enable: false },
        resize: true
      },
      modes: {
        repulse: { distance: 120, duration: 0.8, factor: 100 },
        bubble: { distance: 200, size: 8, duration: 2, opacity: 0.8 }
      }
    },
    detectRetina: true
  });
}

initTsParticles();

// Global Particle System (kept for full-page background)
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.rect = { w: 0, h: 0 };
    this.active = false;
    this.raf = null;

    this.config = {
      count: 180,
      minSize: 1,
      maxSize: 3,
      baseSpeed: 0.15,
      attractionR: 200,
      attractionK: 0.03,
      burstR: 250,
      burstK: 5,
      friction: 0.97,
      drift: 0.025
    };

    this.accent = [232, 125, 74];
    this.bg = "rgba(28, 25, 23, 0.85)";

    this.resize = this.resize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onClick = this.onClick.bind(this);
    this.loop = this.loop.bind(this);

    this.init();
  }

  init() {
    this.resize();
    this.getColor();
    this.spawn();
    this.bind();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) this.start();
    window.addEventListener("resize", this.resize);
  }

  getColor() {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    if (v.startsWith("#")) {
      const h = v.slice(1);
      this.accent = [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
    } else if (v.startsWith("rgb")) {
      this.accent = v.match(/\d+/g).map(Number);
    }
  }

  resize() {
    this.rect.w = this.canvas.width = window.innerWidth;
    this.rect.h = this.canvas.height = window.innerHeight;
  }

  spawn() {
    this.particles = Array.from({ length: this.config.count }, () => {
      const s = this.config.minSize + Math.random() * (this.config.maxSize - this.config.minSize);
      return {
        x: Math.random() * this.rect.w,
        y: Math.random() * this.rect.h,
        vx: (Math.random() - 0.5) * this.config.baseSpeed,
        vy: (Math.random() - 0.5) * this.config.baseSpeed,
        size: s, base: s,
        opacity: 0.25 + Math.random() * 0.5,
        ang: Math.random() * Math.PI * 2,
        drift: this.config.drift * (0.5 + Math.random() * 0.5)
      };
    });
  }

  bind() {
    window.addEventListener("mousemove", this.onMouseMove, { passive: true });
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("touchmove", this.onTouchMove, { passive: true });
    window.addEventListener("click", this.onClick);
  }

  onMouseMove(e) { this.mouse.x = e.clientX; this.mouse.y = e.clientY; }
  onMouseDown() { this.mouse.down = true; setTimeout(() => this.mouse.down = false, 100); }
  onTouchMove(e) { if (e.touches[0]) { this.mouse.x = e.touches[0].clientX; this.mouse.y = e.touches[0].clientY; } }
  onClick(e) {
    if (e.target.closest("a, button, .menu-toggle")) return;
    this.burst(e.clientX, e.clientY);
  }

  burst(cx, cy) {
    this.particles.forEach(p => {
      const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) || 1;
      if (d < this.config.burstR) {
        const f = this.config.burstK * (1 - d / this.config.burstR) / d;
        p.vx += dx * f; p.vy += dy * f;
      }
    });
  }

  step() {
    const { w, h } = this.rect;
    this.particles.forEach(p => {
      p.ang += p.drift * 0.01;
      p.vx += Math.cos(p.ang) * 0.0008;
      p.vy += Math.sin(p.ang) * 0.0008;

      if (this.mouse.x != null) {
        const dx = this.mouse.x - p.x, dy = this.mouse.y - p.y, dist = Math.hypot(dx, dy);
        if (dist < this.config.attractionR && dist > 1) {
          const f = this.config.attractionK * (1 - dist / this.config.attractionR) / dist;
          p.vx += dx * f; p.vy += dy * f;
        }
      }

      p.x += p.vx; p.y += p.vy;
      p.vx *= this.config.friction; p.vy *= this.config.friction;

      const m = 60;
      if (p.x < -m) p.x = w + m;
      if (p.x > w + m) p.x = -m;
      if (p.y < -m) p.y = h + m;
      if (p.y > h + m) p.y = -m;

      p.size = p.base * (0.95 + Math.sin(p.ang * 0.7) * 0.05);
    });
  }

  draw() {
    this.getColor();
    this.ctx.fillStyle = this.bg;
    this.ctx.fillRect(0, 0, this.rect.w, this.rect.h);
    const [r, g, b] = this.accent;
    this.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
      this.ctx.fill();
    });
  }

  loop() {
    if (!this.active) return;
    this.step();
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  }

  start() { if (!this.active) { this.active = true; this.loop(); } }
  stop() { this.active = false; cancelAnimationFrame(this.raf); }
}

// Mouse Trail Particles - Hero only
// Efek partikel mengikuti kursor (attract + trail spawn) dengan glow blend.
// Insipirasi: antigravity.google
class MouseTrailParticles {
  constructor(canvasId, heroSelector) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.hero = document.querySelector(heroSelector);
    if (!this.hero) return;
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.mouse = { x: null, y: null, px: null, py: null, moving: false };
    this.W = 0;
    this.H = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.active = false;
    this.raf = null;
    this.visible = true;

    this.isMobile = window.innerWidth <= 768;

    this.config = {
      maxParticles: 600,
      spawnRate: this.isMobile ? 2 : 3,
      minSize: 1,
      maxSize: 2.5,
      fadeSpeed: 0.012,
      attractRadius: 150,
      attractForce: 0.08,
      drift: 0.02,
      friction: 0.96,
      colors: [
        [232, 125, 74],   // #e87d4a
        [245, 165, 107],  // #f5a56b
        [255, 179, 107],  // #ffb36b
        [255, 217, 168]   // #ffd9a8
      ]
    };

    this.resize = this.resize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.loop = this.loop.bind(this);

    this.init();
  }

  init() {
    this.resize();
    this.bind();
    this.setupVisibility();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) this.start();
    window.addEventListener("resize", this.resize);
  }

  setupVisibility() {
    if (!("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        this.visible = en.isIntersecting;
        if (this.visible && !this.active) this.start();
        else if (!this.visible && this.active) this.stop();
      });
    }, { threshold: 0.05 });
    obs.observe(this.hero);
  }

  resize() {
    const w = this.hero.offsetWidth;
    const h = this.hero.offsetHeight;
    this.W = w;
    this.H = h;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  bind() {
    this.hero.addEventListener("mousemove", this.onMouseMove, { passive: true });
    this.hero.addEventListener("touchmove", this.onTouchMove, { passive: true });
    this.hero.addEventListener("touchend", this.onTouchEnd, { passive: true });
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.px = this.mouse.x;
    this.mouse.py = this.mouse.y;
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
    this.mouse.moving = true;
    this.spawnTrail();
  }

  onTouchMove(e) {
    if (!e.touches[0]) return;
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.touches[0].clientX - rect.left;
    this.mouse.y = e.touches[0].clientY - rect.top;
    this.mouse.moving = true;
    this.spawnTrail();
  }

  onTouchEnd() {
    this.mouse.moving = false;
  }

  spawnTrail() {
    if (this.particles.length >= this.config.maxParticles) return;
    const count = this.config.spawnRate;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 6;
      const color = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
      const size = this.config.minSize + Math.random() * (this.config.maxSize - this.config.minSize);
      this.particles.push({
        x: this.mouse.x + Math.cos(angle) * dist,
        y: this.mouse.y + Math.sin(angle) * dist,
        vx: Math.cos(angle) * 0.3,
        vy: Math.sin(angle) * 0.3,
        size: size,
        baseSize: size,
        opacity: 0.6 + Math.random() * 0.3,
        color: color,
        ang: Math.random() * Math.PI * 2,
        drift: this.config.drift * (0.5 + Math.random() * 0.5)
      });
    }
  }

  step() {
    const { attractRadius, attractForce, friction, fadeSpeed, drift } = this.config;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Drift natural
      p.ang += p.drift * 0.01;
      p.vx += Math.cos(p.ang) * 0.0008;
      p.vy += Math.sin(p.ang) * 0.0008;

      // Attract ke mouse jika dekat
      if (this.mouse.x != null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < attractRadius && dist > 1) {
          const f = attractForce * (1 - dist / attractRadius) / dist;
          p.vx += dx * f;
          p.vy += dy * f;
        }
      }

      // Apply velocity
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= friction;
      p.vy *= friction;

      // Fade out
      p.opacity -= fadeSpeed;

      // Hapus partikel mati
      if (p.opacity <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Wrap around edges
      const m = 20;
      if (p.x < -m) p.x = this.W + m;
      if (p.x > this.W + m) p.x = -m;
      if (p.y < -m) p.y = this.H + m;
      if (p.y > this.H + m) p.y = -m;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.ctx.globalCompositeOperation = "lighter";

    for (const p of this.particles) {
      const [r, g, b] = p.color;
      const radius = Math.max(0.1, p.size * 2.5);

      // Radial gradient untuk glow lembut
      const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.opacity})`);
      grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.3})`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.globalCompositeOperation = "source-over";
  }

  loop() {
    if (!this.active || !this.visible) return;
    this.step();
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  }

  start() { if (!this.active) { this.active = true; this.loop(); } }
  stop() { this.active = false; cancelAnimationFrame(this.raf); }
}

// Init Mouse Trail Particles (Hero only)
const trailCanvas = document.getElementById("hero-trail");
if (trailCanvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  new MouseTrailParticles("hero-trail", ".hero");
}

// Init Global Particles
const globalCanvas = document.getElementById("globalParticles");
if (globalCanvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  new ParticleSystem(globalCanvas);
}

// Global Spotlight (CSS radial gradient)
const spotlight = document.getElementById("global-spotlight");
if (spotlight && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const sections = document.querySelectorAll(".section.alt");
  
  // Update CSS custom properties on mouse move
  window.addEventListener("mousemove", (e) => {
    document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
  });

  // Show/hide spotlight when entering/leaving .section.alt
  sections.forEach((section) => {
    section.addEventListener("mouseenter", () => {
      spotlight.style.opacity = "1";
    });
    section.addEventListener("mouseleave", () => {
      spotlight.style.opacity = "0";
    });
  });
}