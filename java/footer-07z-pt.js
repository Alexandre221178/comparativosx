// Chamada para injetar footer páginas em inglês no html 
  document.addEventListener("DOMContentLoaded", function() {
    // 1. Adicionar links de redes sociais removido se precisar adinionar copiar em alexandregames.com
    

    // 2. Adicionar links de navegação
    const navLinksData = [
        { href: "https://comparativosx.com.br/documentos/sobre-nos-comparativosx.html", text: "Sobre Nós" },
        { href: "https://comparativosx.com.br/documentos/contato-comparativosx.html", text: "Contato" },
        { href: "https://comparativosx.com.br/documentos/isencao-de-responsabilidade.html", text: "Isenção de Responsabilidade" },
        { href: "https://comparativosx.com.br/documentos/politica-de-privacidade-comparativox.html", text: "Política de Privacidade" },
        { href: "https://comparativosx.com.br/documentos/termos-de-uso-comparativox.html", text: "Termos de Uso" }
    ];
    
    const navigationLinksContainer = document.getElementById("navigation-links");
    navLinksData.forEach(link => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.text;
        li.appendChild(a);
        navigationLinksContainer.appendChild(li);
    });

    // 3. Adicionar mensagem de direitos autorais
    const footerMessage = document.getElementById("message");
    const messageText = document.createTextNode("©2024-2025 Blog Comparativos X");
    footerMessage.appendChild(messageText);
});

