(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-m3u8]'));

    shells.forEach(function (shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.player-overlay');
        var url = shell.getAttribute('data-m3u8');
        var prepared = false;
        var hls = null;

        function prepare() {
            if (prepared || !video || !url) {
                return;
            }
            prepared = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                return;
            }

            video.src = url;
        }

        function begin() {
            prepare();
            if (!video) {
                return;
            }
            shell.classList.add('is-playing');
            if (overlay) {
                overlay.setAttribute('hidden', 'hidden');
            }
            var request = video.play();
            if (request && request.catch) {
                request.catch(function () {
                    shell.classList.remove('is-playing');
                    if (overlay) {
                        overlay.removeAttribute('hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', begin);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    begin();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.setAttribute('hidden', 'hidden');
                }
            });
        }
    });
})();
