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
})();
