/**
 * ============================================================
 *  WM ASSESSORIA — CONTEÚDO DO SITE (edite este arquivo!)
 * ============================================================
 *  TUDO que aparece escrito no site vem daqui: textos, números,
 *  depoimentos, perguntas do FAQ, links e parâmetros da calculadora.
 *
 *  COMO ACHAR O TEXTO QUE VOCÊ QUER MUDAR:
 *  1. Abra o site, copie um pedaço da frase que quer alterar.
 *  2. Abra este arquivo e aperte Ctrl+F (Windows) ou Cmd+F (Mac).
 *  3. Cole a frase → o editor pula direto para a linha certa.
 *  4. Altere só o que está entre aspas "..." e salve.
 *
 *  REGRAS DE OURO:
 *  - Não apague vírgulas, aspas, chaves { } nem colchetes [ ].
 *  - Nos títulos, a palavra entre *asteriscos* fica dourada no site.
 *  - Salvou = atualizou (no site local) ou atualiza no próximo
 *    deploy da Vercel.
 *
 *  FOTOS (é só salvar o arquivo com o nome certo, sem mexer aqui):
 *  - public/images/hero.jpg          → foto grande do topo do site
 *  - public/images/equipe-wesley.jpg → foto do Wesley
 *  - public/images/equipe-mirela.jpg → foto da Mirela
 *  - public/images/obras/qualquer-nome.jpg → entra sozinha na
 *    galeria "Resultados" (o nome do arquivo vira a legenda)
 *
 *  Guia completo no arquivo COMO-EDITAR.md
 * ============================================================
 */

