document.addEventListener('DOMContentLoaded', () => {
    const navHTML = `
        <div class="logo">
            <a href="https://comparativosx.com.br"><img src="https://comparativosx.com.br/imagens/comparativox-img/comparativosx-logo.webp" alt="Home Comparativos X" title="Home Blog Comparativos X"></a>
        </div>                     
        <ul>                     
            <div class="dropdown">
                <button class="dropbtn"><a href="https://comparativosx.com.br/menu-eletrodomestico.html">Eletrodomésticos</a></button>
               
            </div>              
            <div class="dropdown">
                <button class="dropbtn"><a href="https://comparativosx.com.br/menu-eletronicos.html">Tecnologia</a></button>
                
            </div> 
            <div class="dropdown">
                <button class="dropbtn"><a href="https://comparativosx.com.br/menu-infantil.html">Infantil</a></button>
                
            </div> 
             
            <div class="dropdown">
                <button class="dropbtn">Mais</button>
                <div class="dropdown-content">
                    
                    <a href="https://comparativosx.com.br/documentos/contato-comparativosx.html">Contato</a>
                    <a href="https://comparativosx.com.br/documentos/isencao-de-responsabilidade.html">Isenção de Responsabilidade</a>
                    <a href="https://comparativosx.com.br/documentos/politica-de-privacidade-comparativox.html">Política de Privacidade</a>
                    <a href="https://comparativosx.com.br/documentos/sobre-nos-comparativosx.html">Sobre Nós</a>
                    <a href="https://comparativosx.com.br/documentos/termos-de-uso-comparativox.html">Termos de Uso</a>
                </div>
            </div>
        </ul>
        <div class="menu-icon">
            <img src="https://comparativosx.com.br/imagens/menu.png" alt="Menu" style="width:48px;height:48px;">
        </div>
         `;

    const navElement = document.createElement('nav');
    navElement.innerHTML = navHTML;
    document.querySelector('#menu-container').prepend(navElement);

    // Move the language switch button inside the nav
    const langButton = document.querySelector('.language-switch');
    if (langButton) {
        navElement.querySelector('ul').appendChild(langButton);
    }

    const menu = document.querySelector('nav ul');
    const menuBar = document.querySelector('nav .menu-icon');
    const iconMenu = document.querySelector('nav .menu-icon img');

    menuBar.addEventListener('click', function() {
        if (iconMenu.getAttribute("src") === 'https://comparativosx.com.br/imagens/close.webp') {
            iconMenu.setAttribute("src", "https://comparativosx.com.br/imagens/menu.png");
        } else {
            iconMenu.setAttribute("src", "https://comparativosx.com.br/imagens/close.webp");
        }
        
        menu.classList.toggle('active');
    });
});