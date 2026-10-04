/*
 * ============================================================
 *  CARDÁPIO DA CONFEITARIA DA THAMI
 *  Este é o único arquivo que você precisa editar no dia a dia:
 *  preços, produtos, número do WhatsApp, avisos e entrega.
 *  Veja o README.md para o passo a passo.
 * ============================================================
 */

window.CONFEITARIA = {
  nome: "Confeitaria da Thami",
  slogan: "Sabor que abraça",
  regiao: "Zona Sul – SP",
  desde: 2016,
  instagram: "confeitariadathami_",

  // Número do WhatsApp que recebe os pedidos.
  // Formato: 55 + DDD + número, só dígitos. Ex.: "5511987654321"
  // CONFIRMAR: enquanto estiver vazio, o botão abre o WhatsApp para a
  // pessoa escolher o contato.
  whatsapp: "",

  // Faixa de aviso no topo do site. Deixe "" para esconder.
  aviso: "Novidade: Brownie Bites, pacotinho de 120g por R$ 12,00",

  entrega: {
    // Taxa fixa em reais (ex.: 8) ou null para combinar pelo WhatsApp.
    taxa: null,
    textoTaxa: "combinada pelo WhatsApp, conforme o bairro",
    // Região atendida, mostrada no formulário de entrega.
    area: "Entregamos na Zona Sul de São Paulo",
    retirada: true,
    textoRetirada: "O endereço de retirada é enviado na confirmação do pedido.",
    // Quantos dias de antecedência para o pedido (0 = pode ser para hoje).
    antecedenciaDias: 1,
    periodos: ["Manhã (9h às 12h)", "Tarde (13h às 18h)", "Noite (18h às 21h)"],
    pedidoMinimo: 0,
  },

  pagamentos: ["Pix", "Cartão", "Dinheiro"],

  sobre: [
    "A Confeitaria da Thami nasceu em 2016, na Zona Sul de São Paulo, pelas mãos da Thamiris Lira: publicitária, criadora de conteúdo e confeiteira.",
    "Os doces são feitos à mão e por encomenda, do brigadeiro tradicional ao morango cravejado. De tempos em tempos tem Festival de Brigadeiros, com mais de dez sabores. Os próximos são anunciados no Instagram.",
  ],

  categorias: [
    { id: "brigadeiros", nome: "Brigadeiros" },
    { id: "morangos", nome: "Morangos e trufas" },
    { id: "brownies", nome: "Brownies e palha italiana" },
    { id: "bolos", nome: "Bolos caseiros" },
    { id: "encomendas", nome: "Encomendas e festas" },
  ],

  /*
   * Cada produto:
   *   id          identificador único, sem espaços
   *   categoria   um dos ids de "categorias" acima
   *   nome        nome que aparece no site
   *   descricao   frase curta
   *   preco       número em reais (ex.: 4.5) ou null para "sob consulta"
   *   unidade     ex.: "unidade", "pacote 120g"
   *   opcoes      (opcional) tamanhos com preços próprios
   *   selo        (opcional) etiqueta, ex.: "Novidade", "Queridinho"
   *   foto        (opcional) caminho da foto, ex.: "img/produtos/brownie.jpg"
   *   ilustracao  desenho usado enquanto não há foto
   *   disponivel  false para mostrar como esgotado
   *
   * Os preços marcados com CONFIRMAR são estimativas. A Thami deve revisar.
   */
  produtos: [
    // ---------- Brigadeiros ----------
    {
      id: "brigadeiro-tradicional",
      categoria: "brigadeiros",
      nome: "Brigadeiro tradicional",
      descricao: "Chocolate de verdade, enrolado à mão e coberto de granulado.",
      preco: 3.0, // CONFIRMAR
      unidade: "unidade",
      ilustracao: "brigadeiro",
    },
    {
      id: "brigadeiro-ninho-nutella",
      categoria: "brigadeiros",
      nome: "Ninho com Nutella",
      descricao: "Brigadeiro de leite Ninho com coração de Nutella.",
      preco: 3.5, // CONFIRMAR
      unidade: "unidade",
      ilustracao: "ninho",
    },
    {
      id: "bicho-de-pe",
      categoria: "brigadeiros",
      nome: "Bicho de pé",
      descricao: "O brigadeiro de morango, passado no açúcar cristal.",
      preco: 3.0, // CONFIRMAR
      unidade: "unidade",
      ilustracao: "bichodepe",
    },
    {
      id: "caixinha-4-brigadeiros",
      categoria: "brigadeiros",
      nome: "Caixinha com 4 brigadeiros",
      descricao: "Quatro sabores sortidos numa caixinha pronta para presentear.",
      preco: 13.0, // CONFIRMAR
      unidade: "caixinha",
      selo: "Para presentear",
      ilustracao: "caixinha",
    },

    // ---------- Morangos e trufas ----------
    {
      id: "morango-cravejado",
      categoria: "morangos",
      nome: "Morango cravejado",
      descricao:
        "Morango fresquinho, Ninho cremoso, chocolate branco e cristais de morango.",
      preco: 6.0, // CONFIRMAR
      unidade: "unidade",
      selo: "Queridinho",
      ilustracao: "morango",
    },
    {
      id: "trufa-morango-cravejado",
      categoria: "morangos",
      nome: "Trufa de morango cravejado",
      descricao:
        "Casquinha de chocolate branco com caramelo triturado, recheada com brigadeiro branco.",
      preco: 4.5, // CONFIRMAR
      unidade: "unidade",
      ilustracao: "trufa",
    },
    {
      id: "morango-do-amor",
      categoria: "morangos",
      nome: "Morango do amor recheado",
      descricao: "Morango com recheio cremoso e casquinha vermelha crocante.",
      preco: 9.0, // CONFIRMAR
      unidade: "unidade",
      ilustracao: "morangodoamor",
    },

    // ---------- Brownies e palha italiana ----------
    {
      id: "brownie-bites",
      categoria: "brownies",
      nome: "Brownie Bites",
      descricao:
        "Pedacinhos de brownie macios, cobertos com chocolate. Para matar a vontade ou dividir, se conseguir.",
      preco: 12.0,
      unidade: "pacote 120g",
      selo: "Novidade",
      ilustracao: "brownie",
    },
    {
      id: "palha-italiana",
      categoria: "brownies",
      nome: "Palha italiana",
      descricao: "Brigadeiro com biscoito, cortado em quadradinhos e passado no açúcar.",
      preco: 8.0, // CONFIRMAR
      unidade: "unidade",
      ilustracao: "palha",
    },

    // ---------- Bolos caseiros ----------
    {
      id: "bolo-de-banana",
      categoria: "bolos",
      nome: "Bolo de banana",
      descricao: "O bolo de banana mais pedido, perfeito para o café da tarde.",
      preco: 35.0, // CONFIRMAR
      unidade: "bolo inteiro",
      ilustracao: "bolo",
    },
    {
      id: "bolo-de-banana-fit",
      categoria: "bolos",
      nome: "Bolo de banana fit",
      descricao: "Versão mais leve, sem abrir mão do sabor.",
      preco: 38.0, // CONFIRMAR
      unidade: "bolo inteiro",
      ilustracao: "bolo",
    },

    // ---------- Encomendas e festas ----------
    {
      id: "pave-abacaxi",
      categoria: "encomendas",
      nome: "Pavê de abacaxi",
      descricao: "Camadas de creme, abacaxi e biscoito. Serve a família toda.",
      unidade: "travessa",
      opcoes: [
        { nome: "Pequeno", preco: 75.0 },
        { nome: "Grande", preco: 160.0 },
      ],
      ilustracao: "pave",
    },
    {
      id: "torta-festa",
      categoria: "encomendas",
      nome: "Torta para festa",
      // CONFIRMAR: nome, sabores e preços (vieram do cardápio de Dia dos Pais).
      descricao: "Torta recheada para a sua comemoração. Sabor a combinar com a Thami.",
      unidade: "torta",
      opcoes: [
        { nome: "10 fatias", preco: 140.0 }, // CONFIRMAR
        { nome: "20 fatias", preco: 250.0 },
      ],
      ilustracao: "fatia",
    },
    {
      id: "doces-de-festa",
      categoria: "encomendas",
      nome: "Doces para festa",
      descricao:
        "Brigadeiros e docinhos para aniversário, chá e casamento. Fale com a Thami para montar o seu.",
      preco: null,
      unidade: "cento",
      ilustracao: "festa",
    },
  ],
};
