const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;

function applyTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function initTheme() {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = stored || (prefersDark ? "dark" : "light");
  applyTheme(initial);
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });
}

initTheme();

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

const revealItems = document.querySelectorAll(".reveal");

// Skill tag tooltip for mobile (tap to show)
const skillTags = document.querySelectorAll(".skill-tag[data-desc]");
if (skillTags.length > 0) {
  let activeTooltip = null;
  
  skillTags.forEach((tag) => {
    tag.addEventListener("click", (e) => {
      // On mobile, toggle tooltip on click
      if (window.innerWidth <= 720) {
        e.preventDefault();
        e.stopPropagation();
        
        if (activeTooltip && activeTooltip !== tag) {
          activeTooltip.classList.remove("tooltip-visible");
        }
        
        tag.classList.toggle("tooltip-visible");
        activeTooltip = tag.classList.contains("tooltip-visible") ? tag : null;
      }
    });
  });
  
  // Close tooltip on outside click
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
  try {
    roles = JSON.parse(taglineRotator.getAttribute("data-roles") || "[]");
  } catch {
    roles = [];
  }
  
  if (roles.length > 0) {
    let currentRoleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    const TYPE_SPEED = 60;      // ms per char when typing
    const DELETE_SPEED = 35;    // ms per char when deleting
    const HOLD_TIME = 1800;     // ms to hold full text
    const PAUSE_BETWEEN = 300;  // ms pause before next role
    
    // Screen reader text (updated once per role)
    let srText = taglineRotator.querySelector(".sr-only");
    if (!srText) {
      srText = document.createElement("span");
      srText.className = "sr-only";
      taglineRotator.parentNode.insertBefore(srText, taglineRotator.nextSibling);
    }
    
    function typeLoop() {
      const currentRole = roles[currentRoleIdx];
      
      if (prefersReducedMotion) {
        // Reduced motion: instant swap, no animation
        taglineRotator.textContent = currentRole;
        srText.textContent = currentRole;
        setTimeout(() => {
          currentRoleIdx = (currentRoleIdx + 1) % roles.length;
          typeLoop();
        }, HOLD_TIME);
        return;
      }
      
      if (!isDeleting) {
        // Typing forward
        if (charIdx < currentRole.length) {
          taglineRotator.textContent = currentRole.slice(0, charIdx + 1);
          charIdx++;
          setTimeout(typeLoop, TYPE_SPEED);
        } else {
          // Finished typing - hold
          srText.textContent = currentRole;
          isDeleting = true;
          setTimeout(typeLoop, HOLD_TIME);
        }
      } else {
        // Deleting
        if (charIdx > 0) {
          taglineRotator.textContent = currentRole.slice(0, charIdx - 1);
          charIdx--;
          setTimeout(typeLoop, DELETE_SPEED);
        } else {
          // Finished deleting - move to next role
          isDeleting = false;
          currentRoleIdx = (currentRoleIdx + 1) % roles.length;
          setTimeout(typeLoop, PAUSE_BETWEEN);
        }
      }
    }
    
    // Start the loop
    typeLoop();
  }
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute("data-target") || el.textContent, 10);
  if (isNaN(target)) return;
  
  let count = 0;
  const duration = 2000; // 2 seconds
  const startTime = performance.now();
  const suffix = el.getAttribute("data-suffix") || "";
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out expo
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    
    const currentCount = Math.floor(easeProgress * target);
    el.textContent = currentCount + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target + suffix;
    }
  }
  
  requestAnimationFrame(update);
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          
          // Trigger counter animation if it's a stat card
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

