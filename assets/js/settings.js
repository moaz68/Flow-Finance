// --- SPA Tab Switching Logic ---
		const tabs = document.querySelectorAll('.tab');
		const panels = document.querySelectorAll('.panel');

		tabs.forEach(tab => {
			tab.addEventListener('click', () => {
				// Remove active from all tabs
				tabs.forEach(t => t.classList.remove('active'));
				// Add active to clicked tab
				tab.classList.add('active');

				const targetId = tab.getAttribute('data-target');

				// Hide all panels with fade out
				panels.forEach(panel => {
					if (panel.id !== targetId) {
						panel.classList.remove('show');
						setTimeout(() => {
							panel.classList.remove('active');
						}, 300); // matches CSS transition time
					}
				});

				// Show target panel with fade in
				const targetPanel = document.getElementById(targetId);
				setTimeout(() => {
					targetPanel.classList.add('active');
					// Small delay to allow display:block to apply before animating opacity
					setTimeout(() => {
						targetPanel.classList.add('show');
					}, 20);
				}, 300);
			});
		});

		// --- Utilities ---
		function showAlert(containerId, type, message) {
			const container = document.getElementById(containerId);
			container.innerHTML = '';
			const div = document.createElement('div');
			div.className = 'alert ' + type;
			div.innerHTML = type === 'success' ? '✓ ' + message : '⚠ ' + message;
			container.appendChild(div);
			if (type === 'success') {
				setTimeout(() => { if (container.contains(div)) container.removeChild(div); }, 4000);
			}
		}

		function setLoading(btn, isLoading, originalText) {
			if (isLoading) {
				btn.disabled = true;
				btn.innerHTML = '<span class="spinner"></span><span style="margin-left: 8px">Saving...</span>';
			} else {
				btn.disabled = false;
				btn.innerHTML = `<span class="btn-text">${originalText}</span>`;
			}
		}

		// --- Profile Form Logic ---
		const profileForm = document.getElementById('profileForm');
		const profileBtn = document.getElementById('profileSubmitBtn');

		function isEmailValid(email) {
			return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
		}

		profileForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const nameInput = document.getElementById('name');
			const emailInput = document.getElementById('email');
			const nameError = document.getElementById('nameError');
			const emailError = document.getElementById('emailError');

			// Reset errors
			nameError.style.display = 'none';
			emailError.style.display = 'none';
			document.getElementById('profileAlertContainer').innerHTML = '';

			const name = nameInput.value.trim();
			const email = emailInput.value.trim();
			let isValid = true;

			if (!name) {
				nameError.textContent = 'Name is required.';
				nameError.style.display = 'block';
				isValid = false;
			}
			if (!email) {
				emailError.textContent = 'Email is required.';
				emailError.style.display = 'block';
				isValid = false;
			} else if (!isEmailValid(email)) {
				emailError.textContent = 'Please enter a valid email address.';
				emailError.style.display = 'block';
				isValid = false;
			}

			if (!isValid) return;

			setLoading(profileBtn, true);

			try {
				const res = await fetch('../api/Settings/Modify_personal_data.php', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'same-origin',
					body: JSON.stringify({ name, email })
				});

				const contentType = res.headers.get('content-type');
				let data;
				if (contentType && contentType.includes('application/json')) {
					data = await res.json();
				} else {
					data = { status: res.ok ? 'success' : 'error', message: await res.text() };
				}

				if (res.ok && data.status !== 'error') {
					showAlert('profileAlertContainer', 'success', data.message || 'Profile updated successfully.');
				} else {
					showAlert('profileAlertContainer', 'error', data.message || 'Failed to update profile.');
				}
			} catch (err) {
				showAlert('profileAlertContainer', 'error', 'Network error. Please try again later.');
			} finally {
				setLoading(profileBtn, false, 'Save Changes');
			}
		});

		// --- Security / Password Form Logic ---
		// Toggle password visibility
		document.querySelectorAll('.toggle-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const target = document.getElementById(btn.dataset.target);
				if (!target) return;
				if (target.type === 'password') {
					target.type = 'text'; btn.textContent = 'Hide';
				} else {
					target.type = 'password'; btn.textContent = 'Show';
				}
			});
		});

		const securityForm = document.getElementById('securityForm');
		const securityBtn = document.getElementById('securitySubmitBtn');
		const securityError = document.getElementById('securityInlineError');

		securityForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			securityError.style.display = 'none';
			document.getElementById('securityAlertContainer').innerHTML = '';

			const oldPassword = document.getElementById('oldPassword').value.trim();
			const newPassword = document.getElementById('newPassword').value.trim();
			const confirmPassword = document.getElementById('confirmPassword').value.trim();

			if (!oldPassword || !newPassword || !confirmPassword) {
				securityError.textContent = 'All fields are required.';
				securityError.style.display = 'block';
				return;
			}
			if (newPassword !== confirmPassword) {
				securityError.textContent = 'New password and confirmation do not match.';
				securityError.style.display = 'block';
				return;
			}

			const payload = {
				password: oldPassword,
				new_password: newPassword,
				Confirm_Password: confirmPassword
			};

			setLoading(securityBtn, true);

			try {
				const res = await fetch('../api/Settings/Change_password.php', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'same-origin',
					body: JSON.stringify(payload)
				});

				const data = await res.json();
				if (data && data.status === 'success') {
					showAlert('securityAlertContainer', 'success', data.message || 'Password updated successfully.');
					securityForm.reset();
				} else {
					showAlert('securityAlertContainer', 'error', data.message || 'An error occurred.');
				}
			} catch (err) {
				showAlert('securityAlertContainer', 'error', 'Network error. Please try again.');
			} finally {
				setLoading(securityBtn, false, 'Update Password');
			}
		});

