(() => {
    const getBase = () => document.body.dataset.base || "";

    function setupMobileMenu() {
        const button = document.querySelector("[data-mobile-menu-button]");
        const panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }

        button.addEventListener("click", () => {
            const isOpen = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function setupHeaderSearch() {
        document.querySelectorAll("[data-search-form]").forEach((form) => {
            form.addEventListener("submit", (event) => {
                const input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }

                const query = input.value.trim();
                if (!query) {
                    event.preventDefault();
                    window.location.href = `${getBase()}search.html`;
                }
            });
        });
    }

    function setupImageFallback() {
        document.querySelectorAll("img").forEach((image) => {
            image.addEventListener("error", () => {
                image.classList.add("is-missing");
                image.setAttribute("aria-hidden", "true");
            }, { once: true });
        });
    }

    function normalize(text) {
        return (text || "").toString().toLowerCase().trim();
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach((scope) => {
            const input = scope.querySelector(".filter-input");
            const selects = Array.from(scope.querySelectorAll(".filter-select"));
            const container = scope.nextElementSibling;
            const count = scope.querySelector(".result-count");
            const cards = container ? Array.from(container.querySelectorAll(".movie-card")) : [];

            if (!cards.length) {
                return;
            }

            const params = new URLSearchParams(window.location.search);
            const query = params.get("q");
            if (query && input) {
                input.value = query;
            }

            function applyFilter() {
                const keyword = normalize(input ? input.value : "");
                const activeFilters = selects.map((select) => ({
                    key: select.dataset.filter,
                    value: normalize(select.value),
                })).filter((item) => item.key && item.value);
                let visible = 0;

                cards.forEach((card) => {
                    const haystack = normalize(card.dataset.search || card.textContent);
                    const keywordMatch = !keyword || haystack.includes(keyword);
                    const filterMatch = activeFilters.every((item) => normalize(card.dataset[item.key]) === item.value);
                    const shouldShow = keywordMatch && filterMatch;
                    card.hidden = !shouldShow;
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = `共 ${visible} 部影片`;
                }
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }
            selects.forEach((select) => select.addEventListener("change", applyFilter));
            applyFilter();
        });
    }

    function setupHeroCarousel() {
        const carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }

        const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
        const previous = carousel.querySelector("[data-hero-prev]");
        const next = carousel.querySelector("[data-hero-next]");
        let current = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === current));
            dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === current));
        }

        function start() {
            stop();
            timer = window.setInterval(() => show(current + 1), 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                show(index);
                start();
            });
        });

        if (previous) {
            previous.addEventListener("click", () => {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                show(current + 1);
                start();
            });
        }

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupPlayers() {
        document.querySelectorAll("[data-player]").forEach((player) => {
            const video = player.querySelector("video");
            const button = player.querySelector("[data-play-button]");
            const status = player.querySelector("[data-player-status]");
            const source = player.dataset.videoUrl;
            const title = player.dataset.videoTitle || "影片";
            let hlsInstance = null;
            let isLoaded = false;

            if (!video || !button || !source) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function loadSource() {
                if (isLoaded) {
                    return Promise.resolve();
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    isLoaded = true;
                    setStatus(`正在播放：${title}`);
                    return Promise.resolve();
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
                        setStatus(`正在播放：${title}`);
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, (_event, data) => {
                        if (data && data.fatal) {
                            setStatus("播放源加载失败，请检查 m3u8 地址是否仍可访问。");
                        }
                    });
                    isLoaded = true;
                    return Promise.resolve();
                }

                setStatus("当前浏览器不支持 HLS 播放，可尝试使用支持 HLS 的浏览器打开。 ");
                return Promise.reject(new Error("HLS is not supported"));
            }

            button.addEventListener("click", () => {
                button.classList.add("is-hidden");
                loadSource()
                    .then(() => video.play())
                    .catch(() => {
                        button.classList.remove("is-hidden");
                    });
            });

            video.addEventListener("play", () => button.classList.add("is-hidden"));
            video.addEventListener("pause", () => {
                if (!video.currentTime || video.ended) {
                    button.classList.remove("is-hidden");
                }
            });
            window.addEventListener("pagehide", () => {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        setupMobileMenu();
        setupHeaderSearch();
        setupImageFallback();
        setupFilters();
        setupHeroCarousel();
        setupPlayers();
    });
})();
