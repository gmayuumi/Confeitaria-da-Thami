(function () {
  "use strict";

  var C = window.CONFEITARIA;
  var CHAVE_SACOLA = "thami-sacola-v1";
  var CHAVE_CLIENTE = "thami-cliente-v1";

  var real = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  var dinheiro = function (v) { return real.format(v).replace(/ /g, " "); };

  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };

  var produtosPorId = {};
  C.produtos.forEach(function (p) { produtosPorId[p.id] = p; });

  var ICONE_MAIS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
  var ICONE_MENOS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';

  function escapar(txt) {
    return String(txt).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function ler(chave, padrao) {
    try {
      var v = localStorage.getItem(chave);
      return v ? JSON.parse(v) : padrao;
    } catch (e) {
      return padrao;
    }
  }

  function gravar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* navegação privada */ }
  }

  /* ---------- Preços e opções ---------- */

  function opcaoDe(produto, nomeOpcao) {
    if (!produto.opcoes) return null;
    for (var i = 0; i < produto.opcoes.length; i++) {
      if (produto.opcoes[i].nome === nomeOpcao) return produto.opcoes[i];
    }
    return null;
  }

  function precoDe(produto, nomeOpcao) {
    var op = opcaoDe(produto, nomeOpcao);
    return op ? op.preco : produto.preco;
  }

  /* ---------- Sacola ---------- */

  // Cada linha: { id, opcao, qtd }. Linhas de produtos removidos do cardápio são descartadas.
  var sacola = ler(CHAVE_SACOLA, []).filter(function (l) {
    var p = produtosPorId[l.id];
    if (!p || p.disponivel === false || precoDe(p, l.opcao) == null) return false;
    if (p.opcoes && !opcaoDe(p, l.opcao)) return false;
    return l.qtd > 0;
  });

  function linha(id, opcao) {
    for (var i = 0; i < sacola.length; i++) {
      if (sacola[i].id === id && (sacola[i].opcao || null) === (opcao || null)) return sacola[i];
    }
    return null;
  }

  function mudarQtd(id, opcao, delta) {
    var l = linha(id, opcao);
    if (!l && delta > 0) {
      l = { id: id, opcao: opcao || null, qtd: 0 };
      sacola.push(l);
    }
    if (!l) return;
    l.qtd = Math.min(999, l.qtd + delta);
    if (l.qtd <= 0) sacola.splice(sacola.indexOf(l), 1);
    gravar(CHAVE_SACOLA, sacola);
    atualizarTudo();
    if (delta > 0) {
      var cont = $("[data-contador]");
      cont.classList.remove("pulou");
      void cont.offsetWidth;
      cont.classList.add("pulou");
    }
  }

  function totalItens() {
    return sacola.reduce(function (s, l) { return s + l.qtd; }, 0);
  }

  function subtotal() {
    return sacola.reduce(function (s, l) {
      return s + precoDe(produtosPorId[l.id], l.opcao) * l.qtd;
    }, 0);
  }

  function taxaEntrega() {
    var modo = ($("input[name=modo]:checked") || {}).value;
    if (modo !== "Entrega") return 0;
    return typeof C.entrega.taxa === "number" ? C.entrega.taxa : null;
  }

  /* ---------- Ilustração ou foto ---------- */

  function imagem(produto, classe) {
    var dentro = produto.foto
      ? '<img src="' + escapar(produto.foto) + '" alt="" loading="lazy">'
      : '<svg viewBox="0 0 100 100"><use href="#ilu-' + escapar(produto.ilustracao || "brigadeiro") + '"/></svg>';
    return '<span class="forminha ' + (classe || "") + '" aria-hidden="true">' + dentro + "</span>";
  }

  /* ---------- Cardápio ---------- */

  function montarCardapio() {
    var nav = $("[data-categorias]");
    var lista = $("[data-lista]");
    var htmlNav = "";
    var htmlLista = "";

    C.categorias.forEach(function (cat) {
      var itens = C.produtos.filter(function (p) { return p.categoria === cat.id; });
      if (!itens.length) return;
      htmlNav += '<a href="#cat-' + cat.id + '" data-cat="' + cat.id + '">' + escapar(cat.nome) + "</a>";
      htmlLista +=
        '<section class="categoria" id="cat-' + cat.id + '" aria-labelledby="titulo-' + cat.id + '">' +
        '<h3 id="titulo-' + cat.id + '">' + escapar(cat.nome) + "</h3>" +
        '<ul class="itens">' + itens.map(itemHtml).join("") + "</ul></section>";
    });

    nav.innerHTML = htmlNav;
    lista.innerHTML = htmlLista;

    lista.addEventListener("click", function (ev) {
      var btn = ev.target.closest("button[data-acao]");
      if (!btn) return;
      var item = btn.closest(".item");
      var id = item.getAttribute("data-id");
      var produto = produtosPorId[id];
      var acao = btn.getAttribute("data-acao");
      if (acao === "orcamento") {
        abrirWhatsApp("Olá, Thami! Quero um orçamento de " + produto.nome + ".");
        return;
      }
      var opcao = opcaoSelecionada(item);
      var tinhaFoco = acao === "menos" && linha(id, opcao) && linha(id, opcao).qtd === 1;
      mudarQtd(id, opcao, acao === "menos" ? -1 : 1);
      // Mantém o foco do teclado no controle que substituiu o botão clicado.
      var alvo = tinhaFoco ? $('[data-acao="mais"]', item) : $('[data-acao="' + acao + '"]', item) || $('[data-acao="mais"]', item);
      if (alvo) alvo.focus();
    });

    lista.addEventListener("change", function (ev) {
      if (ev.target.matches(".opcoes input")) atualizarItem(ev.target.closest(".item"));
    });

    observarCategorias();
  }

  function itemHtml(p) {
    var preco = p.preco == null && !p.opcoes ? "Sob consulta" : precoHtml(p, p.opcoes ? p.opcoes[0].nome : null);

    var opcoes = "";
    if (p.opcoes) {
      opcoes = '<fieldset class="opcoes"><legend>Tamanho de ' + escapar(p.nome) + "</legend>" +
        p.opcoes.map(function (o, i) {
          return '<label><input type="radio" name="op-' + p.id + '" value="' + escapar(o.nome) + '"' + (i === 0 ? " checked" : "") + ">" +
            "<span>" + escapar(o.nome) + "</span></label>";
        }).join("") + "</fieldset>";
    }

    return (
      '<li class="item" data-id="' + p.id + '">' +
      imagem(p, "item-foto") +
      "<div>" +
      '<h4 class="item-nome">' + escapar(p.nome) + (p.selo ? ' <span class="selo">' + escapar(p.selo) + "</span>" : "") + "</h4>" +
      (p.descricao ? '<p class="item-desc">' + escapar(p.descricao) + "</p>" : "") +
      "</div>" +
      opcoes +
      '<div class="item-baixo">' +
      '<p class="item-preco" data-preco>' + preco + "</p>" +
      '<div class="item-acao" data-acao-area></div>' +
      "</div></li>"
    );
  }

  function precoHtml(p, opcao) {
    return dinheiro(precoDe(p, opcao)) + (p.unidade ? " <small>" + escapar(p.unidade) + "</small>" : "");
  }

  function opcaoSelecionada(item) {
    var marcado = $(".opcoes input:checked", item);
    return marcado ? marcado.value : null;
  }

  function atualizarItem(item) {
    var id = item.getAttribute("data-id");
    var p = produtosPorId[id];
    var area = $("[data-acao-area]", item);
    var nome = escapar(p.nome);

    if (p.disponivel === false) {
      area.innerHTML = '<span class="esgotado">Esgotado</span>';
      return;
    }
    if (p.preco == null && !p.opcoes) {
      area.innerHTML = '<button class="botao botao-linha botao-add" type="button" data-acao="orcamento">Pedir orçamento</button>';
      return;
    }

    var opcao = opcaoSelecionada(item);
    if (opcao) $("[data-preco]", item).innerHTML = precoHtml(p, opcao);
    var l = linha(id, opcao);
    var rotulo = nome + (opcao ? ", " + escapar(opcao) : "");

    if (!l) {
      area.innerHTML = '<button class="botao botao-primario botao-add" type="button" data-acao="mais" aria-label="Adicionar ' + rotulo + ' à sacola">' + ICONE_MAIS + "Adicionar</button>";
    } else {
      area.innerHTML =
        '<div class="qtd" role="group" aria-label="Quantidade de ' + rotulo + '">' +
        '<button type="button" data-acao="menos" aria-label="Tirar um">' + ICONE_MENOS + "</button>" +
        '<output aria-live="polite">' + l.qtd + "</output>" +
        '<button type="button" data-acao="mais" aria-label="Pôr mais um">' + ICONE_MAIS + "</button></div>";
    }
  }

  function observarCategorias() {
    var links = $$("[data-categorias] a");
    if (!links.length) return;
    links[0].setAttribute("aria-current", "true");
    if (!("IntersectionObserver" in window)) return;
    var visiveis = {};
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { visiveis[e.target.id] = e.isIntersecting; });
      var atual = null;
      for (var i = 0; i < C.categorias.length; i++) {
        if (visiveis["cat-" + C.categorias[i].id]) { atual = C.categorias[i].id; break; }
      }
      if (!atual) return;
      links.forEach(function (a) {
        var ativo = a.getAttribute("data-cat") === atual;
        a.setAttribute("aria-current", ativo ? "true" : "false");
        if (ativo && a.parentNode.scrollWidth > a.parentNode.clientWidth) {
          a.parentNode.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" });
        }
      });
    }, { rootMargin: "-140px 0px -55% 0px" });
    $$(".categoria").forEach(function (s) { obs.observe(s); });
  }

  /* ---------- Gaveta da sacola ---------- */

  var gaveta = $("#sacola");
  var fundo = $("[data-fundo]");
  var ultimoFoco = null;
  var etapaAtual = "itens";

  function abrirSacola() {
    ultimoFoco = document.activeElement;
    gaveta.hidden = false;
    fundo.hidden = false;
    document.body.classList.add("travado");
    $$('[aria-controls="sacola"]').forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
    mostrarEtapa(etapaAtual === "enviado" ? "enviado" : "itens");
  }

  function fecharSacola() {
    gaveta.hidden = true;
    fundo.hidden = true;
    document.body.classList.remove("travado");
    $$('[aria-controls="sacola"]').forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    if (ultimoFoco && document.contains(ultimoFoco)) ultimoFoco.focus();
  }

  function mostrarEtapa(nome) {
    etapaAtual = nome;
    $$(".etapa", gaveta).forEach(function (e) { e.hidden = e.getAttribute("data-etapa") !== nome; });
    $("[data-voltar]").hidden = nome !== "dados";
    $("[data-sacola-titulo]").textContent =
      nome === "dados" ? "Entrega e pagamento" : nome === "enviado" ? "Pedido pronto" : "Sua sacola";
    $("[data-sacola-titulo]").focus();
    var corpo = $('[data-etapa="' + nome + '"] .sacola-corpo');
    if (corpo) corpo.scrollTop = 0;
  }

  function prenderFoco(ev) {
    if (ev.key !== "Tab" || gaveta.hidden) return;
    var focaveis = $$("a[href], button:not([disabled]), input, select, textarea, [tabindex='-1']", gaveta).filter(function (el) {
      return el.offsetParent !== null && el.getAttribute("tabindex") !== "-1";
    });
    if (!focaveis.length) return;
    var primeiro = focaveis[0];
    var ultimo = focaveis[focaveis.length - 1];
    if (ev.shiftKey && (document.activeElement === primeiro || !gaveta.contains(document.activeElement))) {
      ev.preventDefault();
      ultimo.focus();
    } else if (!ev.shiftKey && document.activeElement === ultimo) {
      ev.preventDefault();
      primeiro.focus();
    }
  }

  function montarItensSacola() {
    var ul = $("[data-sacola-itens]");
    ul.innerHTML = sacola.map(function (l, i) {
      var p = produtosPorId[l.id];
      var nome = escapar(p.nome);
      var detalhe = l.opcao ? escapar(l.opcao) : dinheiro(p.preco) + (p.unidade ? " / " + escapar(p.unidade) : "");
      return (
        '<li class="sacola-item" data-i="' + i + '">' +
        imagem(p) +
        '<p class="sacola-item-nome">' + nome + "<small>" + detalhe + "</small></p>" +
        '<p class="sacola-item-preco">' + dinheiro(precoDe(p, l.opcao) * l.qtd) + "</p>" +
        '<div class="qtd" role="group" aria-label="Quantidade de ' + nome + '">' +
        '<button type="button" data-s="menos" aria-label="Tirar um">' + ICONE_MENOS + "</button>" +
        '<output aria-live="polite">' + l.qtd + "</output>" +
        '<button type="button" data-s="mais" aria-label="Pôr mais um">' + ICONE_MAIS + "</button></div>" +
        '<button class="remover" type="button" data-s="remover">Remover</button>' +
        "</li>"
      );
    }).join("");
  }

  $("[data-sacola-itens]").addEventListener("click", function (ev) {
    var btn = ev.target.closest("button[data-s]");
    if (!btn) return;
    var li = btn.closest(".sacola-item");
    var i = Number(li.getAttribute("data-i"));
    var l = sacola[i];
    var acao = btn.getAttribute("data-s");
    var delta = acao === "mais" ? 1 : acao === "menos" ? -1 : -l.qtd;
    var some = l.qtd + delta <= 0;
    mudarQtd(l.id, l.opcao, delta);
    // Depois de redesenhar, devolve o foco para um lugar que ainda existe.
    var novo = $('.sacola-item[data-i="' + (some ? Math.min(i, sacola.length - 1) : i) + '"]');
    var alvo = novo && (some ? $('[data-s="mais"]', novo) : $('[data-s="' + acao + '"]', novo));
    (alvo || $("[data-sacola-titulo]")).focus();
  });

  /* ---------- Atualização geral ---------- */

  function atualizarTudo() {
    var n = totalItens();
    var sub = subtotal();

    $("[data-contador]").textContent = n;
    $(".botao-sacola").setAttribute("aria-label", "Sacola, " + n + (n === 1 ? " item" : " itens"));
    $("[data-barra]").hidden = n === 0;
    document.body.classList.toggle("tem-itens", n > 0);
    $("[data-barra-resumo]").textContent = n + (n === 1 ? " item, " : " itens, ") + dinheiro(sub);

    $$(".item").forEach(atualizarItem);

    montarItensSacola();
    $("[data-sacola-vazia]").hidden = n > 0;
    $("[data-sacola-pe]").hidden = n === 0;
    $$("[data-subtotal]").forEach(function (el) { el.textContent = dinheiro(sub); });

    var minimo = C.entrega.pedidoMinimo || 0;
    var abaixo = sub < minimo;
    var aviso = $("[data-minimo]");
    aviso.hidden = !abaixo;
    aviso.textContent = abaixo ? "O pedido mínimo é de " + dinheiro(minimo) + ". Faltam " + dinheiro(minimo - sub) + "." : "";
    $("[data-continuar]").disabled = abaixo;

    atualizarTotal();

    if (n === 0 && etapaAtual === "dados") mostrarEtapa("itens");
  }

  function atualizarTotal() {
    var sub = subtotal();
    var taxa = taxaEntrega();
    var modo = ($("input[name=modo]:checked") || {}).value;
    $("[data-taxa]").textContent =
      modo === "Retirada" ? "Retirada, sem taxa" : taxa == null ? "a combinar" : dinheiro(taxa);
    $("[data-total]").textContent = dinheiro(sub + (taxa || 0)) + (taxa == null && modo !== "Retirada" ? " + entrega" : "");
  }

  /* ---------- Formulário ---------- */

  var form = $('[data-etapa="dados"]');

  function hojeMais(dias) {
    var d = new Date();
    d.setDate(d.getDate() + dias);
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var dia = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + dia;
  }

  function dataLegivel(iso) {
    var partes = iso.split("-").map(Number);
    var d = new Date(partes[0], partes[1] - 1, partes[2]);
    var semana = d.toLocaleDateString("pt-BR", { weekday: "long" });
    return semana + ", " + String(partes[2]).padStart(2, "0") + "/" + String(partes[1]).padStart(2, "0");
  }

  function montarFormulario() {
    var e = C.entrega;
    $("[data-area]").textContent = e.area + ". Taxa de entrega " + (typeof e.taxa === "number" ? "de " + dinheiro(e.taxa) + "." : e.textoTaxa + ".");
    $("[data-retirada-texto]").textContent = e.textoRetirada;
    if (!e.retirada) $("[data-op-retirada]").hidden = true;

    $("#f-data").min = hojeMais(e.antecedenciaDias || 0);
    $("#f-periodo").innerHTML = e.periodos.map(function (p) {
      return "<option>" + escapar(p) + "</option>";
    }).join("");

    $("[data-pagamentos]").innerHTML = C.pagamentos.map(function (p) {
      return '<label class="escolha"><input type="radio" name="pagamento" value="' + escapar(p) + '"><span>' + escapar(p) + "</span></label>";
    }).join("");

    // Lembra os dados de quem já pediu antes.
    var cliente = ler(CHAVE_CLIENTE, {});
    ["nome", "endereco", "bairro", "cep", "complemento"].forEach(function (k) {
      if (cliente[k]) form.elements[k].value = cliente[k];
    });

    form.addEventListener("change", function (ev) {
      if (ev.target.name === "modo") {
        var entrega = ev.target.value === "Entrega";
        $('[data-bloco="entrega"]').hidden = !entrega;
        $('[data-bloco="retirada"]').hidden = entrega;
        atualizarTotal();
      }
      if (ev.target.name === "pagamento") {
        $('[data-bloco="troco"]').hidden = ev.target.value !== "Dinheiro";
        mostrarErro("pagamento", "");
      }
    });

    form.addEventListener("input", function (ev) {
      if (ev.target.getAttribute("aria-invalid") === "true") mostrarErro(ev.target.name, "");
      if (ev.target.name === "cep") {
        var d = ev.target.value.replace(/\D/g, "").slice(0, 8);
        ev.target.value = d.length > 5 ? d.slice(0, 5) + "-" + d.slice(5) : d;
      }
    });

    form.addEventListener("submit", enviarPedido);
  }

  function mostrarErro(campo, msg) {
    var el = $('[data-erro="' + campo + '"]', form);
    if (el) el.textContent = msg;
    var input = form.elements[campo];
    if (input && input.setAttribute) {
      if (msg) {
        input.setAttribute("aria-invalid", "true");
        if (el) { el.id = "erro-" + campo; input.setAttribute("aria-describedby", el.id); }
      } else {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
      }
    }
  }

  function validar() {
    var f = form.elements;
    var entrega = f.modo.value === "Entrega";
    var erros = [];
    var checar = function (campo, ok, msg) {
      mostrarErro(campo, ok ? "" : msg);
      if (!ok) erros.push(campo);
    };

    checar("nome", f.nome.value.trim().length > 1, "Diga seu nome para a Thami saber de quem é o pedido.");
    if (entrega) {
      checar("endereco", f.endereco.value.trim().length > 3, "Informe a rua e o número para a entrega.");
      checar("bairro", f.bairro.value.trim().length > 1, "Informe o bairro.");
    } else {
      mostrarErro("endereco", "");
      mostrarErro("bairro", "");
    }
    var min = f.data.min;
    if (!f.data.value) checar("data", false, "Escolha o dia do pedido.");
    else checar("data", f.data.value >= min, "Escolha a partir de " + dataLegivel(min) + ".");
    checar("pagamento", !!f.pagamento.value, "Escolha como vai pagar.");

    if (erros.length) {
      var primeiro = erros[0] === "pagamento" ? $('input[name="pagamento"]', form) : f[erros[0]];
      primeiro.focus();
    }
    return !erros.length;
  }

  function montarMensagem() {
    var f = form.elements;
    var entrega = f.modo.value === "Entrega";
    var taxa = taxaEntrega();
    var sub = subtotal();
    var linhas = [];

    linhas.push("Olá, Thami! Quero fazer um pedido pelo site 🍓");
    linhas.push("");
    linhas.push("*Pedido*");
    sacola.forEach(function (l) {
      var p = produtosPorId[l.id];
      linhas.push(l.qtd + "x " + p.nome + (l.opcao ? " (" + l.opcao + ")" : "") + " — " + dinheiro(precoDe(p, l.opcao) * l.qtd));
    });
    linhas.push("");
    linhas.push("*Subtotal:* " + dinheiro(sub));
    if (entrega) {
      linhas.push("*Entrega:* " + (taxa == null ? "a combinar" : dinheiro(taxa)));
      linhas.push("*Total:* " + dinheiro(sub + (taxa || 0)) + (taxa == null ? " + entrega" : ""));
    } else {
      linhas.push("*Total:* " + dinheiro(sub));
    }
    linhas.push("");
    linhas.push("*Nome:* " + f.nome.value.trim());
    linhas.push("*Receber:* " + f.modo.value);
    if (entrega) {
      var end = f.endereco.value.trim() + ", " + f.bairro.value.trim();
      if (f.complemento.value.trim()) end += " (" + f.complemento.value.trim() + ")";
      if (f.cep.value.trim()) end += ", CEP " + f.cep.value.trim();
      linhas.push("*Endereço:* " + end);
    }
    linhas.push("*Para quando:* " + dataLegivel(f.data.value) + ", " + f.periodo.value.toLowerCase());
    var pag = f.pagamento.value;
    if (pag === "Dinheiro" && f.troco.value.trim()) pag += " (troco para " + f.troco.value.trim() + ")";
    linhas.push("*Pagamento:* " + pag);
    if (f.obs.value.trim()) {
      linhas.push("");
      linhas.push("*Observações:* " + f.obs.value.trim());
    }
    return linhas.join("\n");
  }

  function linkWhatsApp(texto) {
    var numero = String(C.whatsapp || "").replace(/\D/g, "");
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(texto);
  }

  function abrirWhatsApp(texto) {
    var url = linkWhatsApp(texto);
    var janela = window.open(url, "_blank", "noopener");
    if (!janela) window.location.href = url;
    return url;
  }

  function enviarPedido(ev) {
    ev.preventDefault();
    if (!validar()) return;
    var f = form.elements;
    gravar(CHAVE_CLIENTE, {
      nome: f.nome.value.trim(),
      endereco: f.endereco.value.trim(),
      bairro: f.bairro.value.trim(),
      cep: f.cep.value.trim(),
      complemento: f.complemento.value.trim(),
    });
    var url = abrirWhatsApp(montarMensagem());
    $("[data-reabrir]").href = url;
    mostrarEtapa("enviado");
  }

  /* ---------- Textos vindos do cardápio ---------- */

  function preencherTextos() {
    if (C.aviso) {
      $("#aviso").textContent = C.aviso.replace(/R\$ /g, "R$\u00a0");
      $("#aviso").hidden = false;
    }
    var dias = C.entrega.antecedenciaDias || 0;
    $("[data-antecedencia]").textContent = dias
      ? "Pedidos com pelo menos " + dias + (dias === 1 ? " dia" : " dias") + " de antecedência."
      : "Pedidos para hoje ou para os próximos dias.";
    $("[data-sobre]").innerHTML = C.sobre.map(function (p) { return "<p>" + escapar(p) + "</p>"; }).join("");

    var insta = "https://www.instagram.com/" + C.instagram + "/";
    $$("[data-instagram]").forEach(function (a) {
      a.href = insta;
      a.target = "_blank";
      a.rel = "noopener";
    });
    $("[data-instagram-nome]").textContent = "Siga @" + C.instagram + " no Instagram";

    var zap = $("[data-whatsapp-link]");
    zap.href = linkWhatsApp("Olá, Thami! Vim pelo site.");
    zap.target = "_blank";
    zap.rel = "noopener";

    $$("[data-orcamento]").forEach(function (a) {
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        abrirWhatsApp("Olá, Thami! Quero um orçamento de doces para uma festa.\n\n*Data:* \n*Número de convidados:* \n*Sabores preferidos:* ");
      });
    });

    if (!String(C.whatsapp || "").replace(/\D/g, "")) {
      console.warn("Confeitaria da Thami: defina o número em js/cardapio.js (campo whatsapp) para os pedidos irem direto para a Thami.");
    }
  }

  /* ---------- Início ---------- */

  function iniciar() {
    preencherTextos();
    montarCardapio();
    montarFormulario();
    atualizarTudo();

    $$('[aria-controls="sacola"]').forEach(function (b) { b.addEventListener("click", abrirSacola); });
    $$("[data-fechar]").forEach(function (b) { b.addEventListener("click", fecharSacola); });
    fundo.addEventListener("click", fecharSacola);
    $("[data-continuar]").addEventListener("click", function () { mostrarEtapa("dados"); });
    $("[data-voltar]").addEventListener("click", function () { mostrarEtapa("itens"); });
    $("[data-novo]").addEventListener("click", function () {
      sacola = [];
      gravar(CHAVE_SACOLA, sacola);
      form.elements.obs.value = "";
      atualizarTudo();
      mostrarEtapa("itens");
      fecharSacola();
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && !gaveta.hidden) fecharSacola();
      prenderFoco(ev);
    });

    var topo = $(".topo");
    var aoRolar = function () { topo.classList.toggle("rolou", window.scrollY > 8); };
    window.addEventListener("scroll", aoRolar, { passive: true });
    aoRolar();
  }

  iniciar();
})();
