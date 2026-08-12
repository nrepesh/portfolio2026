/* ============================================
   Nrepesh Joshi — Portfolio 2026
   Vanilla JS — No jQuery, No Frameworks
   ============================================ */

(function () {
  'use strict';

  // Honoured by every animation below, not just the scroll reveal.
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Floating profile links (inner pages only) ---
  if (!document.body.classList.contains('landing-page')) {
    var rail = document.createElement('nav');
    rail.className = 'quick-links-rail';
    rail.setAttribute('aria-label', 'Profile links');

    var scriptSrc = document.currentScript && document.currentScript.src;
    var resumeHref = new URL('../../resume/nrepesh-joshi-resume.pdf',
      scriptSrc || window.location.href).href;
    var quickLinks = [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nrepeshjoshi', icon: 'i-linkedin', external: true },
      { label: 'GitHub', href: 'https://github.com/nrepesh', icon: 'i-github', external: true },
      { label: 'Download resume', href: resumeHref, icon: 'i-download', download: true }
    ];

    for (var q = 0; q < quickLinks.length; q++) {
      var item = quickLinks[q];
      var link = document.createElement('a');
      link.href = item.href;
      link.setAttribute('aria-label', item.label);
      link.title = item.label;
      if (item.external) {
        link.target = '_blank';
        link.rel = 'noopener';
      }
      if (item.download) link.setAttribute('download', '');

      var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('class', 'icon');
      icon.setAttribute('aria-hidden', 'true');
      var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', '#' + item.icon);
      icon.appendChild(use);
      link.appendChild(icon);
      rail.appendChild(link);
    }

    document.body.appendChild(rail);
  }

  // --- Reveal on scroll (replaces the AOS library) ---
  // Same [data-aos] / [data-aos-delay] markup, no third-party CSS or JS.
  var reveal = document.querySelectorAll('[data-aos]');
  if (reveal.length) {
    if (!('IntersectionObserver' in window) || reduceMotion) {
      for (var r = 0; r < reveal.length; r++) reveal[r].classList.add('aos-in');
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
    }, { passive: true });
  }

  // --- Mobile hamburger ---
  // The open/closed state used to live only in CSS classes, so a screen reader
  // announced "Toggle menu, button" whether the menu was open or shut - and on
  // a phone this button is the only route to every other page on the site.
  // Routing every state change through setMenu() keeps aria-expanded from
  // drifting out of sync with the DOM, which is what happens when the attribute
  // is set at one call site and forgotten at the other three.
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    var setMenu = function (open) {
      hamburger.classList.toggle('open', open);
      mobileNav.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    };

    hamburger.addEventListener('click', function () {
      setMenu(!mobileNav.classList.contains('open'));
    });

    // Index loop rather than NodeList.forEach: forEach is missing in exactly
    // the browser generation that lacks IntersectionObserver, which line 16
    // already feature-detects for.
    var navLinks = mobileNav.querySelectorAll('a');
    for (var n = 0; n < navLinks.length; n++) {
      navLinks[n].addEventListener('click', function () {
        setMenu(false);
      });
    }

    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        setMenu(false);
      }
    });

    // Escape closes and returns focus to the control that opened it, so a
    // keyboard user is not dropped at the top of the document.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        setMenu(false);
        hamburger.focus();
      }
    });
  }

  // --- Typewriter effect ---
  var typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    var text = 'ML Engineer';
    var pos = 0;
    var cursor = document.createElement('span');
    cursor.className = 'cursor';

    function type() {
      typewriterEl.textContent = text.slice(0, pos + 1);
      typewriterEl.appendChild(cursor);
      if (pos < text.length - 1) {
        pos++;
        setTimeout(type, 70 + Math.random() * 40);
      }
    }

    if (reduceMotion) {
      // Text only. Appending the cursor here was the bug: .cursor carries
      // `animation: blink 1s infinite`, so a user who asked for less motion got
      // an indefinitely blinking element. The CSS now also stops the animation,
      // but not creating the element at all is the cleaner half of the fix.
      typewriterEl.textContent = text;
    } else {
      setTimeout(type, 600);
    }
  }


  // --- Cursor halo: soft amber moonlight that drifts after the cursor ---
  var halo = document.getElementById('cursorHalo');
  if (halo && !reduceMotion) {
    var hx = window.innerWidth / 2;
    var hy = window.innerHeight / 2;
    var htx = hx, hty = hy;
    var haloVisible = false;
    var EASE = 0.06;

    var running = false;

    // Only animate while the halo still has ground to cover. Left running
    // unconditionally this burns a frame callback forever on an idle page.
    function loop() {
      hx += (htx - hx) * EASE;
      hy += (hty - hy) * EASE;
      halo.style.transform = 'translate3d(' + hx + 'px, ' + hy + 'px, 0) translate(-50%, -50%)';
      if (Math.abs(htx - hx) < 0.5 && Math.abs(hty - hy) < 0.5) {
        running = false;
        return;
      }
      requestAnimationFrame(loop);
    }

    function start() {
      if (!running) {
        running = true;
        requestAnimationFrame(loop);
      }
    }

    document.addEventListener('mousemove', function (e) {
      htx = e.clientX;
      hty = e.clientY;
      if (!haloVisible) {
        haloVisible = true;
        halo.classList.add('visible');
      }
      start();
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      haloVisible = false;
      halo.classList.remove('visible');
    });
  }

})();
