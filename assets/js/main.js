/* ============================================
   Nrepesh Joshi — Portfolio 2026
   Vanilla JS — No jQuery, No Frameworks
   ============================================ */

(function () {
  'use strict';

  // --- Reveal on scroll (replaces the AOS library) ---
  // Same [data-aos] / [data-aos-delay] markup, no third-party CSS or JS.
  var reveal = document.querySelectorAll('[data-aos]');
  if (reveal.length) {
    if (!('IntersectionObserver' in window) ||
        matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (var i = 0; i < reveal.length; i++) reveal[i].classList.add('aos-in');
    } else {
      var io = new IntersectionObserver(function (entries) {
        for (var j = 0; j < entries.length; j++) {
          if (!entries[j].isIntersecting) continue;
          var el = entries[j].target;
          el.style.transitionDelay = (el.dataset.aosDelay || 0) + 'ms';
          el.classList.add('aos-in');
          io.unobserve(el);
        }
      }, { rootMargin: '0px 0px -80px 0px' });
      for (var k = 0; k < reveal.length; k++) io.observe(reveal[k]);
    }
  }

  // --- Nav scroll behavior ---
  var nav = document.getElementById('nav');
  if (nav) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          nav.classList.toggle('scrolled', window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // --- Mobile hamburger ---
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      }
    });
  }

  // --- Typewriter effect ---
  var typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    var text = 'ML Engineer';
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
        typewriterEl.textContent = text;
        typewriterEl.appendChild(cursor);
      }
    }

    setTimeout(type, 600);
  }


  // --- Cursor halo: soft amber moonlight that drifts after the cursor ---
  var halo = document.getElementById('cursorHalo');
  if (halo) {
    var hx = window.innerWidth / 2;
    var hy = window.innerHeight / 2;
    var htx = hx, hty = hy;
    var haloVisible = false;
    var EASE = 0.06;

    document.addEventListener('mousemove', function (e) {
      htx = e.clientX;
      hty = e.clientY;
      if (!haloVisible) {
        haloVisible = true;
        halo.classList.add('visible');
      }
    });

    document.addEventListener('mouseleave', function () {
      haloVisible = false;
      halo.classList.remove('visible');
    });

    (function loop() {
      hx += (htx - hx) * EASE;
      hy += (hty - hy) * EASE;
      halo.style.transform = 'translate3d(' + hx + 'px, ' + hy + 'px, 0) translate(-50%, -50%)';
      requestAnimationFrame(loop);
    })();
  }

})();
