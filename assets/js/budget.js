// Backend-driven variables (do NOT persist in localStorage)
let salary = 0;
let expenses = [];
window._budgetsData = {};
window._fullExpensesList = [];
window._budgetMap = {};   // Single source of truth — populated by calculateBudgetUsage()

// ── Normalize a raw category string to a proper-cased canonical name ──
function normalizeCat(raw) {
  const s = (raw || '').trim().toLowerCase();
  // Ensure specific arabic expenses are correctly forced to "Other"
  if (['مصاريف معاذ', 'مصاريف ندي', 'مصاريف بسمله'].includes(s)) return 'Other';
  return CATEGORIES.find(c => c.toLowerCase() === s) || 'Other';
}

// ═══════════ Budget System — Single Source of Truth ═══════════
async function loadBudgets() {
  try {
    const res = await fetch('../api/expenses/get_budgets_Category.php');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    console.log("loadBudgets result:", result);
    if (result.status === 'success' && result.budgets) {
      // Map response data ensuring keys exactly match CATEGORIES
      const mapped = {};
      for (let key in result.budgets) {
        const cat = CATEGORIES.find(c => c.toLowerCase() === key.toLowerCase());
        if (cat) mapped[cat] = result.budgets[key];
      }
      window._budgetsData = mapped;
      return true;
    }
  } catch (e) {
    console.error('Error loading budgets:', e);
  }
  return false;
}

/**
 * calculateBudgetUsage()
 * Runs ONCE per render cycle. Writes to window._budgetMap and returns it.
 * No other function may compute category totals independently.
 */
function calculateBudgetUsage() {
  const cache = {};

  CATEGORIES.forEach(cat => {
    // 3. Correct Calculations: ensure value is treated as Number
    const limit = Number(window._budgetsData[cat]);
    // 2. Fix "No Budget Limit": force Other to 7000 if not found
    const fallbackBudget = cat === 'Other' ? 7000 : 0;

    cache[cat] = {
      budget: (isNaN(limit) || limit <= 0) ? fallbackBudget : limit,
      spent: 0,
      percent: 0
    };
  });

  (window._fullExpensesList || []).forEach(e => {
    // FIX: Properly handle e.Category vs e.category
    const catVal = e.category || e.Category || detectCategory(e.title);
    const cat = normalizeCat(catVal);
    // Total Spent calculated by summing up all expenses
    cache[cat].spent += Number(e.amount) || 0;
  });

  CATEGORIES.forEach(cat => {
    const s = cache[cat];
    s.percent = s.budget > 0 ? (s.spent / s.budget) * 100 : 0;
  });

  window._budgetMap = cache;   // persist for consumers
  return cache;
}

/**
 * getCategoryBudgetUI(category)
 * Returns a high-end glassmorphism Category Progress Tracker block.
 */
function getCategoryBudgetUI(category) {
  const entry = (window._budgetMap && window._budgetMap[category]) || { spent: 0, budget: 0, percent: 0 };
  const spent = parseFloat(entry.spent) || 0;
  const budget = parseFloat(entry.budget) || 0;

  // ── No budget set ──
  if (budget <= 0) {
    return `
      <div class="tracker-wrapper">
        <div class="tracker-cat-label">${category}:</div>
        <div class="tracker-meta">— No budget limit set</div>
      </div>`;
  }

  const pct = entry.percent;
  let statusClass = 'tracker-safe';
  let widthPct = Math.min(100, pct);

  if (pct > 100) {
    statusClass = 'tracker-danger pulse';
  } else if (pct >= 70) {
    statusClass = 'tracker-warning';
  }

  const dispPct = Math.round(pct);
  const fraction = `($${spent.toLocaleString()} / $${budget.toLocaleString()})`;

  // Text format: Category: [Progress Bar] Percentage% ($Spent / $Limit)
  return `
    <div class="tracker-wrapper">
      <div class="tracker-cat-label">${t('label_' + category.toLowerCase())}:</div>
      <div class="tracker-track">
        <div class="tracker-fill ${statusClass}" style="width:${widthPct}%"></div>
      </div>
      <div class="tracker-pct">${dispPct}%</div>
      <div class="tracker-meta">${fraction}</div>
    </div>`;
}

function renderBudgetProgress() {
  const container = document.getElementById('dashboardBudgetContainer');
  if (!container) return;

  // Re-use existing cache if available (already computed this cycle)
  const cache = window._budgetMap || {};
  let html = '';

  CATEGORIES.forEach(cat => {
    const s = cache[cat];
    if (!s || (s.budget <= 0 && s.spent <= 0)) return;

    const statusClass = s.percent > 100 ? 'db-status-danger'
      : s.percent >= 70 ? 'db-status-warning'
        : 'db-status-safe';
    const widthPct = Math.min(100, s.percent).toFixed(1);
    const dispPct = Math.round(s.percent);
    const color = s.percent > 100 ? '#ef4444' : s.percent >= 70 ? '#f59e0b' : '#22c55e';
    const ascFilled = Math.min(10, Math.round(s.percent / 10));
    const ascEmpty = Math.max(0, 10 - ascFilled);
    const overTxt = s.spent > s.budget && s.budget > 0
      ? `<div style="font-size:11px;color:var(--danger);margin-top:3px;font-weight:600">Over budget by $${(s.spent - s.budget).toLocaleString()}</div>`
      : '';

    const isTopCategory = (cat === window._topCategoryAnalytics);
    const glowClass = isTopCategory ? 'pulse' : '';
    const glowStyle = isTopCategory ? 'box-shadow: 0 0 15px rgba(245,158,11,0.8);' : '';

    html += `
      <div class="db-budget-item">
        <div class="db-budget-header">
          <span style="${isTopCategory ? 'color:#f59e0b;font-weight:700;' : ''}">${t('label_' + cat.toLowerCase())} ${isTopCategory ? '🔥' : ''}</span>
          <span style="font-size:12px;color:var(--muted)">${s.spent.toLocaleString()} / ${s.budget > 0 ? s.budget.toLocaleString() : t('msg_no_budget')}</span>
        </div>
        <div style="font-family:monospace;font-size:12px;color:${color};margin-bottom:4px">
          ${'█'.repeat(ascFilled)}${'░'.repeat(ascEmpty)} ${dispPct}%
        </div>
        <div class="db-progress-bg">
          <div class="db-progress-fill ${statusClass} ${glowClass}" style="width:${widthPct}%; ${glowStyle}"></div>
        </div>
        ${overTxt}
      </div>`;
  });

  container.innerHTML = html || `<div style="color:var(--muted);font-size:13px">${t('msg_no_active_budgets')}</div>`;
}

function updateBudgetUI() {
  // cache is already fresh (calculateBudgetUsage was called before this)
  renderBudgetProgress();
  if (typeof renderBudgetOverview === 'function') renderBudgetOverview();
}

