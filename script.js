const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
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
    }
  });
});

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

  projectSlider.addEventListener("mouseenter", pauseAuto);
  projectSlider.addEventListener("mouseleave", resumeAuto);
  projectSlider.addEventListener("focusin", pauseAuto);
  projectSlider.addEventListener("focusout", resumeAuto);
  projectSlider.addEventListener("touchstart", pauseAuto, { passive: true });
  projectSlider.addEventListener("touchend", resumeAutoWithDelay);

  if (!prefersReducedMotion.matches) {
    let direction = 1;
    let lastTime = null;
    const speed = 0.035;

    const step = (time) => {
      const maxScroll = projectSlider.scrollWidth - projectSlider.clientWidth;
      if (lastTime === null) {
        lastTime = time;
        requestAnimationFrame(step);
        return;
      }

      if (maxScroll > 0 && !isPaused) {
        const distance = (time - lastTime) * speed * direction;
        projectSlider.scrollLeft += distance;

        if (projectSlider.scrollLeft >= maxScroll) {
          projectSlider.scrollLeft = maxScroll;
          direction = -1;
        } else if (projectSlider.scrollLeft <= 0) {
          projectSlider.scrollLeft = 0;
          direction = 1;
        }
      }

      lastTime = time;
      requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }
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
