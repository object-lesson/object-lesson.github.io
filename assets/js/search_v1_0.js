(function(){
  async function loadGames(){
    const res = await fetch('/assets/static/my_games.json', {cache:'no-store'});
    const data = await res.json();
    return data.games || [];
  }

  function normalize(s){
    return (s || '').toLowerCase().trim();
  }

  function renderResults(listEl, games, q){
    const v = normalize(q);
    listEl.innerHTML = '';
    if(!v){
      return;
    }
    const hits = games
      .filter(g => normalize(g.name).includes(v))
      .slice(0, 50);

    for(const g of hits){
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = "/" + encodeURIComponent(g.slug) + ".html";
      a.textContent = g.name || 'Game';
      li.appendChild(a);
      listEl.appendChild(li);
    }
  }

  document.addEventListener('DOMContentLoaded', async function(){
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    if(!input || !results) return;

    let games = [];
    try{
      games = await loadGames();
    }catch(e){
      console.error('Search load error', e);
      return;
    }

    // initial render if input prefilled
    renderResults(results, games, input.value);

    input.addEventListener('input', function(e){
      renderResults(results, games, e.target.value);
    });

    // support enter key
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        renderResults(results, games, input.value);
      }
    });

    input.focus();
  });
})();
