/**
 * Animations Module
 * Handles scroll-based animations using Intersection Observer
 */

window.Animations = class {
  constructor(options = {}) {
    this.options = {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || "0px 0px -50px 0px",
      animationClass: options.animationClass || "animate-fade-in",
      selector: options.selector || "section",
      ...options,
    };

    this.observer = null;
    this.init();
  }

  init() {
    this.createObserver();
    this.observeElements();
  }

  createObserver() {
    const observerOptions = {
      threshold: this.options.threshold,
      rootMargin: this.options.rootMargin,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
        }
      });
    }, observerOptions);
  }

  observeElements() {
    const elements = document.querySelectorAll(this.options.selector);
    elements.forEach((element) => {
      this.observer.observe(element);
    });
  }

  animateElement(element) {
    element.classList.add(this.options.animationClass);

    // Unobserve after animation to improve performance
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
};
