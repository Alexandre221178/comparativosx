# 📱 ComparaCelular — Blog de Comparativo de Celulares

Site gerador automático de páginas de comparativo de smartphones, focado em SEO, UX e conversão.

---

## ▶️ Como rodar no VS Code

1. Abra o terminal integrado: `Ctrl + `` ` (backtick)

2. Navegue até a pasta do projeto:
   ```bash
   cd celulares
   ```

3. Execute o gerador:
   ```bash
   node gerar.js
   ```

4. Abra o arquivo `celulares/index.html` no navegador para visualizar o resultado.
   > Dica: instale a extensão **Live Server** no VS Code e clique em *Open with Live Server*.

---

## 📁 Estrutura de pastas

```
celulares/
├── gerar.js                    ← Script gerador (execute este)
├── index.html                  ← Gerado automaticamente
├── assets/
│   └── css/
│       └── style.css           ← Estilos do site
├── data/                       ← Dados dos celulares
│   ├── iphone-15/
│   │   ├── dados.json
│   │   └── imagem.jpg          ← Coloque a imagem aqui
│   ├── samsung-galaxy-a55/
│   │   ├── dados.json
│   │   └── imagem.jpg
│   └── moto-g85/
│       ├── dados.json
│       └── imagem.jpg
├── modelos/                    ← Gerado automaticamente
│   ├── iphone-15.html
│   └── ...
└── comparativos/               ← Gerado automaticamente
    ├── moto-g85-vs-samsung-galaxy-a55.html
    └── ...
```

---

## ➕ Como adicionar um novo celular

1. Crie uma pasta dentro de `/data/` com o slug do celular (use apenas letras minúsculas, números e hífens):
   ```
   data/
   └── galaxy-s24/
       ├── dados.json
       └── imagem.jpg
   ```

2. Crie o arquivo `dados.json` seguindo o modelo abaixo:
   ```json
   {
     "id": "galaxy-s24",
     "nome": "Samsung Galaxy S24",
     "marca": "Samsung",
     "preco_ref": 4299,
     "tela": "6.2\" Dynamic AMOLED 120Hz",
     "bateria": "4000mAh",
     "processador": "Snapdragon 8 Gen 3",
     "camera": "50MP principal + 12MP ultrawide + 10MP telephoto",
     "link_loja": "https://sualoja.com/galaxy-s24",
     "pontos_fortes": ["Desempenho top", "IA integrada", "Zoom óptico"],
     "pontos_fracos": ["Bateria menor que concorrentes", "Preço alto"]
   }
   ```

   | Campo          | Tipo     | Obrigatório | Descrição                                   |
   |----------------|----------|-------------|---------------------------------------------|
   | `id`           | string   | ✅          | Slug único, igual ao nome da pasta          |
   | `nome`         | string   | ✅          | Nome completo do celular                    |
   | `marca`        | string   | ✅          | Fabricante                                  |
   | `preco_ref`    | número   | ✅          | Preço em reais (define a categoria)         |
   | `tela`         | string   | ✅          | Tamanho e tipo de tela                      |
   | `bateria`      | string   | ✅          | Capacidade (ex: `"5000mAh"`)                |
   | `processador`  | string   | ✅          | Chipset do aparelho                         |
   | `camera`       | string   | ✅          | Descrição da câmera                         |
   | `link_loja`    | string   | ✅          | URL completa para sua loja                  |
   | `pontos_fortes`| array    | Recomendado | Lista de vantagens                          |
   | `pontos_fracos`| array    | Recomendado | Lista de desvantagens                       |

3. Coloque a imagem do celular em `data/galaxy-s24/imagem.jpg`

4. Rode o gerador novamente:
   ```bash
   node gerar.js
   ```

---

## 🖼️ Onde colocar as imagens

Cada celular deve ter uma imagem salva em:

```
data/{slug-do-celular}/imagem.jpg
```

**Dicas para as imagens:**
- Formato: JPG ou PNG (renomeie para `imagem.jpg`)
- Tamanho ideal: **400×400 px** ou **600×600 px** (fundo branco ou transparente)
- Fonte: use imagens oficiais do fabricante ou do Mercado Livre/Amazon (verifique licença de uso)
- Se a imagem estiver faltando, a página ainda funciona (aparece o ícone *broken image* do navegador)

---

## 🔄 Como atualizar o site

Sempre que alterar qualquer `dados.json` ou adicionar novos celulares, execute novamente:

```bash
node gerar.js
```

O script regenera **todos** os arquivos:
- `index.html`
- `modelos/*.html`
- `comparativos/*.html`

---

## 💰 Categorias por preço

| Faixa de preço   | Categoria          |
|------------------|--------------------|
| Até R$ 1.999     | 💚 Econômico       |
| R$ 2.000–3.999   | 💛 Intermediário   |
| R$ 4.000+        | 💎 Premium         |

---

## ⚔️ Regra de geração de comparativos

Um comparativo entre dois celulares é gerado apenas quando:
- Ambos são da **mesma categoria**, OU
- A **diferença de preço é menor que R$ 2.000**

Isso evita comparativos irrelevantes (ex: um celular de R$ 800 vs iPhone de R$ 7.000).

---

## 🔗 SEO — Configuração do domínio

Antes de publicar, atualize as URLs canônicas no `gerar.js` (linhas com `canonical`):

```js
canonical: `https://seusite.com/modelos/${cel.id}.html`,
// Troque "seusite.com" pelo seu domínio real
```

---

## 🚀 Publicação no GitHub Pages

1. Coloque a pasta `celulares/` na raiz de um repositório GitHub
2. Ative o GitHub Pages nas configurações do repositório
3. Acesse `https://seuusuario.github.io/celulares/`
