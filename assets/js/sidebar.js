/**
 * Sidebar Module
 * Handles sidebar open/close functionality for mobile and desktop
 */

window.Sidebar = class {
  constructor() {
    this.sidebar = document.getElementById("sidebar");
    this.toggle = document.getElementById("sidebar-toggle");
    this.close = document.getElementById("sidebar-close");
    this.overlay = document.getElementById("sidebar-overlay");
    this.breakpoint = 1024; // lg breakpoint
    this.resizeTimeout = null;
    this.storageKey = "samyrai.sidebarOpen";

    console.log("Sidebar initialized:", {
      sidebar: !!this.sidebar,
      toggle: !!this.toggle,
      close: !!this.close,
      overlay: !!this.overlay,
    });

    this.init();
  }

  init() {
    if (!this.sidebar || !this.toggle) {
      console.warn("Sidebar elements not found");
      return;
    }

    // Set initial state based on screen size
    this.updateSidebarState();
    this.attachEventListeners();
    // Accessibility: set initial aria-hidden for sidebar
    if (this.sidebar) {
      this.sidebar.setAttribute(
        "aria-hidden",
        this.isOpen() ? "false" : "true"
      );
    }
  }

  updateSidebarState() {
    // On desktop, ensure the sidebar is visible by default.
    // We no longer force removal of the 'sidebar-open' class on desktop so the
    // toggle button remains useful and state is consistent across sizes.
    if (window.innerWidth >= this.breakpoint) {
      // Ensure the page isn't scroll-locked on desktop
      document.body.style.overflow = "";
      // Respect user's last preference (persisted in localStorage). If the
      // user previously closed the sidebar on desktop, keep it collapsed.
      try {
        const pref = localStorage.getItem(this.storageKey);
        if (pref === "false") {
          document.body.classList.remove("sidebar-open");
          if (this.toggle) this.toggle.setAttribute("aria-expanded", "false");
          if (this.sidebar) this.sidebar.setAttribute("aria-hidden", "true");
        } else {
          document.body.classList.add("sidebar-open");
          if (this.toggle) this.toggle.setAttribute("aria-expanded", "true");
          if (this.sidebar) this.sidebar.setAttribute("aria-hidden", "false");
        }
      } catch (err) {
        // localStorage may be unavailable (e.g., private mode) — default to
        // showing the sidebar on desktop.
        document.body.classList.add("sidebar-open");
        if (this.toggle) this.toggle.setAttribute("aria-expanded", "true");
        if (this.sidebar) this.sidebar.setAttribute("aria-hidden", "false");
      }
    } else {
      // Mobile: default to closed state (no sidebar-open)
      document.body.classList.remove("sidebar-open");
      if (this.toggle) this.toggle.setAttribute("aria-expanded", "false");
      if (this.sidebar) this.sidebar.setAttribute("aria-hidden", "true");
    }
  }

  attachEventListeners() {
    // Toggle button
    if (this.toggle) {
      this.toggle.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleSidebar();
      });
      // Accessibility: expose current state
      try {
        this.toggle.setAttribute(
          "aria-expanded",
          this.isOpen() ? "true" : "false"
        );
        this.toggle.setAttribute(
          "aria-controls",
          this.sidebar ? this.sidebar.id : ""
        );
      } catch (err) {
        // Not critical — log for debugging
        console.warn("Failed to set ARIA attributes for sidebar toggle", err);
      }
    }

    // Close button
    if (this.close) {
      this.close.addEventListener("click", (e) => {
        console.log("Close button clicked");
        e.preventDefault();
        e.stopPropagation();
        this.closeSidebar();
      });
    } else {
      console.warn("Close button not found");
    }

    // Overlay click
    if (this.overlay) {
      this.overlay.addEventListener("click", (e) => {
        e.preventDefault();
        this.closeSidebar();
      });
    }

    // Close sidebar when clicking an internal anchor link (mobile only)
    try {
      const anchorLinks = this.sidebar.querySelectorAll('a[href^="#"]');
      anchorLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          // Close after navigation for mobile devices
          if (window.innerWidth < this.breakpoint && this.isOpen()) {
            // small timeout to allow default handlers (e.g. smooth scroll) to run first
            setTimeout(() => this.closeSidebar(), 50);
          }
        });
      });
    } catch (err) {
      // Graceful fallback if sidebar DOM isn't present yet
      console.warn("No sidebar links to attach close behavior to", err);
    }

    // Escape key
    document.addEventListener("keydown", (e) => this.handleEscape(e));

    // Window resize
    window.addEventListener("resize", () => this.handleResize());
  }

  open() {
    document.body.classList.add("sidebar-open");
    if (this.toggle) this.toggle.setAttribute("aria-expanded", "true");
    if (this.sidebar) this.sidebar.setAttribute("aria-hidden", "false");

    // Only prevent body scroll on mobile
    if (window.innerWidth < this.breakpoint) {
      document.body.style.overflow = "hidden";
    }
    try {
      localStorage.setItem(this.storageKey, "true");
    } catch (err) {
      // ignore
    }
  }

  closeSidebar() {
    console.log("Closing sidebar");

    // Close sidebar for both mobile and desktop (desktop may collapse into an
    // overlay-less state). Keep accessibility attributes in sync.
    document.body.classList.remove("sidebar-open");
    if (this.toggle) this.toggle.setAttribute("aria-expanded", "false");
    if (this.sidebar) this.sidebar.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    try {
      localStorage.setItem(this.storageKey, "false");
    } catch (err) {
      // ignore
    }
  }

  toggleSidebar() {
    // Toggle the sidebar across device sizes. Desktop will collapse/expand the
    // sidebar too — this is more user friendly and matches the visibility of
    // the toggle button.
    const isOpen = this.isOpen();
    isOpen ? this.closeSidebar() : this.open();
  }

  isOpen() {
    return document.body.classList.contains("sidebar-open");
  }

  handleEscape(event) {
    if (event.key === "Escape" && this.isOpen()) {
      this.closeSidebar();
    }
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.updateSidebarState();
    }, 150);
  }
};
