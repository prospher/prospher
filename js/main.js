/**
 * prospher — lógica da página (menu, animações, modal, renderização
 * dos textos de js/content.js). Não contém textos — edite-os em content.js.
 */
(function () {
  "use strict";

  const C = SITE_CONTENT;

  const ICONS = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>',
    network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
    layout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="7"></rect><rect x="3" y="14" width="9" height="7"></rect><rect x="16" y="14" width="5" height="7"></rect></svg>',
    message: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><polyline points="8 10 11 13 16 8"></polyline></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  };

  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function whatsappUrl(messageKey) {
    const msg = C.whatsapp.messages[messageKey] || C.whatsapp.messages.geral;
    return "https://wa.me/" + C.whatsapp.number + "?text=" + encodeURIComponent(msg);
  }

  /* ---------------------------------------------------------
     Head / meta
     --------------------------------------------------------- */
  function renderMeta() {
    document.title = C.meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", C.meta.description);
  }

  /* ---------------------------------------------------------
     Nav (desktop + mobile share the same link data)
     --------------------------------------------------------- */
  function renderNav() {
    const desktop = document.getElementById("pr-nav-links");
    const mobile = document.getElementById("pr-mobile-links");
    C.nav.links.forEach((link) => {
      const a1 = el("a", null, link.label);
      a1.href = link.href;
      desktop.appendChild(a1);

      const a2 = el("a", null, link.label);
      a2.href = link.href;
      mobile.appendChild(a2);
    });

    document.querySelectorAll("[data-nav-cta]").forEach((btn) => {
      btn.textContent = C.nav.ctaLabel;
      btn.href = whatsappUrl("geral");
    });

    const mobileCta = el("a", "pr-btn", C.nav.ctaLabel);
    mobileCta.href = whatsappUrl("geral");
    mobileCta.target = "_blank";
    mobileCta.rel = "noopener";
    mobile.appendChild(mobileCta);
  }

  /* ---------------------------------------------------------
     Hero
     --------------------------------------------------------- */
  function renderHero() {
    document.getElementById("pr-hero-kicker").textContent = C.hero.kicker;
    document.getElementById("pr-hero-title").textContent = C.hero.title;
    document.getElementById("pr-hero-subtitle").textContent = C.hero.subtitle;

    const cta = document.getElementById("pr-hero-cta");
    cta.textContent = C.hero.ctaLabel;
    cta.href = whatsappUrl("geral");

    const badges = document.getElementById("pr-hero-badges");
    C.hero.badges.forEach((label) => {
      const span = el("span", "pr-hero-badge", ICONS.check + label);
      badges.appendChild(span);
    });

    if (C.hero.variant === "conexao") {
      renderHeroConexao();
    } else {
      renderHeroChat();
    }
  }

  function renderHeroChat() {
    document.getElementById("pr-hero-conexao").hidden = true;
    const wrap = document.getElementById("pr-hero-conversa");
    wrap.hidden = false;
    document.getElementById("pr-chat-label").textContent = C.hero.chat.label;
    document.getElementById("pr-chat-status-label").textContent = C.hero.chat.statusLabel;
    const body = document.getElementById("pr-chat-body");
    const delays = [0.3, 1.1, 1.9, 2.7, 3.5, 4.3];
    C.hero.chat.messages.forEach((msg, i) => {
      const bubble = el("div", "pr-chat-bubble pr-chat-bubble--" + msg.from, msg.text);
      bubble.style.animationDelay = (delays[i] !== undefined ? delays[i] : i) + "s";
      body.appendChild(bubble);
    });
  }

  function renderHeroConexao() {
    document.getElementById("pr-hero-conversa").hidden = true;
    const wrap = document.getElementById("pr-hero-conexao");
    wrap.hidden = false;
    const cx = C.hero.conexao;
    document.getElementById("pr-connect-kicker").textContent = cx.kicker;
    document.getElementById("pr-connect-caption").textContent = cx.caption;

    const left = document.getElementById("pr-connect-left");
    cx.left.forEach((label, i) => {
      const span = el("span", "pr-connect-chip pr-connect-chip--outline", label);
      span.style.animationDelay = i * 0.15 + "s";
      left.appendChild(span);
    });

    const right = document.getElementById("pr-connect-right");
    cx.right.forEach((label, i) => {
      const isLast = i === cx.right.length - 1;
      const span = el("span", "pr-connect-chip " + (isLast ? "pr-connect-chip--solid" : "pr-connect-chip--fill"), label);
      span.style.animationDelay = 0.45 + i * 0.15 + "s";
      right.appendChild(span);
    });
  }

  /* ---------------------------------------------------------
     Problema
     --------------------------------------------------------- */
  function renderProblema() {
    document.getElementById("pr-problema-kicker").textContent = C.problema.kicker;
    document.getElementById("pr-problema-title").textContent = C.problema.title;
    const grid = document.getElementById("pr-problema-grid");
    C.problema.cards.forEach((card) => {
      const div = el(
        "div",
        "pr-problem-card",
        (ICONS[card.icon] || "") +
          "<h3>" + escapeHtml(card.title) + "</h3>" +
          "<p>" + escapeHtml(card.text) + "</p>"
      );
      div.setAttribute("data-reveal", "");
      grid.appendChild(div);
    });
  }

  /* ---------------------------------------------------------
     Solução
     --------------------------------------------------------- */
  function renderSolucao() {
    document.getElementById("pr-solucao-kicker").textContent = C.solucao.kicker;
    document.getElementById("pr-solucao-title").textContent = C.solucao.title;
    document.getElementById("pr-solucao-subtitle").textContent = C.solucao.subtitle;

    const cta = document.getElementById("pr-solucao-cta");
    cta.textContent = C.solucao.ctaLabel;
    cta.href = whatsappUrl(C.solucao.ctaWhatsappMessage);

    const journey = document.getElementById("pr-journey");
    C.solucao.steps.forEach((step, i) => {
      const div = el(
        "div",
        "pr-journey-step",
        '<span class="pr-journey-dot">' + String(i + 1).padStart(2, "0") + "</span>" +
          "<h3>" + escapeHtml(step.title) + "</h3>" +
          "<p>" + escapeHtml(step.text) + "</p>"
      );
      journey.appendChild(div);
    });
  }

  /* ---------------------------------------------------------
     Recebe
     --------------------------------------------------------- */
  function renderRecebe() {
    document.getElementById("pr-recebe-kicker").textContent = C.recebe.kicker;
    document.getElementById("pr-recebe-title").textContent = C.recebe.title;
    const grid = document.getElementById("pr-pipe");
    C.recebe.stages.forEach((stage, i) => {
      const div = el(
        "div",
        "pr-stage",
        '<div class="pr-stage-top"><div class="pr-stage-icon">' + (ICONS[stage.icon] || "") + '</div><span class="pr-stage-num">' +
          String(i + 1).padStart(2, "0") +
          "</span></div>" +
          '<h3 class="pr-stage-title">' + escapeHtml(stage.title) + "</h3>" +
          '<p class="pr-stage-desc">' + escapeHtml(stage.text) + "</p>" +
          '<div class="pr-stage-track"><span class="pr-stage-bar"></span></div>'
      );
      div.setAttribute("data-stage", "");
      grid.appendChild(div);
    });
  }

  /* ---------------------------------------------------------
     Dúvidas (FAQ)
     --------------------------------------------------------- */
  function renderDuvidas() {
    const section = document.getElementById("duvidas");
    if (!C.duvidas.enabled) {
      section.remove();
      return;
    }
    document.getElementById("pr-faq-kicker").textContent = C.duvidas.kicker;
    document.getElementById("pr-faq-title").textContent = C.duvidas.title;
    document.getElementById("pr-faq-subtitle").textContent = C.duvidas.subtitle;

    const list = document.getElementById("pr-faq-list");
    C.duvidas.items.forEach((item) => {
      const details = el(
        "details",
        "pr-faq-item",
        '<summary class="pr-faq-question">' + escapeHtml(item.q) + '<span class="pr-faq-plus">+</span></summary>' +
          '<p class="pr-faq-answer">' + escapeHtml(item.a) + "</p>"
      );
      list.appendChild(details);
    });
  }

  /* ---------------------------------------------------------
     Contato
     --------------------------------------------------------- */
  function renderContato() {
    document.getElementById("pr-contato-title").textContent = C.contato.title;
    document.getElementById("pr-contato-subtitle").textContent = C.contato.subtitle;
    const cta = document.getElementById("pr-contato-cta");
    cta.textContent = C.contato.ctaLabel;
    cta.href = whatsappUrl(C.contato.ctaWhatsappMessage);

    const checks = document.getElementById("pr-contato-checks");
    C.contato.checks.forEach((label) => {
      const span = el("span", "pr-contact-check", ICONS.check + label);
      checks.appendChild(span);
    });
  }

  /* ---------------------------------------------------------
     Footer
     --------------------------------------------------------- */
  function renderFooter() {
    document.getElementById("pr-footer-desc").textContent = C.footer.description;
    document.getElementById("pr-footer-tagline").textContent = C.footer.tagline;
    document.getElementById("pr-footer-nav-label").textContent = C.footer.navLabel;
    document.getElementById("pr-footer-contact-label").textContent = C.footer.contactLabel;
    document.getElementById("pr-footer-copyright").textContent = C.footer.copyright;

    const navLinks = document.getElementById("pr-footer-nav-links");
    C.footer.navLinks.forEach((link) => {
      const a = el("a", null, link.label);
      a.href = link.href;
      navLinks.appendChild(a);
    });

    const contactLinks = document.getElementById("pr-footer-contact-links");
    C.footer.contactLinks.forEach((link) => {
      const a = el("a", null, link.label);
      a.href = whatsappUrl(link.whatsappMessage);
      a.target = "_blank";
      a.rel = "noopener";
      contactLinks.appendChild(a);
    });

    const legal = document.getElementById("pr-footer-legal");
    C.footer.legalLinks.forEach((link) => {
      const a = el("a", null, link.label);
      a.href = link.href;
      legal.appendChild(a);
    });

    if (C.seo.enabled) {
      const btn = el("button", null, C.seo.triggerLabel);
      btn.type = "button";
      btn.id = "pr-seo-open";
      legal.appendChild(btn);
    }
  }

  /* ---------------------------------------------------------
     SEO modal
     --------------------------------------------------------- */
  function renderSeoModal() {
    if (!C.seo.enabled) return;
    document.getElementById("pr-modal-kicker").textContent = C.seo.kicker;
    document.getElementById("pr-modal-title").textContent = C.seo.title;

    const groupsWrap = document.getElementById("pr-modal-groups");
    C.seo.groups.forEach((group) => {
      const wordsHtml = group.words
        .map((w) => '<span class="pr-modal-word">' + escapeHtml(w) + "</span>")
        .join("");
      const groupEl = el(
        "div",
        "pr-modal-group",
        "<h3>" + escapeHtml(group.title) + '</h3><div class="pr-modal-words">' + wordsHtml + "</div>"
      );
      groupsWrap.appendChild(groupEl);
    });

    const backdrop = document.getElementById("pr-seo-modal");
    const openModal = () => {
      backdrop.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };
    const closeModal = () => {
      backdrop.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    document.addEventListener("click", (e) => {
      if (e.target && e.target.id === "pr-seo-open") openModal();
    });
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
    document.getElementById("pr-modal-close").addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  /* ---------------------------------------------------------
     Mobile menu
     --------------------------------------------------------- */
  function setupMenu() {
    const hamburger = document.getElementById("pr-hamburger");
    const panel = document.getElementById("pr-mobile-panel");

    function lockScroll(lock) {
      if (lock) {
        const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        if (scrollbarW > 0) document.body.style.paddingRight = scrollbarW + "px";
      } else {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }
    }

    function toggle() {
      const isOpen = hamburger.classList.toggle("is-open");
      panel.classList.toggle("is-open", isOpen);
      lockScroll(isOpen);
    }

    function close() {
      if (hamburger.classList.contains("is-open")) {
        hamburger.classList.remove("is-open");
        panel.classList.remove("is-open");
        lockScroll(false);
      }
    }

    hamburger.addEventListener("click", toggle);
    panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
    document.querySelectorAll(".pr-nav-links a").forEach((a) => a.addEventListener("click", close));
  }

  /* ---------------------------------------------------------
     Scroll-triggered animations
     --------------------------------------------------------- */
  function setupReveals(reduce) {
    const nodes = Array.from(document.querySelectorAll("[data-reveal]"));
    const extra = Array.from(document.querySelectorAll("section h2, section h2 + p, details, footer > div"));
    extra.forEach((el, i) => {
      if (el.closest("#topo")) return;
      const d = Math.min(i % 4, 3) * 0.06;
      el.style.transition = "opacity .6s cubic-bezier(.22,.61,.36,1) " + d + "s, transform .6s cubic-bezier(.22,.61,.36,1) " + d + "s";
      if (!reduce) {
        el.style.opacity = "0";
        el.style.transform = "translateY(12px)";
      }
      nodes.push(el);
    });
    const show = (el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    };
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(show);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    nodes.forEach((n) => io.observe(n));
    setTimeout(() => nodes.forEach(show), 3500);
  }

  function setupJourney(reduce) {
    const root = document.getElementById("pr-journey");
    if (!root) return;
    const fill = root.querySelector(".pr-journey-fill");
    const steps = Array.from(root.querySelectorAll(".pr-journey-step"));
    const light = (i) => {
      steps[i].classList.add("is-lit");
      steps[i].style.opacity = "1";
      steps[i].style.transform = "none";
    };
    if (reduce) {
      if (fill) fill.style.transform = "none";
      steps.forEach((_, i) => light(i));
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = root.getBoundingClientRect();
      const anchor = window.innerHeight * 0.72;
      const p = Math.max(0, Math.min(1, (anchor - r.top) / Math.max(1, r.height * 0.92)));
      if (fill) fill.style.transform = "scaleY(" + p.toFixed(3) + ")";
      steps.forEach((s, i) => {
        if (p >= (i + 0.35) / steps.length || (p > 0.02 && i === 0)) light(i);
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  function setupPipeline(reduce) {
    const root = document.getElementById("pr-pipe");
    if (!root) return;
    const stages = Array.from(root.querySelectorAll("[data-stage]"));
    const on = (el) => el.classList.add("pr-stage-in");
    if (reduce || !("IntersectionObserver" in window)) {
      stages.forEach(on);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        stages.forEach((el, i) => setTimeout(() => on(el), i * 520));
      },
      { threshold: 0.25 }
    );
    io.observe(root);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderMeta();
    renderNav();
    renderHero();
    renderProblema();
    renderSolucao();
    renderRecebe();
    renderDuvidas();
    renderContato();
    renderFooter();
    renderSeoModal();
    setupMenu();

    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setupReveals(reduce);
    setupJourney(reduce);
    setupPipeline(reduce);
  });
})();
