// Aumentar o tamanho do botão
document.getElementById('loadScript').style.padding = '10px 20px';
document.getElementById('loadScript').style.fontSize = '16px';



// Código original graphcomments
function loadComments() {
  var gc = document.createElement('script'); 
  gc.type = 'text/javascript'; 
  gc.async = true;
  gc.onload = function() {
    // Esconder a mensagem de carregamento quando o script for carregado
    document.getElementById('loadingMessage').style.display = 'none';
    __semio__onload();
  }; 
  gc.defer = true; 
  gc.src = 'https://integration.graphcomment.com/gc_graphlogin.js?' + Date.now();
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(gc);
}

var __semio__params = {
  graphcommentId: "Comparativos-X", // make sure the id is yours
  behaviour: {
    // HIGHLY RECOMMENDED
    //  uid: "...", // uniq identifer for the comments thread on your page (ex: your page id)
  },
  // configure your variables here
}

function __semio__onload() {
  __semio__gc_graphlogin(__semio__params);
}


//  botao graphcomments
document.getElementById('loadScript').addEventListener('click', function() {
  // Ocultar o botão depois de clicado
  this.style.display = 'none';

  // Ocultar o parágrafo
  var commentParagraph = document.getElementById('commentParagraph');
  if (commentParagraph) {
    commentParagraph.style.display = 'none';
  }

  // Exibir a mensagem de carregamento
  document.getElementById('loadingMessage').style.display = 'block';

  // Chamada para a função de carregamento de comentários
  loadComments();
});



