// Main JavaScript functionality
// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
  initializeFAQ();
  initializeNavigation();
  initializeScrollEffects();
  initializeAnalytics();

  // Check if we're in an iframe
  checkIframeStatus();

  // Call debugGA after page loads
  setTimeout(debugGA, 3000);
});

function checkIframeStatus() {
  const isInIframe = window.self !== window.top;

  if (isInIframe) {
    console.log('Page loaded in iframe - implementing fallback tracking');
    // Set a flag for iframe tracking
    window.isEmbedded = true;

    // Track iframe load
    trackEvent('iframe_load', {
      event_category: 'embedding',
      event_label: 'survey_platform',
      custom_parameter_1: 'research_survey',
    });
  }
}

function debugGA() {
  // Check if GA is loaded
  console.log('GA loaded:', typeof gtag !== 'undefined');
  console.log('GA config:', window.dataLayer);

  // Check for GA network requests
  console.log('Check Network tab for requests to:');
  console.log('- google-analytics.com');
  console.log('- googletagmanager.com');
  console.log('- collect?');
}

// Generate a client ID for fallback tracking
function generateClientId() {
  return Date.now() + '.' + Math.random().toString(36).substring(2);
}

// Alternative tracking using Google Analytics Measurement Protocol
function trackAlternative(eventName, eventData) {
  const measurementId = 'G-CZLXNTCELK'; // Your GA measurement ID

  // For now, we'll use a basic implementation without API secret
  // In production, you'd want to set up the Measurement Protocol properly
  const payload = {
    client_id: generateClientId(),
    events: [
      {
        name: eventName,
        parameters: {
          ...eventData,
          page_location: window.location.href,
          page_referrer: document.referrer || '',
          engagement_time_msec: '100',
          is_embedded: window.isEmbedded || false,
        },
      },
    ],
  };

  // Log the fallback attempt
  console.log('Using fallback tracking for:', eventName, payload);

  // Store in localStorage as backup
  try {
    const storedEvents = JSON.parse(
      localStorage.getItem('ga_fallback_events') || '[]'
    );
    storedEvents.push({
      timestamp: new Date().toISOString(),
      event: eventName,
      data: eventData,
      payload: payload,
    });
    localStorage.setItem('ga_fallback_events', JSON.stringify(storedEvents));
    console.log('Event stored in localStorage for later analysis');
  } catch (error) {
    console.log('localStorage not available');
  }

  // You can also send to your own server here if you set one up later
  // fetch('your-tracking-endpoint', { method: 'POST', body: JSON.stringify(payload) });
}

// FAQ Functionality
function initializeFAQ() {
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach((button) => {
    button.addEventListener('click', function () {
      const faqItem = this.parentElement;
      const answer = faqItem.querySelector('.faq-answer');
      const isOpen = answer.style.display === 'block';

      // Close all other FAQ items
      closeAllFAQItems();

      // Toggle current item
      if (!isOpen) {
        answer.style.display = 'block';
        this.style.backgroundColor = '#f8fafc';
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function closeAllFAQItems() {
  const answers = document.querySelectorAll('.faq-answer');
  const questions = document.querySelectorAll('.faq-question');

  answers.forEach((answer) => {
    answer.style.display = 'none';
  });

  questions.forEach((question) => {
    question.style.backgroundColor = 'transparent';
    question.setAttribute('aria-expanded', 'false');
  });
}

// Navigation
function initializeNavigation() {
  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);

      if (target) {
        const offsetTop = target.offsetTop - 80; // Account for fixed nav
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        });
      }
    });
  });
}

// Scroll Effects
function initializeScrollEffects() {
  const nav = document.querySelector('.nav');

  window.addEventListener('scroll', function () {
    // Navbar background on scroll
    if (window.scrollY > 10) {
      nav.style.background = 'rgba(255, 255, 255, 0.95)';
      nav.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    } else {
      nav.style.background = 'rgba(255, 255, 255, 0.95)';
      nav.style.boxShadow = 'none';
    }
  });

  // Intersection Observer for animations (optional)
  if ('IntersectionObserver' in window) {
    initializeScrollAnimations();
  }
}

// Optional: Scroll animations
function initializeScrollAnimations() {
  const animateElements = document.querySelectorAll(
    '.solution-card, .benefit-card, .step, .testimonial'
  );

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  animateElements.forEach((element) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
  });
}

// Utility Functions
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

