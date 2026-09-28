/* Sarkis — loja */
(() => {
  'use strict';

  // ==========================================================================
  // CONFIGURAÇÃO DA LOJA — edite aqui
  // ==========================================================================

  // Número do WhatsApp que recebe os pedidos: DDI + DDD + número, só dígitos.
  // Exemplo: '5511912345678'. Vazio = o WhatsApp pede para escolher o contato.
  const WHATSAPP = '';

  // Tamanhos à venda. Medidas em centímetros, preço em reais.
  // Valores de exemplo: troque pelos reais antes de publicar.
  // Para adicionar ou remover um tamanho, basta mexer nesta lista;
  // a página inteira (medidor, lista, carrinho e textos) se ajusta sozinha.
  const PRODUTOS = [
    { id: 'mini',    sigla: 'PP', nome: 'Mini',    altura: 10, largura: 7,  preco: 29.9,  descricao: 'Cabe na palma da mão. Bom para a mesa de trabalho ou para dar de presente.' },
    { id: 'pequeno', sigla: 'P',  nome: 'Pequeno', altura: 20, largura: 14, preco: 49.9,  descricao: 'Tamanho de prateleira: aparece bem sem ocupar espaço.' },
    { id: 'medio',   sigla: 'M',  nome: 'Médio',   altura: 35, largura: 24, preco: 79.9,  descricao: 'O meio-termo da coleção, para cômoda, rack ou estante.' },
    { id: 'grande',  sigla: 'G',  nome: 'Grande',  altura: 50, largura: 34, preco: 119.9, descricao: 'Meio metro de Sarkis. Fica bem no chão ou num aparador.' },
    { id: 'gigante', sigla: 'GG', nome: 'Gigante', altura: 80, largura: 54, preco: 189.9, descricao: 'O maior da linha. Vira o centro do ambiente.' },
  ];

  // ==========================================================================

  const produtos = [...PRODUTOS].sort((a, b) => a.altura - b.altura);
  const porId = new Map(produtos.map((p) => [p.id, p]));
  const menor = produtos[0];
  const maior = produtos[produtos.length - 1];
  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
  const esc = (texto) => String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const limitar = (n) => Math.min(99, Math.max(1, Math.round(n) || 1));

  // ---------- Textos que dependem da lista de produtos ----------

  function preencherTextos() {
    const dados = {
      siglas: `Tamanhos ${produtos.map((p) => p.sigla).join(' · ')}`,
      menor: `${menor.nome} de ${menor.altura} cm`,
      maior: `${maior.nome} de ${maior.altura} cm`,
      quantidade: `${produtos.length} ${produtos.length === 1 ? 'tamanho' : 'tamanhos'}`,
      faixa: `${menor.altura} a ${maior.altura} cm`,
      apartir: `a partir de ${brl.format(Math.min(...produtos.map((p) => p.preco)))}`,
    };
    document.querySelectorAll('[data-texto]').forEach((el) => {
      const valor = dados[el.dataset.texto];
      if (valor) el.textContent = valor;
    });
    $('#ano').textContent = String(new Date().getFullYear());
  }

  // ---------- Carrinho (salvo neste navegador) ----------

  const CHAVE = 'sarkis:carrinho';
  let carrinho = lerCarrinho();

  function lerCarrinho() {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE) || '{}');
      const limpo = {};
      for (const [id, qtd] of Object.entries(dados)) {
        if (porId.has(id) && Number.isInteger(qtd) && qtd > 0) limpo[id] = Math.min(qtd, 99);
      }
      return limpo;
    } catch {
      return {};
    }
  }

  function salvarCarrinho() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(carrinho));
    } catch {
      // Sem armazenamento disponível: o carrinho vale só nesta visita.
    }
  }

  function adicionar(id, qtd) {
    carrinho[id] = Math.min((carrinho[id] || 0) + qtd, 99);
    atualizarCarrinho();
    const contador = $('#contador-carrinho');
    contador.classList.remove('pulou');
    void contador.offsetWidth;
    contador.classList.add('pulou');
    const nome = porId.get(id).nome;
    avisar(qtd === 1 ? `Sarkis ${nome} adicionado ao carrinho` : `${qtd} Sarkis ${nome} adicionados ao carrinho`);
  }

  function definirQtd(id, qtd) {
    if (qtd <= 0) delete carrinho[id];
    else carrinho[id] = Math.min(qtd, 99);
    atualizarCarrinho();
  }

  function itensDoCarrinho() {
    return produtos.filter((p) => carrinho[p.id]).map((p) => ({ produto: p, qtd: carrinho[p.id] }));
  }

  function linkWhatsApp(itens, subtotal) {
    const linhas = itens.map(({ produto: p, qtd }) =>
      `• ${qtd}× Sarkis ${p.nome} (${p.sigla}, ${p.altura} cm): ${brl.format(p.preco * qtd)}`);
    const mensagem = [
      'Olá! Quero fazer este pedido na loja Sarkis:',
      '',
      ...linhas,
      '',
      `Subtotal: ${brl.format(subtotal)}`,
      'Pode me informar o frete e as formas de pagamento?',
    ].join('\n');
    return `https://wa.me/${WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`;
  }

  function atualizarCarrinho() {
    salvarCarrinho();
    const itens = itensDoCarrinho();
    const totalQtd = itens.reduce((soma, i) => soma + i.qtd, 0);
    const subtotal = itens.reduce((soma, i) => soma + i.qtd * i.produto.preco, 0);

    $('#contador-carrinho').textContent = String(totalQtd);
    $('#abrir-carrinho').setAttribute('aria-label', `Abrir carrinho, ${totalQtd} ${totalQtd === 1 ? 'item' : 'itens'}`);

    const lista = $('#itens-carrinho');
    const rodape = $('#rodape-carrinho');

    if (!itens.length) {
      lista.innerHTML = `
        <div class="vazio">
          <p>Seu carrinho está vazio.</p>
          <a class="botao botao--contorno" href="#loja" data-fechar>Ver tamanhos</a>
        </div>`;
      rodape.hidden = true;
      return;
    }

    rodape.hidden = false;
    lista.innerHTML = itens.map(({ produto: p, qtd }) => `
      <div class="item">
        <div class="etiqueta etiqueta--mini" aria-hidden="true">${esc(p.sigla)}</div>
        <div class="item__info">
          <p class="item__nome">Sarkis ${esc(p.nome)}</p>
          <p class="item__detalhe">${p.altura} cm · ${brl.format(p.preco)} cada</p>
          <div class="qtd qtd--pequena">
            <button type="button" data-item="${p.id}" data-passo="-1" aria-label="${qtd === 1 ? 'Remover' : 'Um a menos de'} Sarkis ${esc(p.nome)}">−</button>
            <output aria-label="Quantidade de Sarkis ${esc(p.nome)}">${qtd}</output>
            <button type="button" data-item="${p.id}" data-passo="1" aria-label="Um a mais de Sarkis ${esc(p.nome)}">+</button>
          </div>
        </div>
        <div class="item__lado">
          <p class="item__total">${brl.format(p.preco * qtd)}</p>
          <button type="button" class="botao-texto" data-remover="${p.id}">Remover</button>
        </div>
      </div>`).join('');

    $('#subtotal').textContent = brl.format(subtotal);
    $('#finalizar').href = linkWhatsApp(itens, subtotal);
  }

  // ---------- Gaveta do carrinho ----------

  const gaveta = $('#carrinho');
  const veu = $('#veu');
  const botaoAbrir = $('#abrir-carrinho');
  const fundo = [$('#topo'), $('#inicio'), $('#rodape')];
  let focoAnterior = null;

  function abrirCarrinho() {
    focoAnterior = document.activeElement;
    gaveta.classList.add('aberta');
    veu.classList.add('visivel');
    botaoAbrir.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('travado');
    fundo.forEach((el) => { el.inert = true; });
    esconderAviso();
    $('#fechar-carrinho').focus();
  }

  function fecharCarrinho({ devolverFoco = true } = {}) {
    if (!gaveta.classList.contains('aberta')) return;
    gaveta.classList.remove('aberta');
    veu.classList.remove('visivel');
    botaoAbrir.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('travado');
    fundo.forEach((el) => { el.inert = false; });
    if (!devolverFoco) return;
    // O aviso some ao abrir a gaveta; nesse caso o foco volta para o botão do carrinho.
    const alvo = focoAnterior && document.contains(focoAnterior) && !aviso.contains(focoAnterior) ? focoAnterior : botaoAbrir;
    alvo.focus();
  }

  botaoAbrir.addEventListener('click', abrirCarrinho);
  $('#fechar-carrinho').addEventListener('click', () => fecharCarrinho());
  $('#continuar').addEventListener('click', () => fecharCarrinho());
  veu.addEventListener('click', () => fecharCarrinho());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharCarrinho();
  });

  $('#itens-carrinho').addEventListener('click', (e) => {
    const passo = e.target.closest('[data-passo]');
    if (passo) {
      const id = passo.dataset.item;
      definirQtd(id, (carrinho[id] || 0) + Number(passo.dataset.passo));
      // A lista é redesenhada: devolve o foco ao mesmo botão, ou ao título se o item saiu.
      const mesmo = $(`[data-item="${id}"][data-passo="${passo.dataset.passo}"]`, gaveta);
      (mesmo || $('#fechar-carrinho')).focus();
      return;
    }
    const remover = e.target.closest('[data-remover]');
    if (remover) {
      definirQtd(remover.dataset.remover, 0);
      $('#fechar-carrinho').focus();
      return;
    }
    if (e.target.closest('[data-fechar]')) fecharCarrinho({ devolverFoco: false });
  });

  // ---------- Aviso ----------

  const aviso = $('#aviso');
  let timerAviso;

  function avisar(texto) {
    $('#aviso-texto').textContent = texto;
    $('#anuncio').textContent = texto;
    aviso.classList.add('visivel');
    agendarSumico(3500);
  }
  function esconderAviso() {
    clearTimeout(timerAviso);
    aviso.classList.remove('visivel');
  }
  function agendarSumico(ms) {
    clearTimeout(timerAviso);
    timerAviso = setTimeout(esconderAviso, ms);
  }

  $('#aviso-ver').addEventListener('click', abrirCarrinho);
  aviso.addEventListener('mouseenter', () => clearTimeout(timerAviso));
  aviso.addEventListener('focusin', () => clearTimeout(timerAviso));
  aviso.addEventListener('mouseleave', () => agendarSumico(2000));
  aviso.addEventListener('focusout', () => agendarSumico(2000));

  // ---------- Lista de produtos ----------

  function renderizarLista() {
    const lista = $('#lista-produtos');
    lista.style.setProperty('--divisoes', String(maior.altura / 5));
    lista.innerHTML = produtos.map((p) => {
      const pct = (p.altura / maior.altura) * 100;
      return `
      <article class="produto" id="produto-${p.id}" aria-labelledby="nome-${p.id}">
        <div class="etiqueta" aria-hidden="true">${esc(p.sigla)}</div>
        <div class="produto__info">
          <h3 id="nome-${p.id}">Sarkis ${esc(p.nome)}<span class="sr">, tamanho ${esc(p.sigla)}</span></h3>
          <p class="produto__medidas">${p.altura} cm de altura × ${p.largura} cm de largura</p>
          <p class="produto__desc">${esc(p.descricao)}</p>
          <div class="regua" role="img" aria-label="${p.altura} cm numa régua de 0 a ${maior.altura} cm" style="--pct: ${pct.toFixed(2)}%">
            <div class="regua__trilho"><div class="regua__fita"></div></div>
            <span class="regua__rotulo" aria-hidden="true">${p.altura} cm</span>
          </div>
        </div>
        <div class="produto__compra">
          <p class="preco">${brl.format(p.preco)}</p>
          <div class="qtd">
            <button type="button" data-passo="-1" aria-label="Diminuir quantidade de Sarkis ${esc(p.nome)}">−</button>
            <input type="number" id="qtd-${p.id}" inputmode="numeric" min="1" max="99" value="1" aria-label="Quantidade de Sarkis ${esc(p.nome)}">
            <button type="button" data-passo="1" aria-label="Aumentar quantidade de Sarkis ${esc(p.nome)}">+</button>
          </div>
          <button type="button" class="botao botao--escuro" data-adicionar="${p.id}">Adicionar</button>
        </div>
      </article>`;
    }).join('');

    lista.addEventListener('click', (e) => {
      const passo = e.target.closest('[data-passo]');
      if (passo) {
        const campo = $('input', passo.parentElement);
        campo.value = limitar(Number(campo.value) + Number(passo.dataset.passo));
        return;
      }
      const botao = e.target.closest('[data-adicionar]');
      if (botao) {
        const id = botao.dataset.adicionar;
        const campo = $(`#qtd-${id}`);
        adicionar(id, limitar(Number(campo.value)));
        campo.value = 1;
      }
    });
    lista.addEventListener('change', (e) => {
      if (e.target.matches('input[type="number"]')) e.target.value = limitar(Number(e.target.value));
    });
  }

  // ---------- Medidor: todos os tamanhos em escala, lado a lado ----------

  function montarMedidor() {
    const palco = $('#palco');
    const controle = $('#espaco');
    const W = 520;
    const H = 342;
    const chao = 298;
    const topo = 24;
    const maxCm = Math.max(100, Math.ceil((maior.altura + 10) / 10) * 10);
    const k = (chao - topo) / maxCm; // px por cm na altura
    const x0 = 70;
    const x1 = W - 8;
    const folgaMin = 12;
    const somaLarguras = produtos.reduce((soma, p) => soma + p.largura, 0);
    // Mesma escala na largura; só encolhe se os tamanhos não couberem lado a lado.
    const kx = Math.min(k, (x1 - x0 - folgaMin * (produtos.length - 1)) / somaLarguras);
    const folga = produtos.length > 1 ? (x1 - x0 - somaLarguras * kx) / (produtos.length - 1) : 0;

    let fita = `<rect class="fita-corpo" x="6" y="${topo - 10}" width="40" height="${chao - topo + 10}" rx="3"/>`;
    for (let cm = 0; cm <= maxCm; cm += 5) {
      const y = (chao - cm * k).toFixed(1);
      const dezena = cm % 10 === 0;
      fita += `<line class="fita-risco" x1="6" x2="${dezena ? 16 : 12}" y1="${y}" y2="${y}"/>`;
      if (dezena && cm > 0) fita += `<text class="fita-numero" x="43" y="${y}">${cm}</text>`;
    }
    fita += `<text class="fita-unidade" x="26" y="${chao + 24}">cm</text>`;

    let x = produtos.length > 1 ? x0 : (x0 + x1 - produtos[0].largura * kx) / 2;
    const figuras = produtos.map((p) => {
      const w = p.largura * kx;
      const h = p.altura * k;
      const cx = x + w / 2;
      const figura = `
        <a class="fig" href="#produto-${p.id}" data-id="${p.id}">
          <title>Sarkis ${esc(p.nome)}, ${p.altura} cm. Ver na loja.</title>
          <g class="fig__forma">
            <rect class="fig__corpo" x="${x.toFixed(1)}" y="${(chao - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(w * 0.3, 28).toFixed(1)}"/>
            <text class="fig__s" x="${cx.toFixed(1)}" y="${(chao - h * 0.5).toFixed(1)}" font-size="${Math.max(10, w * 0.6).toFixed(1)}">S</text>
          </g>
          <text class="fig__cm" x="${cx.toFixed(1)}" y="${(chao - h - 8).toFixed(1)}">${p.altura} cm</text>
          <rect class="fig__tag" x="${(cx - 20).toFixed(1)}" y="${chao + 10}" width="40" height="26" rx="5"/>
          <text class="fig__sigla" x="${cx.toFixed(1)}" y="${chao + 23}">${esc(p.sigla)}</text>
        </a>`;
      x += w + folga;
      return figura;
    }).join('');

    const linha = `
      <g class="espaco" id="linha-espaco">
        <line class="espaco__linha" x1="46" x2="${W - 4}" y1="0" y2="0"/>
        <path class="espaco__seta" d="M46 0l12-7v14z"/>
      </g>`;

    palco.setAttribute('viewBox', `0 0 ${W} ${H}`);
    // A linha do espaço fica atrás das figuras: os rótulos de altura continuam legíveis.
    palco.innerHTML = `${fita}<line class="chao" x1="46" x2="${W - 4}" y1="${chao}" y2="${chao}"/>${linha}${figuras}`;

    controle.max = String(maxCm);
    const grupoLinha = $('#linha-espaco', palco);
    const saida = $('#espaco-valor');
    const texto = $('#resultado-texto');
    const botao = $('#resultado-botao');
    const figurasEl = [...palco.querySelectorAll('.fig')];
    let ultimoTexto = '';

    function atualizar() {
      const cm = Number(controle.value);
      grupoLinha.setAttribute('transform', `translate(0 ${(chao - cm * k).toFixed(1)})`);
      saida.textContent = `${cm} cm`;
      controle.setAttribute('aria-valuetext', `${cm} centímetros`);

      const cabem = produtos.filter((p) => p.altura <= cm);
      const ideal = cabem[cabem.length - 1];
      figurasEl.forEach((el) => {
        const p = porId.get(el.dataset.id);
        el.classList.toggle('fora', p.altura > cm);
        el.classList.toggle('ideal', p === ideal);
      });

      let novoTexto;
      if (!ideal) {
        novoTexto = `Em ${cm} cm nenhum tamanho cabe. O menor, <strong>Sarkis ${esc(menor.nome)}</strong>, tem ${menor.altura} cm.`;
        botao.hidden = true;
      } else {
        novoTexto = cabem.length === produtos.length
          ? `Todos cabem. O maior é o <strong>Sarkis ${esc(ideal.nome)}</strong>, com ${ideal.altura} cm.`
          : `Cabe até o <strong>Sarkis ${esc(ideal.nome)}</strong>, com ${ideal.altura} cm.`;
        botao.hidden = false;
        botao.dataset.id = ideal.id;
        botao.textContent = `Adicionar ${ideal.nome} · ${brl.format(ideal.preco)}`;
      }
      // Só reescreve quando a recomendação muda, para o leitor de tela não repetir a cada passo.
      if (novoTexto !== ultimoTexto) {
        texto.innerHTML = novoTexto;
        ultimoTexto = novoTexto;
      }
    }

    controle.addEventListener('input', atualizar);
    botao.addEventListener('click', () => adicionar(botao.dataset.id, 1));
    atualizar();
  }

  // ---------- Início ----------

  preencherTextos();
  renderizarLista();
  montarMedidor();
  atualizarCarrinho();
})();