// ═══════════ Category System ═══════════
const CATEGORIES = ['Food', 'Bills', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Other'];
const CATEGORY_COLORS = {
  Food: '#22c55e', Bills: '#f59e0b', Transport: '#3b82f6',
  Shopping: '#a855f7', Entertainment: '#ec4899', Health: '#14b8a6', Other: '#64748b'
};
const CATEGORY_ICONS = {
  Food: 'fa-utensils', Bills: 'fa-file-invoice-dollar', Transport: 'fa-car',
  Shopping: 'fa-bag-shopping', Entertainment: 'fa-gamepad', Health: 'fa-heart-pulse', Other: 'fa-box'
};
const CATEGORY_EMOJI = {
  Food: '🍕', Bills: '💡', Transport: '🚗', Shopping: '🛒',
  Entertainment: '🎮', Health: '💊', Other: '📦'
};

// Smart category detection from title keywords
function detectCategory(title) {
  const t = (title || '').toLowerCase();
  const rules = [
    { cat: 'Food', keys: ['food', 'eat', 'restaurant', 'lunch', 'dinner', 'breakfast', 'grocery', 'groceries', 'pizza', 'coffee', 'meal', 'snack', 'drink', 'اكل', 'شرب', 'طعام', 'مطعم'] },
    { cat: 'Bills', keys: ['bill', 'electric', 'electricity', 'water', 'gas', 'internet', 'phone', 'rent', 'subscription', 'كهرباء', 'ميا', 'غاز', 'ايجار', 'فاتور'] },
    { cat: 'Transport', keys: ['transport', 'fuel', 'gas', 'uber', 'taxi', 'bus', 'train', 'car', 'parking', 'petrol', 'مواصلات', 'بنزين', 'عربي', 'سيار'] },
    { cat: 'Shopping', keys: ['shop', 'shopping', 'clothes', 'amazon', 'online', 'store', 'mall', 'buy', 'تسوق', 'ملابس', 'شراء'] },
    { cat: 'Entertainment', keys: ['movie', 'game', 'netflix', 'spotify', 'music', 'party', 'fun', 'travel', 'trip', 'ترفيه', 'العاب', 'سفر'] },
    { cat: 'Health', keys: ['doctor', 'medicine', 'pharmacy', 'hospital', 'health', 'gym', 'dental', 'صحة', 'دكتور', 'دواء', 'مستشفى', 'صيدلي'] },
  ];
  for (const rule of rules) {
    if (rule.keys.some(k => t.includes(k))) return rule.cat;
  }
  return 'Other';
}

function getCategoryBadge(cat) {
  const c = cat || 'Other';
  const cls = 'cat-' + c.toLowerCase();
  const icon = CATEGORY_ICONS[c] || 'fa-box';
  return `<span class="cat-badge ${cls}"><i class="fa-solid ${icon}"></i> ${c}</span>`;
}

function salaryInputChanged(e) {
  const val = Number(e.target.value);
  const input = e.target;
  if (isNaN(val) || val < 0) {
    input.style.borderColor = 'rgba(255,80,80,0.9)';
    return;
  }
  input.style.borderColor = 'rgba(255,255,255,0.04)';
  salary = val;
  const totalEl = document.getElementById('total');
  if (totalEl) totalEl.innerText = salary;
  render();
}

async function saveSalary() {
  const input = document.getElementById('salaryInput');
  if (!input) return;
  const val = Number(input.value);
  if (input.value === '' || isNaN(val) || val < 0) {
    alert('Please enter a valid non-negative salary');
    input.focus();
    return;
  }

  // Try to save on backend if endpoint exists; fall back to updating in-memory only
  try {
    const res = await fetch('../api/salary/salary.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salary: val })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        salary = Number(data.salary ?? val);
        document.getElementById('total').innerText = salary;
        // refresh expenses/derived values
        await fetchExpenses();
        return;
      } else {
        // backend responded with error; fall back to in-memory
        console.warn('Save salary failed:', data);
      }
    } else {
      console.warn('Save salary HTTP error:', res.status);
    }
  } catch (err) {
    console.error('Save salary network error:', err);
  }

  // fallback: update in-memory only (no localStorage)
  salary = val;
  document.getElementById('total').innerText = salary;
  render();
}

// Fetch salary from backend
async function fetchSalary() {
  try {
    const res = await fetch('../api/salary/get_salary.php');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    if (data && data.status === 'success' && typeof data.salary !== 'undefined') {
      salary = Number(data.salary);
      const totalEl = document.getElementById('total');
      if (totalEl) totalEl.innerText = salary;
      const salaryInput = document.getElementById('salaryInput');
      if (salaryInput) salaryInput.value = salary || '';
    } else {
      console.warn('Salary API returned unexpected payload', data);
    }
  } catch (err) {
    console.error('Failed to fetch salary:', err);
  }
}

// Fetch expenses from backend
async function fetchExpenses() {
  try {
    const res = await fetch('../api/expenses/get_expenses.php');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    if (data && data.status === 'success') {
      expenses = Array.isArray(data.expenses) ? data.expenses : [];
      window._fullExpensesList = expenses;
    } else {
      console.warn('Expenses API returned unexpected payload', data);
      expenses = [];
      window._fullExpensesList = [];
    }

    // ── ONE calculateBudgetUsage call per fetch cycle ──
    const budgetsLoaded = await loadBudgets();
    if (budgetsLoaded || Object.keys(window._budgetsData || {}).length > 0) {
      calculateBudgetUsage();   // warms window._budgetMap
      updateBudgetUI();         // reads from cache — no recalc
    }
    render();                 // reads from cache — no recalc
    if (typeof renderExpensesTable === 'function') renderExpensesTable(); // reads from cache
  } catch (err) {
    console.error('Failed to fetch expenses:', err);
    expenses = [];
    window._fullExpensesList = [];
    render();
  }
}

// ADD EXPENSE (posts to backend with category, then reloads expenses)
async function addExpense() {
  const titleEl = document.getElementById('title');
  const amountEl = document.getElementById('amount');
  const catEl = document.getElementById('expenseCategory');
  if (!titleEl || !amountEl) return;

  const title = titleEl.value.trim();
  const amount = Number(amountEl.value);
  if (!title || isNaN(amount) || amount <= 0) {
    alert('Please enter a valid expense name and amount.');
    return;
  }

  // Category: user selection or smart detection
  let category = catEl ? catEl.value : '';
  if (!category) category = detectCategory(title);

  try {
    const res = await fetch('../api/expenses/add_expense.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount, category })
    });
    const data = await res.json();
    if (data.status === 'success') {
      // Clear form
      titleEl.value = '';
      amountEl.value = '';
      if (catEl) catEl.value = '';
      await fetchExpenses();
    } else {
      alert(data.message || 'Failed to add expense');
    }
  } catch (err) {
    console.error('Add expense failed:', err);
    alert('Failed to add expense');
  }
}

