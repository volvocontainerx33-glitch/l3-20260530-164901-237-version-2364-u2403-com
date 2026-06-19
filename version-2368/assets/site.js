
(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function normalize(s) {
    return String(s || '').toLowerCase().trim();
  }

  // Mobile nav
  const navToggle = qs('[data-nav-toggle]');
  const navPanel = qs('[data-nav-panel]');
  const navOverlay = qs('[data-nav-overlay]');
  const closeNav = () => {
    if (!navPanel) return;
    navPanel.classList.add('translate-x-full');
    if (navOverlay) navOverlay.classList.add('hidden');
  };
  const openNav = () => {
    if (!navPanel) return;
    navPanel.classList.remove('translate-x-full');
    if (navOverlay) navOverlay.classList.remove('hidden');
  };
  if (navToggle) navToggle.addEventListener('click', () => {
    if (!navPanel) return;
    if (navPanel.classList.contains('translate-x-full')) openNav(); else closeNav();
  });
  if (navOverlay) navOverlay.addEventListener('click', closeNav);
  qsa('[data-nav-close]').forEach(btn => btn.addEventListener('click', closeNav));

  // Search forms
  qsa('[data-search-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = qs('input[type="search"], input[type="text"]', form);
      const q = encodeURIComponent((input && input.value || '').trim());
      window.location.href = `search.html?q=${q}`;
    });
  });

  // Hero slider
  const hero = qs('[data-hero-slider]');
  if (hero) {
    const slides = qsa('[data-hero-slide]', hero);
    const dots = qsa('[data-hero-dot]', hero);
    let index = 0;
    const setActive = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, idx) => slide.classList.toggle('active', idx === index));
      dots.forEach((dot, idx) => {
        dot.classList.toggle('bg-white', idx === index);
        dot.classList.toggle('bg-white/35', idx !== index);
      });
    };
    dots.forEach((dot, idx) => dot.addEventListener('click', () => setActive(idx)));
    setActive(0);
    setInterval(() => setActive(index + 1), 5500);
  }

  // Detail page player
  const video = qs('[data-detail-video]');
  if (video) {
    const primary = video.getAttribute('data-primary-src') || '';
    const fallback = video.getAttribute('data-fallback-src') || '';
    const poster = video.getAttribute('poster') || '';
    let hls = null;

    function useSource(src) {
      if (!src) return;
      if (window.Hls && Hls.isSupported() && /\.m3u8(\?|$)/i.test(src)) {
        if (hls) hls.destroy();
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (data.fatal && fallback && src !== fallback) {
            useSource(fallback);
          }
        });
      } else {
        video.src = src;
      }
    }

    const btn = qs('[data-play-button]');
    if (btn) btn.addEventListener('click', () => {
      useSource(primary || fallback);
      video.play().catch(() => {});
    });

    video.addEventListener('error', () => {
      if (fallback && video.src !== fallback) {
        if (hls) { try { hls.destroy(); } catch (e) {} }
        useSource(fallback);
      }
    });

    useSource(primary || fallback);
  }

  // Search page
  const resultWrap = qs('[data-search-results]');
  if (resultWrap && window.MOVIES) {
    const params = new URLSearchParams(window.location.search);
    const q = normalize(params.get('q'));
    const type = normalize(params.get('type'));
    const region = normalize(params.get('region'));
    const year = normalize(params.get('year'));
    const queryBox = qs('[data-search-query]');
    if (queryBox && q) queryBox.value = params.get('q');

    const filtered = window.MOVIES.filter(m => {
      const hay = normalize([m.title, m.region, m.type, m.genre, m.tags, m.oneLine, m.summary, m.review, m.category].join(' '));
      const okQ = !q || hay.includes(q);
      const okType = !type || normalize(m.type).includes(type);
      const okRegion = !region || normalize(m.region).includes(region);
      const okYear = !year || String(m.year) === String(year);
      return okQ && okType && okRegion && okYear;
    });

    const view = filtered.slice(0, 180);
    const stats = qs('[data-search-stats]');
    if (stats) stats.textContent = `找到 ${filtered.length} 部影片`;

    if (!view.length) {
      resultWrap.innerHTML = `
        <div class="col-span-full rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <h3 class="text-xl font-bold text-gray-800">未找到匹配结果</h3>
          <p class="mt-3 text-gray-500">可以尝试输入片名、地区、类型、年份或关键词再次搜索。</p>
        </div>
      `;
      return;
    }

    resultWrap.innerHTML = view.map(m => `
      <a href="movie-${String(m.id).padStart(4, '0')}.html" class="card-movie group">
        <div class="card-poster">
          <img src="./${m.id}.svg" alt="${m.title}">
          <div class="card-overlay"></div>
        </div>
        <div class="p-4 md:p-5">
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="tag-pill brand">${m.type}</span>
            <span class="text-xs text-gray-500">${m.year}</span>
          </div>
          <h3 class="font-semibold text-gray-800 line-clamp-1 group-hover:text-red-600 transition-colors">${m.title}</h3>
          <p class="mt-2 text-sm text-gray-500 line-clamp-2">${m.oneLine}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <span class="tag-pill">${m.region}</span>
            <span class="tag-pill">★ ${m.rating.toFixed(1)}</span>
          </div>
        </div>
      </a>
    `).join('');
  }
})();
