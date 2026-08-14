(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var body = document.body;

  /* ================= FULLSCREEN MENU ================= */
  var burger = document.getElementById("menuBtn");
  var fullMenu = document.getElementById("fullMenu");
  var menuLinks = document.querySelectorAll(".menu-nav a[href^='#']");

  function openMenu() {
    var audio = document.getElementById("menuOpenAudio");
    if (audio) { audio.currentTime = 0; audio.play().catch(function(){}); }
    body.classList.add("menu-open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Close menu");
  }
  function closeMenu() {
    var audio = document.getElementById("menuCloseAudio");
    if (audio) { audio.currentTime = 0; audio.play().catch(function(){}); }
    body.classList.remove("menu-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
  }

  if (burger && fullMenu) {
    burger.addEventListener("click", function () {
      body.classList.contains("menu-open") ? closeMenu() : openMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("menu-open")) closeMenu();
    });

    fullMenu.addEventListener("click", function (e) {
      if (e.target === fullMenu) closeMenu();
    });
  }

  menuLinks.forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var target = a.getAttribute("href");
      closeMenu();
      setTimeout(function () {
        var el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      }, 350);
    });
  });

  /* ================= RESPONSIVE PICTURE BUILDER =================
     emits AVIF + WebP <source> variants with srcset/sizes and a
     vector SVG fallback; off-screen media is lazy + async-decoded */
  var WIDTHS = [360, 560, 800];

  function pic(pathBase, w, h, alt, sizes, attrs) {
    function sources(ext) {
      return WIDTHS.map(function (x) {
        return pathBase + "-" + x + "." + ext + " " + x + "w";
      }).join(", ");
    }
    var lazyAttrs = attrs && attrs.lazy
      ? ' loading="lazy" decoding="async"'
      : ' fetchpriority="high" decoding="async"';
    return "<picture>" +
      '<source type="image/avif" sizes="' + sizes + '" srcset="' + sources("avif") + '">' +
      '<source type="image/webp" sizes="' + sizes + '" srcset="' + sources("webp") + '">' +
      '<img src="' + pathBase + '.svg" width="' + w + '" height="' + h + '" alt="' + alt + '"' + lazyAttrs + ">" +
      "</picture>";
  }

  var ILL = "assets/images/illustration/art";
  var THUMB = "assets/images/thumbnails/thumb";

  /* ================= GALLERY ================= */
  var galleryItems = window.siteData.galleryItems;
  var galSizes = "(min-width:900px) 30vw, (min-width:480px) 45vw, 88vw";

  function buildGallery() {
    var box = document.getElementById("gallery");
    if (!box) return;
    box.innerHTML = galleryItems.map(function (it, idx) {
      var path = it[2] || (ILL + String(idx + 1).padStart(2, "0"));
      var imgHtml;
      // Si la ruta ya es un archivo directo (.webp, .png, .jpg, etc.), usarla tal cual
      if (/\.(webp|png|jpg|jpeg|avif|svg)$/i.test(path)) {
        imgHtml = "<img src='" + path + "' width='420' height='420' alt='" +
          it[0] + " — NOIR VEY illustration' loading='lazy' decoding='async'>";
      } else {
        imgHtml = pic(path, 420, 420, it[0] + " — NOIR VEY illustration", galSizes, { lazy: true });
      }
      return "<figure class='g-item'>" +
        imgHtml +
        "<figcaption class='g-caption'><span class='g-title'>" + it[0] +
        "</span><span class='g-no'>" + it[1] + "</span></figcaption></figure>";
    }).join("");
  }

  /* ================= THUMBNAILS ================= */
  var thumbItems = window.siteData.thumbItems;
  var thumbSizes = "(min-width:1200px) 23vw, (min-width:900px) 30vw, (min-width:480px) 45vw, 92vw";

  function buildThumbs() {
    var box = document.getElementById("thumbGrid");
    if (!box) return;
    box.innerHTML = thumbItems.map(function (it, idx) {
      var ratio = idx % 3 === 1 ? " ratio-43" : idx % 3 === 2 ? " ratio-34" : "";
      var dim = idx % 3 === 1 ? [480, 360] : idx % 3 === 2 ? [360, 480] : [420, 420];
      var path = it[3] || (THUMB + String(idx + 1).padStart(2, "0"));
      return "<div class='thumb-card'>" +
        "<div class='thumb-media" + ratio + "'>" +
        pic(path, dim[0], dim[1], it[0] + " cover art", thumbSizes, { lazy: true }) +
        "</div>" +
        "<div class='thumb-info'><span class='thumb-name'>" + it[0] +
        "</span><span class='thumb-date'>" + it[1] + " · " + it[2] + "</span></div></div>";
    }).join("");
  }

  /* ================= SOCIAL ICONS ================= */
  function icon(shape) {
    var sw = "stroke='currentColor' stroke-width='1.65' stroke-linecap='round' stroke-linejoin='round'";
    var base = "fill='none' " + sw;
    var paths = {

      // Spotify — círculo + 3 ondas de señal
      spotify:
        "<circle cx='12' cy='12' r='9.5' " + base + "/>" +
        "<path d='M7.5 10.5c2.8-.9 5.8-.8 8.5.4' " + base + "/>" +
        "<path d='M8 13.5c2.2-.7 4.6-.6 6.7.3' " + base + "/>" +
        "<path d='M8.5 16.3c1.7-.5 3.5-.5 5.2.2' " + base + "/>",

      // SoundCloud — nube característica con ola
      soundcloud:
        "<path d='M2.5 15.5a2 2 0 0 0 2 2h13.5a3.5 3.5 0 0 0 .5-7 4.5 4.5 0 0 0-8.5-1.5 2.5 2.5 0 0 0-3.5 2 2 2 0 0 0-4 4.5z' " + base + "/>",

      // YouTube — rect redondeado con play sólido centrado
      youtube:
        "<rect x='2' y='5.5' width='20' height='13' rx='3.5' " + base + "/>" +
        "<path d='M10 9.5l5.5 3-5.5 3z' fill='currentColor' stroke='none'/>",

      // Instagram — rect redondeado + círculo + punto cámara
      instagram:
        "<rect x='2.5' y='2.5' width='19' height='19' rx='5.5' " + base + "/>" +
        "<circle cx='12' cy='12' r='4.5' " + base + "/>" +
        "<circle cx='17.5' cy='6.5' r='1.2' fill='currentColor' stroke='none'/>",

      // X (Twitter) — dos diagonales que se cruzan formando X limpia
      x:
        "<path d='M4 4 20 20M20 4 4 20' " + base + "/>",

      // Telegram — avión de papel clásico
      telegram:
        "<path d='M22 2 11 13' " + base + "/>" +
        "<path d='M22 2 15 22 11 13 2 9l20-7z' " + base + "/>",

      // WhatsApp — burbuja de chat con teléfono adentro
      whatsapp:
        "<path d='M21 11.5A9 9 0 0 1 12 21a8.94 8.94 0 0 1-4.6-1.27L3 21l1.3-4.23A8.95 8.95 0 0 1 3 12.5 9 9 0 0 1 21 11.5z' " + base + "/>" +
        "<path d='M9 10c.3.6.7 1.2 1.2 1.7l.1.1c.5.5 1.1.9 1.7 1.2.5.3 1 .3 1.4-.2l.3-.4c.3-.4.7-.5 1.1-.3l1.6.9c.4.2.5.6.3 1-.5 1-1.5 1.7-2.7 1.5-1-.1-2-.5-3.3-1.8-1.3-1.2-1.7-2.3-1.8-3.3-.2-1.2.5-2.2 1.5-2.7.4-.2.8-.1 1 .3l.9 1.6c.2.4.1.8-.3 1.1l-.3.3c-.5.4-.5.9-.2 1.4z' fill='currentColor' stroke='none'/>"

    };
    var d = paths[shape] || "";
    return "<svg viewBox='0 0 24 24' aria-hidden='true'>" + d + "</svg>";
  }

  /* ================= DRAGGABLE AUTO CAROUSEL ================= */
  var socials = window.siteData.socials;
  var marquee = document.getElementById("marquee");
  var track = document.getElementById("marqueeTrack");

  function socialGroup() {
    return socials.map(function (s) {
      // pointer-events preserved; click vs drag distinction handled in endDrag
      return "<a class='slide social-hover-" + s[1] + "' href='" + s[2] +
        "' target='_blank' rel='noopener noreferrer' aria-label='" + s[0] + "'>" +
        icon(s[1]) + "<span>" + s[0] + "</span></a>";
    }).join("");
  }

  function buildSocials() {
    if (!track) return;
    var copies = 4;
    var html = "";
    for (var i = 0; i < copies; i++) {
      html += "<div class='marquee-group'>" + socialGroup() + "</div>";
    }
    track.innerHTML = html;
  }

  var dragging = false;
  var moved = false;
  var startX = 0;
  var startScroll = 0;
  var autoRaf = null;
  var resumeTimer = null;
  var RESUME_DELAY = 1000;

  function groupWidth() {
    var g = track ? track.querySelector(".marquee-group") : null;
    return g ? g.getBoundingClientRect().width : 0;
  }

  function autoScroll() {
    if (dragging || reduced || !marquee) return;
    var gw = groupWidth();
    if (gw > 0) {
      marquee.scrollLeft += 1.1;
      if (marquee.scrollLeft >= gw * 2) marquee.scrollLeft -= gw * 2;
    }
    autoRaf = requestAnimationFrame(autoScroll);
  }

  function startAuto() {
    if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; }
    if (autoRaf) cancelAnimationFrame(autoRaf);
    autoRaf = requestAnimationFrame(autoScroll);
  }

  function stopAuto() {
    if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; }
    if (autoRaf) { cancelAnimationFrame(autoRaf); autoRaf = null; }
  }

  if (marquee && track) {
    marquee.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = marquee.scrollLeft;
      marquee.classList.add("dragging");
      stopAuto();
    });

    marquee.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      marquee.scrollLeft = startScroll - dx;
      var gw = groupWidth();
      if (gw > 0) {
        if (marquee.scrollLeft < 0) marquee.scrollLeft += gw;
        if (marquee.scrollLeft > gw * 3) marquee.scrollLeft -= gw * 2;
      }
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      marquee.classList.remove("dragging");
      resumeTimer = setTimeout(startAuto, RESUME_DELAY);
    }
    // NO pointer capture here: capturing on the strip retargets the browser
    // `click` to the strip itself, so slide links would never open. Instead
    // listen on window to end the drag even if the pointer leaves mid-drag.
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    marquee.addEventListener("mouseleave", function () {
      if (dragging) endDrag();
    });

    track.addEventListener("click", function (e) {
      // Only block navigation when the user actually dragged:
      // a full, clean tap lets the native <a href> + target="_blank" fire.
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    track.addEventListener("dragstart", function (e) { e.preventDefault(); });

    startAuto();
  }

  /* ================= AUDIO ENGINE ================= */
  var activeEngine = null;
  var activeCard = null;

  function createEngine(card) {
    var audio = card.querySelector(".track");
    var playing = false;

    function start() {
      if (!audio) return;
      var playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(function(error) {
          console.warn("Audio playback failed:", error);
        });
      }
      playing = true;
    }

    function stop() {
      if (!audio) return;
      playing = false;
      audio.pause();
    }
    
    if (audio) {
      audio.addEventListener("ended", function() {
        stop();
        card.classList.remove("playing");
        if (activeEngine === engineInstance) {
          activeEngine = null;
          activeCard = null;
        }
      });
    }

    var engineInstance = { start: start, stop: stop, isPlaying: function () { return playing; } };
    return engineInstance;
  }

  /* ─── Audio duration helper ─── */
  function formatDuration(secs) {
    if (!isFinite(secs) || secs <= 0) return "--:--";
    var m = Math.floor(secs / 60);
    var s = Math.floor(secs % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function initPlayers() {
    var cards = document.querySelectorAll(".sound-card");
    cards.forEach(function (card) {
      var engine = createEngine(card);
      var btn = card.querySelector(".play-btn");
      var label = card.querySelector(".play-label");
      var audio = card.querySelector(".track");

      /* ── Load duration and display it ── */
      if (audio && label) {
        function applyDuration() {
          if (audio.duration && isFinite(audio.duration)) {
            label.textContent = formatDuration(audio.duration);
          }
        }
        if (audio.readyState >= 1) {
          applyDuration();
        } else {
          audio.addEventListener("loadedmetadata", applyDuration);
          // Trigger metadata fetch without loading the full file
          if (audio.preload === "none") { audio.preload = "metadata"; audio.load(); }
        }
      }

      btn.addEventListener("click", function () {
        if (activeEngine && activeEngine !== engine) {
          activeEngine.stop();
          if (activeCard) activeCard.classList.remove("playing");
        }
        if (engine.isPlaying()) {
          engine.stop();
          card.classList.remove("playing");
          activeEngine = null;
          activeCard = null;
        } else {
          engine.start();
          card.classList.add("playing");
          activeEngine = engine;
          activeCard = card;
        }
      });
    });
  }

  /* ================= NAV ACTIVE STATE ================= */
  var sectionLinks = document.querySelectorAll(".menu-nav a[data-link]");
  var sections = Array.prototype.slice.call(sectionLinks)
    .map(function (a) { return document.getElementById(a.getAttribute("data-link")); })
    .filter(function (s) { return !!s; });

  var navObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        sectionLinks.forEach(function (a) {
          if (a.getAttribute("data-link") === e.target.id) a.classList.add("active");
          else a.classList.remove("active");
        });
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach(function (s) { navObserver.observe(s); });

  /* ================= REVEAL ON SCROLL ================= */
  var revealObserver;
  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
  } else {
    revealObserver = { observe: function () {}, unobserve: function () {} };
  }
  document.querySelectorAll(".reveal").forEach(function (el) {
    if (reduced) return;
    revealObserver.observe(el);
  });

  /* ================= BACK TO TOP ================= */
  var backTop = document.getElementById("backTop");
  var toTopBtn = document.getElementById("toTopBtn");

  function scrollTop() { window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); }
  window.addEventListener("scroll", function () {
    var show = window.scrollY > 480;
    backTop.classList.toggle("show", show);
  }, { passive: true });
  backTop.addEventListener("click", scrollTop);
  toTopBtn.addEventListener("click", scrollTop);

  /* ================= HOVER SOUNDS ================= */
  var hoverAudio = document.getElementById("menuHoverAudio");
  // Seleccionamos los enlaces del menú principal, las redes sociales y los botones generales
  var hoverTargets = document.querySelectorAll(".menu-nav a, .menu-socials a, .btn, .f-col a, .slide");
  
  if (hoverAudio) {
    hoverTargets.forEach(function(el) {
      el.addEventListener("mouseenter", function() {
        // Clonamos el elemento de audio para permitir sonidos superpuestos (polyphony)
        var soundClone = hoverAudio.cloneNode();
        var playPromise = soundClone.play();
        if (playPromise !== undefined) {
          playPromise.catch(function() { /* Silenciar error si el navegador lo bloquea sin interacción previa */ });
        }
        // Limpiamos el clon una vez que termine de sonar
        soundClone.addEventListener("ended", function() {
          soundClone.remove();
        });
      });
    });
  }

  /* ================= LIGHTBOX WITH CAROUSEL ================= */
  var lightbox = document.getElementById("lightbox");
  var lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;
  var lightboxImg = lightbox ? lightbox.querySelector(".lightbox-img") : null;
  var lightboxPrev = lightbox ? lightbox.querySelector(".lightbox-prev") : null;
  var lightboxNext = lightbox ? lightbox.querySelector(".lightbox-next") : null;
  var lightboxCounter = lightbox ? lightbox.querySelector(".lightbox-counter") : null;

  var lbImages = [];   // [{src, alt}]
  var lbIndex  = 0;

  function lbShow(idx) {
    if (!lbImages.length) return;
    lbIndex = (idx + lbImages.length) % lbImages.length;
    var item = lbImages[lbIndex];
    if (lightboxImg) {
      lightboxImg.style.opacity = "0";
      setTimeout(function () {
        lightboxImg.src = item.src;
        lightboxImg.alt = item.alt || "";
        lightboxImg.style.opacity = "1";
      }, 160);
    }
    if (lightboxCounter) {
      lightboxCounter.textContent = (lbIndex + 1) + " / " + lbImages.length;
    }
    // Show/hide nav arrows
    if (lightboxPrev) lightboxPrev.style.display = lbImages.length > 1 ? "" : "none";
    if (lightboxNext) lightboxNext.style.display = lbImages.length > 1 ? "" : "none";
  }

  function openLightbox(src, alt) {
    // Build image list from current gallery at open time
    lbImages = [];
    document.querySelectorAll(".g-item img, .thumb-card img").forEach(function (img) {
      lbImages.push({ src: img.src, alt: img.alt || "" });
    });
    // Find clicked image index
    var startIdx = 0;
    for (var i = 0; i < lbImages.length; i++) {
      if (lbImages[i].src === src) { startIdx = i; break; }
    }
    if (!lightbox) return;
    lightbox.classList.add("active");
    lbShow(startIdx);
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    setTimeout(function () {
      if (lightboxImg) { lightboxImg.src = ""; lightboxImg.style.opacity = "1"; }
    }, 400);
  }

  if (lightbox) {
    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    if (lightboxPrev) lightboxPrev.addEventListener("click", function () { lbShow(lbIndex - 1); });
    if (lightboxNext) lightboxNext.addEventListener("click", function () { lbShow(lbIndex + 1); });

    // Keyboard navigation
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("active")) return;
      if (e.key === "Escape")     closeLightbox();
      if (e.key === "ArrowLeft")  lbShow(lbIndex - 1);
      if (e.key === "ArrowRight") lbShow(lbIndex + 1);
    });

    // Touch / swipe support
    var lbTouchX = 0;
    lightbox.addEventListener("touchstart", function (e) {
      lbTouchX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - lbTouchX;
      if (Math.abs(dx) > 40) {
        dx < 0 ? lbShow(lbIndex + 1) : lbShow(lbIndex - 1);
      }
    }, { passive: true });
  }

  function bindLightbox() {
    document.querySelectorAll(".g-item, .thumb-card").forEach(function (item) {
      item.addEventListener("click", function () {
        var img = this.querySelector("img");
        if (img) openLightbox(img.src, img.alt);
      });
    });
  }

  /* ================= INIT ================= */
  buildGallery();
  buildThumbs();
  buildSocials();
  initPlayers();
  bindLightbox();
})();