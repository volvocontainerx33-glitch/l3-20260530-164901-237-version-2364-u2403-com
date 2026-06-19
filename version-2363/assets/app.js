(function () {
  function all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');
  if (hero) {
    var slides = all('.hero-slide', hero);
    var dots = all('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterRoot = document.querySelector('[data-card-filter]');
  if (filterRoot) {
    var searchInput = document.getElementById('cardSearch');
    var typeFilter = document.getElementById('typeFilter');
    var yearFilter = document.getElementById('yearFilter');
    var cards = all('.filterable-grid .movie-card, .filterable-grid .ranking-item');
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && searchInput) {
      searchInput.value = query;
    }

    function normalize(text) {
      return String(text || '').toLowerCase().trim();
    }

    function applyFilters() {
      var q = normalize(searchInput && searchInput.value);
      var type = normalize(typeFilter && typeFilter.value);
      var year = normalize(yearFilter && yearFilter.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' '));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = (!q || haystack.indexOf(q) !== -1) && (!type || cardType === type) && (!year || cardYear === year);
        card.classList.toggle('is-hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [searchInput, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  var video = document.getElementById('mainPlayer');
  var trigger = document.querySelector('[data-play-trigger]');
  var scrollPlay = document.querySelector('[data-scroll-play]');
  var attached = false;

  function attachVideo() {
    if (!video || attached || !window.playerSource) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = window.playerSource;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        capLevelToPlayerSize: true
      });
      hls.loadSource(window.playerSource);
      hls.attachMedia(video);
    } else {
      video.src = window.playerSource;
    }
  }

  function startVideo() {
    if (!video) {
      return;
    }
    attachVideo();
    if (trigger) {
      trigger.classList.add('is-hidden');
    }
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }

  if (trigger) {
    trigger.addEventListener('click', startVideo);
  }

  if (scrollPlay) {
    scrollPlay.addEventListener('click', function () {
      setTimeout(startVideo, 120);
    });
  }

  if (video) {
    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });
  }
})();
