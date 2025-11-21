/**
 * Table of Contents Module
 * Automatically generates TOC from headings and highlights active section
 */

class TableOfContents {
  constructor(options = {}) {
    this.options = {
      contentSelector: options.contentSelector || ".post-content",
      tocSelector: options.tocSelector || "#table-of-contents",
      headingSelector: options.headingSelector || "h2, h3, h4",
      activeClass: options.activeClass || "active",
      offset: options.offset || 100,
      ...options,
    };

    this.content = null;
    this.toc = null;
    this.headings = [];
    this.observer = null;
    this.activeId = null;

    this.init();
  }

  init() {
    this.content = document.querySelector(this.options.contentSelector);
    this.toc = document.querySelector(this.options.tocSelector);

    if (!this.content) return;

    this.collectHeadings();

    if (this.headings.length === 0) return;

    if (!this.toc) {
      this.createTOC();
    }

    this.setupIntersectionObserver();
    this.attachEventListeners();
  }

  collectHeadings() {
    const headingElements = this.content.querySelectorAll(
      this.options.headingSelector
    );

    headingElements.forEach((heading, index) => {
      // Ensure heading has an ID
      if (!heading.id) {
        heading.id = `heading-${index}-${this.slugify(heading.textContent)}`;
      }

      this.headings.push({
        id: heading.id,
        text: heading.textContent,
        level: parseInt(heading.tagName.charAt(1)),
        element: heading,
      });
    });
  }

  createTOC() {
    // Create TOC container
    const tocContainer = document.createElement("aside");
    tocContainer.id = "table-of-contents";
    tocContainer.className =
      "table-of-contents sticky top-20 bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8";
    tocContainer.setAttribute("aria-label", "Table of Contents");

    const tocTitle = document.createElement("h2");
    tocTitle.className = "text-lg font-semibold mb-4 text-gray-900";
    tocTitle.textContent = "Table of Contents";

    const tocNav = document.createElement("nav");
    tocNav.className = "toc-nav";

    const tocList = document.createElement("ul");
    tocList.className = "toc-list space-y-2";

    this.headings.forEach((heading) => {
      const li = document.createElement("li");
      li.className = `toc-item toc-level-${heading.level}`;
      li.style.paddingLeft = `${(heading.level - 2) * 1}rem`;

      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.className =
        "toc-link block text-sm text-gray-600 hover:text-primary transition-colors duration-200 py-1";
      link.textContent = heading.text;
      link.setAttribute("data-heading-id", heading.id);

      li.appendChild(link);
      tocList.appendChild(li);
    });

    tocNav.appendChild(tocList);
    tocContainer.appendChild(tocTitle);
    tocContainer.appendChild(tocNav);

    // Insert TOC before content
    const article = this.content.closest("article");
    if (article) {
      const header = article.querySelector("header");
      if (header) {
        header.insertAdjacentElement("afterend", tocContainer);
      } else {
        article.insertBefore(tocContainer, this.content);
      }
    }

    this.toc = tocContainer;
  }

  setupIntersectionObserver() {
    const observerOptions = {
      rootMargin: `-${this.options.offset}px 0px -66% 0px`,
      threshold: 0,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.setActiveHeading(entry.target.id);
        }
      });
    }, observerOptions);

    this.headings.forEach((heading) => {
      this.observer.observe(heading.element);
    });
  }

  setActiveHeading(id) {
    if (this.activeId === id) return;

    // Remove active class from previous item
    const prevActive = this.toc?.querySelector(`.${this.options.activeClass}`);
    if (prevActive) {
      prevActive.classList.remove(this.options.activeClass);
    }

    // Add active class to current item
    const currentLink = this.toc?.querySelector(`[data-heading-id="${id}"]`);
    if (currentLink) {
      currentLink.classList.add(this.options.activeClass);
      currentLink.style.color = "var(--color-primary)";
      currentLink.style.fontWeight = "600";
    }

    this.activeId = id;
  }

  attachEventListeners() {
    // Smooth scroll to heading on click
    const links = this.toc?.querySelectorAll(".toc-link");
    links?.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("data-heading-id");
        const target = document.getElementById(targetId);

        if (target) {
          const offsetTop =
            target.getBoundingClientRect().top +
            window.pageYOffset -
            this.options.offset;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        }
      });
    });
  }

  slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

window.TableOfContents = TableOfContents;

// Auto-initialize on single post pages
document.addEventListener("DOMContentLoaded", () => {
  const postContent = document.querySelector(".post-content");
  if (postContent) {
    // Only create TOC if there are enough headings
    const headings = postContent.querySelectorAll("h2, h3, h4");
    if (headings.length >= 3) {
      new TableOfContents();
    }
  }
});
