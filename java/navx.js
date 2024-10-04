document.addEventListener('DOMContentLoaded', () => {
    const navHTML = `
        <div class="logo">
            <a href="https://alexandregames.com/index-pt.html"><img src="../imagens/comparativox-img/comparativox-logo.webp" alt="Logo Blog Comparativo X" title="Logo Blog Comparativo X"></a>
        </div>                     
        <ul>                     
            <div class="dropdown">
                <button class="dropbtn"><a href="https://alexandregames.com/HeroWars.html">Eletrodomésticos</a></button>
               
            </div>              
            <div class="dropdown">
                <button class="dropbtn"><a href="https://alexandregames.com/MobileLegends.html">Tecnologia</a></button>
                
            </div> 
            <div class="dropdown">
                <button class="dropbtn"><a href="https://alexandregames.com/roblox-br.html">Infantil</a></button>
                
            </div> 
             
            <div class="dropdown">
                <button class="dropbtn">Mais</button>
                <div class="dropdown-content">
                    
                    <a href="https://alexandregames.com/Documentos/Contato.html">Contato</a>
                    <a href="https://alexandregames.com/Documentos/aviso-legal.html">Isenção de Responsabilidade</a>
                    <a href="https://alexandregames.com/Documentos/Pol%C3%ADtica%20de%20privacidade.html">Política de Privacidade</a>
                    <a href="https://alexandregames.com/Documentos/Sobre.html">Sobre Nós</a>
                    <a href="https://alexandregames.com/Documentos/Termos%20de%20uso.html">Termos de Uso</a>
                </div>
            </div>
        </ul>
        <div class="menu-icon">
            <img src="https://alexandregames.com/imagens/menu.png" alt="Menu" style="width:48px;height:48px;">
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
        if (iconMenu.getAttribute("src") === 'https://alexandregames.com/imagens/close.webp') {
            iconMenu.setAttribute("src", "https://alexandregames.com/imagens/menu.png");
        } else {
            iconMenu.setAttribute("src", "https://alexandregames.com/imagens/close.webp");
        }
        
        menu.classList.toggle('active');
    });
});

// Function to extract and display modification date
function displayModificationDate() {
    var metaTags = document.getElementsByTagName('meta');
    var modificationDate;

    // Array com nomes dos meses
    var months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Encontrar a meta tag com property="article:modified_time"
    for (var i = 0; i < metaTags.length; i++) {
        if (metaTags[i].getAttribute('property') === 'article:modified_time') {
            modificationDate = metaTags[i].getAttribute('content');
            break;
        }
    }

    // Exibir a data de modificação na página
    if (modificationDate) {
        var formattedDate = new Date(modificationDate);
        var day = formattedDate.getDate();
        var month = months[formattedDate.getMonth()]; // Obter o nome do mês
        var year = formattedDate.getFullYear();
        var dateElement = document.getElementById('data-modificacao');
        dateElement.textContent = 'Última atualização: ' + day + ' de ' + month + ' de ' + year;
    }
}

// Chamar a função quando a página carregar
window.onload = displayModificationDate;