// Form handling (if you add forms later)
function handleFormSubmission(formId, callback) {
  const form = document.getElementById(formId);
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      callback(formData);
    });
  }
}

// Enhanced tracking function
function trackEvent(eventName, eventData = {}) {
  // Try Google Analytics first
  if (typeof gtag !== 'undefined') {
    try {
      gtag('event', eventName, eventData);
      console.log('GA event tracked:', eventName, eventData);
    } catch (error) {
      console.log('GA tracking failed:', error);
      // Fallback to alternative tracking
      trackAlternative(eventName, eventData);
    }
  } else {
    console.log('gtag not available, using fallback tracking');
    trackAlternative(eventName, eventData);
  }
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeFAQ,
    initializeNavigation,
    initializeScrollEffects,
    trackEvent,
  };
}

// ENHANCED ANALYTICS FUNCTION with all the new tracking
function initializeAnalytics() {
  // 1. Track Navigation Links
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      trackEvent('navigation_click', {
        event_category: 'navigation',
        event_label: this.textContent.trim(),
        link_url: this.getAttribute('href'),
        location: 'header_nav',
      });
    });
  });

  // 2. Track Navigation CTA (Get Early Access)
  const navCTA = document.querySelector('.nav-cta');
  if (navCTA) {
    navCTA.addEventListener('click', function () {
      trackEvent('nav_cta_click', {
        event_category: 'conversion',
        event_label: this.textContent.trim(),
        location: 'header_nav',
      });
    });
  }

  // 3. Track Hero CTA Buttons
  const heroCTAButtons = document.querySelectorAll(
    '.hero-cta .cta-button, .hero-cta .cta-secondary'
  );
  heroCTAButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const isPrimary = this.classList.contains('cta-button');
      trackEvent('hero_cta_click', {
        event_category: 'conversion',
        event_label: this.textContent.trim(),
        button_type: isPrimary ? 'primary' : 'secondary',
        location: 'hero_section',
      });
    });
  });

  // 4. Track Footer Social Links
  const socialLinks = document.querySelectorAll('.footer-social .social-link');
  socialLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      trackEvent('social_click', {
        event_category: 'social',
        event_label: this.textContent.trim(),
        location: 'footer',
      });
    });
  });

  // 5. Track Footer Product Links
  const productLinks = document.querySelectorAll(
    '.footer-section:nth-child(2) .footer-links a'
  );
  productLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      trackEvent('footer_product_click', {
        event_category: 'footer_navigation',
        event_label: this.textContent.trim(),
        section: 'product',
        link_url: this.getAttribute('href'),
      });
    });
  });

  // 6. Track Footer Research & Evidence Links
  const researchLinks = document.querySelectorAll(
    '.footer-section:nth-child(3) .footer-links a'
  );
  researchLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      trackEvent('footer_research_click', {
        event_category: 'footer_navigation',
        event_label: this.textContent.trim(),
        section: 'research_evidence',
        link_url: this.getAttribute('href'),
      });
    });
  });

  // 7. Track Footer Learn More Links
  const learnMoreLinks = document.querySelectorAll(
    '.footer-section:nth-child(4) .footer-links a'
  );
  learnMoreLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      trackEvent('footer_learn_more_click', {
        event_category: 'footer_navigation',
        event_label: this.textContent.trim(),
        section: 'learn_more',
        link_url: this.getAttribute('href'),
      });
    });
  });

  // 8. Track all existing CTA buttons (your original code)
  const ctaButtons = document.querySelectorAll(
    '.cta-button:not(.hero-cta .cta-button), .nav-cta'
  );
  ctaButtons.forEach(function (button, index) {
    button.addEventListener('click', function () {
      trackEvent('cta_click', {
        event_category: 'engagement',
        event_label: this.textContent.trim(),
        button_location: this.closest('section')?.className || 'navigation',
      });
    });
  });

  // 9. Track form submission attempts (your original code)
  const formSubmitButton = document.querySelector('button[type="submit"]');
  if (formSubmitButton) {
    formSubmitButton.addEventListener('click', function () {
      trackEvent('form_submit_attempt', {
        event_category: 'conversion',
        event_label: 'insurance_check',
      });
    });
  }

  // 10. Track FAQ interactions (your original code)
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(function (question) {
    question.addEventListener('click', function () {
      trackEvent('faq_click', {
        event_category: 'engagement',
        event_label: this.textContent.trim(),
      });
    });
  });
}
