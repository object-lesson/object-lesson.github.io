(function(){
  // Loads site-level settings from assets/data/site_settings.json
  // Exposes window.SITE_SETTINGS (best-effort; falls back to defaults)
  var defaults = {
    base_url: location.origin,
    site_name: document.title || 'Unblocked Games',
    default_title: document.title || 'Unblocked Games',
    default_description: 'Play unblocked games online.',
    title_suffix: '',
    language: 'en',
    features: { fullscreen:true, open_new_tab:true, cloak_about_blank:true }
  };

  function applySettings(s){
    try{
      window.SITE_SETTINGS = s || defaults;
    }catch(e){
      window.SITE_SETTINGS = defaults;
    }
  }

  function fetchJSON(url, cb){
    try{
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
          if(xhr.status >= 200 && xhr.status < 300){
            try{ cb(null, JSON.parse(xhr.responseText)); }
            catch(e){ cb(e); }
          }else{
            cb(new Error('HTTP '+xhr.status));
          }
        }
      };
      xhr.send();
    }catch(e){ cb(e); }
  }

  fetchJSON('assets/data/site_settings.json', function(err, data){
    if(err || !data){ return applySettings(defaults); }
    // Merge shallow defaults
    for(var k in defaults){
      if(!(k in data)) data[k] = defaults[k];
    }
    if(!data.features) data.features = defaults.features;
    applySettings(data);
  });
})();