// DELETE expense by id
function deleteExpense(id) {
  if (typeof id === 'undefined' || id === null) return;
  fetch('../api/expenses/delete_expense.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  })
    .then(res => res.json())
    .then(async data => {
      await fetchExpenses();
    })
    .catch(err => {
      console.error('Delete expense failed:', err);
      alert('Failed to delete expense');
    });
}

// Render UI from in-memory `salary` and `expenses`
function render() {
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const remaining = salary - totalExpenses;

  const expensesEl = document.getElementById('expenses');
  const remainingEl = document.getElementById('remaining');
  if (expensesEl) expensesEl.innerText = totalExpenses.toLocaleString();

  if (remainingEl) {
    remainingEl.innerText = remaining.toLocaleString();
    const rCard = document.getElementById('remainingCard');
    if (rCard) {
      if (remaining > 0) {
        rCard.style.border = '2px solid var(--accent-a)';
        rCard.style.background = 'rgba(16, 185, 129, 0.03)';
      } else {
        rCard.style.border = '1px solid var(--border-color)';
        rCard.style.background = 'var(--card)';
      }
    }
  }

  // Read from cache (calculateBudgetUsage already ran in fetchExpenses)
  const cache = window._budgetMap || {};

  let html = '';
  expenses.forEach(e => {
    const id = e.id ?? '';
    // FIX: Properly handle e.Category vs e.category
    const catVal = e.category || e.Category || detectCategory(e.title);
    const propCat = normalizeCat(catVal);
    const date = e.Date || e.date || '—';
    const barHtml = getCategoryBudgetUI(propCat);

    html += `
      <tr>
        <td>${escapeHtml(String(e.title))}</td>
        <td>${barHtml}</td>
        <td>$ ${Number(e.amount).toLocaleString()}</td>
        <td style="font-size:13px;color:var(--muted)">${escapeHtml(date)}</td>
        <td>
          <div class="row-actions">
            <button class="btn-sm btn-danger" onclick="deleteExpense(${id})">🗑</button>
          </div>
        </td>
      </tr>
    `;
  });

  const table = document.getElementById('table');
  if (table) table.innerHTML = html;
}

// Analytics Data Globals
window._topCategoryAnalytics = null;
window._topCategoryAmount = 0;

async function fetchAnalytics() {
  try {
    const res = await fetch('../api/analytics/analytics.php');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    if (data && data.status === 'success' && data.analytics) {
      const a = data.analytics;

      // Update Monthly Performance Widget
      const perfWidget = document.getElementById('monthlyPerformanceWidget');
      const perfThisMonth = document.getElementById('perfThisMonth');
      const perfLastMonth = document.getElementById('perfLastMonth');
      const perfStatusLabel = document.getElementById('perfStatusLabel');
      const perfStatusAmount = document.getElementById('perfStatusAmount');

      if (perfWidget) {
        perfWidget.style.display = 'block';
        if (perfThisMonth) perfThisMonth.innerText = '$' + Number(a.this_month_total || 0).toLocaleString();
        if (perfLastMonth) perfLastMonth.innerText = '$' + Number(a.last_month_total || 0).toLocaleString();

        // Calculate: Salary - This Month Total
        const difference = salary - Number(a.this_month_total || 0);
        if (difference >= 0) {
          if (perfStatusLabel) perfStatusLabel.innerText = t('label_total_saved');
          if (perfStatusAmount) {
            perfStatusAmount.innerText = '$' + difference.toLocaleString();
            perfStatusAmount.style.color = 'var(--success)';
          }
        } else {
          if (perfStatusLabel) perfStatusLabel.innerText = t('msg_exceeded_budget');
          if (perfStatusAmount) {
            perfStatusAmount.innerText = '-$' + Math.abs(difference).toLocaleString();
            perfStatusAmount.style.color = 'var(--danger)';
          }
        }
      }

      // Update Savings History Widget
      const savingsWidget = document.getElementById('savingsHistoryWidget');
      const successRateValue = document.getElementById('successRateValue');
      if (savingsWidget) {
        savingsWidget.style.display = 'block';
        if (salary > 0) {
          const savedAmt = salary - Number(a.this_month_total || 0);
          const rate = savedAmt > 0 ? ((savedAmt / salary) * 100) : 0;
          if (successRateValue) successRateValue.innerText = Math.round(rate) + '%';
        } else {
          if (successRateValue) successRateValue.innerText = '0%';
        }
        const rateLabel = savingsWidget.querySelector('.label_success_rate_text') || savingsWidget.querySelector('div[style*="font-size:12px"]');
        if (rateLabel) rateLabel.innerText = t('label_success_rate');
      }

      // Store Top Category for Glowing Progress Bar
      window._topCategoryAnalytics = a.top_category !== '-' ? a.top_category : null;
      window._topCategoryAmount = a.top_category_amount || 0;

      // Trigger update to show glow
      updateBudgetUI();
    }
  } catch (err) {
    console.error('Failed to fetch analytics:', err);
  }
}

function updateMonthProgress() {
  const d = new Date();

  // Format current date: e.g. "Friday, May 1, 2026"
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = d.toLocaleDateString('default', dateOptions);

  // Month string: e.g. "May"
  const monthName = d.toLocaleString('default', { month: 'long' });

  // Calculate total days and remaining days
  const currentMonth = d.getMonth();
  const currentYear = d.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = d.getDate();
  const daysRemaining = daysInMonth - currentDay;

  // Update texts
  const currentDateEl = document.getElementById('currentDateDisplay');
  const daysRemainingEl = document.getElementById('daysRemainingDisplay');
  const messageEl = document.getElementById('monthProgressMessage');

  if (currentDateEl) currentDateEl.innerText = formattedDate;
  if (daysRemainingEl) daysRemainingEl.innerText = `⏳ ${daysRemaining} ${t('label_days_left')}`;
  if (messageEl) messageEl.innerText = `${t('label_stay_on_track')} ${daysRemaining} days to hit your savings goal.`;

  // Progress Ring
  const pct = Math.round((currentDay / daysInMonth) * 100);
  const ring = document.getElementById('monthProgressRing');
  const pctText = document.getElementById('monthProgressPct');

  if (pctText) pctText.innerText = `${pct}%`;
  if (ring) {
    const circumference = 2 * Math.PI * 40; // ~251.2
    // For stroke-dashoffset: 0 is 100% full, circumference is 0% full
    // So if 50% passed, we offset by 50% of circumference
    const offset = circumference - (pct / 100) * circumference;

    // We delay the ring animation slightly so the user sees it fill
    setTimeout(() => {
      ring.style.strokeDashoffset = offset;

      // Pulse Red if < 5 days
      if (daysRemaining < 5) {
        ring.style.stroke = 'var(--danger)';
        ring.style.filter = 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))';
        if (daysRemainingEl) {
          daysRemainingEl.style.color = 'var(--danger)';
          daysRemainingEl.style.animation = 'pulse-red 1.5s infinite';
        }
      } else {
        ring.style.stroke = 'var(--accent-a)';
        ring.style.filter = 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))';
        if (daysRemainingEl) {
          daysRemainingEl.style.color = 'inherit';
          daysRemainingEl.style.animation = 'none';
        }
      }
    }, 100);
  }
}