// Interactive Particle Field (Antigravity-style)
(function () {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    canvas.style.display = "none";
    return;
  }

  const ctx = canvas.getContext("2d");
  const hero = document.querySelector(".hero");
  if (!hero) return;

  // Configuration
  const PARTICLE_COUNT = 120;
  const PARTICLE_MIN_SIZE = 1.2;
  const PARTICLE_MAX_SIZE = 2.8;
  const BASE_SPEED = 0.15;
  const ATTRACTION_RADIUS = 180;
  const ATTRACTION_STRENGTH = 0.025;
  const BURST_RADIUS = 220;
  const BURST_FORCE = 4.5;
  const FRICTION = 0.97;
  const DRIFT_SPEED = 0.03;

  let particles = [];
  let mouse = { x: null, y: null, down: false };
  let canvasRect = { width: 0, height: 0 };
  let animationId = null;
  let lastTheme = null;

  // Color cache
  let accentColor = "#c45a2a";
  let accentRgb = [196, 90, 42];

  function getAccentColor() {
    const computed = getComputedStyle(document.documentElement);
    const val = computed.getPropertyValue("--accent").trim();
    if (val && val !== accentColor) {
      accentColor = val;
      // Parse RGB from hex or rgb()
      if (val.startsWith("#")) {
        const hex = val.slice(1);
        accentRgb = [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16)
        ];
      } else if (val.startsWith("rgb")) {
        accentRgb = val.match(/\d+/g).map(Number);
      }
    }
    return accentColor;
  }

  function resize() {
    canvasRect.width = canvas.width = hero.clientWidth;
    canvasRect.height = canvas.height = hero.clientHeight;
  }

  function createParticle() {
    const size = PARTICLE_MIN_SIZE + Math.random() * (PARTICLE_MAX_SIZE - PARTICLE_MIN_SIZE);
    return {
      x: Math.random() * canvasRect.width,
      y: Math.random() * canvasRect.height,
      vx: (Math.random() - 0.5) * BASE_SPEED,
      vy: (Math.random() - 0.5) * BASE_SPEED,
      size: size,
      baseSize: size,
      opacity: 0.3 + Math.random() * 0.5,
      driftAngle: Math.random() * Math.PI * 2,
      driftSpeed: DRIFT_SPEED * (0.5 + Math.random() * 0.5)
    };
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function updateTheme() {
    getAccentColor();
    // Recreate particles with new color on next frame (handled in draw)
  }

  // Mouse interaction
  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  hero.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  hero.addEventListener("mousedown", () => {
    mouse.down = true;
  });

  hero.addEventListener("mouseup", () => {
    mouse.down = false;
  });

  // Touch support
  hero.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      const rect = hero.getBoundingClientRect();
      const touch = e.touches[0];
      mouse.x = touch.clientX - rect.left;
      mouse.y = touch.clientY - rect.top;
    }
  }, { passive: true });

  hero.addEventListener("touchend", () => {
    mouse.x = null;
    mouse.y = null;
  });

  hero.addEventListener("click", (e) => {
    if (e.target.closest("a, button")) return; // Don't burst on UI clicks
    const rect = hero.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    burst(clickX, clickY);
  });

  function burst(cx, cy) {
    particles.forEach(p => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (dist < BURST_RADIUS) {
        const force = (BURST_FORCE * (1 - dist / BURST_RADIUS)) / dist;
        p.vx += dx * force;
        p.vy += dy * force;
      }
    });
  }

  function update() {
    const cx = canvasRect.width * 0.5;
    const cy = canvasRect.height * 0.5;

    particles.forEach(p => {
      // Organic drift
      p.driftAngle += p.driftSpeed * 0.01;
      p.vx += Math.cos(p.driftAngle) * 0.0008;
      p.vy += Math.sin(p.driftAngle) * 0.0008;

      // Mouse attraction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ATTRACTION_RADIUS && dist > 1) {
          const force = ATTRACTION_STRENGTH * (1 - dist / ATTRACTION_RADIUS) / dist;
          p.vx += dx * force;
          p.vy += dy * force;
        }
      }

      // Apply velocity with friction
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= FRICTION;
      p.vy *= FRICTION;

      // Boundary wrap (organic flow)
      const margin = 50;
      if (p.x < -margin) p.x = canvasRect.width + margin;
      if (p.x > canvasRect.width + margin) p.x = -margin;
      if (p.y < -margin) p.y = canvasRect.height + margin;
      if (p.y > canvasRect.height + margin) p.y = -margin;

      // Subtle size pulse
      p.size = p.baseSize * (0.95 + Math.sin(p.driftAngle * 0.7) * 0.05);
    });
  }

  function draw() {
    // Check theme change
    getAccentColor();

    // Clear with slight fade for subtle trails (very thin)
    ctx.fillStyle = "rgba(253, 251, 247, 0.85)";
    if (document.documentElement.getAttribute("data-theme") === "dark") {
      ctx.fillStyle = "rgba(28, 25, 23, 0.85)";
    }
    ctx.fillRect(0, 0, canvasRect.width, canvasRect.height);

    const [r, g, b] = accentRgb;

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
      ctx.fill();
    });
  }

  function loop() {
    update();
    draw();
    animationId = requestAnimationFrame(loop);
  }

  // Handle resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const oldWidth = canvasRect.width;
      const oldHeight = canvasRect.height;
      resize();
      // Scale particle positions
      if (oldWidth > 0 && oldHeight > 0) {
        const scaleX = canvasRect.width / oldWidth;
        const scaleY = canvasRect.height / oldHeight;
        particles.forEach(p => {
          p.x *= scaleX;
          p.y *= scaleY;
        });
      }
    }, 150);
  });

  // Theme change listener
  const themeObserver = new MutationObserver(() => {
    if (document.documentElement.getAttribute("data-theme") !== lastTheme) {
      lastTheme = document.documentElement.getAttribute("data-theme");
      updateTheme();
    }
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  lastTheme = document.documentElement.getAttribute("data-theme");

  // Initialize
  resize();
  initParticles();
  loop();
})();
