let progress = 0;
const progressEl = document.getElementById("preloader-progress");
function startProgress(){
  if(!progressEl) return;
  const step = ()=>{
    progress = Math.min(progress+1,100);
    progressEl.textContent = progress + "%";
    if(progress<100){
      requestAnimationFrame(step);
    } else {
      finishLoading();
    }
  };
  requestAnimationFrame(step);
}
function finishLoading(){
  if (document.body.classList.contains("loaded")) return;
  document.body.classList.add("loaded");
  setTimeout(() => document.getElementById("preloader")?.remove(), 500);
}
window.addEventListener("load", startProgress);
setTimeout(finishLoading, 5000);

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
    const timer = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) { clearInterval(timer); el.classList.remove("is-typing"); }
    }, 28);
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

// Global Particle System
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

// Cinematic Dust - Hero only
class CinematicDust {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.hero = this.canvas.parentElement;
    this.particles = [];
    this.count = 180;
    this.active = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.W = 0;
    this.H = 0;
    if (!this.active) return;
    this.resize();
    this.spawn();
    window.addEventListener("resize", () => this.resize());
    this.loop();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.W = this.hero.offsetWidth;
    this.H = this.hero.offsetHeight;
    this.canvas.width = this.W * dpr;
    this.canvas.height = this.H * dpr;
    this.canvas.style.width = this.W + "px";
    this.canvas.style.height = this.H + "px";
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    if (this.particles.length === 0) this.spawn();
  }

  spawn() {
    this.particles = [];
    for (let i = 0; i < this.count; i++) {
      this.particles.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        r: 0.5 + Math.random() * 1,
        baseOpacity: 0.1 + Math.random() * 0.3,
        vy: -(0.15 + Math.random() * 0.2),
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.0008 + Math.random() * 0.0012,
      });
    }
  }

  step() {
    this.particles.forEach(p => {
      p.y += p.vy;
      p.phase += p.twinkleSpeed;
      p.x += Math.sin(p.phase * 0.7) * 0.05;
      if (p.y < -10) {
        p.y = this.H + 10 + Math.random() * 20;
        p.x = Math.random() * this.W;
      }
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.particles.forEach(p => {
      const op = p.baseOpacity * (0.5 + 0.5 * Math.sin(p.phase));
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 248, 230, ${op})`;
      this.ctx.fill();
    });
  }

  loop() {
    this.step();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}

new CinematicDust("hero-dust");