// Initialize: preferences → reveal body → fetch data
async function init() {
  // loadPreferences() is safe here: DOM is guaranteed ready (called from DOMContentLoaded)
  await loadPreferences();

  // Reveal body AFTER theme is confirmed applied — no FOUC
  document.body.classList.add('theme-ready');

  const totalEl = document.getElementById('total');
  if (totalEl) totalEl.innerText = salary;

  const salaryInput = document.getElementById('salaryInput');
  if (salaryInput) {
    salaryInput.value = salary || '';
    salaryInput.addEventListener('input', salaryInputChanged);
  }
  const saveBtn = document.getElementById('saveSalaryBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveSalary);

  // Fetch salary & expenses after theme is applied
  await fetchSalary();
  await loadBudgets(); // Globals
  await fetchBudgets(); // UI setup
  await fetchExpenses();
  await fetchAnalytics();
  updateMonthProgress();
}

// UI: show/hide main sections
function showSection(name) {
  const dashboard = document.getElementById('dashboardSection');
  const settings = document.getElementById('settingsSection');
  const expSec = document.getElementById('expensesSection');
  const analytics = document.getElementById('analyticsSection');
  const budgets = document.getElementById('budgetsSection');
  const allSections = [dashboard, settings, expSec, analytics, budgets];

  // Hide all first
  allSections.forEach(s => {
    if (!s) return;
    s.classList.add('section-hidden');
    s.setAttribute('aria-hidden', 'true');
  });

  // Show the requested one
  const target = {
    'dashboard': dashboard,
    'settings': settings,
    'expenses': expSec,
    'analytics': analytics,
    'budgets': budgets
  }[name];
  if (target) {
    target.classList.remove('section-hidden');
    target.setAttribute('aria-hidden', 'false');
  }

  // Update active nav link
  document.querySelectorAll('.top-nav a').forEach(a => a.classList.remove('active-link'));
  const navIdMap = { dashboard: 'navDashboard', expenses: 'navExpenses', analytics: 'navAnalytics', budgets: 'navBudgets', settings: 'settingsLink' };
  const activeNav = document.getElementById(navIdMap[name]);
  if (activeNav) activeNav.classList.add('active-link');
}



// Wire up sidebar and embedded settings behavior after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // --- Dashboard link ---
  const navDashboard = document.getElementById('navDashboard');
  if (navDashboard) {
    navDashboard.addEventListener('click', e => {
      e.preventDefault();
      showSection('dashboard');
    });
  }

  // --- Expenses link ---
  const navExpenses = document.getElementById('navExpenses');
  if (navExpenses) {
    navExpenses.addEventListener('click', async e => {
      e.preventDefault();
      showSection('expenses');
      await loadExpensesSection();
    });
  }

  // --- Analytics link ---
  const navAnalytics = document.getElementById('navAnalytics');
  if (navAnalytics) {
    navAnalytics.addEventListener('click', e => {
      e.preventDefault();
      showSection('analytics');
      renderAnalytics();
    });
  }

  // --- Budgets link ---
  const navBudgets = document.getElementById('navBudgets');
  if (navBudgets) {
    navBudgets.addEventListener('click', e => {
      e.preventDefault();
      showSection('budgets');
      renderBudgetOverview();
    });
  }

  // Refresh button inside Expenses section
  const expRefresh = document.getElementById('expensesRefreshBtn');
  if (expRefresh) expRefresh.addEventListener('click', async () => await loadExpensesSection());

  // Sidebar Settings link should open embedded settings section
  const settingsLink = document.getElementById('settingsLink');
  if (settingsLink) {
    settingsLink.addEventListener('click', function (e) {
      e.preventDefault();
      showSection('settings');

    });
  }

  // --- Accordion Logic ---
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('active');
    });
  });

  // Wire up embedded change password form
  const embeddedForm = document.getElementById('changePasswordFormEmbedded');
  if (embeddedForm) {
    embeddedForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const oldPassword = document.getElementById('oldPasswordEmbedded').value.trim();
      const newPassword = document.getElementById('newPasswordEmbedded').value.trim();
      const confirmPassword = document.getElementById('confirmPasswordEmbedded').value.trim();
      const inlineError = document.getElementById('inlineErrorEmbedded');
      const alertContainer = document.getElementById('settingsAlert');
      if (inlineError) inlineError.style.display = 'none';
      if (alertContainer) alertContainer.innerHTML = '';
      if (!oldPassword || !newPassword || !confirmPassword) {
        if (inlineError) { inlineError.textContent = 'All fields are required.'; inlineError.style.display = 'block'; }
        return;
      }
      if (newPassword !== confirmPassword) {
        if (inlineError) { inlineError.textContent = 'Passwords do not match.'; inlineError.style.display = 'block'; }
        return;
      }

      const payload = { password: oldPassword, new_password: newPassword, Confirm_Password: confirmPassword, id: (window.USER_ID || '') };
      const submitBtn = document.getElementById('submitBtnEmbedded');
      if (submitBtn) submitBtn.disabled = true;
      try {
        const res = await fetch('../api/Settings/Change_password.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(payload) });
        const data = await res.json();
        if (data && data.status === 'success') {
          if (alertContainer) alertContainer.innerHTML = `<div class="alert success">${data.message || 'password updated'}</div>`;
          embeddedForm.reset();
        } else {
          const msg = data && data.message ? data.message : 'An error occurred';
          if (alertContainer) alertContainer.innerHTML = `<div class="alert error">${msg}</div>`;
        }
      } catch (err) {
        console.error('Change password failed:', err);
        if (alertContainer) alertContainer.innerHTML = `<div class="alert error">Network error</div>`;
      } finally { if (submitBtn) submitBtn.disabled = false; }
    });
  }

  // --- Edit Profile form ---
  const editProfileForm = document.getElementById('editProfileForm');
  if (editProfileForm) {

    editProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Reset errors & alert
      const profileAlert = document.getElementById('profileAlert');
      const nameError = document.getElementById('profileNameError');
      const emailError = document.getElementById('profileEmailError');
      const saveBtn = document.getElementById('profileSaveBtn');
      const spinner = document.getElementById('profileSpinner');
      const btnText = document.getElementById('profileBtnText');
      if (profileAlert) profileAlert.innerHTML = '';
      if (nameError) { nameError.style.display = 'none'; nameError.textContent = ''; }
      if (emailError) { emailError.style.display = 'none'; emailError.textContent = ''; }

      const name = document.getElementById('profileName').value.trim();
      const email = document.getElementById('profileEmail').value.trim();

      // Partial-update validation: at least one field must be filled
      let valid = true;
      if (!name && !email) {
        // Neither field has a value — show a combined hint
        if (nameError) {
          nameError.textContent = 'Enter a name or email to update.';
          nameError.style.display = 'block';
        }
        valid = false;
      } else {
        // Validate email format only when the user actually typed something
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (emailError) {
            emailError.textContent = 'Please enter a valid email address.';
            emailError.style.display = 'block';
          }
          valid = false;
        }
      }
      if (!valid) return;

      // Loading state
      if (saveBtn) saveBtn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';
      if (btnText) btnText.textContent = 'Saving...';

      try {
        const res = await fetch('../api/Settings/Modify_personal_data.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(Object.fromEntries(
            Object.entries({ name, email }).filter(([, v]) => v !== '')
          ))
        });
        let data;
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          data = await res.json();
        } else {
          data = { status: res.ok ? 'success' : 'error', message: await res.text() };
        }
        if (res.ok && data.status !== 'error') {
          if (profileAlert) profileAlert.innerHTML = `<div class="alert success">✓ ${data.message || 'Profile updated successfully.'}</div>`;
          setTimeout(() => { if (profileAlert) profileAlert.innerHTML = ''; }, 4000);
        } else {
          if (profileAlert) profileAlert.innerHTML = `<div class="alert error">⚠ ${data.message || 'Failed to update profile.'}</div>`;
        }
      } catch (err) {
        console.error('Profile update failed:', err);
        if (profileAlert) profileAlert.innerHTML = '<div class="alert error">⚠ Network error. Please try again.</div>';
      } finally {
        if (saveBtn) saveBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
        if (btnText) btnText.textContent = 'Save Changes';
      }
    });
  }

  // --- Danger Zone: Delete Account Logic ---
  const initDeleteBtn = document.getElementById('initDeleteBtn');
  const deleteModal = document.getElementById('deleteModal');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const deleteConfirmInput = document.getElementById('deleteConfirmInput');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const deleteSpinner = document.getElementById('deleteSpinner');
  const deleteBtnText = document.getElementById('deleteBtnText');
  const deleteAlert = document.getElementById('deleteAlert');

  if (initDeleteBtn && deleteModal) {
    // Open Modal
    initDeleteBtn.addEventListener('click', () => {
      deleteModal.classList.add('active');
      deleteConfirmInput.value = '';
      confirmDeleteBtn.disabled = true;
      if (deleteAlert) deleteAlert.innerHTML = '';
      setTimeout(() => deleteConfirmInput.focus(), 100);
    });

    // Close Modal
    cancelDeleteBtn.addEventListener('click', () => {
      deleteModal.classList.remove('active');
    });

    // Validate Input ("DELETE")
    deleteConfirmInput.addEventListener('input', (e) => {
      if (e.target.value === 'DELETE') {
        confirmDeleteBtn.disabled = false;
      } else {
        confirmDeleteBtn.disabled = true;
      }
    });

    // Confirm Deletion
    confirmDeleteBtn.addEventListener('click', async () => {
      // Disable everything
      confirmDeleteBtn.disabled = true;
      deleteConfirmInput.disabled = true;
      cancelDeleteBtn.disabled = true;
      deleteSpinner.style.display = 'inline-block';
      if (deleteAlert) deleteAlert.innerHTML = '';

      // Countdown effect
      for (let i = 3; i > 0; i--) {
        deleteBtnText.textContent = `Deleting in ${i}...`;
        await new Promise(r => setTimeout(r, 1000));
      }
      deleteBtnText.textContent = 'Deleting...';

      try {
        const res = await fetch('../api/delete_user.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ confirm: 'DELETE' })
        });

        const data = await res.json();

        if (res.ok && data.status === 'success') {
          if (deleteAlert) deleteAlert.innerHTML = `<div class="alert success">✓ ${data.message || 'Account deleted'}</div>`;
          deleteBtnText.textContent = 'Redirecting...';
          deleteSpinner.style.display = 'none';
          setTimeout(() => {
            window.location.href = 'pro.html';
          }, 1500);
        } else {
          throw new Error(data.message || 'Failed to delete account');
        }
      } catch (err) {
        console.error('Delete account failed:', err);
        if (deleteAlert) deleteAlert.innerHTML = `<div class="alert error">⚠ ${err.message}</div>`;
        // Re-enable
        confirmDeleteBtn.disabled = false;
        deleteConfirmInput.disabled = false;
        cancelDeleteBtn.disabled = false;
        deleteSpinner.style.display = 'none';
        deleteBtnText.textContent = 'Delete Account';
        deleteConfirmInput.value = '';
      }
    });
  }

});

