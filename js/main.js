(() => {
  const S = window.SITE;
  const body = document.body;
  const page = body.dataset.page;
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => Math.round(n).toLocaleString("en-US");

  /* ---------- header, footer, depth gauge ---------- */
  const NAV = [
    { id: "home", label: "Home", href: "index.html", depth: 0 },
    { id: "works", label: "Works", href: "works.html", depth: 300 },
    { id: "about", label: "About me", href: "about.html", depth: 1000 },
    { id: "contact", label: "Contact", href: "contact.html", depth: 4000 }
  ];

  function chrome() {
    const header = $("#site-header");
    if (header) {
      const active = page === "project" ? "works" : page;
      header.className = "site-header";
      header.innerHTML = `
        <a class="brand" href="index.html" aria-label="${esc(S.name)} — home">
          <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="3" fill="currentColor"/><circle cx="16" cy="16" r="8.5" fill="none" stroke="currentColor" stroke-opacity=".6"/><circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-opacity=".3"/></svg>
          <span>${esc(S.name)}</span>
        </a>
        <button class="nav-toggle" aria-expanded="false" aria-controls="nav"><span class="sr-only">Toggle navigation</span><i></i><i></i></button>
        <nav id="nav" class="nav" aria-label="Main">
          ${NAV.map((n) => `<a href="${n.href}" ${n.id === active ? 'aria-current="page"' : ""}><span class="nav-label">${n.label}</span><span class="nav-depth">${fmt(n.depth)} m</span></a>`).join("")}
        </nav>`;
      const toggle = $(".nav-toggle", header);
      toggle.addEventListener("click", () => {
        const open = header.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open);
      });
    }

    const footer = $("#site-footer");
    if (footer) {
      footer.className = "site-footer";
      footer.innerHTML = `
        <div class="wrap footer-inner">
          <p>© ${new Date().getFullYear()} | ${esc(S.name)}.</p>
          <p><a href="${esc(S.github)}" target="_blank" rel="noopener">GitHub</a></p>
        </div>`;
    }

    const gauge = document.createElement("aside");
    gauge.className = "gauge";
    gauge.setAttribute("aria-hidden", "true");
    gauge.innerHTML = `<div class="gauge-track"><i class="gauge-dot"></i></div><div class="gauge-read"><b id="gaugeDepth">0 m</b><span id="gaugeZone">Sunlight zone</span></div>`;
    body.appendChild(gauge);
  }

  function zoneName(m) {
    if (m < 200) return "Sunlight zone";
    if (m < 1000) return "Twilight zone";
    if (m < 4000) return "Midnight zone";
    if (m < 6000) return "Abyssal zone";
    return "Hadal zone";
  }

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const from = parseFloat(body.dataset.depthFrom || 0), to = parseFloat(body.dataset.depthTo || 300);
    const m = from + p * (to - from);
    const d = $("#gaugeDepth"), z = $("#gaugeZone"), dot = $(".gauge-dot");
    if (d) d.textContent = fmt(m) + " m";
    if (z) z.textContent = zoneName(m);
    if (dot) dot.style.top = p * 100 + "%";
    if (window.__ocean) { window.__ocean.scroll = window.scrollY; window.__ocean.progress = p; }
  }

  /* ---------- optional background footage ---------- */
  function video() {
    const v = $("#seaVideo");
    if (!v) return;
    v.addEventListener("canplay", () => {
      document.documentElement.classList.add("has-video");
      if (window.__ocean) window.__ocean.hasVideo = true;
      v.play().catch(() => {});
    }, { once: true });
  }

  /* ---------- project helpers ---------- */
  const repoHref = (p) => p.repo || S.github;
  const repoLabel = (p) => (p.repo ? "Source code" : "See on GitHub");

  function actions(p, opts = {}) {
    const out = [];
    if (p.live) out.push(`<a class="btn btn-primary" href="${esc(p.live)}" target="_blank" rel="noopener">Live site</a>`);
    out.push(`<a class="btn" href="${esc(repoHref(p))}" target="_blank" rel="noopener">${repoLabel(p)}</a>`);
    if (p.caseStudy && !opts.noCase) out.push(`<a class="btn btn-quiet" href="project.html?p=${encodeURIComponent(p.slug)}">View case study</a>`);
    return out.join("");
  }
  const tags = (p) => `<ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

  function worksList() {
    const host = $("#worksList");
    if (!host) return;
    host.innerHTML = S.projects.map((p, i) => `
      <article class="work">
        <div class="work-num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</div>
        <div class="work-main">
          <h2 class="work-title">${p.caseStudy ? `<a href="project.html?p=${encodeURIComponent(p.slug)}">${esc(p.title)}</a>` : esc(p.title)}</h2>
          <p class="work-type">${esc(p.type)}${p.year ? " · " + esc(p.year) : ""}</p>
          <p class="work-desc">${esc(p.summary)}</p>
          ${tags(p)}
        </div>
        <div class="work-actions">${actions(p)}</div>
      </article>`).join("");
  }

  function featured() {
    const host = $("#featured");
    if (!host) return;
    const p = S.projects.find((x) => x.live) || S.projects[0];
    host.innerHTML = `
      <div class="feature">
        <div>
          <p class="mono-label">Latest project</p>
          <h2>${esc(p.title)}</h2>
          <p class="feature-desc">${esc(p.summary)}</p>
          ${tags(p)}
        </div>
        <div class="feature-actions">${actions(p)}</div>
      </div>`;
  }

  /* ---------- case study page ---------- */
  function projectPage() {
    const host = $("#project");
    if (!host) return;
    const slug = new URLSearchParams(location.search).get("p");
    const idx = S.projects.findIndex((x) => x.slug === slug);
    const p = S.projects[idx];
    if (!p) {
      host.innerHTML = `<div class="wrap page-hero"><h1>Project not found</h1><p class="lede">That project isn't on this site. <a href="works.html">Back to works</a>.</p></div>`;
      return;
    }
    document.title = `${p.title} — ${S.name}`;
    const list = S.projects.filter((x) => x.caseStudy);
    const li = list.findIndex((x) => x.slug === p.slug);
    const prev = list[(li - 1 + list.length) % list.length], next = list[(li + 1) % list.length];

    const sections = [{ id: "overview", label: "Overview", zone: "Surface" }];
    if (p.problem) sections.push({ id: "problem", label: "The problem", zone: "Shallows" });
    if (p.built) sections.push({ id: "built", label: "What I built", zone: "Midwater" });
    if (p.stack) sections.push({ id: "stack", label: "Under the hood", zone: "Trench" });
    if (p.learned) sections.push({ id: "learned", label: "What I learned", zone: "Seafloor" });

    host.innerHTML = `
      <div class="wrap cs">
        <nav class="rail" aria-label="Case study sections">
          <ol>${sections.map((s) => `<li><a href="#${s.id}"><i></i><span>${s.label}</span></a></li>`).join("")}</ol>
        </nav>
        <div class="cs-body">
          <section id="overview" class="cs-hero">
            <a class="back" href="works.html">Back to works</a>
            <p class="mono-label">${esc(p.type)}${p.year ? " · " + esc(p.year) : ""}</p>
            <h1>${esc(p.title)}</h1>
            <p class="lede">${esc(p.summary)}</p>
            ${tags(p)}
            <div class="cs-actions">${actions(p, { noCase: true })}</div>
            ${p.image ? `<figure class="shot"><img src="${esc(p.image)}" alt="${esc(p.title)} screenshot" loading="lazy"></figure>` : ""}
          </section>
          ${p.problem ? `<section id="problem" class="cs-section"><h2>The problem</h2><p>${esc(p.problem)}</p></section>` : ""}
          ${p.built ? `<section id="built" class="cs-section"><h2>What I built</h2><ul class="built">${p.built.map((b) => `<li>${esc(b)}</li>`).join("")}</ul></section>` : ""}
          ${p.stack ? `<section id="stack" class="cs-section"><h2>Under the hood</h2><dl class="stack">${p.stack.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.items)}</dd></div>`).join("")}</dl></section>` : ""}
          ${p.learned ? `<section id="learned" class="cs-section"><h2>What I learned</h2><p>${esc(p.learned)}</p></section>` : ""}
          <nav class="pager" aria-label="More projects">
            <a href="project.html?p=${encodeURIComponent(prev.slug)}"><span>Previous project</span><b>${esc(prev.title)}</b></a>
            <a class="pager-next" href="project.html?p=${encodeURIComponent(next.slug)}"><span>Next project</span><b>${esc(next.title)}</b></a>
          </nav>
          <section class="cta">
            <h2>Let's work together</h2>
            <p>Have a project in mind? I'd love to help build it.</p>
            <a class="btn btn-primary" href="contact.html">Hire me</a>
          </section>
        </div>
      </div>`;

    // scroll-spy for the rail
    const links = [...host.querySelectorAll(".rail a")];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el); });
  }

  /* ---------- contact ---------- */
  function contact() {
    const mail = $("#contactEmail");
    if (mail) { mail.textContent = S.email; mail.href = "mailto:" + S.email; }
    const gh = $("#contactGithub");
    if (gh) { gh.textContent = S.github.replace("https://", ""); gh.href = S.github; }
    const loc = $("#contactLocation");
    if (loc) loc.textContent = S.location;
    const form = $("#contactForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const f = new FormData(form);
        const subject = encodeURIComponent(`Portfolio message from ${f.get("name")}`);
        const text = encodeURIComponent(`${f.get("message")}\n\n— ${f.get("name")} (${f.get("email")})`);
        window.location.href = `mailto:${S.email}?subject=${subject}&body=${text}`;
        const note = $("#formNote");
        if (note) note.textContent = "Your email app should open with the message ready to send.";
      });
    }
  }

  chrome();
  video();
  worksList();
  featured();
  projectPage();
  contact();
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
})();