export const site = {
  // ---------- DADOS DA EMPRESA ----------
  empresa: {
    nome: "WM Assessoria",
    cnpj: "66.323.654/0001-64",
    especialistas: "Wesley Pereira e Mirela Rodrigues",
    // Link do WhatsApp com mensagem pré-preenchida (não mude o número sem conferir)
    whatsapp: "https://wa.me/5565999725622",
    whatsappMensagem: "Olá! Quero uma análise gratuita do INSS da minha obra.",
    instagram:
      "https://www.instagram.com/wesley.inssobras?igsh=Y2c3MWpndXJ5MnB1&utm_source=qr",
    // Endereço do site depois de publicado (usado no SEO)
    url: "https://wmassessoria.vercel.app",
  },

  // ---------- TOPO DO SITE (HERO) ----------
  hero: {
    eyebrow: "Regularização de INSS de Obras · Brasil inteiro",
    // A palavra entre *asteriscos* fica DOURADA no título
    titulo: "Você pode estar pagando INSS *a mais* na sua obra",
    subtitulo:
      "Análise gratuita com especialistas que já reduziram mais de R$ 500.000 em INSS de obras — com casos de redução total.",
    botaoPrincipal: "Calcular minha economia",
    botaoWhatsApp: "Falar no WhatsApp",
  },

  // ---------- BARRA DE PROVA (contadores animados) ----------
  prova: {
    numeros: [
      { valor: 5, prefixo: "+", sufixo: " anos", rotulo: "de mercado" },
      { valor: 500000, prefixo: "+R$ ", sufixo: "", rotulo: "reduzidos em INSS de obras", moeda: true },
      { valor: 100, prefixo: "", sufixo: "%", rotulo: "de redução em alguns casos" },
    ],
    nota: "com acompanhamento e estratégia corretos",
  },

  // ---------- COMO FUNCIONA (3 etapas) ----------
  comoFunciona: {
    eyebrow: "Como funciona",
    titulo: "Da obra irregular à *CND* em três etapas",
    etapas: [
      {
        numero: "01",
        codigo: "CNO",
        titulo: "Regularização do cadastro",
        texto:
          "Inscrevemos ou ajustamos o Cadastro Nacional de Obras (CNO) da sua obra na Receita Federal — o primeiro passo para qualquer regularização.",
      },
      {
        numero: "02",
        codigo: "SERO · DCTFWeb",
        titulo: "Apuração correta",
        texto:
          "Fazemos a aferição da obra no SERO com a estratégia certa: cada metro quadrado, período e nota fiscal contam para reduzir o valor devido.",
      },
      {
        numero: "03",
        codigo: "CND ✓",
        titulo: "Certidão liberada",
        texto:
          "Com o INSS apurado (e reduzido) e quitado, emitimos a Certidão Negativa de Débitos — pronta para averbar a obra no cartório.",
      },
    ],
  },

  // ---------- SERVIÇOS (6 cards) ----------
  servicos: {
    eyebrow: "Serviços",
    titulo: "Especialistas em *INSS de obras* — do cadastro à certidão",
    lista: [
      {
        icone: "reducao", // não mude (define o desenho do ícone)
        titulo: "Redução de INSS de Obras",
        texto:
          "Para pessoa física, empresas e licitações: apuramos sua obra com a estratégia certa e você paga só o que é devido — já reduzimos mais de R$ 500 mil.",
      },
      {
        icone: "acompanhamento",
        titulo: "Acompanhamento de Obras em Andamento",
        texto:
          "Começou a construir? Acompanhando a obra desde o início, cada nota fiscal e contrato vira economia na apuração final.",
      },
      {
        icone: "decadencia",
        titulo: "Decadência de Obra",
        texto:
          "Obra concluída há mais de 5 anos pode ter o débito extinto por decadência — em muitos casos, a CND sai sem pagar nada de INSS.",
      },
      {
        icone: "cnd",
        titulo: "Emissão de CND",
        texto:
          "A certidão que destrava sua obra: sem ela não há averbação no cartório, venda ou financiamento. Cuidamos de tudo até a emissão.",
      },
      {
        icone: "consultoria",
        titulo: "Consultoria Especializada",
        texto:
          "Dúvidas sobre CNO, SERO, DCTFWeb ou notificações da Receita? Atendimento direto com os especialistas, sem juridiquês.",
      },
      {
        icone: "analise",
        titulo: "Análise Gratuita",
        texto:
          "Envie os dados da sua obra e receba uma avaliação inicial sem custo: quanto você deve hoje e quanto dá para reduzir.",
      },
    ],
  },

  // ---------- CALCULADORA ----------
  calculadora: {
    eyebrow: "Calculadora gratuita",
    titulo: "Quanto de INSS a Receita vai cobrar da *sua obra*?",
    subtitulo:
      "Simule em 1 minuto pela mesma lógica de aferição da Receita Federal (SERO) e descubra quanto você pode economizar.",
    /**
     * O CÁLCULO É EXATO: usa as mesmas tabelas oficiais da calculadora
     * da WM no Simulador de INSS de Obras (VAU por estado, fator social,
     * percentuais por destinação/material/categoria, alíquota por regime).
     * As tabelas ficam no arquivo content/tabelas-sero.ts — em geral você
     * não precisa mexer nelas.
     *
     * Aqui ficam só os ajustes de marketing:
     */
    parametros: {
      // Estado que já vem selecionado quando a pessoa abre a calculadora
      ufPadrao: "MT - Mato Grosso",
      // Faixa de economia potencial mostrada ao lead (mín. e máx., em %)
      economiaMinima: 0.4,
      economiaMaxima: 1.0,
      // Obras concluídas há mais de X anos podem ter decadência
      anosDecadencia: 5,
    },
    disclaimer:
      "Estimativa baseada na lógica de aferição indireta da Receita Federal (SERO). A apuração real exige análise personalizada da sua obra.",
    lgpd: "Autorizo o contato da WM Assessoria pelo WhatsApp informado.",
  },

  // ---------- RESULTADOS REAIS ----------
  resultados: {
    eyebrow: "Resultados reais",
    titulo: "Quem regularizou com a WM *economizou*",
    depoimentos: [
      {
        nome: "Igor",
        tipoObra: "Obra PJ",
        destaque: "100% de redução",
        valor: "R$ 70.000 economizados",
        texto:
          "Com o acompanhamento e a estratégia corretos, a obra foi regularizada com redução total do INSS lançado.",
      },
      {
        nome: "Renan",
        tipoObra: "Obra PF",
        destaque: "R$ 10.000 reduzidos",
        valor: "na apuração da obra",
        texto:
          "A aferição correta no SERO trouxe uma economia que ele nem sabia que era possível.",
      },
      {
        nome: "Maicon",
        tipoObra: "Obra PF",
        destaque: "R$ 22.500 reduzidos",
        valor: "na regularização",
        texto:
          "Obra regularizada, CND emitida e imóvel liberado para averbação no cartório.",
      },
    ],
    antesDepois: {
      descricao: "Residência de 180 m²",
      antes: "R$ 18.500",
      depois: "R$ 5.200",
      legenda: "INSS apurado antes e depois da estratégia da WM",
    },
    disclaimer:
      "Cada obra é única. Os valores dependem de avaliação personalizada.",
  },

  // ---------- O RISCO DE NÃO REGULARIZAR ----------
  riscos: {
    eyebrow: "O custo de esperar",
    titulo: "O que acontece se a obra *não* for regularizada",
    itens: [
      {
        titulo: "Imóvel travado no cartório",
        texto:
          "Sem a CND, a obra não é averbada na matrícula — e o imóvel não pode ser vendido nem financiado.",
      },
      {
        titulo: "A Receita calcula por você (e para mais)",
        texto:
          "Sem declaração, o débito é lançado por aferição indireta — um valor padrão por m² que quase sempre é maior que o devido.",
      },
      {
        titulo: "Multas de até 75% + juros Selic",
        texto:
          "Sobre o valor lançado incidem multa de ofício e juros pela Selic, que acumulam mês a mês enquanto você espera.",
      },
      {
        titulo: "Dívida ativa e execução fiscal",
        texto:
          "O débito não pago vira inscrição em dívida ativa, com risco de execução fiscal e restrições no CPF ou CNPJ.",
      },
    ],
    alivio:
      "Quanto antes regularizar, menor o custo. Faça a análise gratuita e saiba exatamente onde sua obra está.",
    botao: "Fazer análise gratuita",
  },

  // ---------- QUEM SOMOS ----------
  quemSomos: {
    eyebrow: "Quem somos",
    titulo: "Atendimento direto com os *especialistas*",
    texto:
      "A WM Assessoria é conduzida por Wesley Pereira e Mirela Rodrigues, especialistas em INSS de obras com mais de 5 anos de mercado. Aqui não tem intermediário: quem analisa e conduz a sua obra são os próprios especialistas — do primeiro contato à emissão da CND. Atendemos todo o Brasil de forma online, com presença em Araras-SP e em todo o Mato Grosso.",
    pessoas: [
      {
        nome: "Wesley Pereira",
        cargo: "Especialista em INSS de Obras",
        // Coloque a foto em public/images/equipe-wesley.jpg
        foto: "/images/equipe-wesley.jpg",
      },
      {
        nome: "Mirela Rodrigues",
        cargo: "Especialista em INSS de Obras",
        // Coloque a foto em public/images/equipe-mirela.jpg
        foto: "/images/equipe-mirela.jpg",
      },
    ],
    chips: ["+5 anos de mercado", "Atuação nacional", "PF · PJ · Licitações"],
  },

  // ---------- FAQ (perguntas frequentes) ----------
  faq: {
    eyebrow: "Perguntas frequentes",
    titulo: "Tire suas dúvidas sobre *INSS de obras*",
    perguntas: [
      {
        pergunta: "O que é a CND de obra e por que preciso dela?",
        resposta:
          "A CND (Certidão Negativa de Débitos) comprova que o INSS da construção foi apurado e quitado. Sem ela, o cartório não averba a obra na matrícula do imóvel — o que impede vender, financiar ou usar o imóvel como garantia. É o documento que 'destrava' a sua construção.",
      },
      {
        pergunta: "Construí há muitos anos e nunca regularizei. E agora?",
        resposta:
          "Pode ser uma ótima notícia: obras concluídas há mais de 5 anos podem ter o débito extinto por decadência — em muitos casos a CND sai sem pagar nada de INSS. É preciso comprovar a data de conclusão com a estratégia certa. Fale conosco para avaliar o seu caso gratuitamente.",
      },
      {
        pergunta: "Obra de pessoa física também paga INSS?",
        resposta:
          "Sim. Qualquer obra de construção civil — inclusive a casa própria construída por pessoa física — gera contribuição previdenciária sobre a mão de obra utilizada. A diferença é que, com a apuração correta, o valor pode cair drasticamente em relação ao que a Receita lançaria sozinha.",
      },
      {
        pergunta: "Quanto custa regularizar a minha obra?",
        resposta:
          "Depende do tamanho, do tipo e da situação da obra — por isso a primeira análise é gratuita. Você nos envia os dados, calculamos o cenário atual e apresentamos quanto dá para reduzir antes de qualquer contratação.",
      },
      {
        pergunta: "O que é o CNO?",
        resposta:
          "O Cadastro Nacional de Obras é o registro da sua construção na Receita Federal (substituiu a antiga matrícula CEI). Toda obra precisa estar inscrita no CNO para ser regularizada — é a primeira etapa do nosso trabalho.",
      },
      {
        pergunta: "O que é o SERO e a aferição indireta?",
        resposta:
          "O SERO é o sistema da Receita que calcula o INSS da obra. Quando não há documentação, ele 'afere' a mão de obra por um valor padrão por metro quadrado (aferição indireta) — quase sempre maior que o real. Nossa estratégia usa as regras do próprio sistema (notas fiscais, contratos, período da obra, tipo de construção) para reduzir legalmente o valor.",
      },
      {
        pergunta: "O que acontece se eu vender o imóvel sem CND?",
        resposta:
          "Na prática, a venda trava: o comprador não consegue financiamento e o cartório não transfere a matrícula com a obra não averbada. Além disso, o débito continua existindo e crescendo com multa e juros — e pode alcançar o vendedor mesmo depois do negócio.",
      },
      {
        pergunta: "Em quanto tempo sai a CND?",
        resposta:
          "Depende da situação da obra. Casos simples, com documentação em ordem, podem ser resolvidos em poucas semanas; casos com pendências ou notificações levam mais tempo. Na análise gratuita já conseguimos estimar o prazo do seu caso.",
      },
      {
        pergunta: "Vocês atendem a minha cidade?",
        resposta:
          "Sim — atendemos todo o Brasil de forma 100% online, com a mesma qualidade do atendimento presencial. Todo o processo (CNO, SERO, DCTFWeb e CND) é eletrônico junto à Receita Federal.",
      },
      {
        pergunta: "A redução do INSS é legal?",
        resposta:
          "Totalmente. Não se trata de 'jeitinho': usamos as regras da própria legislação (IN RFB nº 2.021/2021) — abatimento de notas fiscais, enquadramento correto do tipo de obra, decadência e demais direitos que a maioria dos contribuintes simplesmente não conhece.",
      },
    ],
  },

  // ---------- CHAMADA FINAL ----------
  ctaFinal: {
    titulo: "Descubra quanto você pode *economizar*",
    subtitulo:
      "Deixe seu nome e WhatsApp: um especialista analisa sua obra gratuitamente e responde ainda hoje.",
    botao: "Quero minha análise gratuita",
  },

  // ---------- RODAPÉ ----------
  rodape: {
    avisoLegal:
      "Os resultados apresentados dependem de análise individual de cada obra. Nenhum valor de economia é prometido antes da avaliação personalizada.",
    atendimento: "Atendemos todo o Brasil · Araras-SP · Mato Grosso",
  },

  // ---------- SEO (títulos que aparecem no Google) ----------
  seo: {
    titulo: "WM Assessoria · Redução de INSS de Obras e Emissão de CND",
    descricao:
      "Especialistas em INSS de obras: redução para PF, PJ e licitações, regularização de obra, CNO, SERO, decadência e emissão de CND. Mais de R$ 500 mil já reduzidos. Atendemos todo o Brasil — Araras-SP, Cuiabá-MT e Mato Grosso.",
    palavrasChave: [
      "INSS de obras",
      "CND de obra",
      "regularização de obra",
      "decadência de obra",
      "CNO",
      "SERO",
      "reduzir INSS de obra",
      "Araras-SP",
      "Cuiabá-MT",
      "Mato Grosso",
      "Brasil",
    ],
  },
};

export type Site = typeof site;
