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
      
      // Override window.alert with a custom popup
      window.originalAlert = window.alert;
      window.alert = function(message) {
        if (!document.body) {
          return window.originalAlert(message);
        }
        
        var overlay = document.getElementById('customAlertOverlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'customAlertOverlay';
          overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:999999; opacity:0; pointer-events:none; transition:opacity 0.3s ease;';

          var box = document.createElement('div');
          box.id = 'customAlertBox';
          box.style.cssText = 'background:var(--card, #fff); padding:30px; border-radius:16px; width:90%; max-width:380px; text-align:center; box-shadow:0 10px 40px rgba(0,0,0,0.2); transform:translateY(-20px) scale(0.95); transition:all 0.3s cubic-bezier(0.175,0.885,0.32,1.275); border:1px solid var(--border-color, #e5e7eb);';

          var icon = document.createElement('div');
          icon.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
          icon.style.cssText = 'font-size:50px; color:var(--accent-a, #10B981); margin-bottom:16px;';

          var msgBox = document.createElement('div');
          msgBox.id = 'customAlertMessage';
          msgBox.style.cssText = 'font-size:16px; color:var(--text-main, #333); margin-bottom:24px; line-height:1.5; font-weight:500;';

          var btn = document.createElement('button');
          btn.textContent = 'OK';
          btn.style.cssText = 'background:var(--accent-a, #10B981); color:#fff; border:none; padding:12px 32px; border-radius:10px; font-size:16px; font-weight:600; cursor:pointer; transition:all 0.2s ease; outline:none; font-family:inherit;';
          btn.onmouseover = function() { btn.style.transform = 'translateY(-2px)'; btn.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)'; };
          btn.onmouseout = function() { btn.style.transform = 'translateY(0)'; btn.style.boxShadow = 'none'; };
          btn.onmousedown = function() { btn.style.transform = 'translateY(1px)'; };

          btn.onclick = function() {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
            box.style.transform = 'translateY(-20px) scale(0.95)';
            if (typeof window.onAlertClose === 'function') {
                window.onAlertClose();
                window.onAlertClose = null; 
            }
          };

          box.appendChild(icon);
          box.appendChild(msgBox);
          box.appendChild(btn);
          overlay.appendChild(box);
          document.body.appendChild(overlay);
        }

        var box = document.getElementById('customAlertBox');
        var msgBox = document.getElementById('customAlertMessage');
        msgBox.textContent = message;
        
        setTimeout(function() {
          overlay.style.opacity = '1';
          overlay.style.pointerEvents = 'auto';
          box.style.transform = 'translateY(0) scale(1)';
        }, 10);
      };

    })();

