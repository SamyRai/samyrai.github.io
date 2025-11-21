/**
 * Smooth Scroll Module
 * Enables smooth scrolling for anchor links
 */

window.SmoothScroll = class {
  constructor(options = {}) {
    this.options = {
      selector: options.selector || 'a[href^="#"]',
      behavior: options.behavior || "smooth",
      block: options.block || "start",
      offset: options.offset || 0,
      ...options,
    };

    this.init();
  }

  init() {
    this.attachEventListeners();
  }

  attachEventListeners() {
    const anchors = document.querySelectorAll(this.options.selector);

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", (e) => this.handleClick(e));
    });
  }

  handleClick(event) {
    event.preventDefault();

    const href = event.currentTarget.getAttribute("href");
    const target = document.querySelector(href);

    if (!target) {
      console.warn(`Target element not found: ${href}`);
      return;
    }

    this.scrollToElement(target);
  }

  scrollToElement(element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition =
      elementPosition + window.pageYOffset - this.options.offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: this.options.behavior,
    });
  }
};
