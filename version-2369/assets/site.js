(function () {
  var panel = document.querySelector('.mobile-panel');
  var toggle = document.querySelector('.menu-toggle');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  var initialType = params.get('type') || '';
  var initialRegion = params.get('region') || '';
  var searchInputs = document.querySelectorAll('.js-search-input, .js-live-search');
  searchInputs.forEach(function (input) {
    if (initialQuery) {
      input.value = initialQuery;
    }
  });

  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));
  var activeFilter = { key: 'all', value: 'all' };
  if (initialType) {
    activeFilter = { key: 'type', value: initialType };
  }
  if (initialRegion) {
    activeFilter = { key: 'region', value: initialRegion };
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardMatches(card, query) {
    var haystack = [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-channel')
    ].map(normalize).join(' ');
    var queryOk = !query || haystack.indexOf(normalize(query)) !== -1;
    var filterOk = true;
    if (activeFilter.key !== 'all') {
      filterOk = normalize(card.getAttribute('data-' + activeFilter.key)) === normalize(activeFilter.value);
    }
    return queryOk && filterOk;
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var queryInput = document.querySelector('.js-live-search') || document.querySelector('.js-search-input');
    var query = queryInput ? queryInput.value : initialQuery;
    cards.forEach(function (card) {
      card.classList.toggle('hidden-by-filter', !cardMatches(card, query));
    });
  }

  document.querySelectorAll('.js-live-search').forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  document.querySelectorAll('.filter-chip').forEach(function (button) {
    if (button.getAttribute('data-filter-key') === activeFilter.key && button.getAttribute('data-filter-value') === activeFilter.value) {
      document.querySelectorAll('.filter-chip').forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
    }
    button.addEventListener('click', function () {
      document.querySelectorAll('.filter-chip').forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      activeFilter = {
        key: button.getAttribute('data-filter-key') || 'all',
        value: button.getAttribute('data-filter-value') || 'all'
      };
      applyFilters();
    });
  });

  applyFilters();

  document.querySelectorAll('.js-hero').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    restart();
  });

  document.querySelectorAll('.js-player').forEach(function (player) {
    var video = player.querySelector('video');
    var source = player.getAttribute('data-source');
    var playButton = player.querySelector('.js-play');
    var hlsInstance = null;
    var started = false;

    function startPlayer() {
      if (!video || !source) {
        return;
      }
      if (!started) {
        started = true;
        player.classList.add('started');
        video.setAttribute('controls', 'controls');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (playButton) {
      playButton.addEventListener('click', startPlayer);
    }
    player.addEventListener('click', function (event) {
      if (!started && event.target === player) {
        startPlayer();
      }
    });
    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          startPlayer();
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
})();
