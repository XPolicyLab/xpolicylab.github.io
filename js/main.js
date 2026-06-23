(function () {
  /* Copy BibTeX citation to clipboard */
  var copyBtn = document.getElementById("copy-citation");
  var citationEl = document.getElementById("citation-bibtex");

  if (copyBtn && citationEl) {
    copyBtn.addEventListener("click", function () {
      var text = citationEl.textContent.trim();

      navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = "Copied!";
        copyBtn.classList.add("copied");

        setTimeout(function () {
          copyBtn.textContent = "Copy BibTeX";
          copyBtn.classList.remove("copied");
        }, 2000);
      });
    });
  }

  /* Add a subtle border/background to the nav once the page scrolls */
  var nav = document.getElementById("nav");

  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 8) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Page language toggle */
  var langBtns = document.querySelectorAll(".lang-btn");
  var langBlocks = document.querySelectorAll(".lang-content[data-lang]");

  if (langBtns.length && langBlocks.length) {
    langBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang");

        langBtns.forEach(function (b) {
          var isActive = b === btn;
          b.classList.toggle("is-active", isActive);
          b.setAttribute("aria-pressed", isActive ? "true" : "false");
        });

        langBlocks.forEach(function (block) {
          block.classList.toggle("is-hidden", block.getAttribute("data-lang") !== lang);
        });

        document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
      });
    });
  }
})();
