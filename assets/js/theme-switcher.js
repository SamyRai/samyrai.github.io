/**
 * Theme Switcher Module
 * Manages theme selection and application
 */

window.ThemeSwitcher = class {
  constructor(options = {}) {
    this.themes = options.themes || [
      "blue",
      "turquoise",
      "green",
      "berry",
      "orange",
      "ceramic",
    ];

    this.colorMap = {
      blue: {
        primary: "#2563eb",
        primaryDark: "#1d4ed8",
        primaryLight: "#dbeafe",
      },
      turquoise: {
        primary: "#14b8a6",
        primaryDark: "#0f766e",
        primaryLight: "#ccfbf1",
      },
      green: {
        primary: "#22c55e",
        primaryDark: "#15803d",
        primaryLight: "#dcfce7",
      },
      berry: {
        primary: "#ec4899",
        primaryDark: "#be185d",
        primaryLight: "#fce7f3",
      },
      orange: {
        primary: "#f97316",
        primaryDark: "#c2410c",
        primaryLight: "#ffedd5",
      },
      ceramic: {
        primary: "#78716c",
        primaryDark: "#44403c",
        primaryLight: "#f5f5f4",
      },
    };

    this.currentThemeIndex = 0;
    this.button = null;

    this.init();
  }

  init() {
    this.createButton();
    this.attachEventListeners();
  }

  createButton() {
    this.button = document.createElement("button");
    this.button.className = "theme-switcher";
    this.button.setAttribute("aria-label", "Switch theme");
    this.button.innerHTML = `
      <div class="theme-switcher-content">
        <svg class="theme-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"/>
        </svg>
        <span class="theme-label">Theme</span>
        <span class="theme-indicator">${
          this.themes[this.currentThemeIndex]
        }</span>
      </div>
    `;

    document.body.appendChild(this.button);
  }

  attachEventListeners() {
    if (this.button) {
      this.button.addEventListener("click", () => this.switchTheme());
    }
  }

  switchTheme() {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    const newTheme = this.themes[this.currentThemeIndex];

    this.applyTheme(newTheme);
    this.updateIndicator(newTheme);
    this.animateButton();
  }

  applyTheme(themeName) {
    const colors = this.colorMap[themeName];

    if (!colors) {
      console.warn(`Theme "${themeName}" not found`);
      return;
    }

    const root = document.documentElement;
    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-primary-dark", colors.primaryDark);
    root.style.setProperty("--color-primary-light", colors.primaryLight);
  }

  updateIndicator(themeName) {
    const indicator = this.button?.querySelector(".theme-indicator");

    if (indicator) {
      indicator.textContent = themeName;
      indicator.style.opacity = "0.7";

      setTimeout(() => {
        indicator.style.opacity = "1";
      }, 200);
    }
  }

  animateButton() {
    if (this.button) {
      this.button.style.transform = "scale(0.95)";

      setTimeout(() => {
        this.button.style.transform = "scale(1)";
      }, 150);
    }
  }
};
