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
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
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
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
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
