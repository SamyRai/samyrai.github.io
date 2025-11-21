/**
 * Main Application Entry Point
 * Initializes all modules and handles global events
 */

class ResumeApp {
  constructor() {
    this.modules = {};
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.initModules());
    } else {
      this.initModules();
    }

    // Handle page load
    window.addEventListener("load", () => this.onPageLoad());
  }

  initModules() {
    // Initialize sidebar
    this.modules.sidebar = new window.Sidebar();

    // Initialize floating controls
    this.modules.floatingControls = new window.FloatingControls();

    // Initialize animations
    this.modules.animations = new window.Animations({
      selector: "section",
      threshold: 0.1,
      animationClass: "animate-fade-in",
    });

    // Initialize smooth scrolling
    this.modules.smoothScroll = new window.SmoothScroll({
      selector: 'a[href^="#"]',
      behavior: "smooth",
      offset: 20,
    });

    // Initialize filtering for posts
    if (window.FilterPosts && document.querySelector(".posts-list")) {
      try {
        this.modules.filterPosts = new window.FilterPosts({
          container: ".posts-list",
          selector: ".post-item",
        });
      } catch (e) {
        console.warn("FilterPosts initialization failed:", e);
      }
    }

    // Initialize reading progress for single posts
    if (window.ReadingProgress && document.querySelector(".post-content")) {
      try {
        this.modules.readingProgress = new window.ReadingProgress({
          contentSelector: ".post-content",
          showTimeRemaining: true,
        });
      } catch (e) {
        console.warn("ReadingProgress initialization failed:", e);
      }
    }

    // Initialize table of contents for single posts
    if (window.TableOfContents && document.querySelector(".post-content")) {
      try {
        const headings = document.querySelectorAll(
          ".post-content h2, .post-content h3, .post-content h4"
        );
        if (headings.length >= 3) {
          this.modules.tableOfContents = new window.TableOfContents({
            contentSelector: ".post-content",
            headingSelector: "h2, h3, h4",
          });
        }
      } catch (e) {
        console.warn("TableOfContents initialization failed:", e);
      }
    }

    // Expose modules globally for debugging/external access
    window.ResumeSite = {
      modules: this.modules,
      version: "2.2.0",
      features: {
        sidebar: true,
        floatingControls: true,
        animations: true,
        smoothScroll: true,
        filterPosts: !!this.modules.filterPosts,
        readingProgress: !!this.modules.readingProgress,
        tableOfContents: !!this.modules.tableOfContents,
      },
    };

    console.log("ResumeSite initialized:", window.ResumeSite.features);
  }

  onPageLoad() {
    // Add loaded class for CSS animations
    document.body.classList.add("loaded");

    // Lazy load images
    this.initLazyLoading();
  }

  initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
            }
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach((img) => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    }
  }
}

// Initialize the application
new ResumeApp();
