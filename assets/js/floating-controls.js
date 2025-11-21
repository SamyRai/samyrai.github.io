/**
 * Floating Controls Module
 * Handles language and theme switcher dropdowns
 */

window.FloatingControls = class {
  constructor() {
    this.languageToggle = document.getElementById("language-toggle");
    this.languageDropdown = document.getElementById("language-dropdown");
    this.themeToggle = document.getElementById("theme-toggle");
    this.themeDropdown = document.getElementById("theme-dropdown");
    this.activeDropdown = null;

    this.init();
  }

  init() {
    if (!this.languageToggle || !this.themeToggle) {
      console.warn("Floating controls not found");
      return;
    }

    this.attachEventListeners();
    this.loadThemePreference();
  }

  attachEventListeners() {
    // Language toggle
    this.languageToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDropdown("language");
    });

    // Theme toggle
    this.themeToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDropdown("theme");
    });

    // Theme selection
    const themeButtons = this.themeDropdown.querySelectorAll("[data-theme]");
    themeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const theme = button.dataset.theme;
        this.changeTheme(theme);
        this.closeAllDropdowns();
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".floating-control")) {
        this.closeAllDropdowns();
      }
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllDropdowns();
      }
    });
  }

  toggleDropdown(type) {
    const toggle = type === "language" ? this.languageToggle : this.themeToggle;
    const dropdown =
      type === "language" ? this.languageDropdown : this.themeDropdown;
    const isActive = dropdown.classList.contains("active");

    // Close all dropdowns first
    this.closeAllDropdowns();

    // Toggle the clicked one
    if (!isActive) {
      dropdown.classList.add("active");
      toggle.setAttribute("aria-expanded", "true");
      this.activeDropdown = dropdown;
    }
  }

  closeAllDropdowns() {
    [this.languageDropdown, this.themeDropdown].forEach((dropdown) => {
      if (dropdown) {
        dropdown.classList.remove("active");
      }
    });

    [this.languageToggle, this.themeToggle].forEach((toggle) => {
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    this.activeDropdown = null;
  }

  changeTheme(theme) {
    // Theme color mappings
    const themeColors = {
      blue: {
        primary: "#2563eb",
        primaryDark: "#1d4ed8",
        primaryLight: "#dbeafe",
      },
      berry: {
        primary: "#ec4899",
        primaryDark: "#be185d",
        primaryLight: "#fce7f3",
      },
      green: {
        primary: "#22c55e",
        primaryDark: "#15803d",
        primaryLight: "#dcfce7",
      },
      turquoise: {
        primary: "#14b8a6",
        primaryDark: "#0f766e",
        primaryLight: "#ccfbf1",
      },
    };

    const colors = themeColors[theme];
    if (!colors) {
      console.warn(`Theme "${theme}" not found`);
      return;
    }

    // Apply theme colors to CSS custom properties
    const root = document.documentElement;
    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-primary-dark", colors.primaryDark);
    root.style.setProperty("--color-primary-light", colors.primaryLight);

    // Save preference
    try {
      localStorage.setItem("theme-preference", theme);
    } catch (e) {
      console.warn("Could not save theme preference:", e);
    }

    // Update visual indicator
    this.updateThemeIndicator(theme);
  }

  loadThemePreference() {
    try {
      const savedTheme = localStorage.getItem("theme-preference");
      if (savedTheme) {
        // Apply saved theme
        this.changeTheme(savedTheme);
      }
    } catch (e) {
      console.warn("Could not load theme preference:", e);
    }
  }

  updateThemeIndicator(theme) {
    // Remove highlighting from all theme buttons
    const allThemeButtons = this.themeDropdown.querySelectorAll("[data-theme]");
    allThemeButtons.forEach((btn) => {
      btn.style.fontWeight = "";
      btn.style.color = "";
    });

    // Highlight current theme
    const currentThemeButton = this.themeDropdown.querySelector(
      `[data-theme="${theme}"]`
    );
    if (currentThemeButton) {
      currentThemeButton.style.fontWeight = "var(--font-weight-bold)";
      currentThemeButton.style.color = "var(--color-primary)";
    }
  }
};
