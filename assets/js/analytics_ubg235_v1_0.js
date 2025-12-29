// Load the gtag.js script asynchronously
(function() {
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-5Q28Z4RCKL';
  document.head.appendChild(script);
})();

// Initialize Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'G-5Q28Z4RCKL');

