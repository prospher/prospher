/**
 * prospher — comportamento de menu mobile para páginas institucionais
 * (Política de Acesso, Política de Privacidade). Header/rodapé destas
 * páginas são estáticos, então este script só cuida do hamburger —
 * a lógica é a mesma de setupMenu() em js/main.js.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
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
  });

  /* ---------------------------------------------------------
     Conversão: evento de clique no botão do WhatsApp
     --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('a[data-wa][href*="wa.me"]').forEach((a) => {
      a.addEventListener("click", () => {
        const origem = a.getAttribute("data-wa") || "desconhecida";
        if (typeof window.gtag === "function") {
          window.gtag("event", "clique_whatsapp", { origem: origem });
        }
      });
    });
  });

  /* ---------------------------------------------------------
     Consentimento de cookies (Google Consent Mode)
     --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    const KEY = "pr-consent-analytics";
    const banner = document.getElementById("pr-cookie-banner");
    if (!banner) return;

    function apply(granted) {
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", { analytics_storage: granted ? "granted" : "denied" });
      }
    }

    let saved = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch (e) {
      /* localStorage bloqueado (modo privado): segue sem escolha salva */
    }

    if (saved === "granted" || saved === "denied") {
      apply(saved === "granted");
      return;
    }

    banner.hidden = false;
    function decide(granted) {
      apply(granted);
      try {
        localStorage.setItem(KEY, granted ? "granted" : "denied");
      } catch (e) {
        /* segue sem persistir; pergunta de novo na próxima visita */
      }
      banner.hidden = true;
    }

    const accept = document.getElementById("pr-cookie-accept");
    const reject = document.getElementById("pr-cookie-reject");
    if (accept) accept.addEventListener("click", () => decide(true));
    if (reject) reject.addEventListener("click", () => decide(false));
  });
})();
