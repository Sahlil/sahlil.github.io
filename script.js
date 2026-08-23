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
