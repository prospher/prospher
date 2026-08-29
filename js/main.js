/**
 * prospher — interações da página.
 *
 * Este arquivo NÃO renderiza mais texto. Todo o conteúdo vem pronto no HTML,
 * gerado por build.js a partir de js/content.js — o site precisa existir para
 * quem não executa JavaScript (Googlebot em primeira passada e, principalmente,
 * os crawlers de LLM, que não renderizam).
 *
 * O que sobrou aqui: menu mobile, modal de SEO, animações de scroll,
 * rastreio do clique de conversão e repasse de UTM para o WhatsApp.
 */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     Menu mobile
     --------------------------------------------------------- */
  function setupMenu() {
    const hamburger = document.getElementById("pr-hamburger");
    const panel = document.getElementById("pr-mobile-panel");
    if (!hamburger || !panel) return;

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

    function set(open) {
      hamburger.classList.toggle("is-open", open);
      panel.classList.toggle("is-open", open);
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
      lockScroll(open);
    }

    hamburger.addEventListener("click", () => set(!hamburger.classList.contains("is-open")));
    panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
    document
      .querySelectorAll(".pr-nav-links a")
      .forEach((a) => a.addEventListener("click", () => set(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && hamburger.classList.contains("is-open")) {
        set(false);
        hamburger.focus();
      }
    });
  }

  /* ---------------------------------------------------------
     Modal de SEO
     --------------------------------------------------------- */
  function setupModal() {
    const backdrop = document.getElementById("pr-seo-modal");
    const closeBtn = document.getElementById("pr-modal-close");
    const groupsEl = document.getElementById("pr-modal-groups");
    if (!backdrop || !closeBtn) return;

    let lastFocused = null;
    let carregado = false;

    // Os termos vêm de /seo-termos.json em vez de virem no HTML: dentro de um
    // elemento com display:none, eles seriam texto oculto aos olhos do Google.
    // Carrega uma vez, na primeira abertura.
    function carregarTermos() {
      if (carregado || !groupsEl) return;
      carregado = true;
      fetch("/seo-termos.json", { headers: { Accept: "application/json" } })
        .then((r) => {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then((data) => {
          const frag = document.createDocumentFragment();
          (data.groups || []).forEach((g) => {
            const bloco = document.createElement("div");
            bloco.className = "pr-modal-group";

            const h3 = document.createElement("h3");
            h3.textContent = g.title;
            bloco.appendChild(h3);

            const palavras = document.createElement("div");
            palavras.className = "pr-modal-words";
            (g.words || []).forEach((w) => {
              const span = document.createElement("span");
              span.className = "pr-modal-word";
              span.textContent = w;
              palavras.appendChild(span);
            });
            bloco.appendChild(palavras);
            frag.appendChild(bloco);
          });
          groupsEl.textContent = "";
          groupsEl.appendChild(frag);
        })
        .catch(() => {
          carregado = false;
          groupsEl.textContent = "Não foi possível carregar os termos agora.";
        });
    }

    function open(trigger) {
      lastFocused = trigger || document.activeElement;
      carregarTermos();
      backdrop.classList.add("is-open");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function close() {
      if (!backdrop.classList.contains("is-open")) return;
      backdrop.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    document.addEventListener("click", (e) => {
      const trigger = e.target && e.target.closest && e.target.closest("#pr-seo-open");
      if (trigger) open(trigger);
    });
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  /* ---------------------------------------------------------
     Conversão: UTM repassada ao WhatsApp + evento de clique
     --------------------------------------------------------- */
  function setupConversao() {
    const links = Array.from(document.querySelectorAll('a[data-wa][href*="wa.me"]'));
    if (!links.length) return;

    // Repassa a origem da campanha na mensagem pré-preenchida. Sem isso não há
    // como saber se o lead veio do Google, do Instagram ou de indicação.
    let sufixo = "";
    try {
      const q = new URLSearchParams(window.location.search);
      const origem = q.get("utm_source") || q.get("ref");
      const campanha = q.get("utm_campaign");
      if (origem) sufixo = "\n\n(via " + [origem, campanha].filter(Boolean).join(" / ") + ")";
    } catch (e) {
      /* URL malformada: segue sem sufixo */
    }

    links.forEach((a) => {
      if (sufixo) {
        try {
          const url = new URL(a.href);
          url.searchParams.set("text", (url.searchParams.get("text") || "") + sufixo);
          a.href = url.toString();
        } catch (e) {
          /* href inesperado: mantém o original */
        }
      }
      a.addEventListener("click", () => {
        const origem = a.getAttribute("data-wa") || "desconhecida";
        if (window.zaraz && typeof window.zaraz.track === "function") {
          window.zaraz.track("clique_whatsapp", { origem: origem });
        }
      });
    });
  }

  /* ---------------------------------------------------------
     Animações de scroll
     --------------------------------------------------------- */
  function setupReveals(reduce) {
    const nodes = Array.from(document.querySelectorAll("[data-reveal]"));
    const extra = Array.from(
      document.querySelectorAll("section h2, section h2 + p, details, footer > div")
    );
    extra.forEach((el, i) => {
      if (el.closest("#topo")) return;
      const d = Math.min(i % 4, 3) * 0.06;
      el.style.transition =
        "opacity .6s cubic-bezier(.22,.61,.36,1) " + d + "s, transform .6s cubic-bezier(.22,.61,.36,1) " + d + "s";
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
    // Rede de segurança: nada pode ficar invisível por falha do observer.
    setTimeout(() => nodes.forEach(show), 3500);
  }

  function setupJourney(reduce) {
    const root = document.getElementById("pr-journey");
    if (!root) return;
    const fill = root.querySelector(".pr-journey-fill");
    const steps = Array.from(root.querySelectorAll(".pr-journey-step"));
    if (!steps.length) return;
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
    if (!stages.length) return;
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

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    setupMenu();
    setupModal();
    setupConversao();

    const reduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setupReveals(reduce);
    setupJourney(reduce);
    setupPipeline(reduce);
  });
})();
