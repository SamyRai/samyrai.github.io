/**
 * Modern client-side search using the JSON API
 * Implements fuzzy search with highlighting
 */

(function () {
  "use strict";

  class SearchEngine {
    constructor() {
      this.posts = [];
      this.searchInput = document.getElementById("search-input");
      this.searchResults = document.getElementById("search-results");
      this.initialized = false;

      if (this.searchInput && this.searchResults) {
        this.init();
      }
    }

    async init() {
      try {
        // Fetch posts data from JSON API
        const response = await fetch("/posts/index.json");
        const data = await response.json();
        this.posts = data.posts || [];
        this.initialized = true;

        // Set up event listeners
        this.searchInput.addEventListener(
          "input",
          this.debounce(() => this.search(), 300)
        );
        this.searchInput.addEventListener("focus", () => {
          if (this.searchInput.value) this.search();
        });

        // Close results when clicking outside
        document.addEventListener("click", (e) => {
          if (!e.target.closest(".search-container")) {
            this.hideResults();
          }
        });
      } catch (error) {
        console.error("Failed to initialize search:", error);
      }
    }

    search() {
      const query = this.searchInput.value.trim().toLowerCase();

      if (query.length < 2) {
        this.hideResults();
        return;
      }

      const results = this.posts
        .filter((post) => {
          const titleMatch = post.title.toLowerCase().includes(query);
          const summaryMatch = post.summary?.toLowerCase().includes(query);
          const tagsMatch = post.tags?.some((tag) =>
            tag.toLowerCase().includes(query)
          );
          const categoryMatch = post.categories?.some((cat) =>
            cat.toLowerCase().includes(query)
          );

          return titleMatch || summaryMatch || tagsMatch || categoryMatch;
        })
        .slice(0, 10); // Limit to 10 results

      this.displayResults(results, query);
    }

    displayResults(results, query) {
      if (results.length === 0) {
        this.searchResults.innerHTML =
          '<div class="search-no-results">No results found</div>';
        this.searchResults.classList.add("active");
        return;
      }

      const html = results
        .map(
          (post) => `
        <a href="${post.url}" class="search-result-item">
          <div class="search-result-title">${this.highlight(
            post.title,
            query
          )}</div>
          ${
            post.summary
              ? `<div class="search-result-summary">${this.highlight(
                  this.truncate(post.summary, 150),
                  query
                )}</div>`
              : ""
          }
          <div class="search-result-meta">
            ${post.date} · ${post.readingTime} min read
            ${post.tags?.length ? `· ${post.tags.slice(0, 2).join(", ")}` : ""}
          </div>
        </a>
      `
        )
        .join("");

      this.searchResults.innerHTML = html;
      this.searchResults.classList.add("active");
    }

    hideResults() {
      this.searchResults.classList.remove("active");
    }

    highlight(text, query) {
      const regex = new RegExp(`(${this.escapeRegex(query)})`, "gi");
      return text.replace(regex, "<mark>$1</mark>");
    }

    truncate(text, length) {
      if (text.length <= length) return text;
      return text.substr(0, length) + "...";
    }

    escapeRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  }

  // Initialize search when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new SearchEngine());
  } else {
    new SearchEngine();
  }
})();
