(function(){
  function applyTheme(){
    try{
      var theme = localStorage.getItem('ug2026_theme') || 'light';
      document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    }catch(e){}
  }
  window.UG2026 = window.UG2026 || {};
  window.UG2026.get = function(k, fallback){
    try{
      var v = localStorage.getItem(k);
      if(v===null || v===undefined) return fallback;
      if(v==='true') return true;
      if(v==='false') return false;
      return v;
    }catch(e){ return fallback; }
  };
  window.UG2026.set = function(k, v){
    try{ localStorage.setItem(k, String(v)); }catch(e){}
    if(k==='ug2026_theme') applyTheme();
  };
  applyTheme();
})();