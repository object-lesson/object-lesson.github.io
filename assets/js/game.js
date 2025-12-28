(function(){
  function $(s, r){ return (r||document).querySelector(s); }

  var params = new URLSearchParams(location.search);
  var id = params.get('id');
  var lesson = params.get('lesson');
  var urlParam = params.get('url');
  var labelParam = params.get('label') || '';

  var iframe = $('#gameframe');
  var overlay = $('#overlay');
  var playBtn = $('#playbtn');
  var openNew = $('#opennew');
  var fsBtn = $('#fullscreen');
  var gname = $('#gname') || $('.gname-control');
  var gcover = $('#gamecover');

  var resolved = { url: '', label: '', icon: '' };

  function setText(el, v){ if(el) el.textContent = v; }
  function setHref(el, v){ if(el) el.href = v; }
  function setSrc(el, v){ if(el) el.src = v; }

  function setMetaDescription(desc){
    try{
      var meta = document.querySelector('meta[name="description"]') || document.getElementById('meta-description');
      if(!meta){
        meta = document.createElement('meta');
        meta.setAttribute('name','description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', desc || '');
    }catch(e){}
  }
  function setCanonical(url){
    try{
      var link = document.getElementById('canonical-link') || document.querySelector('link[rel="canonical"]');
      if(!link){
        link = document.createElement('link');
        link.setAttribute('rel','canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    }catch(e){}
  }
  function renderArticle(html){
    try{
      var box = document.getElementById('seo-article');
      if(!box) return;
      box.innerHTML = html || '';
      box.style.display = (html ? 'block' : 'none');
    }catch(e){}
  }
  function applySEO(game){
    try{
      var siteSuffix = ' | Unblocked Games 2026';
      if(game && game.seo && game.seo.title){
        document.title = game.seo.title;
      }else{
        document.title = (resolved.label || 'Play') + siteSuffix;
      }
      var desc = (game && game.seo && game.seo.description) ? game.seo.description : ('Play ' + (resolved.label||'games') + ' on Unblocked Games 2026.');
      setMetaDescription(desc);
      setCanonical((location.origin ? (location.origin + location.pathname + location.search) : location.href));
      if(game && game.content && game.content.article_html){
        renderArticle(game.content.article_html);
      }else{
        renderArticle('');
      }
    }catch(e){}
  }

  function resolveById(rawId){
    try{
      if(!rawId || !window.oyunlar) return null;
      var data = window.oyunlar[String(rawId)];
      if(!data) return null;
      return { url: data.game_url || '', label: data.label || ('Game ' + rawId), icon: (data.game_image_icon || '') };
    }catch(e){ return null; }
  }

  function fetchJSON(url, cb){
    try{
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
          try{
            if(xhr.status >= 200 && xhr.status < 300){
              cb(null, JSON.parse(xhr.responseText));
            }else{
              cb(new Error('HTTP '+xhr.status));
            }
          }catch(e){ cb(e); }
        }
      };
      xhr.send();
    }catch(e){ cb(e); }
  }


  function attachGameFromURL(finalUrl, cb){
    fetchJSON('assets/data/games.json', function(err, games){
      if(err || !games) return cb(null);
      for(var i=0;i<games.length;i++){
        if(games[i].game_url === finalUrl || (games[i].slug && (finalUrl.indexOf(games[i].slug) !== -1))){
          return cb(games[i]);
        }
      }
      cb(null);
    });
  }

  function resolveLesson(lessonId, cb){
    fetchJSON('assets/data/games.json', function(err, games){
      if(err || !games){ return cb(null, { url:'', label:'Lesson '+lessonId, icon:'' }); }
      var byLabel = {};
      for(var i=0;i<games.length;i++){ byLabel[games[i].label] = games[i]; }
      var plan = (window.lessonMap && window.lessonMap[String(lessonId)]) || null;
      if (plan){
        if (plan.game_url){
          var g = null;
          for(var j=0;j<games.length;j++){ if(games[j].game_url === plan.game_url){ g = games[j]; break; } }
          return cb(null, { url: plan.game_url, label: plan.label || (g ? g.label : ('Lesson '+lessonId)), icon: (g ? (g.game_image_icon || '') : ''), game: g });
        }
        if (plan.label && byLabel[plan.label]){
          var g2 = byLabel[plan.label];
          return cb(null, { url: g2.game_url, label: g2.label, icon: (g2.game_image_icon || ''), game: g2 });
        }
        return cb(null, { url:'', label:'Lesson '+lessonId, icon:'' });
      }
      var n = parseInt(lessonId,10);
      if(!isNaN(n) && n>=1 && n<=games.length){
        var g3 = games[n-1];
        return cb(null, { url: g3.game_url, label: g3.label, icon: (g3.game_image_icon || ''), game: g3 });
      }
      return cb(null, { url:'', label:'Lesson '+lessonId, icon:'' });
    });
  }

  function init(){
    if(id){
      var r = resolveById(id);
      if(r && r.url){ resolved = r; }
    }
    function afterLesson(){
      if(!resolved.url && urlParam){
        resolved = { url: urlParam, label: labelParam || 'Game', icon: '', game: null };
        attachGameFromURL(urlParam, function(gx){ if(gx){ resolved.game = gx; applySEO(gx); } });
      }
      setText(gname, resolved.label || 'Game');
      applySEO(resolved.game || null);
      if(gcover){
        if(resolved.icon){ gcover.style.display='block'; setSrc(gcover, resolved.icon); }
        else { gcover.style.display='none'; }
      }
    }
    if(!resolved.url && lesson){
      resolveLesson(lesson, function(_e, r){
        if(r && r.url){ resolved = r; }
        afterLesson();
      });
    }else{
      afterLesson();
    }
  }

  function requestFS(node){
    try{
      var target = document.getElementById('gameframe') || node;
      if(target && target.requestFullscreen) return target.requestFullscreen({ navigationUI: 'hide' });
      if(target && target.webkitRequestFullscreen) return target.webkitRequestFullscreen();
      if(target && target.mozRequestFullScreen) return target.mozRequestFullScreen();
      if(target && target.msRequestFullscreen) return target.msRequestFullscreen();
    }catch(e){}
  }
  function exitFS(){
    try{
      if(document.fullscreenElement) return document.exitFullscreen();
      if(document.webkitFullscreenElement) return document.webkitExitFullscreen();
      if(document.mozFullScreenElement) return document.mozCancelFullScreen();
      if(document.msFullscreenElement) return document.msExitFullscreen();
    }catch(e){}
  }
  function isFS(){
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
  }

  function startGame(){
    var finalUrl = resolved.url;
    if(!finalUrl){
      var map = window.oyunlar || {};
      var data = id && map[id] ? map[id] : null;
      if(data && data.game_url){ finalUrl = data.game_url; }
    }
    if(!finalUrl){ alert('Missing URL'); return; }
    if(iframe){ iframe.src = finalUrl; }
    if(overlay){ overlay.style.display = 'none'; }
  }

  // ✅ Robust "Open in New Tab" -> about:blank shell with ensured URL
  if(openNew){
    openNew.addEventListener('click', function(e){
      e.preventDefault();
      // Compute finalUrl synchronously (fallback to oyunlar map by id)
      var useCloak = true;
      try{ if(window.UG2026 && typeof UG2026.get==='function'){ useCloak = !!UG2026.get('ug2026_cloak', true); } }catch(_e){}
      var finalUrl = resolved.url;
      if(!finalUrl){
        var map = window.oyunlar || {};
        var data = id && map[id] ? map[id] : null;
        if(data && data.game_url){ finalUrl = data.game_url; }
      }
      if(!finalUrl && urlParam){ finalUrl = urlParam; }
      if(!finalUrl){ alert('Game link not ready'); return; }

      // Open about:blank (keep opener so we can still interact if needed)
      var win = window.open('about:blank', '_blank'); // no noopener/noreferrer to avoid null window
      if(!win){ return; }

      var title = (resolved.label || 'Game');
      // Write a shell that iframes the game; address bar remains about:blank
      var html = ''
        + '<!doctype html><html><head><meta charset="utf-8">'
        + '<meta name="viewport" content="width=device-width,initial-scale=1">'
        + '<title>'+ String(title).replace(/</g,'&lt;').replace(/>/g,'&gt;') +'</title>'
        + '<style>html,body{height:100%;margin:0;background:#0b1125}'
        + 'iframe{position:fixed;inset:0;border:0;width:100vw;height:100vh;display:block}'
        + '.bar{position:fixed;top:10px;right:10px;z-index:10;display:flex;gap:8px}'
        + '.btn{background:rgba(17,26,58,.8);border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:8px 10px;color:#fff;font-family:system-ui,Segoe UI,Roboto;cursor:pointer}</style>'
        + '</head><body>'
        + '<div class="bar"><button class="btn" id="fs">Fullscreen</button></div>'
        + '<iframe id="childframe" allow="fullscreen; autoplay" referrerpolicy="no-referrer-when-downgrade"></iframe>'
        + '<script>('
        + 'function(){'
        + '  var url = '+ JSON.stringify(finalUrl) + ';'
        + '  var f = document.getElementById("childframe");'
        + '  try{ f.src = url; }catch(e){}'
        + '  function req(){try{if(f.requestFullscreen)f.requestFullscreen({navigationUI:"hide"});else if(f.webkitRequestFullscreen)f.webkitRequestFullscreen();else if(f.mozRequestFullScreen)f.mozRequestFullScreen();else if(f.msRequestFullscreen)f.msRequestFullscreen();}catch(e){}}'
        + '  document.getElementById("fs").addEventListener("click",req);'
        + '})();'
        + ')()<\/script>'
        + '</body></html>';

      try{
        win.document.open();
        win.document.write(html);
        win.document.close();
      }catch(e){}
    });
  }

  if(playBtn){ playBtn.addEventListener('click', startGame); }
  if(fsBtn){
    fsBtn.addEventListener('click', function(){
      if(!isFS()){ requestFS(); } else { exitFS(); }
    });
  }
  document.addEventListener('keydown', function(e){
    var k = e.key || e.keyCode;
    if(k === 'f' || k === 'F' || k === 70){
      e.preventDefault();
      if(!isFS()){ requestFS(); } else { exitFS(); }
    }
  });
  if(iframe){
    iframe.addEventListener('dblclick', function(){
      if(!isFS()){ requestFS(); } else { exitFS(); }
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();