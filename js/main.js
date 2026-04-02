(function () {
  const doc = document;
  const body = doc.body;
  const root = doc.documentElement;

  const SELECTORS = {
    header: ".site-header",
    hero: ".hero",
    mobileNavToggle: "[data-mobile-nav-toggle]",
    mobileNav: "[data-mobile-nav]",
    filterToggle: "[data-filter-toggle]",
    filtersPanel: ".filters-panel",
    filterChip: ".filter-row button",
    anchorLink: 'a[href^="#"]',
    reveal:
      ".feature-card, .camp-card, .featured-card, .result-card, .detail-card, .benefit-card, .plan-card, .faq-item",
    saveButton: "[data-save-button]",
    video: "video",
    themeToggle: "[data-theme-toggle]",
    themeToggleIcon: ".theme-toggle__icon",
  };

  const state = {
    mobileNavOpen: false,
    filtersOpen: false,
    lastScrollY: window.scrollY,
  };

  function ready(fn) {
    if (doc.readyState === "loading") {
      doc.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function qs(selector, scope = doc) {
    return scope.querySelector(selector);
  }

  function qsa(selector, scope = doc) {
    return Array.from(scope.querySelectorAll(selector));
  }

  function setAriaExpanded(el, value) {
    if (!el) return;
    el.setAttribute("aria-expanded", String(value));
  }

  function toggleBodyScroll(locked) {
    if (window.innerWidth < 768) {
      body.classList.toggle("is-locked", locked);
    } else {
      body.classList.remove("is-locked");
    }
  }

  function handleHeaderState() {
    const header = qs(SELECTORS.header);
    const hero = qs(SELECTORS.hero);

    if (!header) return;

    const isScrolled = window.scrollY > 16;
    header.classList.toggle("is-scrolled", isScrolled);

    if (!hero || window.innerWidth < 768) {
      header.classList.remove("is-hidden");
      state.lastScrollY = window.scrollY;
      return;
    }

    const heroBottom = hero.offsetTop + hero.offsetHeight;
    const currentScrollY = window.scrollY;

    if (currentScrollY > heroBottom - 80) {
      if (currentScrollY > state.lastScrollY) {
        header.classList.add("is-hidden");
      } else {
        header.classList.remove("is-hidden");
      }
    } else {
      header.classList.remove("is-hidden");
    }

    state.lastScrollY = currentScrollY;
  }

  function setupHeader() {
    handleHeaderState();
    window.addEventListener("scroll", handleHeaderState, { passive: true });
    window.addEventListener("resize", handleHeaderState);
  }

  function closeMobileNav() {
    const toggle = qs(SELECTORS.mobileNavToggle);
    const nav = qs(SELECTORS.mobileNav);

    if (!toggle || !nav) return;

    state.mobileNavOpen = false;
    nav.classList.remove("is-open");
    toggle.classList.remove("is-active");
    setAriaExpanded(toggle, false);
    toggleBodyScroll(false);
  }

  function openMobileNav() {
    const toggle = qs(SELECTORS.mobileNavToggle);
    const nav = qs(SELECTORS.mobileNav);

    if (!toggle || !nav) return;

    state.mobileNavOpen = true;
    nav.classList.add("is-open");
    toggle.classList.add("is-active");
    setAriaExpanded(toggle, true);
    toggleBodyScroll(true);
  }

  function setupMobileNav() {
    const toggle = qs(SELECTORS.mobileNavToggle);
    const nav = qs(SELECTORS.mobileNav);

    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      if (state.mobileNavOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    qsa("a", nav).forEach(function (link) {
      link.addEventListener("click", function () {
        if (link.getAttribute("aria-disabled") === "true") return;
        closeMobileNav();
      });
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && state.mobileNavOpen) {
        closeMobileNav();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 768 && state.mobileNavOpen) {
        closeMobileNav();
      }
    });
  }

  function openFilters() {
    const panel = qs(SELECTORS.filtersPanel);
    const toggle = qs(SELECTORS.filterToggle);

    if (!panel || !toggle) return;

    state.filtersOpen = true;
    panel.classList.add("is-open");
    setAriaExpanded(toggle, true);
    toggleBodyScroll(true);
  }

  function closeFilters() {
    const panel = qs(SELECTORS.filtersPanel);
    const toggle = qs(SELECTORS.filterToggle);

    if (!panel || !toggle) return;

    state.filtersOpen = false;
    panel.classList.remove("is-open");
    setAriaExpanded(toggle, false);
    toggleBodyScroll(false);
  }

  function setupFiltersPanel() {
    const panel = qs(SELECTORS.filtersPanel);
    const toggle = qs(SELECTORS.filterToggle);

    if (!panel || !toggle) return;

    toggle.addEventListener("click", function () {
      if (state.filtersOpen) {
        closeFilters();
      } else {
        openFilters();
      }
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && state.filtersOpen) {
        closeFilters();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 768) {
        panel.classList.remove("is-open");
        setAriaExpanded(toggle, false);
        state.filtersOpen = false;
        toggleBodyScroll(false);
      }
    });
  }

  function setupFilterChips() {
    const chips = qsa(SELECTORS.filterChip);

    if (!chips.length) return;

    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", "false");

      chip.addEventListener("click", function () {
        const isActive = chip.classList.toggle("is-active");
        chip.setAttribute("aria-pressed", String(isActive));
      });
    });
  }

  function setupSmoothScroll() {
    const links = qsa(SELECTORS.anchorLink);

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;

        const target = qs(href);
        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }

  function setupReveal() {
    const items = qsa(SELECTORS.reveal);
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    items.forEach(function (item) {
      item.classList.add("will-reveal");
      observer.observe(item);
    });
  }

  function setupVideoVisibility() {
    const videos = qsa(SELECTORS.video);
    if (!videos.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const video = entry.target;

          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            if (video.hasAttribute("autoplay")) {
              video.play().catch(function () {});
            }
          } else {
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      {
        threshold: [0, 0.25, 0.6, 1],
      },
    );

    videos.forEach(function (video) {
      observer.observe(video);
    });
  }

  function setupSaveButtons() {
    const buttons = qsa(SELECTORS.saveButton);
    if (!buttons.length) return;

    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", "false");

      button.addEventListener("click", function () {
        const active = button.classList.toggle("is-saved");
        button.setAttribute("aria-pressed", String(active));
        button.textContent = active ? "Saved" : "Save";
      });
    });
  }

  function setupCardFocus() {
    const cards = qsa(".camp-card__link, .result-card__link, .featured-card a");

    cards.forEach(function (card) {
      card.addEventListener("focus", function () {
        const parent = card.closest(".camp-card, .result-card, .featured-card");
        if (parent) parent.classList.add("is-focused");
      });

      card.addEventListener("blur", function () {
        const parent = card.closest(".camp-card, .result-card, .featured-card");
        if (parent) parent.classList.remove("is-focused");
      });
    });
  }

  function setupCurrentYear() {
    const yearNode = qs("[data-current-year]");
    if (!yearNode) return;
    yearNode.textContent = String(new Date().getFullYear());
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const icon = qs(SELECTORS.themeToggleIcon);
    const toggle = qs(SELECTORS.themeToggle);

    if (icon) {
      icon.textContent = theme === "light" ? "☀" : "☾";
    }

    if (toggle) {
      toggle.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to dark mode" : "Switch to light mode",
      );
    }
  }

  function setupThemeToggle() {
    const toggle = qs(SELECTORS.themeToggle);
    if (!toggle) return;

    const savedTheme = localStorage.getItem("theme");
    const initialTheme = savedTheme || "dark";
    applyTheme(initialTheme);

    toggle.addEventListener("click", function () {
      const currentTheme = root.getAttribute("data-theme") || "dark";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      localStorage.setItem("theme", nextTheme);
    });
  }

  ready(function () {
    setupHeader();
    setupMobileNav();
    setupFiltersPanel();
    setupFilterChips();
    setupSmoothScroll();
    setupReveal();
    setupVideoVisibility();
    setupSaveButtons();
    setupCardFocus();
    setupCurrentYear();
    setupThemeToggle();
  });
})();
