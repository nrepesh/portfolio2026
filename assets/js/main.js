/* ============================================
   Nrepesh Joshi — Portfolio 2026
   Vanilla JS — No jQuery, No Frameworks
   ============================================ */

(function () {
  'use strict';

  // --- AOS Init ---
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 600,
      easing: 'ease-out',
      once: true,
      offset: 80
    });
  }

  // --- Nav scroll behavior ---
  const nav = document.getElementById('nav');
  if (nav) {
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (window.scrollY > 40) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // --- Mobile hamburger ---
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      }
    });
  }

  // --- Typewriter effect for hero tag ---
  var typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    var text = '< ML Engineer />';
    var i = 0;
    var cursor = document.createElement('span');
    cursor.className = 'cursor';

    function type() {
      if (i < text.length) {
        typewriterEl.textContent = text.slice(0, i + 1);
        typewriterEl.appendChild(cursor);
        i++;
        setTimeout(type, 70 + Math.random() * 40);
      } else {
        // Keep cursor blinking after done
        typewriterEl.textContent = text;
        typewriterEl.appendChild(cursor);
      }
    }

    // Start after a short delay for the hero fade-in
    setTimeout(type, 600);
  }

})();
