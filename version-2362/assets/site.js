const navToggle = document.querySelector('[data-nav-toggle]');
const mainNav = document.querySelector('[data-main-nav]');

if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
        mainNav.classList.toggle('is-open');
    });
}

document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
        image.classList.add('img-fade');
    });
});

function setupHero() {
    const root = document.querySelector('[data-hero]');
    if (!root) {
        return;
    }

    const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
    const next = root.querySelector('[data-hero-next]');
    const prev = root.querySelector('[data-hero-prev]');
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
        if (!slides.length) {
            return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => show(index + 1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    if (next) {
        next.addEventListener('click', () => {
            show(index + 1);
            start();
        });
    }

    if (prev) {
        prev.addEventListener('click', () => {
            show(index - 1);
            start();
        });
    }

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
            show(nextIndex);
            start();
        });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
}

function setupSearch() {
    const input = document.querySelector('[data-search-input]');
    const list = document.querySelector('[data-search-list]');
    const state = document.querySelector('[data-search-state]');
    if (!input || !list) {
        return;
    }

    const cards = Array.from(list.querySelectorAll('[data-search-card]'));
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    input.value = initial;

    const filter = () => {
        const query = input.value.trim().toLowerCase();
        let count = 0;
        cards.forEach((card) => {
            const haystack = `${card.getAttribute('data-title') || ''} ${card.getAttribute('data-meta') || ''}`.toLowerCase();
            const matched = !query || haystack.includes(query);
            card.style.display = matched ? '' : 'none';
            if (matched) {
                count += 1;
            }
        });
        if (state) {
            state.textContent = query ? `找到 ${count} 个相关结果` : '输入关键词后显示匹配影片。';
        }
    };

    input.addEventListener('input', filter);
    filter();
}

function showPlayerMessage(player, message) {
    let box = player.querySelector('.player-message');
    if (!box) {
        box = document.createElement('div');
        box.className = 'player-message';
        player.appendChild(box);
    }
    box.textContent = message;
}

async function setupPlayer(player) {
    const video = player.querySelector('video[data-src]');
    const button = player.querySelector('[data-play-button]');
    if (!video || !button) {
        return;
    }

    const source = video.getAttribute('data-src');
    let ready = false;

    const start = async () => {
        if (!source) {
            showPlayerMessage(player, '播放源暂时不可用');
            return;
        }

        try {
            if (!ready) {
                ready = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    const Hls = window.Hls;
                    if (Hls && Hls.isSupported()) {
                        const hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else {
                        video.src = source;
                    }
                }
            }
            player.classList.add('is-playing');
            await video.play();
        } catch (error) {
            player.classList.remove('is-playing');
            showPlayerMessage(player, '播放启动失败，请稍后重试');
        }
    };

    button.addEventListener('click', start);
    video.addEventListener('click', () => {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener('play', () => player.classList.add('is-playing'));
    video.addEventListener('pause', () => {
        if (video.currentTime === 0) {
            player.classList.remove('is-playing');
        }
    });
}

function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach((player) => {
        setupPlayer(player);
    });
}

setupHero();
setupSearch();
setupPlayers();
