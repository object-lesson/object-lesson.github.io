(function(){
  function $(id){ return document.getElementById(id); }
  var yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  var KEY = 'ub2026_settings';
  var defaults = { light_theme:false, prefer_fullscreen:true, show_open_new:true };

  function load(){
    try{
      var raw = localStorage.getItem(KEY);
      if(!raw) return Object.assign({}, defaults);
      var obj = JSON.parse(raw);
      return Object.assign({}, defaults, obj||{});
    }catch(e){ return Object.assign({}, defaults); }
  }
  function save(s){
    try{ localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){}
  }

  function applyTheme(s){
    try{
      // site uses dark by default; light_theme adds a class
      if(s.light_theme) document.documentElement.classList.add('light-theme');
      else document.documentElement.classList.remove('light-theme');
    }catch(e){}
  }

  var s = load();
  var themeToggle = $('themeToggle');
  var prefFullscreen = $('prefFullscreen');
  var prefOpenNew = $('prefOpenNew');

  if(themeToggle) themeToggle.checked = !!s.light_theme;
  if(prefFullscreen) prefFullscreen.checked = !!s.prefer_fullscreen;
  if(prefOpenNew) prefOpenNew.checked = !!s.show_open_new;

  applyTheme(s);

  function onChange(){
    s.light_theme = !!(themeToggle && themeToggle.checked);
    s.prefer_fullscreen = !!(prefFullscreen && prefFullscreen.checked);
    s.show_open_new = !!(prefOpenNew && prefOpenNew.checked);
    save(s);
    applyTheme(s);
  }

  if(themeToggle) themeToggle.addEventListener('change', onChange);
  if(prefFullscreen) prefFullscreen.addEventListener('change', onChange);
  if(prefOpenNew) prefOpenNew.addEventListener('change', onChange);

  // Expose for other scripts (optional)
  window.USER_SETTINGS = s;
})();