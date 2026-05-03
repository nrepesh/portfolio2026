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


  // --- Cursor trail: damped follower for soothing motion, white stroke ---
  var trail = document.getElementById('cursorTrail');
  if (trail) {
    var tctx = trail.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var points = []; // {x, y, t}
    var TRAIL_LIFE = 1100; // ms — longer fade reads as soothing
    var EASE = 0.14;       // damping factor — lower = more glide, higher = snappier
    var target = null;     // raw cursor position
    var follower = null;   // smoothed point sampled into the trail

    function sizeTrail() {
      trail.width = window.innerWidth * dpr;
      trail.height = window.innerHeight * dpr;
      tctx.setTransform(1, 0, 0, 1, 0, 0);
      tctx.scale(dpr, dpr);
    }
    sizeTrail();
    window.addEventListener('resize', sizeTrail);

    document.addEventListener('mousemove', function (e) {
      target = { x: e.clientX, y: e.clientY };
      if (!follower) follower = { x: e.clientX, y: e.clientY };
    });

    (function drawTrail() {
      var now = performance.now();

      // Advance the smoothed follower toward the cursor, then sample it into the trail.
      if (target && follower) {
        var dx = target.x - follower.x;
        var dy = target.y - follower.y;
        follower.x += dx * EASE;
        follower.y += dy * EASE;
        // Skip near-duplicate samples so the trail stays clean when the cursor is still.
        var last = points[points.length - 1];
        if (!last || (follower.x - last.x) * (follower.x - last.x) + (follower.y - last.y) * (follower.y - last.y) > 0.5) {
          points.push({ x: follower.x, y: follower.y, t: now });
        }
      }

      // Drop expired points.
      while (points.length && now - points[0].t > TRAIL_LIFE) points.shift();

      tctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (points.length > 1) {
        tctx.lineCap = 'round';
        tctx.lineJoin = 'round';
        for (var i = 1; i < points.length; i++) {
          var p0 = points[i - 1];
          var p1 = points[i];
          var age = (now - p1.t) / TRAIL_LIFE; // 0 fresh -> 1 stale
          var alpha = Math.max(0, 1 - age);
          // Smooth, ease-out alpha curve makes the tail tail off softly.
          var eased = alpha * alpha;
          var width = 2.2 * alpha + 0.4;
          var mx = (p0.x + p1.x) / 2;
          var my = (p0.y + p1.y) / 2;
          var prevMx = i > 1 ? (points[i - 2].x + p0.x) / 2 : p0.x;
          var prevMy = i > 1 ? (points[i - 2].y + p0.y) / 2 : p0.y;
          tctx.beginPath();
          tctx.moveTo(prevMx, prevMy);
          tctx.quadraticCurveTo(p0.x, p0.y, mx, my);
          tctx.strokeStyle = 'rgba(255, 255, 255, ' + (eased * 0.75) + ')';
          tctx.lineWidth = width;
          tctx.stroke();
        }
      }
      requestAnimationFrame(drawTrail);
    })();
  }

})();
