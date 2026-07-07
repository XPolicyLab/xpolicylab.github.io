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

/* ── Benchmark landing: task grids, leaderboard, tabs, counters ── */
(function () {
  var GRADIENTS = [
    "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
    "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
    "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
    "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
    "linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)",
    "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)"
  ];

  /* Pool of representative manipulation tasks (name + glyph). */
  var TASK_POOL = [
    ["Block Handover", "\uD83E\uDDE9"], ["Stack Blocks", "\uD83C\uDFD7\uFE0F"], ["Pick Apple", "\uD83C\uDF4E"],
    ["Place Shoe", "\uD83D\uDC5F"], ["Pour Water", "\uD83E\uDD5B"], ["Open Drawer", "\uD83D\uDDC4\uFE0F"],
    ["Close Laptop", "\uD83D\uDCBB"], ["Hang Mug", "\u2615"], ["Insert Peg", "\uD83D\uDD29"],
    ["Fold Cloth", "\uD83E\uDDFA"], ["Wipe Table", "\uD83E\uDDFD"], ["Sort Cubes", "\uD83C\uDFB2"],
    ["Press Button", "\uD83D\uDD18"], ["Turn Knob", "\uD83C\uDF9B\uFE0F"], ["Plug Charger", "\uD83D\uDD0C"],
    ["Sweep Debris", "\uD83E\uDDF9"], ["Screw Bottle Cap", "\uD83E\uDDF4"], ["Flip Switch", "\uD83D\uDCA1"],
    ["Hammer Nail", "\uD83D\uDD28"], ["Scan Item", "\uD83D\uDCE6"], ["Water Plant", "\uD83E\uDEB4"],
    ["Slice Bread", "\uD83E\uDD56"], ["Load Dish", "\uD83C\uDF7D\uFE0F"], ["Stack Bowls", "\uD83E\uDD63"],
    ["Grasp Bottle", "\uD83C\uDF7C"], ["Rotate Cube", "\uD83E\uDDCA"], ["Toggle Lamp", "\uD83D\uDD26"],
    ["Assemble Gear", "\u2699\uFE0F"], ["Pack Box", "\uD83D\uDCE6"], ["Unstack Cups", "\uD83E\uDD64"],
    ["Push Chair", "\uD83E\uDE91"], ["Pull Handle", "\uD83D\uDEAA"], ["Zip Bag", "\uD83D\uDC5C"],
    ["Sort Fruit", "\uD83C\uDF47"], ["Balance Rod", "\uD83E\uDD62"], ["Thread Ring", "\uD83D\uDC8D"],
    ["Coil Cable", "\uD83D\uDD0C"], ["Stamp Paper", "\uD83D\uDCC4"], ["Peel Sticker", "\uD83C\uDFF7\uFE0F"],
    ["Snap Lego", "\uD83E\uDDE9"], ["Wind Toy", "\uD83E\uDDF8"], ["Dial Phone", "\u260E\uFE0F"],
    ["Clip Pen", "\uD83D\uDD8A\uFE0F"], ["Tie Knot", "\uD83E\uDEA2"], ["Stir Pot", "\uD83C\uDF72"],
    ["Crack Egg", "\uD83E\uDD5A"], ["Peel Banana", "\uD83C\uDF4C"], ["Sort Screws", "\uD83D\uDD29"],
    ["Roll Dice", "\uD83C\uDFB2"], ["Fold Paper", "\uD83D\uDCC3"]
  ];

  function buildTasks(count, prefix) {
    var out = [];
    for (var i = 0; i < count; i++) {
      var t = TASK_POOL[i % TASK_POOL.length];
      out.push({
        id: prefix + "-" + String(i + 1).padStart(2, "0"),
        name: t[0],
        glyph: t[1],
        grad: GRADIENTS[i % GRADIENTS.length]
      });
    }
    return out;
  }

  var TASKS = {
    "rt3-sim": buildTasks(42, "S3"),
    "rt3-real": buildTasks(18, "R3"),
    "rt2-sim": buildTasks(50, "S2")
  };

  function renderTasks(panel, tasks) {
    var frag = document.createDocumentFragment();
    tasks.forEach(function (task) {
      var tile = document.createElement("article");
      tile.className = "task-tile";
      tile.innerHTML =
        '<div class="task-thumb" style="background:' + task.grad + '">' +
        '<span class="task-glyph">' + task.glyph + "</span></div>" +
        '<div class="task-caption"><span class="task-id">' + task.id + "</span>" +
        '<span class="task-name">' + task.name + "</span></div>";
      frag.appendChild(tile);
    });
    panel.innerHTML = "";
    panel.appendChild(frag);
  }

  Object.keys(TASKS).forEach(function (key) {
    var panel = document.querySelector('[data-bench-panel="' + key + '"]');
    if (panel) renderTasks(panel, TASKS[key]);
  });

  /* Benchmark tab switching (task grids) */
  var benchTabs = document.querySelectorAll(".bench-tab[data-bench]");
  benchTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.getAttribute("data-bench");
      benchTabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      document.querySelectorAll("[data-bench-panel]").forEach(function (p) {
        p.classList.toggle("is-hidden", p.getAttribute("data-bench-panel") !== key);
      });
    });
  });

  /* Leaderboard data */
  var LEADERBOARD = {
    "rt3-sim": [
      { policy: "RDT-1B", type: "VLA", score: 71.4 },
      { policy: "Pi0", type: "VLA", score: 68.2 },
      { policy: "OpenVLA", type: "VLA", score: 61.9 },
      { policy: "Diffusion Policy", type: "IL", score: 57.3 },
      { policy: "Octo-Base", type: "VLA", score: 52.8 },
      { policy: "ACT", type: "IL", score: 48.6 }
    ],
    "rt3-real": [
      { policy: "RDT-1B", type: "VLA", score: 63.0 },
      { policy: "Pi0", type: "VLA", score: 59.5 },
      { policy: "Diffusion Policy", type: "IL", score: 51.1 },
      { policy: "OpenVLA", type: "VLA", score: 47.8 },
      { policy: "ACT", type: "IL", score: 42.2 }
    ],
    "rt2-sim": [
      { policy: "RDT-1B", type: "VLA", score: 74.9 },
      { policy: "Diffusion Policy", type: "IL", score: 66.1 },
      { policy: "Pi0", type: "VLA", score: 64.7 },
      { policy: "Octo-Base", type: "VLA", score: 55.0 },
      { policy: "ACT", type: "IL", score: 50.4 }
    ]
  };

  var lbBody = document.getElementById("leaderboard-body");
  var currentLb = "rt3-sim";

  function renderLeaderboard(key) {
    if (!lbBody) return;
    var rows = LEADERBOARD[key].slice().sort(function (a, b) {
      return b.score - a.score;
    });
    var max = rows.length ? rows[0].score : 100;
    lbBody.innerHTML = rows.map(function (r, i) {
      var medal = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
      var pct = Math.round((r.score / max) * 100);
      return (
        "<tr>" +
        '<td class="lb-rank"><span class="lb-rank-badge ' + medal + '">' + (i + 1) + "</span></td>" +
        '<td><span class="lb-policy">' + r.policy + "</span></td>" +
        '<td><span class="lb-type">' + r.type + "</span></td>" +
        '<td class="lb-num"><span class="lb-score">' +
        '<span class="lb-bar"><span style="width:' + pct + '%"></span></span>' +
        '<span class="lb-score-val">' + r.score.toFixed(1) + "%</span></span></td>" +
        "</tr>"
      );
    }).join("");
  }

  renderLeaderboard(currentLb);

  var lbTabs = document.querySelectorAll(".bench-tab[data-lb]");
  lbTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      currentLb = tab.getAttribute("data-lb");
      lbTabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      renderLeaderboard(currentLb);
    });
  });

  /* Export leaderboard as LaTeX table */
  var exportBtn = document.getElementById("export-tex");
  if (exportBtn) {
    exportBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var rows = LEADERBOARD[currentLb].slice().sort(function (a, b) {
        return b.score - a.score;
      });
      var tex =
        "\\begin{tabular}{cllr}\n\\toprule\n# & Policy & Type & Success (\\%) \\\\\n\\midrule\n" +
        rows.map(function (r, i) {
          return (i + 1) + " & " + r.policy + " & " + r.type + " & " + r.score.toFixed(1);
        }).join(" \\\\\n") +
        " \\\\\n\\bottomrule\n\\end{tabular}";
      navigator.clipboard.writeText(tex).then(function () {
        var orig = exportBtn.textContent;
        exportBtn.textContent = "TeX Copied!";
        exportBtn.classList.add("copied");
        setTimeout(function () {
          exportBtn.textContent = orig;
          exportBtn.classList.remove("copied");
        }, 2000);
      });
    });
  }

  /* Animated stat counters */
  var counters = document.querySelectorAll(".stat-num[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var animate = function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var suffix = /\+/.test(el.textContent) ? "+" : "";
      var start = null;
      var dur = 1100;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { io.observe(c); });
  }
})();
