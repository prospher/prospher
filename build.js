#!/usr/bin/env node
/**
 * build.js — gera dist/ com o HTML já renderizado.
 *
 * Por que existe: até então todo o texto do site era injetado por js/main.js no
 * navegador. Crawler de LLM não executa JavaScript, então o site era invisível
 * para ChatGPT/Claude/Perplexity além do H1 (checklist §6.6, §12.2). Aqui o
 * mesmo js/content.js é lido em tempo de build e o HTML sai completo.
 *
 * Efeito colateral bem-vindo: como o deploy passa a publicar dist/ em vez da
 * raiz do repositório, o diretório .git deixa de ir para o ar (§20.6).
 *
 * Uso: node build.js   (Cloudflare Pages: build command = node build.js,
 *                       build output directory = dist)
 */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const ROOT = __dirname;
const OUT = path.join(ROOT, "dist");
const SITE_URL = "https://prospher.com.br";

const warnings = [];
function warn(msg) {
  warnings.push(msg);
}

/* ---------------------------------------------------------
   Conteúdo
   --------------------------------------------------------- */
const contentSrc = fs.readFileSync(path.join(ROOT, "js", "content.js"), "utf8");
const C = new Function(contentSrc + "\n;return SITE_CONTENT;")();

/* ---------------------------------------------------------
   Helpers de string / HTML
   --------------------------------------------------------- */
