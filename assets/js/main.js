// Modern JavaScript for the resume site
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    initAnimations();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize theme switching (if needed)
    initThemeSwitching();
});

// Animation initialization
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Theme switching functionality
function initThemeSwitching() {
    const themeColors = ['blue', 'turquoise', 'green', 'berry', 'orange', 'ceramic'];
    let currentThemeIndex = 0;
    
    // Create theme switcher if needed
    const themeSwitcher = document.createElement('button');
    themeSwitcher.className = 'theme-switcher';
    themeSwitcher.innerHTML = `
        <div class="theme-switcher-content">
            <svg class="theme-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
            </svg>
            <span class="theme-label">Theme</span>
            <span class="theme-indicator">${themeColors[currentThemeIndex]}</span>
        </div>
    `;
    themeSwitcher.setAttribute('aria-label', 'Switch theme');
    
    themeSwitcher.addEventListener('click', () => {
        currentThemeIndex = (currentThemeIndex + 1) % themeColors.length;
        const newTheme = themeColors[currentThemeIndex];
        applyTheme(newTheme);
        
        // Update the indicator
        const indicator = themeSwitcher.querySelector('.theme-indicator');
        if (indicator) {
            indicator.textContent = newTheme;
            // Add a subtle color transition
            indicator.style.opacity = '0.7';
            setTimeout(() => {
                indicator.style.opacity = '1';
            }, 200);
        }
        
        // Add a subtle animation
        themeSwitcher.style.transform = 'scale(0.95)';
        setTimeout(() => {
            themeSwitcher.style.transform = 'scale(1)';
        }, 150);
    });
    
    // Add theme switcher to page
    document.body.appendChild(themeSwitcher);
}

// Apply theme colors
function applyTheme(theme) {
    const root = document.documentElement;
    const colorMap = {
        blue: {
            primary: '#2563eb',
            primaryDark: '#1d4ed8',
            primaryLight: '#dbeafe'
        },
        turquoise: {
            primary: '#14b8a6',
            primaryDark: '#0f766e',
            primaryLight: '#ccfbf1'
        },
        green: {
            primary: '#22c55e',
            primaryDark: '#15803d',
            primaryLight: '#dcfce7'
        },
        berry: {
            primary: '#ec4899',
            primaryDark: '#be185d',
            primaryLight: '#fce7f3'
        },
        orange: {
            primary: '#f97316',
            primaryDark: '#c2410c',
            primaryLight: '#ffedd5'
        },
        ceramic: {
            primary: '#78716c',
            primaryDark: '#44403c',
            primaryLight: '#f5f5f4'
        }
    };
    
    const colors = colorMap[theme];
    if (colors) {
        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-primary-dark', colors.primaryDark);
        root.style.setProperty('--color-primary-light', colors.primaryLight);
    }
}

// Utility functions
function debounce(func, wait) {
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

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Handle responsive behavior
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth >= 1024 && sidebar) {
        sidebar.classList.remove('-translate-x-full');
    }
}, 250));

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Export functions for potential use in templates
window.ResumeSite = {
    initAnimations,
    initSmoothScrolling,
    initThemeSwitching,
    applyTheme
};