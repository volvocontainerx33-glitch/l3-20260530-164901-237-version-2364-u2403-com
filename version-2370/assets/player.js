(function () {
  function attachPlayer(box) {
    var video = box.querySelector('video');
    var layer = box.querySelector('[data-poster-layer]');
    var button = box.querySelector('[data-play-button]');
    var stream = video ? video.getAttribute('data-stream') : '';
    var hlsInstance = null;

    function loadStream() {
      if (!video || !stream) {
        return;
      }
      if (video.getAttribute('data-loaded') === 'yes') {
        return;
      }
      video.setAttribute('data-loaded', 'yes');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = stream;
    }

    function start() {
      loadStream();
      if (layer) {
        layer.classList.add('is-hidden');
      }
      if (video) {
        video.controls = true;
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (layer) {
      layer.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('error', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    }
  }

  document.querySelectorAll('[data-player]').forEach(attachPlayer);
})();