// --- Expenses full-page loader ---
async function loadExpensesSection() {
  const statusEl = document.getElementById('expensesStatus');
  const tbody = document.getElementById('expensesFullBody');
  const catFilter = document.getElementById('filterCategory');
  const monthFilter = document.getElementById('filterMonth');

  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.style.background = 'rgba(255,255,255,0.03)';
    statusEl.style.color = 'var(--muted)';
    statusEl.style.border = '1px solid rgba(255,255,255,0.04)';
    statusEl.innerHTML = '<span style="display:inline-flex;align-items:center;gap:10px"><span class="spinner"></span> Loading expenses...</span>';
  }
  if (tbody) tbody.innerHTML = '';

  try {
    const res = await fetch('../api/expenses/get_expenses.php', { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();

    if (!data || data.status !== 'success') {
      throw new Error(data.message || 'Unexpected response from server');
    }

    const list = Array.isArray(data.expenses) ? data.expenses : [];

    // Save to global for filters
    window._fullExpensesList = list;

    // Populate Month filter
    if (monthFilter) {
      const months = new Set();
      list.forEach(e => {
        if (e.date) months.add(e.date.substring(0, 7)); // YYYY-MM
      });

      const currentMonthVal = monthFilter.value;
      let monthOpts = '<option value="">All Months</option>';
      Array.from(months).sort().reverse().forEach(m => {
        monthOpts += `<option value="${m}">${m}</option>`;
      });
      monthFilter.innerHTML = monthOpts;
      if (Array.from(months).includes(currentMonthVal)) monthFilter.value = currentMonthVal;
    }

    // Attach filter listeners if not already attached
    if (catFilter && !catFilter.dataset.listening) {
      catFilter.addEventListener('change', renderExpensesTable);
      catFilter.dataset.listening = "true";
    }
    if (monthFilter && !monthFilter.dataset.listening) {
      monthFilter.addEventListener('change', renderExpensesTable);
      monthFilter.dataset.listening = "true";
    }

    if (statusEl) statusEl.style.display = 'none';

    renderExpensesTable();

  } catch (err) {
    console.error('loadExpensesSection error:', err);
    if (statusEl) {
      statusEl.style.display = 'block';
      statusEl.style.background = 'rgba(239,68,68,0.07)';
      statusEl.style.color = 'var(--danger)';
      statusEl.style.border = '1px solid rgba(239,68,68,0.15)';
      statusEl.innerHTML = `⚠ Failed to load expenses: ${escapeHtml(err.message)}`;
    }
  }
}

function renderExpensesTable() {
  const tbody = document.getElementById('expensesFullBody');
  const catFilter = document.getElementById('filterCategory');
  const monthFilter = document.getElementById('filterMonth');
  if (!tbody || !window._fullExpensesList) return;

  const catVal = catFilter ? catFilter.value : '';
  const monthVal = monthFilter ? monthFilter.value : '';

  let filtered = window._fullExpensesList;

  if (catVal) {
    filtered = filtered.filter(e => {
      // FIX: Properly handle e.Category vs e.category
      const c = e.category || e.Category || detectCategory(e.title) || 'Other';
      return c.toLowerCase() === catVal.toLowerCase();
    });
  }

  if (monthVal) {
    filtered = filtered.filter(e => (e.Date || e.date || '').startsWith(monthVal));
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="padding:24px 16px;color:var(--muted);font-size:14px;text-align:center">No expenses found matching the criteria.</td></tr>`;
    return;
  }

  // Read from cache — already computed in fetchExpenses, zero recalculation here
  const cache = window._budgetMap || {};

  let html = '';
  filtered.forEach((e, i) => {
    const id = e.id ?? '';
    // FIX: Properly handle e.Category vs e.category
    const catVal = e.category || e.Category || detectCategory(e.title);
    const propCat = normalizeCat(catVal);
    const date = e.Date || e.date || '—';
    const barHtml = getCategoryBudgetUI(propCat);

    html += `
      <tr>
        <td style="padding:13px 16px;background:var(--card);border-radius:10px 0 0 10px;color:var(--muted);font-size:13px">${i + 1}</td>
        <td style="padding:13px 16px;background:var(--card);font-weight:600">${escapeHtml(String(e.title))}</td>
        <td style="padding:13px 16px;background:var(--card)">${barHtml}</td>
        <td style="padding:13px 16px;background:var(--card);color:var(--success)">$ ${Number(e.amount).toLocaleString()}</td>
        <td style="padding:13px 16px;background:var(--card);color:var(--muted);font-size:13px">${escapeHtml(date)}</td>
        <td style="padding:13px 16px;background:var(--card);border-radius:0 10px 10px 0">
          <button class="btn-sm btn-danger" onclick="deleteExpense(${id})">🗑</button>
        </td>
      </tr>`;
  });
  tbody.innerHTML = html;
}

// XSS-safe string escaper
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// init() is now called from DOMContentLoaded to ensure DOM is ready
//----------------------
// LOGOUT
//----------------------
function logout() {

  fetch("../api/Logout.php", {
    method: "POST"
  })
    .then(res => res.json())
    .then(data => {

      alert(data.message);

      if (data.status === "success") {
        window.location.href = "pro.html";
      }

    })
    .catch((err) => {
      console.error('Logout failed:', err);
      alert("Logout failed");
    });

}
//----------------------
// PREFERENCES
//----------------------
// Toggle logic
function setToggleActive(groupId, value) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.toggle-item').forEach(btn => {
    if (btn.dataset.value === value) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function getToggleValue(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return null;
  const activeBtn = group.querySelector('.toggle-item.active');
  return activeBtn ? activeBtn.dataset.value : null;
}

function initToggles() {
  document.querySelectorAll('.toggle-group').forEach(group => {
    group.querySelectorAll('.toggle-item').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.toggle-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Immediate dark mode switch
        if (group.id === 'prefDarkModeGroup') {
          if (btn.dataset.value === '1') {
            document.documentElement.classList.add('dark-mode');
          } else {
            document.documentElement.classList.remove('dark-mode');
          }
        }
      });
    });
  });
}

// Safe toggle setter — no-ops if element not in DOM yet
function safeSetToggle(id, value) {
  const el = document.getElementById(id);
  if (el) setToggleActive(id, value);
}

async function loadPreferences() {
  try {
    let data;

    if (window.__prefsPromise) {
      data = await window.__prefsPromise;
      window.__prefsPromise = null;
    } else {
      const res = await fetch('../api/Settings/user/get_preferences.php', {
        credentials: 'same-origin'
      });
      if (!res.ok) throw new Error('Server error');
      data = await res.json();
    }

    if (data?.status === 'success' && data.preferences) {
      const prefs = data.preferences;

      const isDark = prefs.dark_mode == 1 || prefs.dark_mode === true;
      const isNotif = prefs.notifications == 1 || prefs.notifications === true;
      const lang = prefs.language || 'en';

      safeSetToggle('prefDarkModeGroup', isDark ? '1' : '0');
      safeSetToggle('prefNotificationsGroup', isNotif ? '1' : '0');
      safeSetToggle('prefLanguageGroup', lang);

      document.documentElement.classList.toggle('dark-mode', isDark);
      updateTopIcons(isDark, isNotif);
    }

  } catch (err) {
    console.error('Preferences load failed:', err);
  } finally {

    document.body.classList.add('theme-ready');
  }
}

async function savePreferences() {
  const alertEl = document.getElementById('preferencesAlert');
  const btn = document.getElementById('preferencesSaveBtn');
  const spinner = document.getElementById('preferencesSpinner');
  const btnText = document.getElementById('preferencesBtnText');

  if (alertEl) alertEl.innerHTML = '';
  if (btn) btn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';
  if (btnText) btnText.textContent = 'Saving...';

  const darkMode = getToggleValue('prefDarkModeGroup') === '1' ? true : false;
  const notifications = getToggleValue('prefNotificationsGroup') === '1' ? true : false;
  const language = getToggleValue('prefLanguageGroup') || 'en';

  try {
    const res = await fetch('../api/Settings/user/save_preferences.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ dark_mode: darkMode, notifications: notifications, language: language })
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Preferences parse error:', e);
      throw new Error('Invalid JSON response from server');
    }

    if (res.ok && data.status === 'success') {
      if (alertEl) alertEl.innerHTML = `<div class="alert success">✓ ${data.message || 'Preferences saved successfully.'}</div>`;
      if (darkMode) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
      updateTopIcons(darkMode, notifications);
      setTimeout(() => { if (alertEl) alertEl.innerHTML = ''; }, 4000);
    } else {
      if (alertEl) alertEl.innerHTML = `<div class="alert error">⚠ ${data.message || 'Failed to save preferences.'}</div>`;
    }
  } catch (err) {
    console.error('Save preferences failed:', err);
    if (alertEl) alertEl.innerHTML = `<div class="alert error">⚠ Error: ${err.message}</div>`;
  } finally {
    if (btn) btn.disabled = false;
    if (spinner) spinner.style.display = 'none';
    if (btnText) btnText.textContent = 'Save Preferences';
  }
}

// ═══════════ ANALYTICS LOGIC ═══════════
let categoryPieChart = null;
let monthlyBarChart = null;

function renderAnalytics(timeframe = 'month', specificValue = null) {
  if (!window._fullExpensesList) window._fullExpensesList = expenses;
  const fullList = window._fullExpensesList;

  const now = new Date();

  // Base prefixes (defaulting to current)
  let currentDayPrefix = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  let currentMonthPrefix = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  let currentYearPrefix = String(now.getFullYear());

  // Apply specific value if provided
  if (timeframe === 'day' && specificValue) {
    currentDayPrefix = specificValue;
  } else if (timeframe === 'month' && specificValue) {
    currentMonthPrefix = specificValue;
  } else if (timeframe === 'year' && specificValue) {
    currentYearPrefix = specificValue;
  }

  // Populate Pickers if empty
  const dayPicker = document.getElementById('analyticsDayPicker');
  const monthPicker = document.getElementById('analyticsMonthPicker');
  const yearPicker = document.getElementById('analyticsYearPicker');

  if (dayPicker && !dayPicker.value) {
    dayPicker.value = currentDayPrefix;
  }

  if (monthPicker && monthPicker.options.length === 0) {
    const months = new Set();
    const years = new Set();
    fullList.forEach(e => {
      if (e.date) {
        months.add(e.date.substring(0, 7)); // YYYY-MM
        years.add(e.date.substring(0, 4)); // YYYY
      }
    });
    months.add(now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0'));
    years.add(String(now.getFullYear()));

    let monthOpts = '';
    Array.from(months).sort().reverse().forEach(m => {
      const d = new Date(m + '-01');
      const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      monthOpts += `<option value="${m}">${label}</option>`;
    });
    monthPicker.innerHTML = monthOpts;
    monthPicker.value = currentMonthPrefix;

    if (yearPicker) {
      let yearOpts = '';
      Array.from(years).sort().reverse().forEach(y => {
        yearOpts += `<option value="${y}">${y}</option>`;
      });
      yearPicker.innerHTML = yearOpts;
      yearPicker.value = currentYearPrefix;
    }
  }

  // Filter list - Direct comparison for Day since format is YYYY-MM-DD
  let list = [];
  if (timeframe === 'day') {
    list = fullList.filter(e => e.date === currentDayPrefix);
  } else if (timeframe === 'year') {
    list = fullList.filter(e => e.date && e.date.startsWith(currentYearPrefix));
  } else {
    list = fullList.filter(e => e.date && e.date.startsWith(currentMonthPrefix));
  }

  // 1. Calculate Totals
  let totalSpent = 0;
  const catTotals = {};

  list.forEach(e => {
    const amt = parseFloat(e.amount || 0);
    // Fallback to "Other" if category is missing or invalid
    const cat = e.category || detectCategory(e.title) || 'Other';
    totalSpent += amt;
    catTotals[cat] = (catTotals[cat] || 0) + amt;
  });

  const avgExpense = list.length > 0 ? (totalSpent / list.length) : 0;

  let topCat = '—';
  let topCatAmt = 0;
  for (const [c, amt] of Object.entries(catTotals)) {
    if (amt > topCatAmt) { topCatAmt = amt; topCat = c; }
  }

  // Update Summary Cards
  document.getElementById('anTotalSpent').innerText = '$' + totalSpent.toLocaleString();
  document.getElementById('anAvgExpense').innerText = '$' + Math.round(avgExpense).toLocaleString();
  document.getElementById('anTopCategory').innerText = topCat;
  document.getElementById('anExpenseCount').innerText = list.length;

  let subLabel = 'This month';
  if (timeframe === 'day') subLabel = currentDayPrefix;
  if (timeframe === 'month') subLabel = currentMonthPrefix;
  if (timeframe === 'year') subLabel = currentYearPrefix;
  document.getElementById('anTotalSpentSub').innerText = subLabel;

  // 2. Charts
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: 'var(--muted)', padding: 16, font: { family: 'Inter' } } }
    }
  };

  // Pie Chart
  const pieCtx = document.getElementById('categoryPieChart');
  if (pieCtx) {
    if (categoryPieChart) categoryPieChart.destroy();

    if (list.length === 0) {
      categoryPieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: { labels: ['No expenses'], datasets: [{ data: [1], backgroundColor: ['#333'] }] },
        options: { ...chartOptions, cutout: '65%', plugins: { legend: { display: false } } }
      });
    } else {
      const labels = Object.keys(catTotals);
      const data = Object.values(catTotals);
      const bgColors = labels.map(c => CATEGORY_COLORS[c] || CATEGORY_COLORS.Other);

      categoryPieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: { labels: labels, datasets: [{ data: data, backgroundColor: bgColors, borderWidth: 0 }] },
        options: { ...chartOptions, cutout: '65%' }
      });
    }
  }

  // Bar Chart (Dynamic)
  const barCtx = document.getElementById('monthlyBarChart');
  if (barCtx) {
    if (monthlyBarChart) monthlyBarChart.destroy();

    const timeMap = {};
    let barTitle = '';

    if (timeframe === 'day') {
      barTitle = 'Daily Spending (7 Days)';
      const parts = currentDayPrefix.split('-');
      const targetDate = new Date(parts[0], parts[1] - 1, parts[2]);

      for (let i = 6; i >= 0; i--) {
        const d = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() - i);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const label = d.toLocaleDateString(currentLang, { weekday: 'short' });
        timeMap[key] = { label, total: 0 };
      }
      fullList.forEach(e => {
        if (e.date && timeMap[e.date]) {
          timeMap[e.date].total += parseFloat(e.amount || 0);
        }
      });

    } else if (timeframe === 'year') {
      barTitle = 'Monthly Spending';
      const y = parseInt(currentYearPrefix);
      for (let i = 0; i < 12; i++) {
        const d = new Date(y, i, 1);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        const monthShort = d.toLocaleString('en', { month: 'short' }).toLowerCase();
        const label = t('month_' + monthShort);
        timeMap[key] = { label, total: 0 };
      }
      fullList.forEach(e => {
        if (e.date && e.date.startsWith(currentYearPrefix)) {
          const key = e.date.substring(0, 7);
          if (timeMap[key]) timeMap[key].total += parseFloat(e.amount || 0);
        }
      });

    } else {
      barTitle = 'Monthly Spending';
      const parts = currentMonthPrefix.split('-');
      const targetDate = new Date(parts[0], parts[1] - 1, 1);

      for (let i = 5; i >= 0; i--) {
        const d = new Date(targetDate.getFullYear(), targetDate.getMonth() - i, 1);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        const monthShort = d.toLocaleString('en', { month: 'short' }).toLowerCase();
        const label = t('month_' + monthShort);
        timeMap[key] = { label, total: 0 };
      }
      fullList.forEach(e => {
        if (e.date) {
          const key = e.date.substring(0, 7);
          if (timeMap[key]) timeMap[key].total += parseFloat(e.amount || 0);
        }
      });
    }

    const barTitleEl = barCtx.parentElement.previousElementSibling;
    if (barTitleEl) barTitleEl.innerHTML = `<i class="fa-solid fa-chart-bar" style="color:var(--accent-b);margin-right:8px"></i>${barTitle}`;

    monthlyBarChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: Object.values(timeMap).map(m => m.label),
        datasets: [{
          label: t('label_spending'),
          data: Object.values(timeMap).map(m => m.total),
          backgroundColor: (() => {
            let ctx = barCtx.getContext('2d');
            let gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
            return gradient;
          })(),
          borderRadius: 6
        }]
      },
      options: {
        ...chartOptions,
        scales: {
          y: { beginAtZero: true, grid: { color: 'var(--border-color)' }, ticks: { color: 'var(--muted)' } },
          x: { grid: { display: false }, ticks: { color: 'var(--muted)' } }
        }
      }
    });
  }

  // 3. Category Breakdown Table
  const tbody = document.getElementById('categoryBreakdownBody');
  if (tbody) {
    let html = '';
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

    sortedCats.forEach(([cat, amt]) => {
      const pct = totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(1) : 0;
      const count = list.filter(e => (e.category || detectCategory(e.title) || 'Other') === cat).length;
      const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;

      html += `
        <tr>
          <td>${getCategoryBadge(cat)}</td>
          <td style="font-weight:600">$${amt.toLocaleString()}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="cat-pct-bar" style="flex:1"><div class="cat-pct-fill" style="width:${pct}%; background:${color}"></div></div>
              <span style="font-size:12px;color:var(--muted);width:35px">${pct}%</span>
            </div>
          </td>
          <td style="color:var(--muted)">${count}</td>
        </tr>
      `;
    });
    tbody.innerHTML = html || `<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--muted)">No data available for this ${timeframe}</td></tr>`;
  }

  // 4. Smart Insights
  const insightsEl = document.getElementById('insightsPanel');
  if (insightsEl) {
    let insightsHtml = '';

    if (list.length === 0) {
      insightsHtml = `
        <div class="insight-card">
          <div class="insight-icon"><i class="fa-solid fa-seedling"></i></div>
          <div><strong>You're just getting started!</strong><br><span style="color:var(--muted)">Add an expense to see insights here.</span></div>
        </div>`;
    } else {
      // Insight 1: Top Category
      if (topCatAmt > 0 && totalSpent > 0) {
        const pct = Math.round((topCatAmt / totalSpent) * 100);
        insightsHtml += `
          <div class="insight-card">
            <div class="insight-icon" style="color:${CATEGORY_COLORS[topCat]}"><i class="fa-solid ${CATEGORY_ICONS[topCat]}"></i></div>
            <div><strong>${t('label_' + topCat.toLowerCase())} ${t('msg_biggest_expense')}</strong><br><span style="color:var(--muted)">It makes up ${pct}% of your spending this ${timeframe}.</span></div>
          </div>`;
      }

      // Insight 2: Number of expenses
      insightsHtml += `
        <div class="insight-card">
          <div class="insight-icon" style="color:var(--accent-b)"><i class="fa-solid fa-receipt"></i></div>
          <div><strong>${t('title_active_tracking')}</strong><br><span style="color:var(--muted)">${t('msg_recorded_expenses')} this ${timeframe}.</span></div>
        </div>`;

      // Insight 3: Trend (only for month/day to keep it simple, or customize)
      if (timeframe === 'month') {
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthPrefix = lastMonthDate.getFullYear() + '-' + String(lastMonthDate.getMonth() + 1).padStart(2, '0');
        const lastMonthVal = fullList.filter(e => e.date && e.date.startsWith(lastMonthPrefix)).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

        if (lastMonthVal > 0) {
          if (totalSpent > lastMonthVal) {
            insightsHtml += `
              <div class="insight-card">
                <div class="insight-icon" style="color:var(--danger)"><i class="fa-solid fa-arrow-trend-up"></i></div>
                <div><strong>Spending is up</strong><br><span style="color:var(--muted)">You've spent more this month ($${totalSpent}) than last month ($${lastMonthVal}).</span></div>
              </div>`;
          } else {
            insightsHtml += `
              <div class="insight-card">
                <div class="insight-icon" style="color:var(--success)"><i class="fa-solid fa-arrow-trend-down"></i></div>
                <div><strong>Saving money!</strong><br><span style="color:var(--muted)">You've spent less this month ($${totalSpent}) compared to last month ($${lastMonthVal}).</span></div>
              </div>`;
          }
        }
      } else if (timeframe === 'day') {
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const yesterdayPrefix = yesterday.getFullYear() + '-' + String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + String(yesterday.getDate()).padStart(2, '0');
        const yesterdayVal = fullList.filter(e => e.date && e.date.startsWith(yesterdayPrefix)).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

        if (yesterdayVal > 0) {
          if (totalSpent > yesterdayVal) {
            insightsHtml += `
              <div class="insight-card">
                <div class="insight-icon" style="color:var(--danger)"><i class="fa-solid fa-arrow-trend-up"></i></div>
                <div><strong>Higher spending</strong><br><span style="color:var(--muted)">You've spent more today ($${totalSpent}) than yesterday ($${yesterdayVal}).</span></div>
              </div>`;
          } else {
            insightsHtml += `
              <div class="insight-card">
                <div class="insight-icon" style="color:var(--success)"><i class="fa-solid fa-arrow-trend-down"></i></div>
                <div><strong>Spending less</strong><br><span style="color:var(--muted)">You've spent less today ($${totalSpent}) compared to yesterday ($${yesterdayVal}).</span></div>
              </div>`;
          }
        }
      }
    }

    insightsEl.innerHTML = insightsHtml;
  }
}

