(function(){
			// DOM refs
			const tabs = document.querySelectorAll('.tab');
			const profileForm = document.getElementById('profile-form');
			const saveBtn = document.getElementById('save-btn');
			const saveSpinner = document.getElementById('save-spinner');
			const saveText = document.getElementById('save-text');
			const toast = document.getElementById('toast');

			const nameInput = document.getElementById('name');
			const emailInput = document.getElementById('email');
			const nameError = document.getElementById('name-error');
			const emailError = document.getElementById('email-error');
			const formMsg = document.getElementById('form-msg');

			// Simple tab switching with fade
			tabs.forEach(t=>t.addEventListener('click', () => {
				tabs.forEach(x=>{ x.classList.remove('active'); x.setAttribute('aria-selected','false') });
				t.classList.add('active'); t.setAttribute('aria-selected','true');
				const target = t.dataset.target;
				document.querySelectorAll('[data-panel]').forEach(p=>{
					if(p.dataset.panel === target){
						p.style.display='block'; setTimeout(()=>{ p.style.opacity='1'; p.style.transform='translateY(0)'; },20);
					} else { p.style.opacity='0'; p.style.transform='translateY(6px)'; setTimeout(()=>{ p.style.display='none'; },220); }
				});
			}));

			// Validation helpers
			function isEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
			function showError(el, msg){ el.style.display='block'; el.textContent=msg; }
			function clearError(el){ el.style.display='none'; el.textContent=''; }

			// Optional: prefill from server-rendered values if available as data-* on body (not required)
			try{
				const preName = document.body.dataset.userName;
				const preEmail = document.body.dataset.userEmail;
				if(preName) nameInput.value = preName;
				if(preEmail) emailInput.value = preEmail;
			} catch(e){}

			// Toast
			function showToast(msg, opts={timeout:3000}){
				toast.textContent = msg; toast.classList.add('show');
				clearTimeout(toast._t);
				toast._t = setTimeout(()=>{ toast.classList.remove('show'); }, opts.timeout);
			}

			// Form submit
			saveBtn.addEventListener('click', async function(){
				// clear messages
				clearError(nameError); clearError(emailError); formMsg.textContent='';

				const name = nameInput.value.trim();
				const email = emailInput.value.trim();
				let invalid=false;
				if(!name){ showError(nameError, 'Name is required'); invalid=true; }
				if(!email){ showError(emailError, 'Email is required'); invalid=true; }
				else if(!isEmail(email)){ showError(emailError, 'Enter a valid email'); invalid=true; }
				if(invalid) return;

				// disable + spinner
				saveBtn.disabled = true; saveSpinner.style.display='inline-block'; saveText.textContent='Saving';

				try{
					const res = await fetch('../api/Settings/Modify_personal_data.php', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						credentials: 'same-origin',
						body: JSON.stringify({ name, email })
					});

					const contentType = res.headers.get('content-type') || '';
					let body = null;
					if(contentType.includes('application/json')) body = await res.json(); else body = await res.text();

					if(res.ok){
						showToast((body && body.message) ? body.message : 'Profile updated');
						formMsg.textContent = '';
					} else {
						const msg = (body && body.message) ? body.message : (typeof body === 'string' ? body : 'Update failed');
						formMsg.textContent = msg; formMsg.style.color = '#ffb4b4';
						showToast(msg);
					}

				} catch(err){
					formMsg.textContent = 'Network error'; formMsg.style.color = '#ffb4b4';
					showToast('Network error');
				} finally{
					saveBtn.disabled = false; saveSpinner.style.display='none'; saveText.textContent='Save';
				}
			});

			// optional: inline validation on blur
			nameInput.addEventListener('blur', ()=>{ if(!nameInput.value.trim()) showError(nameError,'Name is required'); else clearError(nameError); });
			emailInput.addEventListener('blur', ()=>{ const v=emailInput.value.trim(); if(!v) showError(emailError,'Email is required'); else if(!isEmail(v)) showError(emailError,'Enter a valid email'); else clearError(emailError); });

		})();

