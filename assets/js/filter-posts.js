/**
 * Advanced Post Filtering & Search Module
 * Features: search, multi-tag filtering, category filtering, sorting, URL state
 */
class FilterPosts {
  constructor(opts = {}) {
    this.container = document.querySelector(opts.container || ".posts-list");
    this.selector = opts.selector || ".post-item";
    this.searchInput = null;
    this.sortSelect = null;
    this.activeTags = new Set();
    this.activeCategories = new Set();
    this.searchTerm = "";
    this.allPosts = [];
    this.debounceTimer = null;

    if (!this.container) {
      console.warn("FilterPosts: container not found");
      return;
    }

    this.init();
  }

  init() {
    this.allPosts = Array.from(document.querySelectorAll(this.selector));
    this.createSearchBar();
    this.createSortControls();
    this.bindEvents();
    this.loadStateFromURL();
    this.updateUI();
  }

  createSearchBar() {
    const existingSearch = this.container.querySelector(".posts-search");
    if (existingSearch) return;

    const searchContainer = document.createElement("div");
    searchContainer.className = "posts-search mb-6";
    searchContainer.innerHTML = `
      <div class="search-wrapper relative">
        <svg class="search-icon icon text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="search"
          id="post-search-input"
          class="search-input"
          placeholder="Search posts by title, description, or tags..."
          aria-label="Search posts"
        />
        <button class="clear-search text-gray-400 hover:text-gray-600 hidden" aria-label="Clear search">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="search-results-count mt-2 text-sm text-gray-600"></div>
    `;

    const submenu = this.container.querySelector(".blog-submenu");
    if (submenu) {
      submenu.insertAdjacentElement("afterend", searchContainer);
    } else {
      this.container.insertBefore(searchContainer, this.container.firstChild);
    }

    this.searchInput = document.getElementById("post-search-input");
  }

  createSortControls() {
    const existingSort = this.container.querySelector(".posts-sort");
    if (existingSort) return;

    const sortContainer = document.createElement("div");
    sortContainer.className =
      "posts-sort mb-4 flex items-center justify-between flex-wrap gap-3";
    sortContainer.innerHTML = `
      <div class="active-filters flex flex-wrap gap-2"></div>
      <div class="sort-controls flex items-center gap-2">
        <label for="sort-select" class="text-sm text-gray-600">Sort by:</label>
        <select id="sort-select" class="sort-select px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="title-asc">Title (A-Z)</option>
          <option value="title-desc">Title (Z-A)</option>
          <option value="reading-time-asc">Shortest Read</option>
          <option value="reading-time-desc">Longest Read</option>
        </select>
      </div>
    `;

    const searchContainer = this.container.querySelector(".posts-search");
    if (searchContainer) {
      searchContainer.insertAdjacentElement("afterend", sortContainer);
    }

    this.sortSelect = document.getElementById("sort-select");
  }

