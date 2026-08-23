const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

function setMenuState(isOpen) {
  if (!menuToggle || !siteNav) {
    return;
  }

  menuToggle.classList.toggle("is-open", isOpen);
  siteNav.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Tutup menu navigasi" : "Buka menu navigasi",
  );
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    setMenuState(!siteNav.classList.contains("is-open"));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      setMenuState(false);
    }
  });
}

const scrollLinks = document.querySelectorAll("[data-scroll]");
scrollLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetSelector = link.getAttribute("data-scroll");
    const target = targetSelector
      ? document.querySelector(targetSelector)
      : null;
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
      target.focus({ preventScroll: true });
    }
  });
});

const scrollProgress = document.getElementById("scrollProgress");
if (scrollProgress) {
  const sections = document.querySelectorAll("section.section");
  
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
    
    // Color shift by section
    const viewportMid = window.innerHeight * 0.4;
    let activeSection = null;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= viewportMid && rect.bottom >= viewportMid) {
        activeSection = section;
      }
    });
    
    if (activeSection) {
      const isAlt = activeSection.classList.contains("alt");
      scrollProgress.style.background = isAlt 
        ? "var(--accent-strong)" 
        : "var(--accent)";
    }
  };
  
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
}

const projectSlider = document.querySelector(".project-slider");
if (projectSlider) {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  let isPaused = false;
  let resumeTimer = null;

  const pauseAuto = () => {
    isPaused = true;
    if (resumeTimer) {
      clearTimeout(resumeTimer);
      resumeTimer = null;
    }
  };

  const resumeAuto = () => {
    if (prefersReducedMotion.matches) {
      return;
    }
    isPaused = false;
  };

  const resumeAutoWithDelay = () => {
    if (prefersReducedMotion.matches) {
      return;
    }
    if (resumeTimer) {
      clearTimeout(resumeTimer);
    }
    resumeTimer = setTimeout(() => {
      isPaused = false;
    }, 1600);
  };

  projectSlider.addEventListener(
    "wheel",
    (event) => {
      const maxScroll = projectSlider.scrollWidth - projectSlider.clientWidth;
      if (maxScroll <= 0) {
        return;
      }

      if (
        (event.deltaY < 0 && projectSlider.scrollLeft <= 0) ||
        (event.deltaY > 0 && projectSlider.scrollLeft >= maxScroll)
      ) {
        return;
      }

      pauseAuto();
      event.preventDefault();
      projectSlider.scrollLeft += event.deltaY;
      resumeAutoWithDelay();
    },
    { passive: false },
  );

  projectSlider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      projectSlider.scrollBy({ left: -300, behavior: "smooth" });
    } else if (e.key === "ArrowRight") {
      projectSlider.scrollBy({ left: 300, behavior: "smooth" });
    }
  });

  projectSlider.addEventListener("mouseenter", pauseAuto);
  projectSlider.addEventListener("mouseleave", resumeAuto);
  projectSlider.addEventListener("focusin", pauseAuto);
  projectSlider.addEventListener("focusout", resumeAuto);
  projectSlider.addEventListener("touchstart", pauseAuto, { passive: true });
  projectSlider.addEventListener("touchend", resumeAutoWithDelay);
}

// Global reveal and counter observer
const revealItems = document.querySelectorAll(".reveal");

