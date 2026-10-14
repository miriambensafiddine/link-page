/**
 * Miriam Bensafiddine Portfolio - Main App Script
 * Handles site initialization, smooth scrolling, and utility functions
 */

document.addEventListener('DOMContentLoaded', function() {
  // Remove loading state when page is ready
  document.body.classList.remove('loading');
  
  // Initialize smooth scrolling for anchor links
  initSmoothScroll();
  
  // Initialize theme/accessibility helpers
  initAccessibility();
  
  // Log initialization complete
  console.log('Portfolio initialized ✓');
});

/**
 * Smooth scroll to anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Skip if it's just "#" or no valid target
      if (href === '#' || href === '') return;
      
      const target = document.querySelector(href);
      
      if (target) {
        e.preventDefault();
        
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update URL without page jump
        window.history.pushState(null, null, href);
      }
    });
  });
}

/**
 * Accessibility helpers
 */
function initAccessibility() {
  // Handle keyboard navigation for interactive elements
  document.addEventListener('keydown', function(e) {
    // ESC key - close any modals/overlays if needed
    if (e.key === 'Escape') {
      const overlay = document.getElementById('cookie-overlay');
      if (overlay && !overlay.classList.contains('cookie-hidden')) {
        // Cookie overlay stays until user interacts
      }
    }
  });
  
  // Add focus visible for keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });
  
  document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-nav');
  });
}

/**
 * Utility: Check if element is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom >= 0
  );
}

/**
 * Utility: Debounce function for performance
 */
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

/**
 * Utility: Throttle function for performance
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Handle window resize events (debounced)
 */
const handleResize = debounce(function() {
  // Custom resize handling can go here
  window.dispatchEvent(new CustomEvent('app:resize'));
}, 250);

window.addEventListener('resize', handleResize);

/**
 * Handle scroll events (throttled)
 */
const handleScroll = throttle(function() {
  // Custom scroll handling can go here
  window.dispatchEvent(new CustomEvent('app:scroll'));
}, 100);

window.addEventListener('scroll', handleScroll);

/**
 * Preload images for better performance
 */
function preloadImages(selector = 'img') {
  const images = document.querySelectorAll(selector);
  images.forEach(img => {
    // Images are already loading, this ensures they're cached
    const tempImg = new Image();
    tempImg.src = img.src;
  });
}

// Preload key images after page load
window.addEventListener('load', function() {
  preloadImages('img[data-preload]');
});

/**
 * Export utilities for use in other scripts
 */
window.PortfolioApp = {
  isInViewport,
  debounce,
  throttle,
  preloadImages,
  log: function(message) {
    console.log(`[Portfolio] ${message}`);
  }
};
