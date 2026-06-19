
(function () {
  const body = document.body;
  const navToggle = document.querySelector('[data-nav-toggle]');
  const searchInput = document.querySelector('[data-search-input]');
  const filterGrid = document.querySelector('[data-filter-grid]');
  const resultCount = document.querySelector('[data-result-count]');
  const filterChips = document.querySelectorAll('[data-filter-chip]');

  if (navToggle) {
    navToggle.addEventListener('click', () => body.classList.toggle('nav-open'));
  }

  const hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-slide]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    const show = (n) => {
      index = (n + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    };
    const move = (dir) => show(index + dir);
    if (prev) prev.addEventListener('click', () => move(-1));
    if (next) next.addEventListener('click', () => move(1));
    setInterval(() => move(1), 5200);
    hero.addEventListener('mouseenter', () => hero.dataset.pause = '1');
    hero.addEventListener('mouseleave', () => delete hero.dataset.pause);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function applyFilter(query) {
    if (!filterGrid) return;
    const q = normalize(query);
    let count = 0;
    const cards = Array.from(filterGrid.querySelectorAll('.movie-card'));
    cards.forEach((card) => {
      const data = normalize(card.dataset.search || card.dataset.title || card.textContent);
      const visible = !q || data.includes(q);
      card.classList.toggle('js-hidden', !visible);
      if (visible) count += 1;
    });
    if (resultCount) resultCount.textContent = String(count);
    const empty = filterGrid.parentElement.querySelector('.result-empty');
    if (empty) empty.remove();
    if (count === 0) {
      const div = document.createElement('div');
      div.className = 'result-empty';
      div.textContent = '未找到匹配影片，请尝试其他关键词。';
      filterGrid.after(div);
    }
  }

  if (searchInput && filterGrid) {
    searchInput.addEventListener('input', (e) => applyFilter(e.target.value));
    filterChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        filterChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        searchInput.value = chip.dataset.filter || '';
        applyFilter(searchInput.value);
      });
    });
    applyFilter('');
  }

  const player = document.querySelector('.js-player');
  if (player) {
    const playBtn = document.querySelector('[data-player-play]');
    const src = player.dataset.src;

    function attachHls() {
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(player);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (playBtn) playBtn.textContent = '立即播放';
        });
      } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = src;
      } else {
        player.src = src;
      }
    }

    attachHls();
    if (playBtn) {
      playBtn.addEventListener('click', async () => {
        try {
          await player.play();
          playBtn.style.display = 'none';
        } catch (err) {
          console.warn(err);
        }
      });
    }
    player.addEventListener('play', () => {
      if (playBtn) playBtn.style.display = 'none';
    });
  }
})();
