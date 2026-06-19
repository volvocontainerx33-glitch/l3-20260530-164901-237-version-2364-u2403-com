(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
            slide.classList.toggle('active', idx === current);
        });
        dots.forEach(function (dot, idx) {
            dot.classList.toggle('active', idx === current);
        });
    }

    function restart() {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    if (slides.length) {
        showSlide(0);
        restart();
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            restart();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            restart();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            restart();
        });
    });

    var heroForm = document.querySelector('[data-hero-search]');
    if (heroForm) {
        heroForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = heroForm.querySelector('input');
            var value = input ? input.value.trim() : '';
            window.location.href = './search.html' + (value ? '?q=' + encodeURIComponent(value) : '');
        });
    }

    var searchInput = document.querySelector('[data-filter-keyword]');
    var categorySelect = document.querySelector('[data-filter-category]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var countNode = document.querySelector('[data-result-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title][data-category][data-region][data-year]'));

    if (searchInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        if (params.get('q')) {
            searchInput.value = params.get('q');
        }
        if (params.get('category') && categorySelect) {
            categorySelect.value = params.get('category');
        }
        if (params.get('region') && regionSelect) {
            regionSelect.value = params.get('region');
        }
        if (params.get('year') && yearSelect) {
            yearSelect.value = params.get('year');
        }

        var filter = function () {
            var keyword = searchInput.value.trim().toLowerCase();
            var category = categorySelect ? categorySelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title || '',
                    card.dataset.category || '',
                    card.dataset.region || '',
                    card.dataset.year || '',
                    card.dataset.tags || ''
                ].join(' ').toLowerCase();
                var matched = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (category && card.dataset.category !== category) {
                    matched = false;
                }
                if (region && card.dataset.region.indexOf(region) === -1) {
                    matched = false;
                }
                if (year && card.dataset.year !== year) {
                    matched = false;
                }
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = '当前显示 ' + visible + ' 部影片';
            }
        };

        [searchInput, categorySelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filter);
                control.addEventListener('change', filter);
            }
        });

        filter();
    }
})();
