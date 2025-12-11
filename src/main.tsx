import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './MobileStyles.css'

// Mobile viewport fix function
const initMobileViewportFix = () => {
  // Fix for mobile 100vh issue
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Fix for iOS input zoom
  const preventZoom = () => {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });

    // Add class to disable zoom on input focus
    document.addEventListener('focusin', (event) => {
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        document.documentElement.classList.add('input-focused');
      }
    });

    document.addEventListener('focusout', () => {
      document.documentElement.classList.remove('input-focused');
    });
  };

  // Initialize
  setVH();
  preventZoom();

  // Update on resize and orientation change
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', () => {
    setTimeout(setVH, 100);
  });

  // Add loaded class
  window.addEventListener('load', () => {
    document.documentElement.classList.add('is-loaded');
  });

  console.log('Mobile viewport fix initialized');
};

// Passive event listener helper for better scroll performance
const addPassiveEventListener = (
  element: HTMLElement | Document, 
  eventName: string, 
  handler: EventListenerOrEventListenerObject
) => {
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get() { supportsPassive = true; }
    });
    window.addEventListener('test', null as any, opts);
  } catch (e) {}
  
  element.addEventListener(eventName, handler, supportsPassive ? { passive: true } : false);
};

// Initialize mobile fixes immediately if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initMobileViewportFix();
    
    // Add passive touch listeners for better scroll performance
    addPassiveEventListener(document, 'touchstart', () => {});
    addPassiveEventListener(document, 'touchmove', () => {});
  });
} else {
  initMobileViewportFix();
  addPassiveEventListener(document, 'touchstart', () => {});
  addPassiveEventListener(document, 'touchmove', () => {});
}

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      registration => {
        console.log('Service Worker registered successfully: ', registration.scope)
      },
      error => {
        console.log('Service Worker registration failed: ', error)
      }
    )
  })
}

// Create React root and render app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Optional: Add error boundary for better error handling
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});