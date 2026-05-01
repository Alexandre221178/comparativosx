/**
 * comparar.js — Lógica client-side da página de seleção interativa
 * Depende de window.CELULARES (injetado pelo gerar.js no HTML)
 */
(function () {
  'use strict';

  // ============================================================
  // CONSTANTES
  // ============================================================

  var CATEGORIA_LABEL = {
    barato:        '💚 Econômico',
    intermediario: '💛 Intermediário',
    premium:       '💎 Premium',
  };

  var CATEGORIA_CLASS = {
    barato:        'cat-barato',
    intermediario: 'cat-intermediario',
    premium:       'cat-premium',
  };

  // ============================================================
  // FUNÇÕES DE ANÁLISE (mesma lógica do gerar.js)
  // ============================================================

  function getCategoria(preco) {
    if (preco < 2000) return 'barato';
    if (preco < 4000) return 'intermediario';
    return 'premium';
  }

  function getBateriaNum(bateria) {
    var m = String(bateria).match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }

  function getDesempenhoScore(processador, fortes) {
    var p = String(processador).toLowerCase();
    fortes = Array.isArray(fortes) ? fortes : [];
    var score = 1;

    if (/a17|a18|snapdragon\s*8\s*(gen\s*)?(2|3|4)|dimensity\s*9[0-9]{3}/.test(p))           score = 5;
    else if (/a16|a15|snapdragon\s*8\s*(gen\s*)?1|dimensity\s*8[0-9]{3}/.test(p))             score = 4;
    else if (/snapdragon\s*7|a14|dimensity\s*7[0-9]{3}|exynos\s*14[0-9]{2}|helio\s*g9/.test(p)) score = 3;
    else if (/snapdragon\s*6s?|snapdragon\s*4|a13|helio\s*g8|exynos\s*13[0-9]{2}/.test(p))   score = 2;

    if (fortes.some(function (f) { return /desempenho|performance|veloc/i.test(f); })) score += 0.5;
    return score;
  }

  function formatarPreco(preco) {
    return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // ============================================================
  // TEXTOS DINÂMICOS
  // ============================================================

  function gerarTextoBateria(c1, c2) {
    var b1   = getBateriaNum(c1.bateria);
    var b2   = getBateriaNum(c2.bateria);
    var diff = Math.abs(b1 - b2);

    if (b1 === b2) {
      return 'Empate na bateria: ambos trazem ' + c1.bateria + '.';
    }

    var ven   = b1 > b2 ? c1 : c2;
    var per   = b1 > b2 ? c2 : c1;
    var horas = Math.round(diff / 150);

    return 'O <strong>' + ven.nome + '</strong> vence na autonomia com ' + ven.bateria +
      ' contra ' + per.bateria + ' do ' + per.nome + '. A diferença de ' + diff +
      ' mAh pode representar até ' + horas + ' hora' + (horas !== 1 ? 's' : '') + ' extra de uso contínuo.';
  }

  function gerarTextoDesempenho(c1, c2) {
    var s1 = getDesempenhoScore(c1.processador, c1.pontos_fortes);
    var s2 = getDesempenhoScore(c2.processador, c2.pontos_fortes);

    if (s1 === s2) {
      return 'Ambos têm desempenho similar: ' + c1.nome + ' usa o ' + c1.processador +
        ' e ' + c2.nome + ' usa o ' + c2.processador + '.';
    }

    var ven = s1 > s2 ? c1 : c2;
    var per = s1 > s2 ? c2 : c1;

    return 'No desempenho, o <strong>' + ven.nome + '</strong> (' + ven.processador +
      ') supera o ' + per.nome + ' (' + per.processador +
      '). Para jogos, multitarefa e apps pesados, o ' + ven.nome + ' é a melhor escolha.';
  }

  function gerarRecomendacao(c1, c2) {
    var score1 = 0, score2 = 0;
    var b1 = getBateriaNum(c1.bateria),  b2 = getBateriaNum(c2.bateria);
    var d1 = getDesempenhoScore(c1.processador, c1.pontos_fortes);
    var d2 = getDesempenhoScore(c2.processador, c2.pontos_fortes);

    if (b1 > b2) score1++; else if (b2 > b1) score2++;
    if (d1 > d2) score1++; else if (d2 > d1) score2++;
    if (c1.preco_ref < c2.preco_ref) score1++; else if (c2.preco_ref < c1.preco_ref) score2++;
    if ((c1.pontos_fortes || []).length > (c2.pontos_fortes || []).length) score1++;
    else if ((c2.pontos_fortes || []).length > (c1.pontos_fortes || []).length) score2++;

    if (score1 === score2) {
      var f1 = (c1.pontos_fortes || ['design'])[0];
      var f2 = (c2.pontos_fortes || ['custo-benefício'])[0];
      return 'Os dois são ótimas opções. Prefira o <strong>' + c1.nome + '</strong> se valoriza ' +
        f1 + '; escolha o <strong>' + c2.nome + '</strong> se prioriza ' + f2 + '.';
    }

    var rec = score1 > score2 ? c1 : c2;
    return 'Nossa recomendação é o <strong>' + rec.nome + '</strong>. ' +
      'Ele entrega o melhor conjunto de recursos, equilibrando desempenho, bateria e preço.';
  }

  // ============================================================
  // RENDERIZAÇÃO
  // ============================================================

  function tagCategoria(cat) {
    return '<span class="cat-badge ' + CATEGORIA_CLASS[cat] + '">' + CATEGORIA_LABEL[cat] + '</span>';
  }

  function btnOferta(link, texto) {
    return '<a href="' + link + '" target="_blank" rel="noopener sponsored" class="btn-oferta">' + texto + '</a>';
  }

  // Link interno (mesma aba, sem sponsored)
  function btnInterno(href, texto) {
    return '<a href="' + href + '" class="btn-oferta">' + texto + '</a>';
  }

  function renderComparacao(c1, c2) {
    var cat1 = getCategoria(c1.preco_ref);
    var cat2 = getCategoria(c2.preco_ref);
    var p1   = formatarPreco(c1.preco_ref);
    var p2   = formatarPreco(c2.preco_ref);
    var b1   = getBateriaNum(c1.bateria);
    var b2   = getBateriaNum(c2.bateria);

    var rows = [
      ['Marca',       c1.marca,        c2.marca],
      ['Tela',        c1.tela,         c2.tela],
      ['Processador', c1.processador,  c2.processador],
      ['Câmera',      c1.camera,       c2.camera],
    ];

    var rowsHtml = rows.map(function (r) {
      return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>';
    }).join('');

    // Linha bateria com destaque do vencedor
    rowsHtml +=
      '<tr><td>Bateria</td>' +
      '<td class="' + (b1 > b2 ? 'vencedor' : '') + '">' + c1.bateria + (b1 > b2 ? ' 🏆' : '') + '</td>' +
      '<td class="' + (b2 > b1 ? 'vencedor' : '') + '">' + c2.bateria + (b2 > b1 ? ' 🏆' : '') + '</td></tr>';

    // Linha preço com destaque do vencedor
    rowsHtml +=
      '<tr><td>Preço</td>' +
      '<td class="' + (c1.preco_ref < c2.preco_ref ? 'vencedor' : '') + '">' + p1 + (c1.preco_ref < c2.preco_ref ? ' 🏆' : '') + '</td>' +
      '<td class="' + (c2.preco_ref < c1.preco_ref ? 'vencedor' : '') + '">' + p2 + (c2.preco_ref < c1.preco_ref ? ' 🏆' : '') + '</td></tr>';

    rowsHtml +=
      '<tr><td>Categoria</td>' +
      '<td>' + CATEGORIA_LABEL[cat1] + '</td>' +
      '<td>' + CATEGORIA_LABEL[cat2] + '</td></tr>';

    return (
      '<article class="comparativo-page">' +

      '<h2>' + c1.nome + ' vs ' + c2.nome + '</h2>' +

      // Topo com cards dos dois celulares
      '<div class="comparativo-topo">' +
        '<div class="cel-card">' +
          '<figure><img src="data/' + c1.id + '/imagem.webp" alt="' + c1.nome + '" width="280" height="280"></figure>' +
          '<h3>' + c1.nome + '</h3>' +
          tagCategoria(cat1) +
          '<p class="preco">' + p1 + '</p>' +
          btnOferta(c1.link_loja, '🔥 Ver preço') +
        '</div>' +

        '<div class="vs-badge" aria-hidden="true">VS</div>' +

        '<div class="cel-card">' +
          '<figure><img src="data/' + c2.id + '/imagem.webp" alt="' + c2.nome + '" width="280" height="280"></figure>' +
          '<h3>' + c2.nome + '</h3>' +
          tagCategoria(cat2) +
          '<p class="preco">' + p2 + '</p>' +
          btnOferta(c2.link_loja, '🔥 Ver preço') +
        '</div>' +
      '</div>' +

      // Tabela
      '<h3 class="section-heading">Tabela Comparativa</h3>' +
      '<div class="table-wrapper">' +
        '<table class="compare-table" aria-label="Comparação ' + c1.nome + ' vs ' + c2.nome + '">' +
          '<thead><tr>' +
            '<th scope="col">Especificação</th>' +
            '<th scope="col">' + c1.nome + '</th>' +
            '<th scope="col">' + c2.nome + '</th>' +
          '</tr></thead>' +
          '<tbody>' + rowsHtml + '</tbody>' +
        '</table>' +
      '</div>' +

      // Bateria
      '<section class="analise-section">' +
        '<h3>🔋 Bateria: Quem Dura Mais?</h3>' +
        '<p>' + gerarTextoBateria(c1, c2) + '</p>' +
        '<div class="btn-row">' +
          btnInterno('modelos/' + c1.id + '.html', '📱 Ver ' + c1.nome) +
          btnInterno('modelos/' + c2.id + '.html', '📱 Ver ' + c2.nome) +
        '</div>' +
      '</section>' +

      // Desempenho
      '<section class="analise-section">' +
        '<h3>⚡ Desempenho: Qual é Mais Rápido?</h3>' +
        '<p>' + gerarTextoDesempenho(c1, c2) + '</p>' +
        '<div class="btn-row">' +
          btnInterno('modelos/' + c1.id + '.html', '📱 Ver ' + c1.nome) +
          btnInterno('modelos/' + c2.id + '.html', '📱 Ver ' + c2.nome) +
        '</div>' +
      '</section>' +

      // Recomendação
      '<section class="recomendacao-box">' +
        '<h3>🎯 Nossa Recomendação Final</h3>' +
        '<p>' + gerarRecomendacao(c1, c2) + '</p>' +
        '<div class="btn-row btn-row-center">' +
          btnOferta(c1.link_loja, '🔥 Ver melhor oferta') +
          btnOferta(c2.link_loja, '🔥 Ver melhor oferta') +
        '</div>' +
      '</section>' +

      '</article>'
    );
  }

  // ============================================================
  // INICIALIZAÇÃO — AUTOCOMPLETE
  // ============================================================

  var CELULARES   = window.CELULARES || [];
  var resultado   = document.getElementById('comparar-resultado');
  var placeholder = document.getElementById('comparar-placeholder');

  // Celular confirmado por slot (1 e 2)
  var selecionados = { 1: null, 2: null };

  // -----------------------------------------------------------
  // Score de relevância para ordenar sugestões
  // -----------------------------------------------------------
  function scoreRelevancia(cel, termo) {
    var haystack = (cel.nome + ' ' + cel.marca).toLowerCase();
    var nomeLow  = cel.nome.toLowerCase();
    var t        = termo.toLowerCase();
    if (haystack.indexOf(t) === 0) return 4;  // começa pelo início exato
    if (nomeLow.indexOf(t)  === 0) return 3;  // nome começa com o termo
    if (nomeLow.indexOf(t)  !== -1) return 2;  // nome contém o termo
    if (haystack.indexOf(t) !== -1) return 1;  // marca contém o termo
    return 0;
  }

  function filtrar(termo) {
    if (!termo || !termo.trim()) return CELULARES.slice();
    var t = termo.trim();
    var resultados = [];
    for (var i = 0; i < CELULARES.length; i++) {
      var s = scoreRelevancia(CELULARES[i], t);
      if (s > 0) resultados.push({ cel: CELULARES[i], s: s });
    }
    resultados.sort(function (a, b) { return b.s - a.s; });
    var lista = [];
    for (var j = 0; j < resultados.length; j++) lista.push(resultados[j].cel);
    return lista;
  }

  // -----------------------------------------------------------
  // Fábrica de autocomplete (uma instância por slot)
  // -----------------------------------------------------------
  function criarAutoComplete(slot) {
    var inp    = document.getElementById('inp-cel' + slot);
    var list   = document.getElementById('ac-list-' + slot);
    var curIdx = -1;

    function fechar() {
      list.hidden = true;
      list.innerHTML = '';
      inp.setAttribute('aria-expanded', 'false');
      curIdx = -1;
    }

    function abrir(itens) {
      list.innerHTML = '';

      if (itens.length === 0) {
        var vazio = document.createElement('li');
        vazio.className   = 'ac-item ac-vazio';
        vazio.textContent = 'Nenhum resultado encontrado';
        list.appendChild(vazio);
        list.hidden = false;
        inp.setAttribute('aria-expanded', 'true');
        return;
      }

      itens.forEach(function (cel) {
        var cat = getCategoria(cel.preco_ref);
        var li  = document.createElement('li');
        li.className = 'ac-item';
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        li.dataset.id = cel.id;

        var nomeEl = document.createElement('span');
        nomeEl.className   = 'ac-nome';
        nomeEl.textContent = cel.nome;

        var metaEl = document.createElement('span');
        metaEl.className   = 'ac-meta';
        metaEl.textContent = cel.marca + ' · ' + CATEGORIA_LABEL[cat];

        li.appendChild(nomeEl);
        li.appendChild(metaEl);

        // mousedown antes do blur para garantir que o clique registra
        li.addEventListener('mousedown', function (e) {
          e.preventDefault();
          selecionar(cel);
        });

        list.appendChild(li);
      });

      list.hidden = false;
      inp.setAttribute('aria-expanded', 'true');
      curIdx = -1;
    }

    function highlight(idx) {
      var itens = list.querySelectorAll('.ac-item:not(.ac-vazio)');
      for (var i = 0; i < itens.length; i++) {
        var ativo = (i === idx);
        itens[i].classList.toggle('ac-highlighted', ativo);
        itens[i].setAttribute('aria-selected', ativo ? 'true' : 'false');
      }
      curIdx = idx;
    }

    function selecionar(cel) {
      inp.value         = cel.nome + ' — ' + cel.marca;
      selecionados[slot] = cel;
      fechar();
      atualizarComparacao();
    }

    // Abre a lista ao focar (mostra todos se campo vazio)
    inp.addEventListener('focus', function () {
      abrir(filtrar(inp.value));
    });

    // Filtra enquanto digita
    inp.addEventListener('input', function () {
      selecionados[slot] = null;  // seleção anterior deixa de valer
      abrir(filtrar(inp.value));
      atualizarComparacao();
    });

    // Navegação por teclado
    inp.addEventListener('keydown', function (e) {
      var itens = list.querySelectorAll('.ac-item:not(.ac-vazio)');
      var total = itens.length;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlight(Math.min(curIdx + 1, total - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlight(Math.max(curIdx - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (curIdx >= 0 && curIdx < total) {
          var id = itens[curIdx].dataset.id;
          for (var i = 0; i < CELULARES.length; i++) {
            if (CELULARES[i].id === id) { selecionar(CELULARES[i]); break; }
          }
        }
      } else if (e.key === 'Escape') {
        fechar();
        inp.blur();
      }
    });

    // Fecha ao perder foco (150ms para o mousedown do item ter tempo)
    inp.addEventListener('blur', function () {
      setTimeout(fechar, 150);
    });
  }

  // -----------------------------------------------------------
  // Atualiza a comparação quando ambos os slots têm seleção
  // -----------------------------------------------------------
  function atualizarComparacao() {
    var c1 = selecionados[1];
    var c2 = selecionados[2];

    if (!c1 || !c2) {
      resultado.innerHTML = '';
      placeholder.style.display = 'flex';
      return;
    }

    if (c1.id === c2.id) {
      resultado.innerHTML = '<p class="comparar-aviso">⚠️ Selecione dois celulares <strong>diferentes</strong> para comparar.</p>';
      placeholder.style.display = 'none';
      return;
    }

    resultado.innerHTML = renderComparacao(c1, c2);
    placeholder.style.display = 'none';
    resultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  criarAutoComplete(1);
  criarAutoComplete(2);

}());
