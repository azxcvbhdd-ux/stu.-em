'use strict';

// Register only when hosted. The guide also opens normally as local files.
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  const register = () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(error => {
      console.warn('Offline support could not be enabled.', error);
    });
  };
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