function updateTopIcons(isDark, isNotif) {
  const themeBtn = document.getElementById('topThemeToggle');
  const notifBtn = document.getElementById('topNotifToggle');

  if (themeBtn) {
    themeBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  }
  if (notifBtn) {
    notifBtn.innerHTML = isNotif ? '<i class="fa-solid fa-bell"></i>' : '<i class="fa-solid fa-bell-slash"></i>';
  }
}

// ═══════════ SMART BUDGET ALLOCATION LOGIC ═══════════
let userBudgets = {};

// Attach event listeners to all budget inputs for real-time validation
document.querySelectorAll('.budget-input').forEach(input => {
  input.addEventListener('input', calculateRemaining);
});

async function fetchBudgets() {
  try {
    const res = await fetch('../api/expenses/get_budgets_Category.php');
    if (res.ok) {
      const result = await res.json();
      if (result.status === 'success' && result.budgets) {
        userBudgets = result.budgets;
        // Populate the form fields
        CATEGORIES.forEach(cat => {
          const el = document.getElementById('b_' + cat);
          if (el) el.value = userBudgets[cat] || '';
        });
      }
    }
  } catch (e) {
    console.error("Error fetching budgets:", e);
  } finally {
    // Run the remaining calculation to set initial state
    calculateRemaining();
  }
}

