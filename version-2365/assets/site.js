(function () {
    function queryAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = queryAll('[data-hero-slide]');
    var dots = queryAll('[data-hero-dot]');
    var activeSlide = 0;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            setSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            setSlide(activeSlide + 1);
        }, 5000);
    }

    setSlide(0);

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    queryAll('[data-filter-root]').forEach(function (root) {
        var searchInput = root.querySelector('[data-filter-search]');
        var yearSelect = root.querySelector('[data-filter-year]');
        var genreSelect = root.querySelector('[data-filter-genre]');
        var cards = queryAll('.movie-card', root);
        var count = root.querySelector('[data-filter-count]');
        var empty = root.querySelector('[data-no-results]');

        function applyFilter() {
            var keyword = normalize(searchInput && searchInput.value);
            var year = yearSelect && yearSelect.value !== '全部' ? yearSelect.value : '';
            var genre = genreSelect && genreSelect.value !== '全部' ? genreSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.type,
                    card.textContent
                ].join(' '));
                var yearOk = !year || card.dataset.year === year;
                var genreOk = !genre || normalize(card.dataset.genre).indexOf(normalize(genre)) !== -1;
                var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
                var shouldShow = yearOk && genreOk && keywordOk;

                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, yearSelect, genreSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        var params = new URLSearchParams(window.location.search);
        if (params.get('q') && searchInput) {
            searchInput.value = params.get('q');
        }

        applyFilter();
    });

    queryAll('[data-video-player]').forEach(function (box) {
        var video = box.querySelector('video');
        var button = box.querySelector('[data-play-button]');
        var src = box.getAttribute('data-src');

        function attachSource() {
            if (!video || video.dataset.ready === '1') {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else {
                video.src = src;
            }

            video.dataset.ready = '1';
        }

        if (button) {
            button.addEventListener('click', function () {
                attachSource();
                button.classList.add('is-hidden');
                video.setAttribute('controls', 'controls');
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        button.classList.remove('is-hidden');
                    });
                }
            });
        }
    });
})();
