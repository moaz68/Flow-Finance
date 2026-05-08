(function(){
      // Hide body immediately to prevent FOUC
      document.documentElement.style.setProperty('--body-opacity','0');
      // Fire the preferences fetch early so it's in-flight
      window.__prefsPromise = fetch('../api/Settings/user/get_preferences.php',{
        credentials:'same-origin'
      })
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d && d.status==='success' && d.preferences){
          var dark = d.preferences.dark_mode==1 || d.preferences.dark_mode===true;
          if(dark){
            document.documentElement.classList.add('dark-mode');
          } else {
            document.documentElement.classList.remove('dark-mode');
          }
        }
        return d;
      })
      .catch(function(){ return null; });
    })();

