(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      toggle.textContent = opened ? "×" : "☰";
    });
  }

  function initBackTop() {
    var button = document.querySelector(".back-top");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function textOf(card) {
    return (card.getAttribute("data-search") || "").toLowerCase();
  }

  function initPageSearch() {
    var input = document.querySelector("[data-page-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (initial) {
      input.value = initial;
    }

    function selectedFilter() {
      var active = document.querySelector("[data-filter-group] .filter-chip.is-active");
      return active ? active.getAttribute("data-filter") : "all";
    }

    function selectedYear() {
      var active = document.querySelector("[data-year-filter-group] .filter-chip.is-active");
      return active ? active.getAttribute("data-year-filter") : "all";
    }

    function apply() {
      var query = input.value.trim().toLowerCase();
      var type = selectedFilter();
      var year = selectedYear();
      cards.forEach(function (card) {
        var matchesText = !query || textOf(card).indexOf(query) >= 0;
        var matchesType = type === "all" || card.getAttribute("data-type") === type;
        var matchesYear = year === "all" || card.getAttribute("data-year") === year;
        card.classList.toggle("is-filtered-out", !(matchesText && matchesType && matchesYear));
      });
    }

    input.addEventListener("input", apply);
    Array.prototype.slice.call(document.querySelectorAll("[data-filter-group] .filter-chip")).forEach(function (button) {
      button.addEventListener("click", function () {
        button.parentElement.querySelectorAll(".filter-chip").forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        apply();
      });
    });
    Array.prototype.slice.call(document.querySelectorAll("[data-year-filter-group] .filter-chip")).forEach(function (button) {
      button.addEventListener("click", function () {
        button.parentElement.querySelectorAll(".filter-chip").forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        apply();
      });
    });
    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".video-shell"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var layer = shell.querySelector(".play-layer");
      var started = false;
      var hls = null;
      var playUrl = shell.getAttribute("data-play");

      function startVideo() {
        if (!video || !playUrl) {
          return;
        }
        if (layer) {
          layer.classList.add("is-hidden");
        }
        if (!started) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = playUrl;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ maxBufferLength: 30 });
            hls.loadSource(playUrl);
            hls.attachMedia(video);
          } else {
            video.src = playUrl;
          }
          started = true;
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (layer) {
        layer.addEventListener("click", startVideo);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            startVideo();
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initBackTop();
    initHero();
    initPageSearch();
    initPlayers();
  });
})();
