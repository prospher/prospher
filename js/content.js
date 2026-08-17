/**
 * TEXTOS DA PÁGINA — prospher
 * ---------------------------------------------------------
 * Edite os textos, links e listas aqui. O restante do site
 * (index.html, css/styles.css, js/main.js) não precisa ser
 * tocado para atualizar o conteúdo.
 * ---------------------------------------------------------
 */
const SITE_CONTENT = {

  meta: {
    title: "prospher — Presença digital para advogados",
    description: "Estrutura completa de tráfego, landing page e atendimento para advogados autônomos pararem de depender só de indicação.",
  },

  // Número e mensagens pré-preenchidas do WhatsApp usadas nos botões do site.
  whatsapp: {
    number: "5511999999999",
    messages: {
      geral: "Olá, sou advogado e quero saber como a prospher pode me trazer clientes.",
      diagnostico: "Olá, quero um diagnóstico da minha advocacia.",
      contato: "Olá, sou advogado autônomo e quero conversar sobre captação de clientes.",
    },
  },

  nav: {
    links: [
      { label: "Início", href: "#topo" },
      { label: "Problema", href: "#problema" },
      { label: "Solução", href: "#solucao" },
      { label: "O que você recebe", href: "#recebe" },
      { label: "Dúvidas", href: "#duvidas" },
    ],
    ctaLabel: "Conectar com a prospher",
  },

  hero: {
    // "conversa" mostra o mockup de chat do WhatsApp; "conexao" mostra o diagrama de conexão.
    variant: "conversa",
    kicker: "Presença digital profissional para advogados.",
    title: "Pare de depender só de indicações.",
    subtitle: "Estrutura completa que você constrói conosco. Página, tráfego e atendimento customizados para atrair quem realmente precisa de você.",
    ctaLabel: "Conectar com a prospher",
    badges: [
      "Estrutura sob medida",
      "Feito para OAB",
      "Sem contrato longo",
    ],
    chat: {
      label: "prospher · atendimento",
      statusLabel: "online",
      messages: [
        { from: "user", text: "Oi, vi o site. Atuo com direito do consumidor. Como funciona?" },
        { from: "bot", text: "Oi! Antes de tudo, me conta: qual é o maior desafio que você tem hoje pra conseguir clientes?" },
        { from: "user", text: "Hoje é quase tudo indicação. Queria algo mais constante." },
        { from: "bot", text: "Entendo. E o que você já tentou pra resolver isso?" },
        { from: "user", text: "Nada ainda, nunca tive site nem nada online." },
        { from: "bot", text: "Faz sentido começarmos por aí então. Posso te mostrar como isso funcionaria pro seu caso." },
      ],
    },
    conexao: {
      kicker: "A conexão que falta hoje",
      left: ["Quem busca advogado", "Busca no Google", "Rola o Instagram"],
      right: ["Sua página", "Seu WhatsApp", "Cliente atendido"],
      caption: "Hoje esse caminho não existe para você. É exatamente isso que a gente constrói.",
    },
  },

  problema: {
    kicker: "O problema",
    title: "Você advoga bem. O problema é que poucos sabem disso.",
    cards: [
      {
        icon: "trend",
        title: "Poucos clientes novos",
        text: "O mês começa sem previsibilidade. Você não sabe quantos casos vai fechar, nem de onde eles virão.",
      },
      {
        icon: "network",
        title: "Depende de indicação",
        text: "Quando a rede de contatos esfria, a agenda esfria junto. Indicação funciona, mas não é estrutura.",
      },
      {
        icon: "clock",
        title: "O concorrente já apareceu primeiro",
        text: "Colegas com menos tempo de OAB aparecem antes de você na busca. Não é mérito técnico, é presença digital.",
      },
    ],
  },

  solucao: {
    kicker: "Como resolvemos",
    title: "Nada de pacote fechado. Cada advogado recebe uma solução desenhada para a sua necessidade.",
    subtitle: "Primeiro entendemos sua área, seu ticket e seu cliente ideal. Só depois começamos a construir.",
    ctaLabel: "Quero meu diagnóstico",
    ctaWhatsappMessage: "diagnostico",
    steps: [
      { title: "Conversa", text: "Você manda uma mensagem contando sua área e sua situação hoje. Já começamos a entender seu caso." },
      { title: "Diagnóstico", text: "Entendemos sua área, sua região e como o cliente te procura hoje." },
      { title: "Estratégia personalizada", text: "Desenhamos o plano pro seu caso, dentro do que a OAB permite." },
      { title: "Execução", text: "Montamos tudo e colocamos no ar. Você continua advogando." },
      { title: "Resultados acompanhados", text: "Acompanhe quantos contatos chegam e quantos se tornam clientes." },
    ],
  },

  recebe: {
    kicker: "O que você recebe",
    title: "Uma esteira em que cada etapa alimenta a próxima.",
    stages: [
      { icon: "target", title: "Tráfego", text: "Anúncios para quem já procura um advogado da sua área, na sua região." },
      { icon: "layout", title: "Landing page", text: "Uma página que explica seu serviço com clareza e conduz ao contato." },
      { icon: "message", title: "Leads qualificados", text: "Chega no seu WhatsApp já sabendo o que você faz. Menos curioso, mais caso real." },
      { icon: "users", title: "Clientes", text: "Você fecha os casos que fazem sentido. A esteira continua rodando no mês seguinte." },
    ],
  },

  duvidas: {
    enabled: true,
    kicker: "Dúvidas",
    title: "Antes de você perguntar.",
    subtitle: "Se a sua dúvida não estiver aqui, manda no WhatsApp. Respondemos sem script de vendas.",
    items: [
      {
        q: "Isso é permitido pela OAB?",
        a: "Sim. Trabalhamos dentro do Provimento 205/2021: informação sobre o serviço, sem mercantilização, sem promessa de resultado e sem captação vedada. A copy já é escrita nessa régua.",
      },
      {
        q: "Preciso entender de marketing?",
        a: "Não. A parte técnica é nossa. De você precisamos do conhecimento da sua área e do retorno no WhatsApp quando o cliente chegar.",
      },
      {
        q: "Sou autônomo, ainda vale?",
        a: "É justamente para quem advoga sozinho. Você não tem equipe de marketing nem tempo sobrando. Por isso a estrutura precisa ser enxuta e rodar sem você.",
      },
      {
        q: "Em quanto tempo vejo movimento?",
        a: "A estrutura fica no ar em poucos dias. O volume de contato depende da área, da região e do investimento em anúncio. Isso a gente dimensiona junto no diagnóstico, com número em cima da mesa.",
      },
      {
        q: "A primeira conversa custa algo?",
        a: "Não. O diagnóstico é gratuito e acontece no WhatsApp. Se não fizer sentido para o seu momento, a gente diz.",
      },
    ],
  },

  contato: {
    title: "A próxima indicação você não controla. Essa conversa, sim.",
    subtitle: "Dez minutos no WhatsApp para entender sua área e dizer, com honestidade, o que faria diferença na sua captação.",
    ctaLabel: "Conectar com a prospher agora",
    ctaWhatsappMessage: "contato",
    checks: [
      "Conversa direta com quem executa",
      "Escopo em conformidade com a OAB",
      "Sem contrato longo de fidelidade",
    ],
  },

  footer: {
    description: "Estrutura digital de captação de clientes para advogados autônomos.",
    tagline: "Tecnologia para quem argumenta com precisão.",
    navLabel: "Navegação",
    navLinks: [
      { label: "Início", href: "#topo" },
      { label: "Problema", href: "#problema" },
      { label: "Solução", href: "#solucao" },
      { label: "O que você recebe", href: "#recebe" },
      { label: "Dúvidas", href: "#duvidas" },
      { label: "Contato", href: "#contato" },
    ],
    contactLabel: "Contato",
    contactLinks: [
      { label: "WhatsApp", whatsappMessage: "geral" },
    ],
    copyright: "© 2026 prospher. Todos os direitos reservados.",
    legalLinks: [
      { label: "Política de Privacidade", href: "#" },
      { label: "Termos de Uso", href: "#" },
    ],
  },

  seo: {
    enabled: true,
    triggerLabel: "SEO",
    title: "SEO — termos que direcionamos",
    kicker: "Palavras-chave",
    groups: [
      {
        title: "Serviço geral",
        words: ["site para advogado", "site para advogado autônomo", "landing page para advogado", "presença digital para advogado", "marketing jurídico digital", "captação de clientes para advogado", "estrutura digital para advocacia", "divulgação para advogado", "página profissional para advogado", "site jurídico personalizado"],
      },
      {
        title: "Direito trabalhista",
        words: ["advogado trabalhista site", "site para advogado trabalhista", "captação de clientes advogado trabalhista", "marketing digital advogado trabalhista", "leads para advogado trabalhista", "divulgação advogado trabalhista", "anúncios para advogado trabalhista", "presença digital advogado trabalhista", "site rescisão trabalhista advogado", "tráfego pago advogado trabalhista"],
      },
      {
        title: "Direito do consumidor",
        words: ["advogado direito do consumidor site", "site para advogado consumidor", "captação de clientes advogado consumidor", "marketing digital advogado consumidor", "leads advogado direito do consumidor", "divulgação advogado consumidor", "anúncios para advogado consumidor", "presença digital advogado do consumidor", "tráfego pago advogado consumidor", "site ações contra banco advogado"],
      },
      {
        title: "Conformidade OAB",
        words: ["provimento 205 OAB marketing jurídico", "marketing jurídico permitido pela OAB", "publicidade advocacia OAB", "divulgação advocacia dentro da OAB", "marketing advocacia sem infringir OAB"],
      },
      {
        title: "Dor e intenção de busca",
        words: ["como conseguir clientes sendo advogado autônomo", "como divulgar escritório de advocacia sozinho", "advogado autônomo sem clientes o que fazer", "como aparecer no google sendo advogado", "como ter site sendo advogado sem saber programar", "advogado precisa de site", "vale a pena ter site advogado", "como sair da dependência de indicação advogado", "estrutura digital para escritório de advocacia pequeno", "agência de marketing jurídico para advogado autônomo"],
      },
      {
        title: "Marca e cauda longa",
        words: ["prospher advogados", "prospher marketing jurídico", "captação de clientes qualificados advogado", "anúncios google para advogado", "tráfego para site de advogado"],
      },
    ],
  },
};
