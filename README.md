# prospher.com.br

Landing page institucional da prospher. Site estático, uma página só, sem backend,
sem banco e sem formulário — a única conversão é o clique no WhatsApp.

---

## Como editar o conteúdo

**Todo o texto vive em [`js/content.js`](js/content.js).** É o único arquivo que você
precisa tocar para trocar uma frase, um passo da jornada, uma pergunta do FAQ ou o
número do WhatsApp.

`index.html` é **template**: os elementos com `id` são preenchidos por `build.js`.
Texto escrito à mão dentro deles é sobrescrito no próximo build.

| Quero mudar | Arquivo |
|---|---|
| Textos, links, FAQ, WhatsApp, CNPJ | `js/content.js` |
| Estrutura da página | `index.html` |
| Estilos | `css/styles.css` |
| Comportamento (menu, modal, animação) | `js/main.js` |
| Texto da Política de Privacidade | `templates/privacidade.html` |
| Layout de 404 e Política | `templates/pagina.html` |

## Build

```bash
node build.js
```

Sem dependências — só Node (testado no v22). Gera `dist/`, que é o que vai ao ar.

O build lê `js/content.js` e **renderiza todo o HTML em tempo de build**. Isso é
proposital: crawler de LLM (ChatGPT, Claude, Perplexity) não executa JavaScript.
Antes disso, o site era invisível para eles além do `<h1>`.

O build também:

- versiona `styles.css` e `main.js` com `?v=<hash>`, o que torna seguro o cache longo do `_headers`;
- gera o JSON-LD (`ProfessionalService`, `WebSite`, `WebPage`, `FAQPage`) a partir do conteúdo;
- gera `sitemap.xml` com `lastmod` real;
- injeta o commit e a data em `<meta name="build">` — responde na hora "é cache ou é a versão nova?";
- **avisa** quando algo essencial está faltando. Leia os `[ATENCAO]` no fim da saída.

O build nunca falha por dado faltando; ele omite o que não pode publicar com
honestidade. Sem `site.legal` preenchido, a página `/privacidade` não é gerada **e o
link some do rodapé** — link morto seria pior que link ausente.

## Deploy — Cloudflare Pages

| Configuração | Valor |
|---|---|
| Build command | `node build.js` |
| Build output directory | `dist` |
| Root directory | *(vazio)* |

> **Não publique a raiz do repositório.** Foi assim que o diretório `.git/` acabou
> exposto em `https://prospher.com.br/.git/config` — qualquer um conseguia baixar
> o código. Publicar `dist/` resolve isso por construção.

Deploy automático a cada push na `main`.

**Rollback:** Cloudflare Pages → Deployments → escolher um deploy anterior →
*Rollback to this deployment*. Teste isso uma vez **antes** de precisar.

## Configuração fora do código

Estes itens não estão no repositório e precisam ser feitos no painel:

- **Cloudflare → SSL/TLS → Edge Certificates → Always Use HTTPS: ON**
- **Cloudflare → DNS:** CNAME `www` → apex (proxied) + Redirect Rule 301 `www` → apex
- **Cloudflare → WAF:** regra bloqueando `/.git/*` (rede de segurança)
- **Cloudflare → Web Analytics:** ativar e colar o token em `site.analytics.cloudflareToken`
- **Cloudflare → Zaraz:** evento `clique_whatsapp` (o `main.js` já dispara o `zaraz.track`)
- **Google Search Console** (propriedade do tipo Domínio) e **Bing Webmaster Tools**
- **UptimeRobot:** check a cada 5 min com verificação de palavra-chave, não só status 200

O roteiro completo, com o porquê de cada item, está em
`../../checklist-producao-web.md`.

## Estrutura

```
index.html              template da home
templates/              shell e conteúdo das páginas simples
js/content.js           TODO o texto do site
js/main.js              interações (não renderiza texto)
css/styles.css          estilos
assets/                 logos, og.png e fontes self-hosted
tools/gerar-imagens.py  regenera og.png, favicon.ico e apple-touch-icon.png
build.js                gerador do dist/
_headers                cabeçalhos de segurança e cache (Cloudflare Pages)
dist/                   saída do build — não versionada
```

### Fontes

Archivo é servida do próprio domínio (`assets/fonts/`). Não use Google Fonts por
CDN: além de criar uma cadeia de requisições bloqueante, envia o IP de todo
visitante para os EUA sem base legal — o que a Política de Privacidade teria de
declarar.

### Regenerar as imagens

```bash
python tools/gerar-imagens.py assets caminho/archivo-800.ttf caminho/archivo-400.ttf
```

Os TTFs são só para o build das imagens e não vão para o repositório. Baixe-os com
um user-agent antigo, que faz o Google Fonts servir TTF em vez de woff2:

```bash
curl -A "Mozilla/4.0" "https://fonts.googleapis.com/css2?family=Archivo:wght@400;800"
```
