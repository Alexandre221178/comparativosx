'use strict';

/**
 * gerar.js — Gerador automático de páginas de comparativo de celulares
 *
 * Execute dentro da pasta /celulares:
 *   node gerar.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT       = __dirname;
const DATA_DIR   = path.join(ROOT, 'data');
const MODELS_DIR = path.join(ROOT, 'modelos');
const COMPS_DIR  = path.join(ROOT, 'comparativos');

// ============================================================
// CATEGORIA POR PREÇO
// ============================================================

function getCategoria(preco) {
  if (preco < 2000) return 'barato';
  if (preco < 4000) return 'intermediario';
  return 'premium';
}

const CATEGORIA_LABEL = {
  barato:        '💚 Econômico',
  intermediario: '💛 Intermediário',
  premium:       '💎 Premium',
};

const CATEGORIA_CLASS = {
  barato:        'cat-barato',
  intermediario: 'cat-intermediario',
  premium:       'cat-premium',
};

// ============================================================
// ANÁLISE TÉCNICA
// ============================================================

function getBateriaNum(bateria) {
  const m = String(bateria).match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

function getDesempenhoScore(processador, pontosFortes) {
  const p      = String(processador).toLowerCase();
  const fortes = Array.isArray(pontosFortes) ? pontosFortes : [];
  let score    = 1;

  if (/a17|a18|snapdragon\s*8\s*(gen\s*)?(2|3|4)|dimensity\s*9[0-9]{3}/.test(p))         score = 5;
  else if (/a16|a15|snapdragon\s*8\s*(gen\s*)?1|dimensity\s*8[0-9]{3}/.test(p))           score = 4;
  else if (/snapdragon\s*7|a14|dimensity\s*7[0-9]{3}|exynos\s*14[0-9]{2}|helio\s*g9/.test(p)) score = 3;
  else if (/snapdragon\s*6s?|snapdragon\s*4|a13|helio\s*g8|exynos\s*13[0-9]{2}/.test(p)) score = 2;

  if (fortes.some(f => /desempenho|performance|veloc/i.test(f))) score += 0.5;
  return score;
}

// ============================================================
// TEXTOS DINÂMICOS
// ============================================================

function formatarPreco(preco) {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function gerarDescricao(cel) {
  const cat      = getCategoria(cel.preco_ref);
  const adjetivo = {
    barato:        'acessível e econômico',
    intermediario: 'intermediário com ótimo custo-benefício',
    premium:       'premium de alto desempenho',
  }[cat];
  const precoFmt = formatarPreco(cel.preco_ref);
  const fortes   = (cel.pontos_fortes || []).join(', ');

  return (
    `O ${cel.nome} é um smartphone ${adjetivo} da ${cel.marca}, ` +
    `com preço de referência em ${precoFmt}. ` +
    `Equipado com tela ${cel.tela}, processador ${cel.processador}, ` +
    `câmera de ${cel.camera} e bateria de ${cel.bateria}. ` +
    (fortes ? `Destaca-se em: ${fortes}.` : '')
  );
}

function gerarTextoBateria(c1, c2) {
  const b1   = getBateriaNum(c1.bateria);
  const b2   = getBateriaNum(c2.bateria);
  const diff = Math.abs(b1 - b2);

  if (b1 === b2) {
    return `Empate na bateria: ambos trazem ${c1.bateria}.`;
  }

  const [ven, per] = b1 > b2 ? [c1, c2] : [c2, c1];
  const horas      = Math.round(diff / 150);

  return (
    `O <strong>${ven.nome}</strong> vence na autonomia com ${ven.bateria} ` +
    `contra ${per.bateria} do ${per.nome}. ` +
    `A diferença de ${diff} mAh pode representar até ` +
    `${horas} hora${horas !== 1 ? 's' : ''} extra de uso contínuo.`
  );
}

function gerarTextoDesempenho(c1, c2) {
  const s1 = getDesempenhoScore(c1.processador, c1.pontos_fortes);
  const s2 = getDesempenhoScore(c2.processador, c2.pontos_fortes);

  if (s1 === s2) {
    return (
      `Ambos têm desempenho similar: ${c1.nome} usa o ${c1.processador} ` +
      `e ${c2.nome} usa o ${c2.processador}.`
    );
  }

  const [ven, per] = s1 > s2 ? [c1, c2] : [c2, c1];
  return (
    `No desempenho, o <strong>${ven.nome}</strong> (${ven.processador}) ` +
    `supera o ${per.nome} (${per.processador}). ` +
    `Para jogos, multitarefa e apps pesados, o ${ven.nome} é a melhor escolha.`
  );
}

function gerarRecomendacao(c1, c2) {
  let score1 = 0, score2 = 0;

  const b1 = getBateriaNum(c1.bateria);
  const b2 = getBateriaNum(c2.bateria);
  const d1 = getDesempenhoScore(c1.processador, c1.pontos_fortes);
  const d2 = getDesempenhoScore(c2.processador, c2.pontos_fortes);

  if (b1 > b2) score1++; else if (b2 > b1) score2++;
  if (d1 > d2) score1++; else if (d2 > d1) score2++;
  if (c1.preco_ref < c2.preco_ref) score1++; else if (c2.preco_ref < c1.preco_ref) score2++;
  if ((c1.pontos_fortes || []).length > (c2.pontos_fortes || []).length) score1++;
  else if ((c2.pontos_fortes || []).length > (c1.pontos_fortes || []).length) score2++;

  if (score1 === score2) {
    const f1 = (c1.pontos_fortes || ['design'])[0];
    const f2 = (c2.pontos_fortes || ['custo-benefício'])[0];
    return (
      `Os dois são ótimas opções. Prefira o <strong>${c1.nome}</strong> se valoriza ${f1}; ` +
      `escolha o <strong>${c2.nome}</strong> se prioriza ${f2}.`
    );
  }

  const rec      = score1 > score2 ? c1 : c2;
  const catLabel = CATEGORIA_LABEL[getCategoria(rec.preco_ref)];
  return (
    `Nossa recomendação é o <strong>${rec.nome}</strong>. ` +
    `Ele entrega o melhor conjunto de recursos na categoria ${catLabel}, ` +
    `equilibrando desempenho, bateria e preço.`
  );
}

// ============================================================
// COMPONENTES HTML
// ============================================================

function tagCategoria(cat) {
  return `<span class="cat-badge ${CATEGORIA_CLASS[cat]}">${CATEGORIA_LABEL[cat]}</span>`;
}

function btnOferta(link, texto) {
  const t = texto || '🔥 Ver melhor oferta';
  return `<a href="${link}" target="_blank" rel="noopener sponsored" class="btn-oferta">${t}</a>`;
}

function btnOfertaSm(link, texto) {
  return `<a href="${link}" target="_blank" rel="noopener sponsored" class="btn-oferta btn-sm">${texto}</a>`;
}

// ============================================================
// SHELL HTML BASE
// ============================================================

function htmlShell(opts) {
  const { title, description, canonical, cssPath, logoHref, comparaHref, body } = opts;
  const ano = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <link rel="stylesheet" href="${cssPath}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="article">
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-7F7XBWL42E"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-7F7XBWL42E');
  </script>
  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7838775403194689"
    crossorigin="anonymous"></script>
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a href="${logoHref}" class="logo">📱 ComparaCelular</a>
      <nav class="site-nav">
        <a href="${logoHref}">Início</a>
        <a href="${comparaHref}" class="nav-comparar">⚔️ Comparar</a>
      </nav>
    </div>
  </header>

  <main class="container">
    ${body}
  </main>

  <footer class="site-footer">
    <div class="container">
      <p>© ${ano} Blog Comparativos X · Comparativo independente de smartphones</p>
    </div>
  </footer>
</body>
</html>`;
}

// ============================================================
// PÁGINA DE MODELO
// ============================================================

function gerarPaginaModelo(cel) {
  const cat      = getCategoria(cel.preco_ref);
  const precoFmt = formatarPreco(cel.preco_ref);
  const descricao = gerarDescricao(cel);
  const ano      = new Date().getFullYear();
  const imgPath  = `../data/${cel.id}/imagem.webp`;

  const liFortes = (cel.pontos_fortes  || []).map(p => `<li>${p}</li>`).join('');
  const liFracos = (cel.pontos_fracos  || []).map(p => `<li>${p}</li>`).join('');

  const body = `
    <article class="modelo-page" itemscope itemtype="https://schema.org/Product">

      <h1 itemprop="name">${cel.nome} — Análise Completa ${ano}</h1>
      ${tagCategoria(cat)}

      <div class="cta-bloco">
        ${btnOferta(cel.link_loja, `🔥 Ver oferta do ${cel.nome}`)}
      </div>

      <figure class="modelo-figura">
        <img src="${imgPath}"
             alt="${cel.nome} — foto oficial"
             loading="lazy" width="400" height="400" itemprop="image">
      </figure>

      <p class="descricao" itemprop="description">${descricao}</p>

      <h2>Especificações do ${cel.nome}</h2>
      <table class="specs-table" aria-label="Especificações do ${cel.nome}">
        <tbody>
          <tr><th scope="row">Marca</th>        <td itemprop="brand">${cel.marca}</td></tr>
          <tr><th scope="row">Tela</th>         <td>${cel.tela}</td></tr>
          <tr><th scope="row">Processador</th>  <td>${cel.processador}</td></tr>
          <tr><th scope="row">Câmera</th>       <td>${cel.camera}</td></tr>
          <tr><th scope="row">Bateria</th>      <td>${cel.bateria}</td></tr>
          <tr><th scope="row">Preço ref.</th>   <td itemprop="offers" itemscope itemtype="https://schema.org/Offer">
            <span itemprop="price" content="${cel.preco_ref}">${precoFmt}</span>
            <meta itemprop="priceCurrency" content="BRL">
          </td></tr>
          <tr><th scope="row">Categoria</th>    <td>${CATEGORIA_LABEL[cat]}</td></tr>
        </tbody>
      </table>

      <div class="cta-bloco">
        ${btnOferta(cel.link_loja)}
      </div>

      <div class="pros-cons">
        <div class="pros">
          <h3>✅ Pontos Fortes</h3>
          <ul>${liFortes}</ul>
        </div>
        <div class="cons">
          <h3>❌ Pontos Fracos</h3>
          <ul>${liFracos}</ul>
        </div>
      </div>

      <div class="cta-bloco">
        ${btnOferta(cel.link_loja, `🛒 Comprar ${cel.nome} agora`)}
      </div>

    </article>`;

  return htmlShell({
    title:       `${cel.nome}: Ficha Técnica, Preço e Vale a Pena? (${ano}) | ComparaCelular`,
    description: `Análise completa do ${cel.nome}: câmera ${cel.camera}, bateria ${cel.bateria}, processador ${cel.processador}. Preço a partir de ${precoFmt}. Vale a pena comprar?`,
    canonical:   `https://seusite.com/modelos/${cel.id}.html`,
    cssPath:     '../assets/css/style.css',
    logoHref:    '../index.html',
    comparaHref: '../comparar.html',
    body,
  });
}

// ============================================================
// PÁGINA DE COMPARATIVO
// ============================================================

function gerarPaginaComparativo(c1, c2) {
  const cat1  = getCategoria(c1.preco_ref);
  const cat2  = getCategoria(c2.preco_ref);
  const p1Fmt = formatarPreco(c1.preco_ref);
  const p2Fmt = formatarPreco(c2.preco_ref);
  const b1    = getBateriaNum(c1.bateria);
  const b2    = getBateriaNum(c2.bateria);
  const ano   = new Date().getFullYear();

  const txtBateria    = gerarTextoBateria(c1, c2);
  const txtDesempenho = gerarTextoDesempenho(c1, c2);
  const recomendacao  = gerarRecomendacao(c1, c2);

  const body = `
    <article class="comparativo-page">

      <h1>${c1.nome} vs ${c2.nome}: Qual é Melhor em ${ano}?</h1>

      <div class="comparativo-topo">
        <div class="cel-card">
          <figure>
            <img src="../data/${c1.id}/imagem.webp" alt="${c1.nome}"
                 loading="lazy" width="280" height="280">
          </figure>
          <h2>${c1.nome}</h2>
          ${tagCategoria(cat1)}
          <p class="preco">${p1Fmt}</p>
          ${btnOfertaSm(c1.link_loja, '🔥 Ver preço')}
        </div>

        <div class="vs-badge" aria-hidden="true">VS</div>

        <div class="cel-card">
          <figure>
            <img src="../data/${c2.id}/imagem.webp" alt="${c2.nome}"
                 loading="lazy" width="280" height="280">
          </figure>
          <h2>${c2.nome}</h2>
          ${tagCategoria(cat2)}
          <p class="preco">${p2Fmt}</p>
          ${btnOfertaSm(c2.link_loja, '🔥 Ver preço')}
        </div>
      </div>

      <h2>Tabela Comparativa</h2>
      <div class="table-wrapper">
        <table class="compare-table"
               aria-label="Comparação entre ${c1.nome} e ${c2.nome}">
          <thead>
            <tr>
              <th scope="col">Especificação</th>
              <th scope="col">${c1.nome}</th>
              <th scope="col">${c2.nome}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Marca</td>
              <td>${c1.marca}</td>
              <td>${c2.marca}</td>
            </tr>
            <tr>
              <td>Tela</td>
              <td>${c1.tela}</td>
              <td>${c2.tela}</td>
            </tr>
            <tr>
              <td>Processador</td>
              <td>${c1.processador}</td>
              <td>${c2.processador}</td>
            </tr>
            <tr>
              <td>Câmera</td>
              <td>${c1.camera}</td>
              <td>${c2.camera}</td>
            </tr>
            <tr>
              <td>Bateria</td>
              <td class="${b1 > b2 ? 'vencedor' : ''}">${c1.bateria}${b1 > b2 ? ' 🏆' : ''}</td>
              <td class="${b2 > b1 ? 'vencedor' : ''}">${c2.bateria}${b2 > b1 ? ' 🏆' : ''}</td>
            </tr>
            <tr>
              <td>Preço</td>
              <td class="${c1.preco_ref < c2.preco_ref ? 'vencedor' : ''}">${p1Fmt}${c1.preco_ref < c2.preco_ref ? ' 🏆' : ''}</td>
              <td class="${c2.preco_ref < c1.preco_ref ? 'vencedor' : ''}">${p2Fmt}${c2.preco_ref < c1.preco_ref ? ' 🏆' : ''}</td>
            </tr>
            <tr>
              <td>Categoria</td>
              <td>${CATEGORIA_LABEL[cat1]}</td>
              <td>${CATEGORIA_LABEL[cat2]}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <section class="analise-section">
        <h2>🔋 Bateria: Quem Dura Mais?</h2>
        <p>${txtBateria}</p>
        <div class="btn-row">
          <a href="../modelos/${c1.id}.html" class="btn-oferta">📱 Ver ${c1.nome}</a>
          <a href="../modelos/${c2.id}.html" class="btn-oferta">📱 Ver ${c2.nome}</a>
        </div>
      </section>

      <section class="analise-section">
        <h2>⚡ Desempenho: Qual é Mais Rápido?</h2>
        <p>${txtDesempenho}</p>
        <div class="btn-row">
          <a href="../modelos/${c1.id}.html" class="btn-oferta">📱 Ver ${c1.nome}</a>
          <a href="../modelos/${c2.id}.html" class="btn-oferta">📱 Ver ${c2.nome}</a>
        </div>
      </section>

      <section class="recomendacao-box">
        <h2>🎯 Nossa Recomendação Final</h2>
        <p>${recomendacao}</p>
        <div class="btn-row btn-row-center">
          ${btnOferta(c1.link_loja, '🔥 Ver melhor oferta')}
          ${btnOferta(c2.link_loja, '🔥 Ver melhor oferta')}
        </div>
      </section>

    </article>`;

  return htmlShell({
    title:       `${c1.nome} vs ${c2.nome}: Comparativo Completo ${ano} | ComparaCelular`,
    description: `Compare ${c1.nome} e ${c2.nome}: câmera, bateria, desempenho e preço. Descubra qual vale mais a pena comprar em ${ano}!`,
    canonical:   `https://seusite.com/comparativos/${c1.id}-vs-${c2.id}.html`,
    cssPath:     '../assets/css/style.css',
    logoHref:    '../index.html',
    comparaHref: '../comparar.html',
    body,
  });
}

// ============================================================
// PÁGINA COMPARAR (seletor interativo)
// ============================================================

function gerarPaginaComparar(celulares) {
  // Serialização segura: evita que </script> nos dados quebre o parser
  const safeJson = JSON.stringify(celulares).replace(/<\//g, '<\\/');
  const ano      = new Date().getFullYear();

  const body = `
    <section class="comparar-selector">
      <h1>⚔️ Compare Celulares</h1>
      <p class="comparar-intro">
        Escolha dois modelos abaixo e veja a comparação completa ao vivo.
      </p>

      <div class="sel-wrapper">
        <div class="sel-group">
          <label for="inp-cel1">📱 Celular 1</label>
          <div class="ac-wrap" id="ac-wrap-1">
            <span class="ac-icon" aria-hidden="true">🔍</span>
            <input type="text" id="inp-cel1" class="ac-input"
                   placeholder="Digite marca ou modelo…"
                   autocomplete="off"
                   role="combobox" aria-expanded="false"
                   aria-autocomplete="list" aria-controls="ac-list-1"
                   aria-haspopup="listbox">
            <ul id="ac-list-1" class="ac-list" role="listbox"
                aria-label="Sugestões para Celular 1" hidden></ul>
          </div>
        </div>

        <div class="sel-vs" aria-hidden="true">VS</div>

        <div class="sel-group">
          <label for="inp-cel2">📱 Celular 2</label>
          <div class="ac-wrap" id="ac-wrap-2">
            <span class="ac-icon" aria-hidden="true">🔍</span>
            <input type="text" id="inp-cel2" class="ac-input"
                   placeholder="Digite marca ou modelo…"
                   autocomplete="off"
                   role="combobox" aria-expanded="false"
                   aria-autocomplete="list" aria-controls="ac-list-2"
                   aria-haspopup="listbox">
            <ul id="ac-list-2" class="ac-list" role="listbox"
                aria-label="Sugestões para Celular 2" hidden></ul>
          </div>
        </div>
      </div>
    </section>

    <div id="comparar-placeholder" class="comparar-placeholder">
      <span class="placeholder-icon">📲</span>
      <p>Selecione os dois celulares acima para ver a comparação</p>
    </div>

    <div id="comparar-resultado"></div>

    <script>window.CELULARES = ${safeJson};</script>
    <script src="assets/js/comparar.js"></script>`;

  return htmlShell({
    title:       `Comparar Celulares ${ano}: Escolha Dois e Veja Qual é Melhor | ComparaCelular`,
    description: `Ferramenta interativa para comparar celulares: escolha dois modelos e veja tabela completa, análise de bateria, desempenho e nossa recomendação.`,
    canonical:   'https://comparativosx.com.br/comparar.html',
    cssPath:     'assets/css/style.css',
    logoHref:    'index.html',
    comparaHref: 'comparar.html',
    body,
  });
}

// ============================================================
// PÁGINA INDEX
// ============================================================

function gerarIndex(celulares) {
  const ano = new Date().getFullYear();

  const cards = celulares.map(cel => {
    const cat      = getCategoria(cel.preco_ref);
    const precoFmt = formatarPreco(cel.preco_ref);
    return `
      <article class="cel-card-index">
        <a href="modelos/${cel.id}.html">
          <figure>
            <img src="data/${cel.id}/imagem.webp" alt="${cel.nome}"
                 loading="lazy" width="200" height="200">
          </figure>
          <h3>${cel.nome}</h3>
        </a>
        ${tagCategoria(cat)}
        <p class="preco">${precoFmt}</p>
        <div class="card-links">
          <a href="modelos/${cel.id}.html" class="btn-secondary">Ver análise</a>
          <a href="${cel.link_loja}" target="_blank" rel="noopener sponsored"
             class="btn-oferta btn-sm">🔥 Oferta</a>
        </div>
      </article>`;
  }).join('\n');

  const body = `
    <section class="hero">
      <h1>Comparativo de Celulares ${ano}</h1>
      <p>Análises imparciais, especificações completas e os melhores preços.<br>
         Encontre o smartphone ideal para você.</p>
      <a href="comparar.html" class="btn-oferta hero-comparar">⚔️ Comparar celulares agora</a>
    </section>

    <section class="celulares-grid">
      <h2>📱 Celulares analisados</h2>
      <div class="grid-cards">
        ${cards}
      </div>
    </section>`;

  return htmlShell({
    title:       `Comparativo de Celulares ${ano} — Qual o Melhor Smartphone? | ComparaCelular`,
    description: `Compare os melhores celulares de ${ano}: câmera, bateria, desempenho e preço. Análises completas para você escolher o smartphone ideal.`,
    canonical:   'https://store.alexandregames.com/',
    cssPath:     'assets/css/style.css',
    logoHref:    'index.html',
    comparaHref: 'comparar.html',
    body,
  });
}

// ============================================================
// UTILITÁRIOS DE I/O
// ============================================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function lerCelulares() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`❌  Pasta /data não encontrada em: ${DATA_DIR}`);
    process.exit(1);
  }

  const celulares = [];
  const slugs     = fs
    .readdirSync(DATA_DIR)
    .filter(f => fs.statSync(path.join(DATA_DIR, f)).isDirectory());

  for (const slug of slugs) {
    const jsonPath = path.join(DATA_DIR, slug, 'dados.json');

    if (!fs.existsSync(jsonPath)) {
      console.warn(`⚠️  Ignorando "${slug}": dados.json não encontrado.`);
      continue;
    }

    try {
      const cel = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      if (!cel.id || !cel.nome || typeof cel.preco_ref !== 'number') {
        console.warn(`⚠️  "${slug}/dados.json" incompleto (campos obrigatórios: id, nome, preco_ref).`);
        continue;
      }

      celulares.push(cel);
    } catch (err) {
      console.warn(`⚠️  Erro ao ler ${jsonPath}: ${err.message}`);
    }
  }

  return celulares;
}

function deveComparar(c1, c2) {
  const cat1      = getCategoria(c1.preco_ref);
  const cat2      = getCategoria(c2.preco_ref);
  const diffPreco = Math.abs(c1.preco_ref - c2.preco_ref);
  return cat1 === cat2 || diffPreco < 2000;
}

// ============================================================
// MAIN
// ============================================================

function main() {
  console.log('🚀 ComparaCelular — Gerador de páginas\n');

  ensureDir(MODELS_DIR);
  ensureDir(COMPS_DIR);

  const celulares = lerCelulares();

  if (celulares.length === 0) {
    console.error('❌  Nenhum celular encontrado. Adicione pastas com dados.json em /data.');
    process.exit(1);
  }

  const nomes = celulares.map(c => c.nome).join(', ');
  console.log(`📦 ${celulares.length} celular(es) encontrado(s): ${nomes}\n`);

  // --- Modelos ---
  for (const cel of celulares) {
    const html    = gerarPaginaModelo(cel);
    const outPath = path.join(MODELS_DIR, `${cel.id}.html`);
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`  ✅ Modelo gerado:      modelos/${cel.id}.html`);
  }

  console.log('');

  // --- Comparativos ---
  let totalComparativos = 0;
  for (let i = 0; i < celulares.length; i++) {
    for (let j = i + 1; j < celulares.length; j++) {
      const c1 = celulares[i];
      const c2 = celulares[j];

      if (!deveComparar(c1, c2)) {
        console.log(`  ⏭️  Ignorado:           ${c1.id} vs ${c2.id} (categorias e preços muito distantes)`);
        continue;
      }

      const html    = gerarPaginaComparativo(c1, c2);
      const slug    = `${c1.id}-vs-${c2.id}`;
      const outPath = path.join(COMPS_DIR, `${slug}.html`);
      fs.writeFileSync(outPath, html, 'utf-8');
      console.log(`  ✅ Comparativo gerado: comparativos/${slug}.html`);
      totalComparativos++;
    }
  }

  console.log('');

  // --- Index ---
  const indexHtml = gerarIndex(celulares);
  fs.writeFileSync(path.join(ROOT, 'index.html'), indexHtml, 'utf-8');
  console.log(`  ✅ Index gerado:       index.html`);

  // --- Comparar (seletor interativo) ---
  const comparaHtml = gerarPaginaComparar(celulares);
  fs.writeFileSync(path.join(ROOT, 'comparar.html'), comparaHtml, 'utf-8');
  console.log(`  ✅ Seletor gerado:     comparar.html`);

  console.log(
    `\n🎉 Concluído! ${celulares.length} modelo(s), ${totalComparativos} comparativo(s) e seletor gerado(s).`
  );
  console.log(`\n💡 Abra celulares/index.html no navegador para visualizar.\n`);
}

main();
