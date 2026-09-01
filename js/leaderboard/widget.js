/* Modular Top-10 leaderboard widgets for XPolicyLab.
   Data is fetched live from RoboTwin-published JSON so the homepage
   stays in sync without a redeploy. Mount any empty node:

     <div data-xpl-lb="robotwin" data-top="10" data-refresh="300"></div>
     <div data-xpl-lb="robodojo" data-top="10" data-refresh="300"></div>
*/
(function (global) {
  var XPL = global.XPL = global.XPL || {};
  var LB = XPL.Leaderboard = XPL.Leaderboard || {};

  var INDEX_URL = "https://robotwin-platform.github.io/data/index.json";

  var BOARDS = {
    robotwin: {
      kind: "robotwin",
      title: "RoboTwin 2.0",
      kicker: "Leaderboard",
      logo: "assets/robotwin.png",
      dataUrl: "https://robotwin-platform.github.io/data/robotwin_leaderboard.json",
      pageUrl: "https://robotwin-platform.github.io/leaderboard",
      topN: 10
    },
    robodojo: {
      kind: "robodojo",
      title: "RoboDojo Sim",
      kicker: "Leaderboard",
      logo: "assets/robodojo.png",
      dataUrl: "https://robotwin-platform.github.io/data/robodojo_leaderboard.json",
      pageUrl: "https://robodojo-benchmark.com/LeaderBoard",
      topN: 10
    }
  };

  var RT_SHORT = { avg: "Average", hard: "Hard", easy: "Easy" };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function attr(el, name, fallback) {
    var raw = el.getAttribute(name);
    return raw == null || raw === "" ? fallback : raw;
  }

  function fetchJson(url) {
    return fetch(url, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    });
  }

  function heat(value) {
    var t = Math.max(0, Math.min(100, Number(value) || 0)) / 100;
    return "background:rgba(101,164,135," + (0.08 + 0.5 * t).toFixed(3) + ")";
  }

  function fmtPct(value, digits) {
    var n = Number(value);
    if (!isFinite(n)) return "—";
    if (digits != null) return n.toFixed(digits) + "%";
    return (Math.abs(n - Math.round(n)) < 1e-9 ? String(Math.round(n)) : n.toFixed(1)) + "%";
  }

  function fmtPair(pair) {
    if (!pair || pair.length < 2) return "—";
    return Number(pair[0]).toFixed(2) + "/" + Number(pair[1]).toFixed(2) + "%";
  }

  function paintShell(root, cls, inner) {
    root.innerHTML = '<article class="xpl-board ' + cls + '">' + inner + "</article>";
  }

  function paintLoading(root, cfg) {
    paintShell(root, "xpl-board--loading xpl-board--" + cfg.kind, headerHtml(cfg, {
      meta: "Syncing official Top " + cfg.topN + "…"
    }) + '<p class="xpl-board__status">Fetching live ranking…</p>');
  }

  function paintError(root, cfg, err) {
    paintShell(root, "xpl-board--error xpl-board--" + cfg.kind, headerHtml(cfg, {
      meta: "Live sync unavailable"
    }) + '<p class="xpl-board__status">Could not load <code>' + esc(cfg.dataUrl) + "</code>" +
      (err && err.message ? " (" + esc(err.message) + ")" : "") +
      '. <a href="' + esc(cfg.pageUrl) + '" target="_blank" rel="noopener noreferrer">Open the official board</a>.</p>');
  }

  function headerHtml(cfg, extra) {
    extra = extra || {};
    return '<header class="xpl-board__head">' +
      '<div class="xpl-board__brand">' +
        (cfg.logo ? '<img class="xpl-board__logo" src="' + esc(cfg.logo) + '" alt="">' : "") +
        "<div>" +
          '<p class="xpl-board__kicker">' + esc(cfg.kicker) + "</p>" +
          "<h3>" + esc(cfg.title) + "</h3>" +
          (extra.meta ? '<p class="xpl-board__meta">' + extra.meta + "</p>" : "") +
        "</div>" +
      "</div>" +
      '<div class="xpl-board__side">' +
        (extra.live || "") +
        '<a class="xpl-board__more" href="' + esc(cfg.pageUrl) + '" target="_blank" rel="noopener noreferrer">Full board <span aria-hidden="true">↗</span></a>' +
      "</div>" +
    "</header>";
  }

  function liveHtml(updated) {
    return '<span class="xpl-board__live" title="Fetched from robotwin-platform.github.io">' +
      '<span class="xpl-board__dot" aria-hidden="true"></span>' +
      "Live" +
      (updated ? ' · <time datetime="' + esc(updated) + '">' + esc(updated) + "</time>" : "") +
      "</span>";
  }

  function chip(label, pressed, attrs) {
    return '<button type="button" class="xpl-board__chip' + (pressed ? " is-active" : "") +
      '" aria-pressed="' + (pressed ? "true" : "false") + '" ' + attrs + ">" + esc(label) + "</button>";
  }

  function mountRoboTwin(root, cfg) {
    var sortKey = null;
    var data = null;

    function avgMean(entry) { return (entry.easy_mean + entry.hard_mean) / 2; }

    function scoreOf(entry, key) {
      if (key === "easy") return entry.easy_mean;
      if (key === "hard") return entry.hard_mean;
      return avgMean(entry);
    }

    function rankingOf(key) {
      var rankings = (data.board && data.board.rankings) || [];
      for (var i = 0; i < rankings.length; i++) {
        if (rankings[i].id === key) return rankings[i];
      }
      return { id: key, label: key, eval: key };
    }

    function paint() {
      var board = data.board || {};
      var entries = data.entries || [];
      var rankings = board.rankings || [];
      var settings = {};
      (board.settings || []).forEach(function (s) { settings[s.id] = s; });
      var defaultContributor = board.default_contributor || "—";
      var current = rankingOf(sortKey);

      var sorted = entries.slice().sort(function (a, b) {
        var alt = sortKey === "easy" ? "hard" : "easy";
        return (scoreOf(b, sortKey) - scoreOf(a, sortKey)) ||
          (scoreOf(b, alt) - scoreOf(a, alt));
      }).slice(0, cfg.topN);

      var chips = rankings.map(function (r) {
        return chip(RT_SHORT[r.id] || r.label, r.id === sortKey, 'data-rt-sort="' + esc(r.id) + '"');
      }).join("");

      var rows = sorted.map(function (entry, i) {
        var rank = i + 1;
        var setting = settings[entry.setting] || {};
        var digits = entry.setting === "sft" ? 2 : 1;
        var avg = avgMean(entry);
        var badgeClass = entry.setting === "sft" ? "xpl-board__badge xpl-board__badge--sft" : "xpl-board__badge xpl-board__badge--co";
        return "<tr>" +
          '<td class="xpl-board__rank' + (rank <= 3 ? " is-top" : "") + '">#' + rank + "</td>" +
          '<td class="xpl-board__method">' + esc(entry.name) + "</td>" +
          '<td class="xpl-board__who">' + esc(entry.contributor || defaultContributor) + "</td>" +
          '<td class="xpl-board__score is-avg' + (sortKey === "avg" ? " is-sorted" : "") + '" style="' + (sortKey === "avg" ? heat(avg) : "") + '">' + fmtPct(avg, digits) + "</td>" +
          '<td class="xpl-board__score is-hard' + (sortKey === "hard" ? " is-sorted" : "") + '" style="' + (sortKey === "hard" ? heat(entry.hard_mean) : "") + '">' + fmtPct(entry.hard_mean, digits) + "</td>" +
          '<td class="xpl-board__score is-easy' + (sortKey === "easy" ? " is-sorted" : "") + '" style="' + (sortKey === "easy" ? heat(entry.easy_mean) : "") + '">' + fmtPct(entry.easy_mean, digits) + "</td>" +
          '<td><span class="' + badgeClass + '">' + esc(setting.label || (entry.setting === "sft" ? "Single" : "Co-train")) + "</span></td>" +
        "</tr>";
      }).join("");

      paintShell(root, "xpl-board--" + cfg.kind, headerHtml(cfg, {
        meta: "Top " + cfg.topN + " · Ranked by " + esc(current.label) + " ↓",
        live: liveHtml(board.updated)
      }) +
        '<div class="xpl-board__toolbar">' +
          '<div class="xpl-board__chips" role="group" aria-label="Ranking setting">' + chips + "</div>" +
        "</div>" +
        '<div class="xpl-board__scroll">' +
          '<table class="xpl-board__table">' +
            "<thead><tr>" +
              "<th>Rank</th><th>Method</th><th>Contributor</th>" +
              '<th' + (sortKey === "avg" ? ' class="is-sorted"' : "") + '><button type="button" data-rt-sort="avg">Average</button></th>' +
              '<th' + (sortKey === "hard" ? ' class="is-sorted"' : "") + '><button type="button" data-rt-sort="hard">Hard</button></th>' +
              '<th' + (sortKey === "easy" ? ' class="is-sorted"' : "") + '><button type="button" data-rt-sort="easy">Easy</button></th>' +
              "<th>Track</th>" +
            "</tr></thead>" +
            "<tbody>" + (rows || '<tr><td colspan="7" class="xpl-board__empty">No entries yet.</td></tr>') + "</tbody>" +
          "</table>" +
        "</div>" +
        '<a class="xpl-board__foot" href="' + esc(cfg.pageUrl) + '" target="_blank" rel="noopener noreferrer">Show full RoboTwin leaderboard</a>'
      );
    }

    function load() {
      return fetchJson(cfg.dataUrl).then(function (json) {
        data = json;
        if (!sortKey) sortKey = (json.board && json.board.default_ranking) || "avg";
        paint();
      }).catch(function (err) {
        console.error("RoboTwin leaderboard", err);
        if (!data) paintError(root, cfg, err);
      });
    }

    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-rt-sort]");
      if (!btn || !data) return;
      sortKey = btn.getAttribute("data-rt-sort");
      paint();
    });

    paintLoading(root, cfg);
    load();
    if (cfg.refresh > 0) setInterval(load, cfg.refresh * 1000);
  }

  function mountRoboDojo(root, cfg) {
    var dim = null;
    var metricId = null;
    var data = null;

    function paint() {
      var board = data.board || {};
      var entries = data.entries || [];
      var dims = board.dimensions || [];
      var metrics = board.metrics || [];
      var metric = null;
      var i;
      for (i = 0; i < metrics.length; i++) {
        if (metrics[i].id === metricId) metric = metrics[i];
      }
      if (!metric) metric = metrics[0] || { id: "score", index: 0, label: "Score" };

      var dimLabel = dim;
      for (i = 0; i < dims.length; i++) {
        if (dims[i].id === dim) dimLabel = dims[i].label;
      }

      var sorted = entries.slice().sort(function (a, b) {
        var ap = a[dim] || [0, 0];
        var bp = b[dim] || [0, 0];
        var alt = 1 - metric.index;
        return (bp[metric.index] - ap[metric.index]) ||
          (bp[alt] - ap[alt]) ||
          String(a.model).localeCompare(String(b.model));
      }).slice(0, cfg.topN);

      var dimChips = dims.map(function (d) {
        return chip(d.label, d.id === dim, 'data-dj-dim="' + esc(d.id) + '"');
      }).join("");
      var metricChips = metrics.map(function (m) {
        return chip(m.label, m.id === metric.id, 'data-dj-metric="' + esc(m.id) + '"');
      }).join("");

      var heads = dims.map(function (d) {
        return '<th class="' + (d.id === dim ? "is-sorted" : "") + '">' +
          '<button type="button" data-dj-dim="' + esc(d.id) + '">' + esc(d.label) +
          (d.id === dim ? " ↓" : "") + "</button></th>";
      }).join("");

      var rows = sorted.map(function (entry, idx) {
        var rank = idx + 1;
        var cells = dims.map(function (d) {
          var cls = "xpl-board__metric" + (d.id === dim ? " is-sorted" : "") +
            (d.id === dim && rank === 1 ? " is-leader" : "");
          return '<td class="' + cls + '">' + fmtPair(entry[d.id]) + "</td>";
        }).join("");
        return '<tr class="' + (rank === 1 ? "is-leader-row" : "") + '">' +
          '<td class="xpl-board__rank' + (rank <= 3 ? " is-top" : "") + '">#' + rank + "</td>" +
          '<td class="xpl-board__method">' + esc(entry.model) + "</td>" +
          '<td class="xpl-board__who">' + esc(entry.team) + "</td>" +
          cells +
        "</tr>";
      }).join("");

      paintShell(root, "xpl-board--" + cfg.kind, headerHtml(cfg, {
        meta: "Top " + cfg.topN + " · Ranked by " + esc(dimLabel) + " · " + esc(metric.label) + " ↓",
        live: liveHtml(board.updated)
      }) +
        '<div class="xpl-board__toolbar">' +
          '<div class="xpl-board__sort">' +
            '<span class="xpl-board__sort-label">Dimension</span>' +
            '<div class="xpl-board__chips" role="group" aria-label="Sort by dimension">' + dimChips + "</div>" +
          "</div>" +
          '<div class="xpl-board__sort">' +
            '<span class="xpl-board__sort-label">Rank by</span>' +
            '<div class="xpl-board__chips" role="group" aria-label="Sort by metric">' + metricChips + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="xpl-board__scroll">' +
          '<table class="xpl-board__table xpl-board__table--wide">' +
            "<thead><tr><th>Rank</th><th>Model</th><th>Contributor</th>" + heads + "</tr></thead>" +
            "<tbody>" + (rows || '<tr><td colspan="99" class="xpl-board__empty">No entries yet.</td></tr>') + "</tbody>" +
          "</table>" +
        "</div>" +
        '<a class="xpl-board__foot" href="' + esc(cfg.pageUrl) + '" target="_blank" rel="noopener noreferrer">Show full RoboDojo leaderboard</a>'
      );
    }

    function load() {
      return fetchJson(cfg.dataUrl).then(function (json) {
        data = json;
        var board = json.board || {};
        var metrics = board.metrics || [];
        if (!dim) dim = board.default_dimension || (board.dimensions && board.dimensions[0] && board.dimensions[0].id);
        if (!metricId) metricId = board.default_metric || (metrics[0] && metrics[0].id);
        paint();
      }).catch(function (err) {
        console.error("RoboDojo leaderboard", err);
        if (!data) paintError(root, cfg, err);
      });
    }

    root.addEventListener("click", function (e) {
      var dimBtn = e.target.closest("[data-dj-dim]");
      var metricBtn = e.target.closest("[data-dj-metric]");
      if (!data) return;
      if (dimBtn) {
        dim = dimBtn.getAttribute("data-dj-dim");
        paint();
      } else if (metricBtn) {
        metricId = metricBtn.getAttribute("data-dj-metric");
        paint();
      }
    });

    paintLoading(root, cfg);
    load();
    if (cfg.refresh > 0) setInterval(load, cfg.refresh * 1000);
  }

  function configFrom(el) {
    var id = el.getAttribute("data-xpl-lb");
    var base = BOARDS[id];
    if (!base) return null;
    var cfg = {
      id: id,
      kind: base.kind,
      title: attr(el, "data-title", base.title),
      kicker: attr(el, "data-kicker", base.kicker),
      logo: attr(el, "data-logo", base.logo),
      dataUrl: attr(el, "data-url", base.dataUrl),
      pageUrl: attr(el, "data-page", base.pageUrl),
      topN: parseInt(attr(el, "data-top", String(base.topN)), 10) || 10,
      refresh: parseInt(attr(el, "data-refresh", "0"), 10) || 0
    };
    return cfg;
  }

  LB.BOARDS = BOARDS;
  LB.INDEX_URL = INDEX_URL;

  LB.mount = function (el, options) {
    if (!el) return null;
    var cfg = configFrom(el);
    if (options) {
      Object.keys(options).forEach(function (key) {
        if (options[key] != null) cfg[key] = options[key];
      });
    }
    if (!cfg) {
      console.warn("Unknown leaderboard mount", el.getAttribute("data-xpl-lb"));
      return null;
    }
    if (cfg.kind === "robodojo") mountRoboDojo(el, cfg);
    else mountRoboTwin(el, cfg);
    return cfg;
  };

  LB.mountAll = function (scope) {
    var root = scope || document;
    var nodes = root.querySelectorAll("[data-xpl-lb]");
    var mounted = [];
    for (var i = 0; i < nodes.length; i++) mounted.push(LB.mount(nodes[i]));
    return mounted;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { LB.mountAll(); });
  } else {
    LB.mountAll();
  }
})(window);