function calculateRemaining() {
  const maxLimit = Number(salary) || 0;
  let currentSum = 0;

  // Sum up all current values from inputs
  CATEGORIES.forEach(cat => {
    const el = document.getElementById('b_' + cat);
    if (el) currentSum += Number(el.value) || 0;
  });

  const remaining = maxLimit - currentSum;
  const percentUsed = maxLimit > 0 ? (currentSum / maxLimit) * 100 : 0;

  // UI Elements
  const remEl = document.getElementById('allocRemaining');
  const totEl = document.getElementById('allocTotalSalary');
  const barEl = document.getElementById('allocBarFill');
  const warnEl = document.getElementById('allocWarningMsg');
  const saveBtn = document.getElementById('saveBudgetsBtn');

  if (totEl) totEl.innerText = `$${maxLimit.toLocaleString()}`;
  if (remEl) remEl.innerText = `$${remaining.toLocaleString()}`;

  if (barEl) {
    const visualPct = Math.min(100, percentUsed);
    barEl.style.width = `${visualPct}%`;

    // Smooth Neon Logic based on Salary Usage
    barEl.className = 'tracker-fill';
    if (percentUsed > 100) barEl.classList.add('tracker-danger');
    else if (percentUsed >= 85) barEl.classList.add('tracker-warning');
    else barEl.classList.add('tracker-safe');
  }

  // Warning System & Validation Lock
  if (remaining < 0) {
    if (remEl) remEl.style.color = '#ef4444'; // Red
    if (warnEl) warnEl.style.display = 'block';
    if (saveBtn) saveBtn.disabled = true;
  } else {
    if (remEl) remEl.style.color = '#22c55e'; // Green
    if (warnEl) warnEl.style.display = 'none';
    if (saveBtn) saveBtn.disabled = false;
  }
}

async function saveBudgets() {
  const msgEl = document.getElementById('saveBudgetsMsg');
  const btn = document.getElementById('saveBudgetsBtn');

  if (msgEl) msgEl.innerHTML = '';
  if (btn) btn.disabled = true;

  // Final Validation Check before sending
  const maxLimit = Number(salary) || 0;
  let currentSum = 0;
  CATEGORIES.forEach(cat => {
    const el = document.getElementById('b_' + cat);
    if (el) currentSum += Number(el.value) || 0;
  });

  if (currentSum > maxLimit) {
    if (msgEl) msgEl.innerHTML = '<span style="color:#ef4444">Cannot save: Total budgets exceed your Salary Limit.</span>';
    return;
  }

  const data = {
    Food: parseFloat(document.getElementById('b_Food').value || 0),
    Bills: parseFloat(document.getElementById('b_Bills').value || 0),
    Transport: parseFloat(document.getElementById('b_Transport').value || 0),
    Shopping: parseFloat(document.getElementById('b_Shopping').value || 0),
    Entertainment: parseFloat(document.getElementById('b_Entertainment').value || 0),
    Health: parseFloat(document.getElementById('b_Health').value || 0),
    Other: parseFloat(document.getElementById('b_Other').value || 0)
  };

  try {
    const res = await fetch('../api/expenses/save_budgets_Category.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.status === 'success') {
      if (msgEl) msgEl.innerHTML = '<span style="color:var(--success)">Budgets saved successfully!</span>';

      // Completely sync globals and entire UI immediately
      await loadBudgets();
      calculateBudgetUsage();
      render();
      updateBudgetUI();
      if (typeof renderExpensesTable === 'function') renderExpensesTable();
      if (typeof renderBudgetOverview === 'function') renderBudgetOverview();

      setTimeout(() => { if (msgEl) msgEl.innerHTML = ''; }, 3000);
    } else {
      if (msgEl) msgEl.innerHTML = `<span style="color:var(--danger)">${result.message || 'Error saving'}</span>`;
    }
  } catch (e) {
    console.error('Save budgets failed:', e);
    if (msgEl) msgEl.innerHTML = '<span style="color:var(--danger)">Network error</span>';
  } finally {
    // Re-run remaining calc which handles button unlocking appropriately
    calculateRemaining();
  }
}