function animateCounter(el) {
  const target = parseInt(el.getAttribute("data-target") || el.textContent, 10);
  if (isNaN(target)) return;
  
  const duration = 2000;
  const startTime = performance.now();
  const suffix = el.getAttribute("data-suffix") || "";
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const currentCount = Math.floor(easeProgress * target);
    el.textContent = currentCount + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(update);
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          if (entry.target.classList.contains("hero-stats")) {
            entry.target.querySelectorAll(".stat-value").forEach(animateCounter);
          }
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// Skill tag tooltip for mobile
const skillTags = document.querySelectorAll(".skill-tag[data-desc]");
if (skillTags.length > 0) {
  let activeTooltip = null;
  skillTags.forEach((tag) => {
    tag.addEventListener("click", (e) => {
      if (window.innerWidth <= 720) {
        e.preventDefault();
        e.stopPropagation();
        if (activeTooltip && activeTooltip !== tag) activeTooltip.classList.remove("tooltip-visible");
        tag.classList.toggle("tooltip-visible");
        activeTooltip = tag.classList.contains("tooltip-visible") ? tag : null;
      }
    });
  });
  document.addEventListener("click", (e) => {
    if (activeTooltip && !activeTooltip.contains(e.target)) {
      activeTooltip.classList.remove("tooltip-visible");
      activeTooltip = null;
    }
  });
}

// Typewriter tagline
const taglineRotator = document.querySelector(".tagline-rotator");
if (taglineRotator) {
  let roles;
  try { roles = JSON.parse(taglineRotator.getAttribute("data-roles") || "[]"); } catch { roles = []; }
  
  if (roles.length > 0) {
    let currentRoleIdx = 0, charIdx = 0, isDeleting = false;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const TYPE_SPEED = 60, DELETE_SPEED = 35, HOLD_TIME = 1800, PAUSE_BETWEEN = 300;
    
    let srText = taglineRotator.querySelector(".sr-only") || document.createElement("span");
    if (!srText.parentNode) {
      srText.className = "sr-only";
      taglineRotator.parentNode.insertBefore(srText, taglineRotator.nextSibling);
    }
    
    function typeLoop() {
      const currentRole = roles[currentRoleIdx];
      if (prefersReducedMotion) {
        taglineRotator.textContent = currentRole;
        srText.textContent = currentRole;
        setTimeout(() => { currentRoleIdx = (currentRoleIdx + 1) % roles.length; typeLoop(); }, HOLD_TIME);
        return;
      }
      if (!isDeleting) {
        if (charIdx < currentRole.length) {
          taglineRotator.textContent = currentRole.slice(0, charIdx + 1);
          charIdx++;
          setTimeout(typeLoop, TYPE_SPEED);
        } else {
          srText.textContent = currentRole;
          isDeleting = true;
          setTimeout(typeLoop, HOLD_TIME);
        }
      } else {
        if (charIdx > 0) {
          taglineRotator.textContent = currentRole.slice(0, charIdx - 1);
          charIdx--;
          setTimeout(typeLoop, DELETE_SPEED);
        } else {
          isDeleting = false;
          currentRoleIdx = (currentRoleIdx + 1) % roles.length;
          setTimeout(typeLoop, PAUSE_BETWEEN);
        }
      }
    }
    typeLoop();
  }
}

// Particle System Factory
class ParticleSystem {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.parent = canvas.parentElement;
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.canvasRect = { width: 0, height: 0 };
    this.isActive = false;
    this.animationId = null;

    // Config
    this.count = options.count || 100;
    this.minSize = options.minSize || 1.2;
    this.maxSize = options.maxSize || 2.8;
    this.attractionRadius = options.attractionRadius || 180;
    this.attractionStrength = options.attractionStrength || 0.025;
    this.burstRadius = options.burstRadius || 220;
    this.burstForce = options.burstForce || 4.5;
    this.friction = 0.97;
    this.driftSpeed = 0.03;

    this.accentRgb = [232, 125, 74]; // Default terracotta
    this.bgColor = "rgba(28, 25, 23, 0.85)"; // Dark base

    this.init();
  }

  getAccentColor() {
    const computed = getComputedStyle(document.documentElement);
    const val = computed.getPropertyValue("--accent").trim();
    if (val) {
      if (val.startsWith("#")) {
        const hex = val.slice(1);
        this.accentRgb = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
      } else if (val.startsWith("rgb")) {
        this.accentRgb = val.match(/\d+/g).map(Number);
      }
    }
  }

  resize() {
    this.canvasRect.width = this.canvas.width = this.parent.clientWidth;
    this.canvasRect.height = this.canvas.height = this.parent.clientHeight;
  }

  createParticle() {
    const size = this.minSize + Math.random() * (this.maxSize - this.minSize);
    return {
      x: Math.random() * this.canvasRect.width,
      y: Math.random() * this.canvasRect.height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: size,
      baseSize: size,
      opacity: 0.3 + Math.random() * 0.5,
      driftAngle: Math.random() * Math.PI * 2,
      driftSpeed: this.driftSpeed * (0.5 + Math.random() * 0.5)
    };
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.count; i++) this.particles.push(this.createParticle());
  }

  bindEvents() {
    this.parent.addEventListener("mousemove", (e) => {
      const rect = this.parent.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    this.parent.addEventListener("mouseleave", () => { this.mouse.x = null; this.mouse.y = null; });
    this.parent.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      const rect = this.parent.getBoundingClientRect();
      this.burst(e.clientX - rect.left, e.clientY - rect.top);
    });
    
    // Resize support
    window.addEventListener("resize", () => {
      const oldW = this.canvasRect.width, oldH = this.canvasRect.height;
      this.resize();
      if (oldW > 0 && oldH > 0) {
        const sx = this.canvasRect.width / oldW, sy = this.canvasRect.height / oldH;
        this.particles.forEach(p => { p.x *= sx; p.y *= sy; });
      }
    });
  }

  burst(cx, cy) {
    this.particles.forEach(p => {
      const dx = p.x - cx, dy = p.y - cy, dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (dist < this.burstRadius) {
        const force = (this.burstForce * (1 - dist / this.burstRadius)) / dist;
        p.vx += dx * force; p.vy += dy * force;
      }
    });
  }

  update() {
    this.particles.forEach(p => {
      p.driftAngle += p.driftSpeed * 0.01;
      p.vx += Math.cos(p.driftAngle) * 0.0008;
      p.vy += Math.sin(p.driftAngle) * 0.0008;

      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - p.x, dy = this.mouse.y - p.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.attractionRadius && dist > 1) {
          const force = this.attractionStrength * (1 - dist / this.attractionRadius) / dist;
          p.vx += dx * force; p.vy += dy * force;
        }
      }

      p.x += p.vx; p.y += p.vy;
      p.vx *= this.friction; p.vy *= this.friction;

      const m = 50;
      if (p.x < -m) p.x = this.canvasRect.width + m;
      if (p.x > this.canvasRect.width + m) p.x = -m;
      if (p.y < -m) p.y = this.canvasRect.height + m;
      if (p.y > this.canvasRect.height + m) p.y = -m;
      p.size = p.baseSize * (0.95 + Math.sin(p.driftAngle * 0.7) * 0.05);
    });
  }

  draw() {
    this.getAccentColor();
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this.canvasRect.width, this.canvasRect.height);
    const [r, g, b] = this.accentRgb;
    this.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
      this.ctx.fill();
    });
  }

  start() { if (!this.isActive) { this.isActive = true; this.loop(); } }
  stop() { this.isActive = false; cancelAnimationFrame(this.animationId); }

  loop() {
    if (!this.isActive) return;
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.loop());
  }

  init() {
    this.resize();
    this.initParticles();
    this.bindEvents();
  }
}

// Initialize Particle Systems with Visibility Observer
const systems = [];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  // Hero System
  const heroCanvas = document.getElementById("particleCanvas");
  if (heroCanvas) systems.push({ el: heroCanvas, instance: new ParticleSystem(heroCanvas, { count: 120 }) });

  // Section Systems
  document.querySelectorAll(".section-particles").forEach(canvas => {
    systems.push({ el: canvas, instance: new ParticleSystem(canvas, { count: 60, attractionRadius: 150 }) });
  });

  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const system = systems.find(s => s.el === entry.target);
      if (system) {
        if (entry.isIntersecting) system.instance.start();
        else system.instance.stop();
      }
    });
  }, { threshold: 0.05 });

  systems.forEach(s => visibilityObserver.observe(s.el));
}
