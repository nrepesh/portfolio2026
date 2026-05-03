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


  // --- Shooting stars: occasional meteors streak across the upper sky ---
  var starsCanvas = document.getElementById('shootingStars');
  if (starsCanvas) {
    var sctx = starsCanvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var w = 0, h = 0;
    var stars = [];
    var initialized = false;

    function sizeStars() {
      var rect = starsCanvas.getBoundingClientRect();
      // Bail when the canvas hasn't been laid out yet — drawStars will retry next frame.
      if (rect.width <= 0 || rect.height <= 0) return false;
      w = rect.width;
      h = rect.height;
      starsCanvas.width = Math.round(w * dpr);
      starsCanvas.height = Math.round(h * dpr);
      sctx.setTransform(1, 0, 0, 1, 0, 0);
      sctx.scale(dpr, dpr);
      return true;
    }

    function spawnStar() {
      // Shallow angle (4–12° below horizontal): meteor stays in the upper sky.
      var angle = (4 + Math.random() * 8) * Math.PI / 180;
      // Calmer pace: gentle drift across the sky.
      var speed = 7 + Math.random() * 3;
      var depth = (speed - 7) / 3; // 0 (far) → 1 (near)
      return {
        x: -180,
        y: -20 + Math.random() * (h * 0.5),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 110 + depth * 90,
        width: 0.6 + depth * 0.6,
        alpha: 0.30 + depth * 0.18      // softer overall — atmospheric, not bold
      };
    }

    var lastSpawnAt = 0;
    var nextSpawnDelay = 1500; // ms — first meteor after a brief moment
    var MAX_ACTIVE = 1;
    // Warm amber/firefly color for that "magical sky" feel
    var STAR_R = 255, STAR_G = 212, STAR_B = 154;

    function ensureInitialized() {
      if (initialized) return true;
      if (!sizeStars()) return false;
      // Start empty; the spawn loop in drawStars handles introduction.
      stars.length = 0;
      initialized = true;
      return true;
    }

    window.addEventListener('resize', function () {
      if (sizeStars()) {
        // Keep stars; just clamp y if it's now outside.
        for (var k = 0; k < stars.length; k++) {
          if (stars[k].y > h) stars[k].y = -40 + Math.random() * (h * 0.55);
        }
      }
    });

    if (window.ResizeObserver) {
      new ResizeObserver(function () { sizeStars(); }).observe(starsCanvas);
    }

    function drawStars() {
      if (!ensureInitialized()) {
        requestAnimationFrame(drawStars);
        return;
      }
      var now = performance.now();

      // Sparse spawning: 1 in flight at a time, big gap so each appearance feels like a moment.
      if (stars.length < MAX_ACTIVE && now - lastSpawnAt > nextSpawnDelay) {
        stars.push(spawnStar());
        lastSpawnAt = now;
        nextSpawnDelay = 8000 + Math.random() * 7000; // next meteor in 8–15 seconds
      }

      sctx.clearRect(0, 0, w, h);
      for (var i = stars.length - 1; i >= 0; i--) {
        var s = stars[i];
        s.x += s.vx;
        s.y += s.vy;

        // Position-based alpha curve: soft fade-in entering, soft fade-out exiting.
        var fadeIn = s.x < 120 ? Math.max(0, s.x) / 120 : 1;
        var fadeOut = s.x > w - 120 ? Math.max(0, (w - s.x) / 120) : 1;
        var visAlpha = s.alpha * fadeIn * fadeOut;

        if (visAlpha > 0.005) {
          var v = Math.hypot(s.vx, s.vy);
          var tx = s.x - (s.vx / v) * s.len;
          var ty = s.y - (s.vy / v) * s.len;

          var rgb = STAR_R + ', ' + STAR_G + ', ' + STAR_B;
          var grad = sctx.createLinearGradient(tx, ty, s.x, s.y);
          grad.addColorStop(0,    'rgba(' + rgb + ', 0)');
          grad.addColorStop(0.55, 'rgba(' + rgb + ', ' + (visAlpha * 0.18) + ')');
          grad.addColorStop(0.92, 'rgba(' + rgb + ', ' + visAlpha + ')');
          grad.addColorStop(1,    'rgba(' + rgb + ', ' + visAlpha + ')');

          sctx.strokeStyle = grad;
          sctx.lineWidth = s.width;
          sctx.lineCap = 'round';
          sctx.shadowColor = 'rgba(' + rgb + ', ' + (visAlpha * 0.7) + ')';
          sctx.shadowBlur = 8;
          sctx.beginPath();
          sctx.moveTo(tx, ty);
          sctx.lineTo(s.x, s.y);
          sctx.stroke();
        }

        if (s.x > w + 80 || s.y > h + 80) {
          stars.splice(i, 1);
        }
      }
      sctx.shadowBlur = 0;
      requestAnimationFrame(drawStars);
    }
    drawStars();
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
