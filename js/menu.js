document.addEventListener("DOMContentLoaded", function() {
    var isMobile = /Mobi|Android/i.test(navigator.userAgent);
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({ "@context": "https://schema.org", "isMobile": isMobile });
    document.head.appendChild(script);
});