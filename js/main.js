(function () {
  /* TOC scroll-spy */
  var tocLinks = document.querySelectorAll(".toc-list a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var linkFor = {};
    var activate = function (a) {
      tocLinks.forEach(function (l) { l.classList.remove("is-active"); });
      if (a) a.classList.add("is-active");
    };
    tocLinks.forEach(function (a) {
      linkFor[a.getAttribute("href").slice(1)] = a;
      a.addEventListener("click", function () { activate(a); });
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) activate(linkFor[entry.target.id]);
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(linkFor).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
    // Bottom of page: force the last section active, since it may
    // never reach the observer band when the page is short.
    var lastId = Object.keys(linkFor).pop();
    window.addEventListener("scroll", function () {
      var nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
      if (nearBottom) activate(linkFor[lastId]);
    }, { passive: true });
  }

  /* Copy BibTeX */
  var btn = document.getElementById("copy-citation");
  if (btn) {
    btn.addEventListener("click", function () {
      var block = document.querySelector("#citation-bibtex code");
      if (!block) return;
      var label = btn.textContent;
      navigator.clipboard.writeText(block.textContent.trim()).then(function () {
        btn.textContent = "Copied";
        btn.classList.add("copied");
        setTimeout(function () {
          btn.textContent = label;
          btn.classList.remove("copied");
        }, 1600);
      });
    });
  }

  /* Policy marquee */
  var POLICIES = [
    { name: "A1", logo: "A1.png" },
    { name: "AHA-WAM", logo: "AHA-WAM.png" },
    { name: "ABot-M0", logo: "ABot-M0.png" },
    { name: "ACT", logo: "ACT.png" },
    { name: "Being-H0.5", logo: "being-beyond.png" },
    { name: "Dexbotic-DM0", logo: "DM0.png" },
    { name: "Dexora-1B", logo: "Dexora-1B.png" },
    { name: "Diffusion Policy", logo: "columbia.png" },
    { name: "DreamZero", logo: "GROOT-N1.7.png" },
    { name: "EventVLA", logo: "EventVLA.png" },
    { name: "FastWAM", logo: "Fast-WAM.png" },
    { name: "G0.5", logo: "GalaxeaVLA.png" },
    { name: "G0", logo: "GalaxeaVLA.png" },
    { name: "GigaWorld-Policy", logo: "GigaWorld-Policy-0.png" },
    { name: "GO-1", logo: "GO-1.png" },
    { name: "GR00T-N1.7", logo: "GROOT-N1.7.png" },
    { name: "H-RDT", logo: "H-RDT.png" },
    { name: "Hy-Embodied-0.5-VLA", logo: "Hy-Embodied-0.5-VLA.png" },
    { name: "InternVLA-A1", logo: "InternVLA-A1.png" },
    { name: "InternVLA-A1.5", logo: "InternVLA-A1.5.png" },
    { name: "LDA-1B", logo: "LDA-1B.png" },
    { name: "LingBot-VA", logo: "lingbot.png" },
    { name: "LingBot-VLA", logo: "LingBot-VLA.png" },
    { name: "Mem-0", logo: "hku.png" },
    { name: "MolmoAct2", logo: "MolmoAct2.png" },
    { name: "OpenVLA-OFT", logo: "OpenVLA-OFT.png" },
    { name: "π0", logo: "Pi-0.png" },
    { name: "π0.5", logo: "Pi-05.png" },
    { name: "VLAct", logo: "VLAct.png" },
    { name: "RDT-1B", logo: "RDT.png" },
    { name: "RISE", logo: null },
    { name: "SmolVLA", logo: "SmolVLA.png" },
    { name: "Spatial Forcing", logo: "Spatial_Forcing.png" },
    { name: "Spirit v1.5", logo: "Spirit_v1.5.png" },
    { name: "StarVLA", logo: "StarVLA.png" },
    { name: "TinyVLA", logo: "TinyVLA.png" },
    { name: "X-VLA", logo: "X-VLA.png" },
    { name: "X-WAM", logo: "X-WAM.png" },
    { name: "Xiaomi-Robotics-0", logo: "Xiaomi-Robotics-0.png" },
    { name: "Xiaomi-Robotics-1", logo: "Xiaomi-Robotics-1.png" },
    { name: "UniT", logo: "XPeng.png" },
    { name: "RxBrain", logo: "rldx.png" }
  ];

  var REPO = "https://github.com/XPolicyLab/XPolicyLab/tree/main/policy/";
  var LOGO_BASE = "assets/logos/";
  var SPEED = 30; // px/sec

  function policySlug(name) {
    return name.replace(/π/g, "Pi_").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }

  var stage = document.getElementById("marquee-stage");
  if (!stage) return;

  var nRows = 4;
  var perRow = Math.ceil(POLICIES.length / nRows);

  for (var r = 0; r < nRows; r++) {
    var rowPolicies = POLICIES.slice(r * perRow, (r + 1) * perRow);
    if (!rowPolicies.length) continue;

    var row = document.createElement("div");
    row.className = "marquee-row";

    var track = document.createElement("div");
    track.className = "marquee-track";

    var strip = document.createElement("div");
    strip.style.display = "inline-flex";
    strip.style.alignItems = "center";

    rowPolicies.forEach(function (p) {
      var a = document.createElement("a");
      a.className = "marquee-item";
      a.href = REPO + policySlug(p.name);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      if (p.logo) {
        var img = document.createElement("img");
        img.src = LOGO_BASE + p.logo;
        img.alt = "";
        img.loading = "lazy";
        a.appendChild(img);
      }
      var span = document.createElement("span");
      span.textContent = p.name;
      a.appendChild(span);
      strip.appendChild(a);
    });

    track.appendChild(strip);
    row.appendChild(track);
    stage.appendChild(row);

    (function (track, strip) {
      requestAnimationFrame(function () {
        var stripW = strip.offsetWidth || 800;
        var vw = stage.clientWidth || 800;
        var copies = Math.max(2, Math.ceil(vw / Math.max(stripW, 1)) + 1);
        for (var c = 1; c < copies; c++) {
          track.appendChild(strip.cloneNode(true));
        }
        var dur = Math.max(20, stripW / SPEED);
        track.style.setProperty("--dur", dur.toFixed(2) + "s");
        track.style.setProperty("--shift", stripW + "px");
      });
    })(track, strip);
  }
})();