function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function attr(str) {
  return esc(str).replace(/"/g, "&quot;");
}

/**
 * Localiza um elemento pelo id e devolve os offsets da tag de abertura, do
 * conteúdo e da tag de fechamento. Conta profundidade para suportar elementos
 * aninhados de mesma tag.
 */
function findElement(html, id) {
  const open = new RegExp(
    '<([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"]|"[^"]*")*?\\sid="' + id + '"(?:[^>"]|"[^"]*")*?)>'
  );
  const m = open.exec(html);
  if (!m) throw new Error('build: id nao encontrado no template: "' + id + '"');
  const tag = m[1];
  const openStart = m.index;
  const openEnd = m.index + m[0].length;

  const scan = new RegExp("<" + tag + "\\b|</" + tag + "\\s*>", "gi");
  scan.lastIndex = openEnd;
  let depth = 1;
  let mm;
  while ((mm = scan.exec(html)) !== null) {
    if (mm[0][1] === "/") {
      depth -= 1;
      if (depth === 0) {
        return {
          tag: tag,
          openStart: openStart,
          openEnd: openEnd,
          closeStart: mm.index,
          closeEnd: mm.index + mm[0].length,
          openTag: m[0],
        };
      }
    } else {
      depth += 1;
    }
  }
  throw new Error('build: tag nao fechada para o id "' + id + '"');
}

/** Acrescenta HTML ao final do elemento (equivale ao appendChild do main.js). */
function append(html, id, inner) {
  const e = findElement(html, id);
  return html.slice(0, e.closeStart) + inner + html.slice(e.closeStart);
}

/** Substitui todo o conteúdo do elemento por texto escapado. */
function setText(html, id, str) {
  const e = findElement(html, id);
  return html.slice(0, e.openEnd) + esc(str) + html.slice(e.closeStart);
}

/** Substitui todo o conteúdo do elemento por HTML cru (já escapado na origem). */
function setHtml(html, id, inner) {
  const e = findElement(html, id);
  return html.slice(0, e.openEnd) + inner + html.slice(e.closeStart);
}

/** Define (ou sobrescreve) um atributo na tag de abertura do elemento. */
function setAttr(html, id, name, value) {
  const e = findElement(html, id);
  let open = e.openTag;
  const existing = new RegExp("\\s" + name + '="[^"]*"');
  if (existing.test(open)) {
    open = open.replace(existing, " " + name + '="' + attr(value) + '"');
  } else {
    open = open.replace(/>$/, " " + name + '="' + attr(value) + '">');
  }
  return html.slice(0, e.openStart) + open + html.slice(e.openEnd);
}

/** Remove um atributo (usado para tirar o `hidden` da variante ativa do hero). */
function removeAttr(html, id, name) {
  const e = findElement(html, id);
  const open = e.openTag.replace(new RegExp("\\s" + name + '(="[^"]*")?', "i"), "");
  return html.slice(0, e.openStart) + open + html.slice(e.openEnd);
}

/** Remove o elemento inteiro, com subárvore. */
function removeEl(html, id) {
  const e = findElement(html, id);
  return html.slice(0, e.openStart) + html.slice(e.closeEnd);
}

/* ---------------------------------------------------------
   Ícones (antes viviam em js/main.js; agora são resolvidos no build)
   --------------------------------------------------------- */
const SVG = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

const ICONS = {
  check:
    '<svg ' + SVG + ' stroke-width="2.4"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  trend:
    '<svg ' + SVG + ' stroke-width="1.8"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>',
  network:
    '<svg ' + SVG + ' stroke-width="1.8"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',
  clock:
    '<svg ' + SVG + ' stroke-width="1.8"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
  target:
    '<svg ' + SVG + ' stroke-width="1.7"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
  layout:
    '<svg ' + SVG + ' stroke-width="1.7"><rect x="3" y="3" width="18" height="7"></rect><rect x="3" y="14" width="9" height="7"></rect><rect x="16" y="14" width="5" height="7"></rect></svg>',
  message:
    '<svg ' + SVG + ' stroke-width="1.7"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><polyline points="8 10 11 13 16 8"></polyline></svg>',
  users:
    '<svg ' + SVG + ' stroke-width="1.7"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
};

/* ---------------------------------------------------------
   WhatsApp
   --------------------------------------------------------- */
const PLACEHOLDER_WA = "5511999999999";

function whatsappUrl(key) {
  const msg = C.whatsapp.messages[key] || C.whatsapp.messages.geral;
  return "https://wa.me/" + C.whatsapp.number + "?text=" + encodeURIComponent(msg);
}

if (C.whatsapp.number === PLACEHOLDER_WA) {
  warn(
    "WhatsApp ainda esta com o numero PLACEHOLDER (" + PLACEHOLDER_WA + ").\n" +
      "            Todos os CTAs do site levam a lugar nenhum.\n" +
      "            Ajuste whatsapp.number em js/content.js."
  );
}

/* ---------------------------------------------------------
   Identificação legal (rodapé + Política de Privacidade)

   A prospher ainda opera como pessoa física, sem CNPJ - por isso a
   identificação do controlador (checklist 22.2) e a própria Política de
   Privacidade/Acesso são páginas estáticas versionadas em
   politica-de-privacidade/ e politica-de-acesso/, e não texto gerado a
   partir de razaoSocial/cnpj/cidade. O build só copia essas pastas para
   dist/; ele não exige CNPJ para publicá-las.
   --------------------------------------------------------- */
const legal = (C.site && C.site.legal) || {};

if (!legal.emailTitular) {
  warn(
    "site.legal.emailTitular ausente em js/content.js - sem ele o security.txt\n" +
      "            nao e publicado (canal do art. 18 da LGPD)."
  );
}

/* ---------------------------------------------------------
   Renderização das seções
   --------------------------------------------------------- */
function navLinksHtml() {
  return C.nav.links
    .map((l) => '<a href="' + attr(l.href) + '">' + esc(l.label) + "</a>")
    .join("");
}

function renderNav(html) {
  html = append(html, "pr-nav-links", navLinksHtml());

  const mobileCta =
    '<a class="pr-btn" href="' + attr(whatsappUrl("geral")) +
    '" target="_blank" rel="noopener" data-wa="nav-mobile">' + esc(C.nav.ctaLabel) + "</a>";
  html = append(html, "pr-mobile-links", navLinksHtml() + mobileCta);

  html = setAttr(html, "pr-nav-cta", "href", whatsappUrl("geral"));
  html = setText(html, "pr-nav-cta", C.nav.ctaLabel);
  return html;
}

function renderHero(html) {
  html = setText(html, "pr-hero-kicker", C.hero.kicker);
  html = setText(html, "pr-hero-title", C.hero.title);
  html = setText(html, "pr-hero-subtitle", C.hero.subtitle);

  html = setAttr(html, "pr-hero-cta", "href", whatsappUrl("geral"));
  html = setText(html, "pr-hero-cta", C.hero.ctaLabel);

  html = append(
    html,
    "pr-hero-badges",
    C.hero.badges
      .map((label) => '<span class="pr-hero-badge">' + ICONS.check + esc(label) + "</span>")
      .join("")
  );

  if (C.hero.variant === "conexao") {
    html = removeEl(html, "pr-hero-conversa");
    html = removeAttr(html, "pr-hero-conexao", "hidden");
    const cx = C.hero.conexao;
    html = setText(html, "pr-connect-kicker", cx.kicker);
    html = setText(html, "pr-connect-caption", cx.caption);
    html = append(
      html,
      "pr-connect-left",
      cx.left
        .map(
          (label, i) =>
            '<span class="pr-connect-chip pr-connect-chip--outline" style="animation-delay:' +
            (i * 0.15).toFixed(2) + 's">' + esc(label) + "</span>"
        )
        .join("")
    );
    html = append(
      html,
      "pr-connect-right",
      cx.right
        .map((label, i) => {
          const cls =
            i === cx.right.length - 1 ? "pr-connect-chip--solid" : "pr-connect-chip--fill";
          return '<span class="pr-connect-chip ' + cls + '" style="animation-delay:' +
            (0.45 + i * 0.15).toFixed(2) + 's">' + esc(label) + "</span>";
        })
        .join("")
    );
  } else {
    html = removeEl(html, "pr-hero-conexao");
    html = removeAttr(html, "pr-hero-conversa", "hidden");
    html = setText(html, "pr-chat-label", C.hero.chat.label);
    html = setText(html, "pr-chat-status-label", C.hero.chat.statusLabel);
    const delays = [0.3, 1.1, 1.9, 2.7, 3.5, 4.3];
    html = append(
      html,
      "pr-chat-body",
      C.hero.chat.messages
        .map((msg, i) => {
          const d = delays[i] !== undefined ? delays[i] : i;
          return '<div class="pr-chat-bubble pr-chat-bubble--' + attr(msg.from) +
            '" style="animation-delay:' + d + 's">' + esc(msg.text) + "</div>";
        })
        .join("")
    );
  }
  return html;
}

function renderProblema(html) {
  html = setText(html, "pr-problema-kicker", C.problema.kicker);
  html = setText(html, "pr-problema-title", C.problema.title);
  return append(
    html,
    "pr-problema-grid",
    C.problema.cards
      .map(
        (card) =>
          '<div class="pr-problem-card" data-reveal>' +
          (ICONS[card.icon] || "") +
          "<h3>" + esc(card.title) + "</h3>" +
          "<p>" + esc(card.text) + "</p>" +
          "</div>"
      )
      .join("")
  );
}

function renderSolucao(html) {
  html = setText(html, "pr-solucao-kicker", C.solucao.kicker);
  html = setText(html, "pr-solucao-title", C.solucao.title);
  html = setText(html, "pr-solucao-subtitle", C.solucao.subtitle);
  html = setAttr(html, "pr-solucao-cta", "href", whatsappUrl(C.solucao.ctaWhatsappMessage));
  html = setText(html, "pr-solucao-cta", C.solucao.ctaLabel);

  return append(
    html,
    "pr-journey",
    C.solucao.steps
      .map(
        (step, i) =>
          '<div class="pr-journey-step">' +
          '<span class="pr-journey-dot">' + String(i + 1).padStart(2, "0") + "</span>" +
          "<h3>" + esc(step.title) + "</h3>" +
          "<p>" + esc(step.text) + "</p>" +
          "</div>"
      )
      .join("")
  );
}

function renderRecebe(html) {
  html = setText(html, "pr-recebe-kicker", C.recebe.kicker);
  html = setText(html, "pr-recebe-title", C.recebe.title);
  return append(
    html,
    "pr-pipe",
    C.recebe.stages
      .map(
        (stage, i) =>
          '<div class="pr-stage" data-stage>' +
          '<div class="pr-stage-top"><div class="pr-stage-icon">' + (ICONS[stage.icon] || "") +
          '</div><span class="pr-stage-num">' + String(i + 1).padStart(2, "0") + "</span></div>" +
          '<h3 class="pr-stage-title">' + esc(stage.title) + "</h3>" +
          '<p class="pr-stage-desc">' + esc(stage.text) + "</p>" +
          '<div class="pr-stage-track"><span class="pr-stage-bar"></span></div>' +
          "</div>"
      )
      .join("")
  );
}

function renderDuvidas(html) {
  if (!C.duvidas.enabled) return removeEl(html, "duvidas");
  html = setText(html, "pr-faq-kicker", C.duvidas.kicker);
  html = setText(html, "pr-faq-title", C.duvidas.title);
  html = setText(html, "pr-faq-subtitle", C.duvidas.subtitle);
  return append(
    html,
    "pr-faq-list",
    C.duvidas.items
      .map(
        (item) =>
          '<details class="pr-faq-item">' +
          '<summary class="pr-faq-question">' + esc(item.q) +
          '<span class="pr-faq-plus" aria-hidden="true">+</span></summary>' +
          '<p class="pr-faq-answer">' + esc(item.a) + "</p>" +
          "</details>"
      )
      .join("")
  );
}

function renderContato(html) {
  html = setText(html, "pr-contato-title", C.contato.title);
  html = setText(html, "pr-contato-subtitle", C.contato.subtitle);
  html = setAttr(html, "pr-contato-cta", "href", whatsappUrl(C.contato.ctaWhatsappMessage));
  html = setText(html, "pr-contato-cta", C.contato.ctaLabel);
  return append(
    html,
    "pr-contato-checks",
    C.contato.checks
      .map((label) => '<span class="pr-contact-check">' + ICONS.check + esc(label) + "</span>")
      .join("")
  );
}

function renderFooter(html) {
  html = setText(html, "pr-footer-desc", C.footer.description);
  html = setText(html, "pr-footer-tagline", C.footer.tagline);
  html = setText(html, "pr-footer-nav-label", C.footer.navLabel);
  html = setText(html, "pr-footer-contact-label", C.footer.contactLabel);
  html = setText(html, "pr-footer-copyright", C.footer.copyright);

  html = append(
    html,
    "pr-footer-nav-links",
    C.footer.navLinks
      .map((l) => '<a href="' + attr(l.href) + '">' + esc(l.label) + "</a>")
      .join("")
  );

  html = append(
    html,
    "pr-footer-contact-links",
    C.footer.contactLinks
      .map(
        (l) =>
          '<a href="' + attr(whatsappUrl(l.whatsappMessage)) +
          '" target="_blank" rel="noopener" data-wa="rodape">' + esc(l.label) + "</a>"
      )
      .join("")
  );

  // Identificação do responsável pelo site — Marco Civil / CDC (§31.7, §23.2).
  // Sem CNPJ (pessoa física), essa identificação vive na própria Política de
  // Privacidade estática, não no rodapé - só mostra algo aqui se um dia
  // razaoSocial/cnpj forem preenchidos (pessoa jurídica).
  if (legal.razaoSocial && legal.cnpj) {
    const partes = [legal.razaoSocial, "CNPJ " + legal.cnpj];
    if (legal.cidade) partes.push(legal.cidade);
    html = setText(html, "pr-footer-identity", partes.join(" · "));
  } else {
    html = removeEl(html, "pr-footer-identity");
  }

  // Só publica link para página que existe de verdade. Trocar href="#"
  // por um link que dá 404 não resolveria nada.
  const links = C.footer.legalLinks.filter((l) => Boolean(l.href) && l.href !== "#");

  let legalLinks = links
    .map((l) => '<a href="' + attr(l.href) + '">' + esc(l.label) + "</a>")
    .join("");
  if (C.seo.enabled) {
    legalLinks +=
      '<button type="button" id="pr-seo-open" aria-haspopup="dialog">' +
      esc(C.seo.triggerLabel) + "</button>";
  }
  return append(html, "pr-footer-legal", legalLinks);
}

/**
 * O modal de SEO é argumento de venda: mostra ao visitante quais termos a
 * prospher persegue. Mas os ~56 termos NÃO podem ir no HTML servido.
 *
 * Eles ficavam dentro de uma div com `display:none`, o que é literalmente o
 * que as políticas de spam do Google chamam de texto oculto e keyword
 * stuffing — num domínio novo, sem autoridade para absorver sinal ruim, é
 * risco sem contrapartida. Aqui o modal fica vazio no HTML e os termos são
 * buscados de /seo-termos.json só quando alguém abre. Ver js/main.js.
 */
function renderSeoModal(html) {
  if (!C.seo.enabled) return removeEl(html, "pr-seo-modal");
  html = setText(html, "pr-modal-kicker", C.seo.kicker);
  html = setText(html, "pr-modal-title", C.seo.title);
  return html;
}

/* ---------------------------------------------------------
   <head>: meta, Open Graph, JSON-LD
   --------------------------------------------------------- */
function renderHead(html, opts) {
  const title = opts.title || C.meta.title;
  const description = opts.description || C.meta.description;
  const url = SITE_URL + (opts.pathname || "/");

  html = html.replace(/<title>[\s\S]*?<\/title>/, "<title>" + esc(title) + "</title>");
  const swap = (re, value) => {
    html = html.replace(re, "$1" + attr(value) + "$2");
  };
  swap(/(<meta name="description" content=")[^"]*(")/, description);
  swap(/(<link rel="canonical" href=")[^"]*(")/, url);
  swap(/(<meta property="og:url" content=")[^"]*(")/, url);
  swap(/(<meta property="og:title" content=")[^"]*(")/, title);
  swap(/(<meta property="og:description" content=")[^"]*(")/, description);
  swap(/(<meta name="twitter:title" content=")[^"]*(")/, title);
  swap(/(<meta name="twitter:description" content=")[^"]*(")/, description);
  return html;
}

function buildJsonLd(buildDate) {
  const org = {
    "@type": "ProfessionalService",
    "@id": SITE_URL + "/#organizacao",
    name: "prospher",
    description: C.meta.description,
    url: SITE_URL + "/",
    logo: SITE_URL + "/assets/word.svg",
    image: SITE_URL + "/assets/og.png",
    areaServed: { "@type": "Country", name: "Brasil" },
    serviceType: "Marketing digital e captação de clientes para advogados",
    audience: { "@type": "Audience", audienceType: "Advogados autônomos" },
  };
  if (legal.razaoSocial) org.legalName = legal.razaoSocial;
  if (legal.cnpj) org.taxID = legal.cnpj;
  if (legal.cidade) {
    org.address = {
      "@type": "PostalAddress",
      addressLocality: legal.cidade,
      addressCountry: "BR",
    };
  }
  if (C.whatsapp.number !== PLACEHOLDER_WA) {
    org.telephone = "+" + C.whatsapp.number;
    org.contactPoint = {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: "+" + C.whatsapp.number,
      availableLanguage: "pt-BR",
    };
  }
  const sameAs = (C.site && C.site.sameAs) || [];
  if (sameAs.length) org.sameAs = sameAs;

  const graph = [
    org,
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#site",
      url: SITE_URL + "/",
      name: "prospher",
      inLanguage: "pt-BR",
      publisher: { "@id": SITE_URL + "/#organizacao" },
    },
    {
      "@type": "WebPage",
      "@id": SITE_URL + "/#pagina",
      url: SITE_URL + "/",
      name: C.meta.title,
      description: C.meta.description,
      isPartOf: { "@id": SITE_URL + "/#site" },
      about: { "@id": SITE_URL + "/#organizacao" },
      inLanguage: "pt-BR",
      dateModified: buildDate,
    },
  ];

  // FAQPage só entra se houver FAQ real e visível na página (§9.4).
  if (C.duvidas.enabled && C.duvidas.items.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": SITE_URL + "/#faq",
      isPartOf: { "@id": SITE_URL + "/#site" },
      mainEntity: C.duvidas.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
}

/* ---------------------------------------------------------
   Escrita em disco
   --------------------------------------------------------- */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function write(rel, contents) {
  const full = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
}

function hashOf(rel) {
  return crypto
    .createHash("md5")
    .update(fs.readFileSync(path.join(ROOT, rel)))
    .digest("hex")
    .slice(0, 8);
}

function gitCommit() {
  if (process.env.CF_PAGES_COMMIT_SHA) return process.env.CF_PAGES_COMMIT_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch (e) {
    return "dev";
  }
}

const analytics = (C.site && C.site.analytics) || {};

/** Beacon da Cloudflare Web Analytics — sem cookie, logo sem banner (§24.2). */
function beaconTag() {
  if (!analytics.cloudflareToken) return "";
  return (
    '\n<script defer src="https://static.cloudflareinsights.com/beacon.min.js" ' +
    "data-cf-beacon='" + JSON.stringify({ token: analytics.cloudflareToken }) + "'></script>"
  );
}

/** Ajustes aplicados a toda página gerada. */
function applyCommon(html, o) {
  html = html.replace(/href="\/?css\/styles\.css"/g, 'href="/css/styles.css?v=' + o.cssV + '"');
  html = html.replace(/src="\/?js\/main\.js"/g, 'src="/js/main.js?v=' + o.jsV + '"');
  html = html.replace(
    /(<meta name="build" content=")[^"]*(")/,
    "$1" + attr(o.commit + " " + o.buildDate) + "$2"
  );
  // js/content.js não vai para produção: o texto já está no HTML.
  html = html.replace(/\s*<script src="\/?js\/content\.js"><\/script>/, "");
  // Comentários do template não interessam a quem recebe a página.
  html = html.replace(/\n?<!--[\s\S]*?-->/g, "");
  html = html.replace("</body>", beaconTag() + "\n</body>");
  return html;
}

/** Monta uma página simples (404, política) reaproveitando o shell. */
function buildSimplePage(shell, o) {
  let html = shell;
  html = renderHead(html, {
    pathname: o.pathname,
    title: o.title,
    description: o.description,
  });
  if (o.noindex) {
    html = html.replace("</title>", '</title>\n<meta name="robots" content="noindex">');
  }
  html = setText(html, "pr-page-heading", o.heading);
  html = setHtml(html, "pr-page-body", o.body);
  html = setAttr(html, "pr-page-cta", "href", whatsappUrl("geral"));
  html = setText(html, "pr-page-cta", C.nav.ctaLabel);
  html = setText(html, "pr-page-copyright", C.footer.copyright);
  return applyCommon(html, o);
}

/* ---------------------------------------------------------
   Main
   --------------------------------------------------------- */
function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const agora = new Date();
  const buildDate = agora.toISOString().slice(0, 10);
  // Ano do rodape sempre correto, sem depender de alguem lembrar (31.6).
  C.footer.copyright = C.footer.copyright.replace(/\{\{ANO\}\}/g, String(agora.getFullYear()));
  const commit = gitCommit();
  const common = {
    cssV: hashOf("css/styles.css"),
    jsV: hashOf("js/main.js"),
    commit: commit,
    buildDate: buildDate,
  };

  // --- index.html ---
  let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  html = renderHead(html, { pathname: "/" });
  html = renderNav(html);
  html = renderHero(html);
  html = renderProblema(html);
  html = renderSolucao(html);
  html = renderRecebe(html);
  html = renderDuvidas(html);
  html = renderContato(html);
  html = renderFooter(html);
  html = renderSeoModal(html);
  html = setHtml(html, "pr-jsonld", "\n" + buildJsonLd(buildDate) + "\n");
  // O aviso só existe no template, para o caso de alguém publicar a raiz do repo.
  html = removeEl(html, "pr-build-warning");
  html = applyCommon(html, common);
  write("index.html", html);

  // --- páginas auxiliares ---
  const shell = fs.readFileSync(path.join(ROOT, "templates", "pagina.html"), "utf8");

  write(
    "404.html",
    buildSimplePage(shell, {
      ...common,
      pathname: "/404",
      title: "Página não encontrada — prospher",
      description: "A página que você procurou não existe neste site.",
      heading: "Essa página não existe.",
      body:
        "<p>O endereço pode estar errado ou a página pode ter saído do ar. " +
        'Volte para o <a href="/">início</a> — ou fale direto com a gente.</p>',
      noindex: true,
    })
  );

  // --- estáticos ---
  copyDir(path.join(ROOT, "assets"), path.join(OUT, "assets"));
  copyDir(path.join(ROOT, "css"), path.join(OUT, "css"));
  fs.mkdirSync(path.join(OUT, "js"), { recursive: true });
  fs.copyFileSync(path.join(ROOT, "js", "main.js"), path.join(OUT, "js", "main.js"));
  fs.copyFileSync(path.join(ROOT, "js", "legal.js"), path.join(OUT, "js", "legal.js"));

  // Política de Acesso / Política de Privacidade — páginas estáticas
  // (pessoa física, sem CNPJ), mantidas à mão fora de js/content.js.
  for (const dir of ["politica-de-acesso", "politica-de-privacidade"]) {
    const src = path.join(ROOT, dir);
    if (fs.existsSync(src)) copyDir(src, path.join(OUT, dir));
    else warn("pasta ausente, nao copiada para dist/: " + dir);
  }

  for (const f of ["robots.txt", "llms.txt", "_headers", "favicon.ico", "apple-touch-icon.png"]) {
    const src = path.join(ROOT, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUT, f));
    else warn("arquivo ausente, nao copiado para dist/: " + f);
  }

  const wellKnown = path.join(ROOT, ".well-known");
  if (fs.existsSync(wellKnown)) copyDir(wellKnown, path.join(OUT, ".well-known"));

  // Termos do modal de SEO, carregados sob demanda pelo main.js. Ficam fora do
  // HTML de propósito — ver renderSeoModal().
  if (C.seo.enabled) {
    write("seo-termos.json", JSON.stringify({ groups: C.seo.groups }));
  }

  // security.txt — canal para reportar vulnerabilidade (§20.12). Precisa de um
  // e-mail que exista; sem ele o arquivo não é publicado.
  if (legal.emailTitular) {
    const expira = new Date();
    expira.setFullYear(expira.getFullYear() + 1);
    write(
      ".well-known/security.txt",
      "Contact: mailto:" + legal.emailTitular + "\n" +
        "Expires: " + expira.toISOString().replace(/\.\d+Z$/, "Z") + "\n" +
        "Preferred-Languages: pt-BR, en\n" +
        "Canonical: " + SITE_URL + "/.well-known/security.txt\n"
    );
  }

  // sitemap com lastmod real (§7.3)
  write(
    "sitemap.xml",
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      "  <url>\n" +
      "    <loc>" + SITE_URL + "/</loc>\n" +
      "    <lastmod>" + buildDate + "</lastmod>\n" +
      "    <changefreq>monthly</changefreq>\n" +
      "    <priority>1.0</priority>\n" +
      "  </url>\n" +
      ["politica-de-acesso", "politica-de-privacidade"]
        .map(
          (dir) =>
            "  <url>\n    <loc>" + SITE_URL + "/" + dir + "/</loc>\n    <lastmod>" +
            buildDate + "</lastmod>\n    <changefreq>yearly</changefreq>\n" +
            "    <priority>0.3</priority>\n  </url>\n"
        )
        .join("") +
      "</urlset>\n"
  );

  // --- relatório ---
  const pages = ["index.html", "404.html", "politica-de-acesso/", "politica-de-privacidade/"];
  console.log("build ok - dist/ gerado");
  console.log("  commit  " + commit + "  ." + "  " + buildDate);
  console.log("  paginas " + pages.join(", "));
  console.log("  assets  styles.css?v=" + common.cssV + "  main.js?v=" + common.jsV);
  if (warnings.length) {
    console.log("");
    warnings.forEach((w) => console.log("  [ATENCAO] " + w));
  }
}

main();
