# Confeitaria da Thami

Site de pedidos da [@confeitariadathami_](https://www.instagram.com/confeitariadathami_/): doces artesanais na Zona Sul de São Paulo, desde 2016.

O cliente escolhe os doces, coloca na sacola, diz se quer entrega ou retirada, o dia e a forma de pagamento. O site monta a mensagem do pedido e abre o WhatsApp da Thami com tudo escrito. Não tem mensalidade, servidor nem banco de dados.

## Antes de colocar no ar

Abra `js/cardapio.js` e confira:

1. **WhatsApp**: preencha `whatsapp` com 55 + DDD + número, só dígitos (ex.: `"5511987654321"`). Enquanto estiver vazio, o WhatsApp abre e pede para a pessoa escolher o contato.
2. **Preços**: os itens marcados com `// CONFIRMAR` têm preço estimado. Os únicos que vieram do Instagram são Brownie Bites (R$ 12,00), pavê de abacaxi (R$ 75 / R$ 160) e a torta de 10/20 fatias (R$ 140 / R$ 250).
3. **Entrega**: taxa (`taxa: 8`, por exemplo, ou `null` para combinar), dias de antecedência, períodos e pedido mínimo.
4. **Formas de pagamento**: lista `pagamentos`.

## Como editar o cardápio

Tudo fica em `js/cardapio.js`. Cada doce é um bloco assim:

```js
{
  id: "brownie-bites",          // sem espaços nem acentos, único
  categoria: "brownies",        // uma das categorias do topo do arquivo
  nome: "Brownie Bites",
  descricao: "Pedacinhos de brownie macios, cobertos com chocolate.",
  preco: 12.0,                  // use ponto, não vírgula. null = "Sob consulta"
  unidade: "pacote 120g",
  selo: "Novidade",             // opcional
  foto: "img/produtos/brownie-bites.jpg", // opcional
  ilustracao: "brownie",        // desenho usado quando não há foto
},
```

- **Esgotou?** Coloque `disponivel: false` no doce.
- **Tamanhos diferentes?** Use `opcoes` no lugar de `preco` (veja o pavê de abacaxi).
- **Aviso no topo** (festival, novidade, feriado): edite `aviso`. Deixe `""` para esconder.
- **Fotos**: coloque o arquivo em `img/produtos/` (quadrado, cerca de 600×600) e adicione `foto: "img/produtos/nome.jpg"` no doce.

Ilustrações disponíveis: `brigadeiro`, `ninho`, `bichodepe`, `caixinha`, `morango`, `trufa`, `morangodoamor`, `brownie`, `palha`, `bolo`, `pave`, `fatia`, `festa`.

## Como publicar (grátis, pelo GitHub Pages)

1. No GitHub, abra o repositório e vá em **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
3. Em um ou dois minutos o site fica no ar em `https://gmayuumi.github.io/Confeitaria-da-Thami/`.
4. Coloque esse link na bio do Instagram.

Dá para usar um domínio próprio depois (por exemplo, `confeitariadathami.com.br`) na mesma tela.

## Ver no computador

Abra o `index.html` no navegador, ou rode um servidor simples na pasta:

```sh
npx serve .
```

## Arquivos

```
index.html          página
css/style.css       visual
js/cardapio.js      cardápio, preços e configurações (edite aqui)
js/app.js           sacola, formulário e mensagem do WhatsApp
img/                favicon e fotos dos produtos
fontes/             fontes Shrikhand e Figtree (licença SIL OFL)
```
