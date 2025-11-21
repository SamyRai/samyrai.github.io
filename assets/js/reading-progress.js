/**
 * Reading Progress Module
 * Shows reading progress bar and estimated time remaining
 */

class ReadingProgress {
  constructor(options = {}) {
    this.options = {
      progressBarSelector:
        options.progressBarSelector || ".reading-progress-bar",
      contentSelector: options.contentSelector || ".post-content",
      showTimeRemaining: options.showTimeRemaining !== false,
      wordsPerMinute: options.wordsPerMinute || 200,
      ...options,
    };

    this.progressBar = null;
    this.timeRemainingEl = null;
    this.content = null;
    this.totalWords = 0;
    this.observer = null;

    this.init();
  }

  init() {
    this.content = document.querySelector(this.options.contentSelector);
    if (!this.content) return;

    this.createProgressBar();
    this.calculateTotalWords();
    this.attachEventListeners();
    this.updateProgress();
  }

  createProgressBar() {
    // Check if progress bar already exists
    if (document.querySelector(this.options.progressBarSelector)) {
      this.progressBar = document.querySelector(
        this.options.progressBarSelector
      );
      return;
    }

    const progressContainer = document.createElement("div");
    progressContainer.className =
      "reading-progress-container fixed top-0 left-0 w-full z-50";
    progressContainer.innerHTML = `
      <div class="reading-progress-bar h-1 bg-primary transition-all duration-300 ease-out" style="width: 0%"></div>
      ${
        this.options.showTimeRemaining
          ? `
        <div class="reading-time-remaining fixed bottom-4 right-4 bg-white shadow-lg rounded-lg px-4 py-2 text-sm text-gray-700 border border-gray-200 hidden">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="time-text">5 min remaining</span>
          </div>
        </div>
      `
          : ""
      }
    `;

    document.body.appendChild(progressContainer);
    this.progressBar = progressContainer.querySelector(".reading-progress-bar");
    this.timeRemainingEl = progressContainer.querySelector(
      ".reading-time-remaining"
    );
  }

  calculateTotalWords() {
    if (!this.content) return;
    const text = this.content.textContent || "";
    this.totalWords = text.trim().split(/\s+/).length;
  }

  attachEventListeners() {
    let ticking = false;

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Show/hide time remaining on scroll
    if (this.timeRemainingEl) {
      let timeoutId;
      window.addEventListener("scroll", () => {
        this.timeRemainingEl.classList.remove("hidden");
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          this.timeRemainingEl.classList.add("hidden");
        }, 2000);
      });
    }
  }

  updateProgress() {
    if (!this.content || !this.progressBar) return;

    const contentRect = this.content.getBoundingClientRect();
    const contentTop = contentRect.top + window.pageYOffset;
    const contentHeight = contentRect.height;
    const windowHeight = window.innerHeight;
    const scrollPosition = window.pageYOffset;

    // Calculate progress percentage
    const progress = Math.max(
      0,
      Math.min(
        100,
        ((scrollPosition - contentTop + windowHeight) /
          (contentHeight + windowHeight)) *
          100
      )
    );

    this.progressBar.style.width = `${progress}%`;

    // Update time remaining
    if (this.timeRemainingEl && this.totalWords > 0) {
      const wordsRemaining = Math.max(
        0,
        this.totalWords * (1 - progress / 100)
      );
      const minutesRemaining = Math.ceil(
        wordsRemaining / this.options.wordsPerMinute
      );

      const timeText = this.timeRemainingEl.querySelector(".time-text");
      if (timeText) {
        if (minutesRemaining <= 0) {
          timeText.textContent = "Finished!";
        } else if (minutesRemaining === 1) {
          timeText.textContent = "1 min remaining";
        } else {
          timeText.textContent = `${minutesRemaining} min remaining`;
        }
      }
    }
  }

  destroy() {
    const container = document.querySelector(".reading-progress-container");
    if (container) {
      container.remove();
    }
  }
}

window.ReadingProgress = ReadingProgress;

// Auto-initialize on single post pages
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".post-content")) {
    new ReadingProgress();
  }
});