  bindEvents() {
    // Search input with debounce
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.searchTerm = e.target.value.toLowerCase().trim();
          this.updateUI();
          this.updateURL();
        }, 300);
      });

      // Clear search button
      const clearBtn = this.container.querySelector(".clear-search");
      if (clearBtn) {
        this.searchInput.addEventListener("input", (e) => {
          clearBtn.classList.toggle("hidden", !e.target.value);
        });
        clearBtn.addEventListener("click", () => {
          this.searchInput.value = "";
          this.searchTerm = "";
          clearBtn.classList.add("hidden");
          this.updateUI();
          this.updateURL();
        });
      }
    }

    // Sort controls
    if (this.sortSelect) {
      this.sortSelect.addEventListener("change", (e) => {
        this.sortPosts(e.target.value);
        this.updateURL();
      });
    }

    // Tag and category filtering
    document.addEventListener("click", (e) => {
      const tagEl = e.target.closest("[data-filter-tag]");
      const catEl = e.target.closest("[data-filter-category]");

      if (tagEl) {
        e.preventDefault();
        const tag = tagEl.getAttribute("data-filter-tag");
        this.toggleTag(tag);
      } else if (catEl) {
        e.preventDefault();
        const category = catEl.getAttribute("data-filter-category");
        this.toggleCategory(category);
      }
    });
  }

  toggleTag(tag) {
    if (this.activeTags.has(tag)) {
      this.activeTags.delete(tag);
    } else {
      this.activeTags.add(tag);
    }
    this.updateUI();
    this.updateURL();
  }

  toggleCategory(category) {
    if (this.activeCategories.has(category)) {
      this.activeCategories.delete(category);
    } else {
      this.activeCategories.add(category);
    }
    this.updateUI();
    this.updateURL();
  }

  matchesFilters(post) {
    const tags = (post.getAttribute("data-tags") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const categories = (post.getAttribute("data-categories") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Check tags
    if (this.activeTags.size > 0) {
      const hasTag = Array.from(this.activeTags).some((tag) =>
        tags.includes(tag)
      );
      if (!hasTag) return false;
    }

    // Check categories
    if (this.activeCategories.size > 0) {
      const hasCategory = Array.from(this.activeCategories).some((cat) =>
        categories.includes(cat)
      );
      if (!hasCategory) return false;
    }

    // Check search term
    if (this.searchTerm) {
      const title = (
        post.querySelector(".post-title")?.textContent || ""
      ).toLowerCase();
      const summary = (
        post.querySelector(".post-summary")?.textContent || ""
      ).toLowerCase();
      const tagsText = tags.join(" ").toLowerCase();
      const searchable = `${title} ${summary} ${tagsText}`;

      if (!searchable.includes(this.searchTerm)) return false;
    }

    return true;
  }

  updateUI() {
    let visibleCount = 0;

    this.allPosts.forEach((post) => {
      const matches = this.matchesFilters(post);
      post.style.display = matches ? "" : "none";
      if (matches) visibleCount++;
    });

    // Update result count
    const countEl = this.container.querySelector(".search-results-count");
    if (countEl) {
      if (
        this.searchTerm ||
        this.activeTags.size > 0 ||
        this.activeCategories.size > 0
      ) {
        countEl.textContent = `Showing ${visibleCount} of ${this.allPosts.length} posts`;
      } else {
        countEl.textContent = "";
      }
    }

    // Update active filter badges
    this.updateActiveFilters();

    // Update tag/category pill states
    this.updatePillStates();
  }

  updateActiveFilters() {
    const container = this.container.querySelector(".active-filters");
    if (!container) return;

    container.innerHTML = "";

    const createBadge = (text, removeCallback) => {
      const badge = document.createElement("span");
      badge.className =
        "active-filter-badge inline-flex items-center gap-2 px-3 py-1 bg-primary text-white text-sm rounded-full";
      badge.innerHTML = `
        ${text}
        <button class="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5" aria-label="Remove filter">
          <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      `;
      badge.querySelector("button").addEventListener("click", removeCallback);
      return badge;
    };

    this.activeTags.forEach((tag) => {
      container.appendChild(
        createBadge(`Tag: ${tag}`, () => this.toggleTag(tag))
      );
    });

    this.activeCategories.forEach((category) => {
      container.appendChild(
        createBadge(`Category: ${category}`, () =>
          this.toggleCategory(category)
        )
      );
    });

    if (this.activeTags.size > 0 || this.activeCategories.size > 0) {
      const clearAll = document.createElement("button");
      clearAll.className = "text-sm text-gray-600 hover:text-primary underline";
      clearAll.textContent = "Clear all filters";
      clearAll.addEventListener("click", () => {
        this.activeTags.clear();
        this.activeCategories.clear();
        this.updateUI();
        this.updateURL();
      });
      container.appendChild(clearAll);
    }
  }

  updatePillStates() {
    // Update tag pills
    document.querySelectorAll("[data-filter-tag]").forEach((el) => {
      const tag = el.getAttribute("data-filter-tag");
      if (this.activeTags.has(tag)) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });

    // Update category pills
    document.querySelectorAll("[data-filter-category]").forEach((el) => {
      const category = el.getAttribute("data-filter-category");
      if (this.activeCategories.has(category)) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }

  sortPosts(sortBy) {
    const postsGrid = this.container.querySelector(".posts-grid");
    if (!postsGrid) return;

    const posts = Array.from(this.allPosts);

    posts.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.getAttribute("data-date") || 0) -
            new Date(a.getAttribute("data-date") || 0)
          );
        case "date-asc":
          return (
            new Date(a.getAttribute("data-date") || 0) -
            new Date(b.getAttribute("data-date") || 0)
          );
        case "title-asc":
          return (
            a.querySelector(".post-title")?.textContent || ""
          ).localeCompare(b.querySelector(".post-title")?.textContent || "");
        case "title-desc":
          return (
            b.querySelector(".post-title")?.textContent || ""
          ).localeCompare(a.querySelector(".post-title")?.textContent || "");
        case "reading-time-asc":
          return (
            (parseInt(a.getAttribute("data-reading-time")) || 0) -
            (parseInt(b.getAttribute("data-reading-time")) || 0)
          );
        case "reading-time-desc":
          return (
            (parseInt(b.getAttribute("data-reading-time")) || 0) -
            (parseInt(a.getAttribute("data-reading-time")) || 0)
          );
        default:
          return 0;
      }
    });

    posts.forEach((post) => postsGrid.appendChild(post));
  }

  updateURL() {
    const params = new URLSearchParams();

    if (this.searchTerm) params.set("q", this.searchTerm);
    if (this.activeTags.size > 0)
      params.set("tags", Array.from(this.activeTags).join(","));
    if (this.activeCategories.size > 0)
      params.set("categories", Array.from(this.activeCategories).join(","));
    if (this.sortSelect) params.set("sort", this.sortSelect.value);

    const newURL = params.toString()
      ? `${window.location.pathname}?${params}`
      : window.location.pathname;
    window.history.replaceState({}, "", newURL);
  }

  loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);

    const q = params.get("q");
    if (q && this.searchInput) {
      this.searchInput.value = q;
      this.searchTerm = q.toLowerCase().trim();
      this.container.querySelector(".clear-search")?.classList.remove("hidden");
    }

    const tags = params.get("tags");
    if (tags) {
      tags.split(",").forEach((tag) => this.activeTags.add(tag.trim()));
    }

    const categories = params.get("categories");
    if (categories) {
      categories
        .split(",")
        .forEach((cat) => this.activeCategories.add(cat.trim()));
    }

    const sort = params.get("sort");
    if (sort && this.sortSelect) {
      this.sortSelect.value = sort;
      this.sortPosts(sort);
    }
  }
}

window.FilterPosts = FilterPosts;

// Initialize automatically on blog pages
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".posts-list")) {
    new FilterPosts({ container: ".posts-list", selector: ".post-item" });
  }
});