function calculateCategorySpending(expensesList, budgets) {
  const categories = ['Food', 'Bills', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Other'];
  const spending = {};

  categories.forEach(cat => {
    spending[cat] = {
      spent: 0,
      budget: parseFloat(budgets[cat] || 0),
      remaining: 0,
      percentage: 0
    };
  });

  const now = new Date();
  const currentMonthPrefix = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

  // Only track current month's spending against budgets
  expensesList.forEach(e => {
    if (e.date && e.date.startsWith(currentMonthPrefix)) {
      let cat = e.category || detectCategory(e.title) || 'Other';
      if (!spending[cat]) cat = 'Other';
      spending[cat].spent += parseFloat(e.amount || 0);
    }
  });

  categories.forEach(cat => {
    const s = spending[cat];
    s.remaining = s.budget - s.spent;
    if (s.budget > 0) {
      s.percentage = Math.min(100, Math.round((s.spent / s.budget) * 100));
    }
  });

  return spending;
}

function renderBudgetOverview() {
  const container = document.getElementById('budgetProgressContainer');
  if (!container) return;

  if (!window._fullExpensesList) window._fullExpensesList = expenses;
  const list = window._fullExpensesList;

  const spending = calculateCategorySpending(list, userBudgets);
  const categories = Object.keys(spending);
  let html = '';

  categories.forEach(cat => {
    const s = spending[cat];
    if (s.budget <= 0 && s.spent <= 0) return; // Skip completely empty/unused categories

    let statusClass = 'status-good';
    if (s.percentage >= 90) statusClass = 'status-danger';
    else if (s.percentage >= 70) statusClass = 'status-warning';

    const exceeded = s.spent > s.budget && s.budget > 0;

    html += `
      <div class="budget-item ${exceeded ? 'exceeded' : ''}">
        <div class="budget-header">
          <span style="display:flex;align-items:center;gap:6px">${getCategoryBadge(cat)}</span>
          <span>$${s.spent.toLocaleString()} / <span class="budget-meta">${s.budget > 0 ? '$' + s.budget.toLocaleString() : t('msg_no_budget')}</span></span>
        </div>
        <div class="progress-bg">
          <div class="progress-fill ${statusClass}" style="width: ${s.budget > 0 ? s.percentage : 0}%"></div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="budget-meta">${s.budget > 0 ? s.percentage + '% ' + t('label_used') : t('msg_set_budget_track')}</span>
          <span class="budget-meta">${s.budget > 0 ? (s.remaining >= 0 ? '$' + s.remaining.toLocaleString() + ' ' + t('label_left') : '<span style="color:var(--danger)">-$' + Math.abs(s.remaining).toLocaleString() + '</span>') : ''}</span>
        </div>
        <div class="budget-warning">⚠ ${t('msg_exceeded_budget_pre')} ${t('label_' + cat.toLowerCase())} ${t('msg_exceeded_budget_post')}</div>
      </div>
    `;
  });

  container.innerHTML = html || `<div style="color:var(--muted); font-size:13px">${t('msg_no_active_budgets')}</div>`;
}

function updateDashboardBudgets() {
  const container = document.getElementById('dashboardBudgetContainer');
  if (!container) return;

  if (!window._fullExpensesList) window._fullExpensesList = expenses;
  const list = window._fullExpensesList;

  const spending = calculateCategorySpending(list, userBudgets);
  const categories = Object.keys(spending);
  let html = '';

  categories.forEach(cat => {
    const s = spending[cat];
    if (s.budget <= 0 && s.spent <= 0) return; // Skip if unused and no budget

    let statusClass = 'status-good';
    if (s.percentage >= 90) statusClass = 'status-danger';
    else if (s.percentage >= 70) statusClass = 'status-warning';

    html += `
      <div class="budget-item" style="margin-bottom:12px;">
        <div class="budget-header" style="margin-bottom:6px; font-size:13px; font-weight:600;">
          <span style="display:flex;align-items:center;gap:6px">${getCategoryBadge(cat)}</span>
          <span style="font-size:12px;">${s.percentage}% <span style="color:var(--muted); font-weight:400">($${s.spent.toLocaleString()} / $${s.budget.toLocaleString()})</span></span>
        </div>
        <div class="progress-bg" style="height:6px;">
          <div class="progress-fill ${statusClass}" style="width: ${s.budget > 0 ? Math.min(s.percentage, 100) : 0}%"></div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html || '<div style="color:var(--muted); font-size:13px">No active budgets to display.</div>';
}

function updateTopIcons(isDark, isNotif) {
  const themeBtn = document.getElementById('topThemeToggle');
  const notifBtn = document.getElementById('topNotifToggle');

  if (themeBtn) {
    themeBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  }
  if (notifBtn) {
    notifBtn.innerHTML = isNotif ? '<i class="fa-solid fa-bell"></i>' : '<i class="fa-solid fa-bell-slash"></i>';
  }
}

async function _savePreferencesQuiet(prefs) {
  try {
    await fetch('../api/Settings/user/save_preferences.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(prefs)
    });
  } catch (err) {
    console.error('Silent save prefs failed', err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Wire toggle click handlers (before init so clicks work immediately)
  initToggles();

  // 2. Boot app — init() calls loadPreferences() internally (DOM is ready here)
  await init();

  // 3. Default visible section
  showSection('dashboard');

  // 4. Top-bar theme toggle
  const topThemeToggle = document.getElementById('topThemeToggle');
  if (topThemeToggle) {
    topThemeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark-mode');
      const newDark = !isDark;
      setToggleActive('prefDarkModeGroup', newDark ? '1' : '0');
      if (newDark) document.documentElement.classList.add('dark-mode');
      else document.documentElement.classList.remove('dark-mode');
      const isNotif = getToggleValue('prefNotificationsGroup') === '1';
      const lang = getToggleValue('prefLanguageGroup') || 'en';
      updateTopIcons(newDark, isNotif);
      _savePreferencesQuiet({ dark_mode: newDark, notifications: isNotif, language: lang });
    });
  }

  // 5. Top-bar notifications toggle
  const topNotifToggle = document.getElementById('topNotifToggle');
  if (topNotifToggle) {
    topNotifToggle.addEventListener('click', () => {
      const isNotif = getToggleValue('prefNotificationsGroup') === '1';
      const newNotif = !isNotif;
      setToggleActive('prefNotificationsGroup', newNotif ? '1' : '0');
      const isDark = document.documentElement.classList.contains('dark-mode');
      const lang = getToggleValue('prefLanguageGroup') || 'en';
      updateTopIcons(isDark, newNotif);
      _savePreferencesQuiet({ dark_mode: isDark, notifications: newNotif, language: lang });
    });
  }
  // 6. Analytics Time Filter
  const timeFilterGroup = document.getElementById('analyticsTimeFilter');
  const dayPicker = document.getElementById('analyticsDayPicker');
  const monthPicker = document.getElementById('analyticsMonthPicker');
  const yearPicker = document.getElementById('analyticsYearPicker');

  if (timeFilterGroup) {
    timeFilterGroup.querySelectorAll('.toggle-item').forEach(btn => {
      btn.addEventListener('click', () => {
        // Update UI state
        timeFilterGroup.querySelectorAll('.toggle-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const timeframe = btn.dataset.value;

        // Show/hide pickers
        if (dayPicker) dayPicker.style.display = timeframe === 'day' ? 'inline-block' : 'none';
        if (monthPicker) monthPicker.style.display = timeframe === 'month' ? 'inline-block' : 'none';
        if (yearPicker) yearPicker.style.display = timeframe === 'year' ? 'inline-block' : 'none';

        // Re-render analytics with selected timeframe
        let specificVal = null;
        if (timeframe === 'day' && dayPicker) specificVal = dayPicker.value || null;
        if (timeframe === 'month' && monthPicker) specificVal = monthPicker.value || null;
        if (timeframe === 'year' && yearPicker) specificVal = yearPicker.value || null;

        renderAnalytics(timeframe, specificVal);
      });
    });
  }

  // Handle picker changes
  const handlePickerChange = () => {
    const activeBtn = timeFilterGroup ? timeFilterGroup.querySelector('.toggle-item.active') : null;
    const timeframe = activeBtn ? activeBtn.dataset.value : 'month';
    let specificVal = null;
    if (timeframe === 'day' && dayPicker) specificVal = dayPicker.value;
    if (timeframe === 'month' && monthPicker) specificVal = monthPicker.value;
    if (timeframe === 'year' && yearPicker) specificVal = yearPicker.value;
    renderAnalytics(timeframe, specificVal);
  };

  if (dayPicker) dayPicker.addEventListener('change', handlePickerChange);
  if (monthPicker) monthPicker.addEventListener('change', handlePickerChange);
  if (yearPicker) yearPicker.addEventListener('change', handlePickerChange);

  // 7. Global Language Change Re-render
  document.addEventListener('languagechange', () => {
    // Re-render all dynamic components
    render(); 
    updateBudgetUI();
    updateMonthProgress();
    
    // If analytics section is visible, re-render charts
    const analyticsSec = document.getElementById('analyticsSection');
    if (analyticsSec && !analyticsSec.classList.contains('section-hidden')) {
        const activeBtn = timeFilterGroup ? timeFilterGroup.querySelector('.toggle-item.active') : null;
        const timeframe = activeBtn ? activeBtn.dataset.value : 'month';
        let specificVal = null;
        if (timeframe === 'day' && dayPicker) specificVal = dayPicker.value;
        if (timeframe === 'month' && monthPicker) specificVal = monthPicker.value;
        if (timeframe === 'year' && yearPicker) specificVal = yearPicker.value;
        renderAnalytics(timeframe, specificVal);
    }
    
    // Update dashboard and budgets
    if (typeof renderExpensesTable === 'function') renderExpensesTable();
    if (typeof renderBudgetOverview === 'function') renderBudgetOverview();
    if (typeof updateDashboardBudgets === 'function') updateDashboardBudgets();
  });
});

