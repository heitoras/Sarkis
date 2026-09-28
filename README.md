# Sarkis

Site de vendas da loja Sarkis, com o Sarkis em cinco tamanhos, do Mini (PP) ao Gigante (GG).

É um site estático (HTML, CSS e JavaScript puros), sem dependências nem etapa de build.

## O que tem no site

- **Medidor de espaço**: a pessoa arrasta a altura livre que tem em casa e vê todos os tamanhos
  desenhados em escala ao lado de uma fita métrica, com o maior que cabe em destaque.
- **Lista de tamanhos e preços**: cada tamanho com etiqueta (PP, P, M, G, GG), altura, largura,
  uma régua comparando com o maior e botão para adicionar ao carrinho com quantidade.
- **Carrinho**: gaveta lateral com quantidades, subtotal e botão **Finalizar pelo WhatsApp**,
  que abre a conversa com o pedido já escrito. O carrinho fica salvo no navegador.
- Seções **Como comprar** e **Dúvidas**, tema claro e escuro automático, layout para celular.

## Como ver no computador

Abra o arquivo `index.html` no navegador. Se preferir um servidor local:

```bash
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

## Como editar produtos, preços e WhatsApp

Tudo fica no topo do arquivo `script.js`:

```js
const WHATSAPP = '';          // ex.: '5511912345678' (DDI + DDD + número)

const PRODUTOS = [
  { id: 'mini', sigla: 'PP', nome: 'Mini', altura: 10, largura: 7, preco: 29.9, descricao: '...' },
  // ...
];
```

- **Os preços, medidas e descrições que estão lá são de exemplo.** Troque pelos reais antes de publicar.
- Para adicionar ou tirar um tamanho, edite só essa lista. O medidor, a lista, o carrinho e os
  textos do topo ("5 tamanhos", "a partir de R$ ...") se ajustam sozinhos.
- Sem número em `WHATSAPP`, o botão de finalizar abre o WhatsApp pedindo para escolher o contato.

## Publicar no GitHub Pages

1. No GitHub, vá em **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**, selecione a branch e a pasta `/ (root)`.
3. Salve. O endereço do site aparece na mesma página depois de alguns minutos.

## Arquivos

| Arquivo      | Conteúdo                                              |
|--------------|-------------------------------------------------------|
| `index.html` | Estrutura e textos da página                          |
| `styles.css` | Visual: cores, fontes, layout e tema escuro           |
| `script.js`  | Produtos, preços, medidor, carrinho e link do WhatsApp |
