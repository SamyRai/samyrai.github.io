/**
 * Utility Functions
 * Reusable helper functions
 */

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
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

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @param {number} offset - Offset from viewport edge
 * @returns {boolean} Whether element is in viewport
 */
export function isInViewport(element, offset = 0) {
  const rect = element.getBoundingClientRect();

  return (
    rect.top >= -offset &&
    rect.left >= -offset &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.right <=
      (window.innerWidth || document.documentElement.clientWidth) + offset
  );
}

/**
 * Get CSS variable value
 * @param {string} variable - CSS variable name (with or without --)
 * @returns {string} Variable value
 */
export function getCSSVariable(variable) {
  const varName = variable.startsWith("--") ? variable : `--${variable}`;
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

/**
 * Set CSS variable value
 * @param {string} variable - CSS variable name (with or without --)
 * @param {string} value - Value to set
 */
export function setCSSVariable(variable, value) {
  const varName = variable.startsWith("--") ? variable : `--${variable}`;
  document.documentElement.style.setProperty(varName, value);
}
