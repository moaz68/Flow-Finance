/**
 * ============================================================
 *  i18n.js  —  Arabic / English Internationalization Module
 *  Supports: English (en) · Arabic (ar)
 * ============================================================
 */

const TRANSLATIONS = {
  en: {
    // Navigation
    nav_dashboard: 'Dashboard',
    nav_expenses: 'Expenses',
    nav_analytics: 'Analytics',
    nav_budgets: 'Budgets',
    nav_settings: 'Settings',
    nav_logout: 'Logout',

    // Titles & Sections
    title_budget_dashboard: 'Budget Dashboard',
    subtitle_finances: 'Personal finances — clean & simple',
    section_account: 'Account',
    section_security: 'Security',
    section_preferences: 'Preferences',
    title_monthly_performance: 'Monthly Performance',
    title_budget_progress: 'Budget Progress',
    title_add_expense: '➕ Add Expense',
    title_expenses_table: '🧾 Expenses',
    title_analytics: 'Analytics',
    title_savings_history: 'Savings History',
    title_category_distribution: 'Category Distribution',
    title_monthly_spending: 'Monthly Spending',
    title_smart_insights: 'Smart Insights',
    title_category_breakdown: 'Category Breakdown',
    title_category_budgets: 'Category Budgets',
    title_tracking_overview: 'Tracking Overview',
    title_set_budgets: 'Set Monthly Budgets',
    title_active_tracking: 'Active Tracking',
    title_change_password: 'Change Password',

    // Labels
    label_appearance: 'Appearance',
    label_notifications: 'Notifications',
    label_language: 'Language',
    label_name: 'Name',
    label_email: 'Email',
    label_old_password: 'Old Password',
    label_new_password: 'New Password',
    label_confirm_password: 'Confirm Password',
    label_total_salary: 'Total Salary',
    label_total_expenses: 'Total Expenses',
    label_remaining: 'Remaining',
    label_monthly_salary: 'Monthly Salary',
    label_this_month_spending: "This Month's Spending",
    label_last_month_spending: "Last Month's Spending",
    label_total_saved: 'Total Saved',
    label_across_all: 'across all expenses',
    label_highest_spending: 'highest spending',
    label_recorded_expenses: 'recorded expenses',
    label_expense_name: 'Expense name',
    label_amount: 'Amount',
    label_category: 'Category',
    label_total_spent: 'Total Spent',
    label_avg_per_expense: 'Avg per Expense',
    label_top_category: 'Top Category',
    label_total_expenses_count: 'Total Expenses',
    label_success_rate: 'Success Rate',
    label_used: 'used',
    label_left: 'left',
    label_spending: 'Spending',
    label_food: 'Food',
    label_bills: 'Bills',
    label_transport: 'Transport',
    label_shopping: 'Shopping',
    label_entertainment: 'Entertainment',
    label_health: 'Health',
    label_other: 'Other',
    label_total_salary_limit: 'Total Salary Limit',
    label_remaining_balance: 'Remaining Balance',
    label_days_left: 'Days left in Month',
    label_stay_on_track: 'Stay on track!',
    label_danger_zone: 'Danger Zone',
    label_month: 'Month',
    label_filter_category: 'Category',
    label_filter_month: 'Month',
    opt_all_categories: 'All Categories',
    opt_all_months: 'All Months',
    opt_auto_detect: 'Auto-detect',

    // Table Headers
    th_category: 'CATEGORY',
    th_amount: 'AMOUNT',
    th_share: 'SHARE',
    th_count: 'COUNT',

    // Buttons
    btn_save_preferences: 'Save Preferences',
    btn_save_changes: 'Save Changes',
    btn_update_password: 'Update Password',
    btn_light_mode: 'Light',
    btn_dark_mode: 'Dark',
    btn_notif_off: 'Off',
    btn_notif_on: 'On',
    btn_lang_en: 'EN',
    btn_lang_ar: 'AR',
    btn_add_expense: 'Add Expense',
    btn_save_salary: 'Save Salary',
    btn_save_budgets: 'Save Budgets',
    btn_refresh: '↺ Refresh',
    btn_filter_day: 'Day',
    btn_filter_month: 'Month',
    btn_filter_year: 'Year',
    btn_delete_account: 'Delete Account',

    // Messages
    msg_exceeded_budget: 'You exceeded your budget!',
    msg_exceeded_budget_pre: 'You exceeded your',
    msg_exceeded_budget_post: 'budget!',
    msg_no_budget: 'No budget',
    msg_no_active_budgets: 'No active budgets tracked yet.',
    msg_set_budget_track: 'Set a budget to track progress',
    msg_loading_budgets: 'Loading budgets...',
    msg_loading_insights: 'Loading insights...',
    msg_biggest_expense: 'is your biggest expense',
    msg_recorded_expenses: "You've recorded expenses this month",
    text_danger_zone: 'Permanently delete your account and all associated data. This action cannot be undone.',

    // Months
    month_jan: 'Jan', month_feb: 'Feb', month_mar: 'Mar', month_apr: 'Apr',
    month_may: 'May', month_jun: 'Jun', month_jul: 'Jul', month_aug: 'Aug',
    month_sep: 'Sep', month_oct: 'Oct', month_nov: 'Nov', month_dec: 'Dec',

    // Placeholders
    placeholder_name: 'Your full name',
    placeholder_email: 'you@example.com',
    placeholder_salary: 'Enter your salary',
    placeholder_expense: 'e.g., Groceries',
    placeholder_old_pass: 'Enter current password',
    placeholder_new_pass: 'Enter new password',
    placeholder_conf_pass: 'Confirm new password',
  },
  ar: {
    // Navigation
    nav_dashboard: 'لوحة التحكم',
    nav_expenses: 'المصروفات',
    nav_analytics: 'التحليلات',
    nav_budgets: 'الميزانيات',
    nav_settings: 'الإعدادات',
    nav_logout: 'تسجيل الخروج',

    // Titles & Sections
    title_budget_dashboard: 'لوحة الميزانية',
    subtitle_finances: 'ماليتك الشخصية — بسيطة وواضحة',
    section_account: 'الحساب',
    section_security: 'الأمان',
    section_preferences: 'التفضيلات',
    title_monthly_performance: 'الأداء الشهري',
    title_budget_progress: 'تقدم الميزانية',
    title_add_expense: '➕ إضافة مصروف',
    title_expenses_table: '🧾 المصروفات',
    title_analytics: 'التحليلات',
    title_savings_history: 'سجل المدخرات',
    title_category_distribution: 'توزيع الفئات',
    title_monthly_spending: 'الإنفاق الشهري',
    title_smart_insights: 'رؤى ذكية',
    title_category_breakdown: 'تفصيل الفئات',
    title_category_budgets: 'ميزانيات الفئات',
    title_tracking_overview: 'نظرة عامة على التتبع',
    title_set_budgets: 'تحديد الميزانيات الشهرية',
    title_active_tracking: 'التتبع النشط',
    title_change_password: 'تغيير كلمة المرور',

    // Labels
    label_appearance: 'المظهر',
    label_notifications: 'الإشعارات',
    label_language: 'اللغة',
    label_name: 'الاسم',
    label_email: 'البريد الإلكتروني',
    label_old_password: 'كلمة المرور القديمة',
    label_new_password: 'كلمة المرور الجديدة',
    label_confirm_password: 'تأكيد كلمة المرور',
    label_total_salary: 'إجمالي الراتب',
    label_total_expenses: 'إجمالي المصروفات',
    label_remaining: 'المتبقي',
    label_monthly_salary: 'الراتب الشهري',
    label_this_month_spending: 'إنفاق هذا الشهر',
    label_last_month_spending: 'إنفاق الشهر الماضي',
    label_total_saved: 'إجمالي المدخرات',
    label_across_all: 'عبر جميع المصاريف',
    label_highest_spending: 'أعلى إنفاق',
    label_recorded_expenses: 'مصروفات مسجلة',
    label_expense_name: 'اسم المصروف',
    label_amount: 'المبلغ',
    label_category: 'الفئة',
    label_total_spent: 'إجمالي المُنفق',
    label_avg_per_expense: 'متوسط المصروف',
    label_top_category: 'أعلى فئة',
    label_total_expenses_count: 'إجمالي المصروفات',
    label_success_rate: 'معدل النجاح',
    label_used: 'مستخدم',
    label_left: 'متبقٍ',
    label_spending: 'إنفاق',
    label_food: 'طعام',
    label_bills: 'فواتير',
    label_transport: 'مواصلات',
    label_shopping: 'تسوق',
    label_entertainment: 'ترفيه',
    label_health: 'صحة',
    label_other: 'أخرى',
    label_total_salary_limit: 'حد الراتب الكلي',
    label_remaining_balance: 'الرصيد المتبقي',
    label_days_left: 'يوم متبقٍ في الشهر',
    label_stay_on_track: 'استمر على المسار!',
    label_danger_zone: 'منطقة الخطر',
    label_month: 'شهر',
    label_filter_category: 'الفئة',
    label_filter_month: 'الشهر',
    opt_all_categories: 'جميع الفئات',
    opt_all_months: 'جميع الأشهر',
    opt_auto_detect: 'كشف تلقائي',

    // Table Headers
    th_category: 'الفئة',
    th_amount: 'المبلغ',
    th_share: 'الحصة',
    th_count: 'العدد',

    // Buttons
    btn_save_preferences: 'حفظ التفضيلات',
    btn_save_changes: 'حفظ التغييرات',
    btn_update_password: 'تحديث كلمة المرور',
    btn_light_mode: 'فاتح',
    btn_dark_mode: 'داكن',
    btn_notif_off: 'إيقاف',
    btn_notif_on: 'تشغيل',
    btn_lang_en: 'EN',
    btn_lang_ar: 'AR',
    btn_add_expense: 'إضافة مصروف',
    btn_save_salary: 'حفظ الراتب',
    btn_save_budgets: 'حفظ الميزانيات',
    btn_refresh: '↺ تحديث',
    btn_filter_day: 'يوم',
    btn_filter_month: 'شهر',
    btn_filter_year: 'سنة',
    btn_delete_account: 'حذف الحساب',

    // Messages
    msg_exceeded_budget: 'لقد تجاوزت ميزانيتك!',
    msg_exceeded_budget_pre: 'لقد تجاوزت ميزانية',
    msg_exceeded_budget_post: '!',
    msg_no_budget: 'لا توجد ميزانية',
    msg_no_active_budgets: 'لا توجد ميزانيات نشطة حتى الآن.',
    msg_set_budget_track: 'حدد ميزانية لتتبع التقدم',
    msg_loading_budgets: 'جارٍ تحميل الميزانيات...',
    msg_loading_insights: 'جارٍ تحميل الرؤى...',
    msg_biggest_expense: 'هي أكبر مصاريفك',
    msg_recorded_expenses: 'لقد سجلت مصروفات هذا الشهر',
    text_danger_zone: 'حذف حسابك نهائيا وجميع البيانات المرتبطة به. هذا الإجراء لا يمكن التراجع عنه.',

    // Months
    month_jan: 'يناير', month_feb: 'فبراير', month_mar: 'مارس', month_apr: 'أبريل',
    month_may: 'مايو', month_jun: 'يونيو', month_jul: 'يوليو', month_aug: 'أغسطس',
    month_sep: 'سبتمبر', month_oct: 'أكتوبر', month_nov: 'نوفمبر', month_dec: 'ديسمبر',

    // Placeholders
    placeholder_name: 'اسمك الكامل',
    placeholder_email: 'you@example.com',
    placeholder_salary: 'أدخل راتبك',
    placeholder_expense: 'مثال: مشتريات',
    placeholder_old_pass: 'أدخل كلمة المرور الحالية',
    placeholder_new_pass: 'أدخل كلمة المرور الجديدة',
    placeholder_conf_pass: 'تأكيد كلمة المرور الجديدة',
  }
};

const SUPPORTED_LANGS = ['en', 'ar'];
let currentLang = 'en';

function t(key) {
  const translation = (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key])
                   || (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]);
                   
  if (translation) return translation;

  // Clean fallback: remove common prefixes, replace underscores with spaces, and capitalize
  const cleanKey = key.replace(/^(btn|label|title|msg|th|nav|placeholder)_/i, '');
  return cleanKey.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function changeLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) {
    lang = 'en';
  }

  currentLang = lang;
  const isRTL = lang === 'ar';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    
    // Icon-safe replacement
    let textNodeReplaced = false;
    el.childNodes.forEach(node => {
      // Find the text node that actually contains text (not just whitespace)
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '') {
        // If there's an icon before it, add a space, otherwise just the translation
        const hasIconPrefix = el.querySelector('i, svg') && el.firstChild.nodeType !== Node.TEXT_NODE;
        node.nodeValue = hasIconPrefix ? ' ' + translation : translation;
        textNodeReplaced = true;
      }
    });

    // If the element has no text node to replace, append one
    if (!textNodeReplaced) {
      const hasIcon = el.querySelector('i, svg') !== null;
      el.appendChild(document.createTextNode((hasIcon ? ' ' : '') + translation));
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });

  // Partial text translation for elements containing specific keywords
  // This looks for elements that might have dynamic numbers but static labels
  // Note: It's better to use data-i18n, but this handles requested "used/left" patterns
  document.querySelectorAll('.budget-meta, .tracker-meta, .tracker-label').forEach(el => {
    let content = el.innerHTML;
    // Simple replacement logic for "used" and "left" patterns
    content = content.replace(/\bused\b/gi, t('label_used'));
    content = content.replace(/\bleft\b/gi, t('label_left'));
    // Arabic specific handling if needed, but the replace works if the strings are found
    // If the element already contains Arabic, we might need more complex logic, 
    // but for "cleaning" a refresh, this is a starting point.
    // el.innerHTML = content; // Warning: this can break child nodes. 
    // Better to iterate text nodes.
    [...el.childNodes].forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = node.nodeValue.replace(/\bused\b/gi, t('label_used'))
                                           .replace(/\bleft\b/gi, t('label_left'))
                                           .replace(/مستخدم/g, t('label_used')) // handle existing ar
                                           .replace(/متبقٍ/g, t('label_left'));
        }
    });
  });

  document.body.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;

  // Hide French buttons / UI elements (automatically strips any leftover FR UI)
  document.querySelectorAll('[data-value="fr"], [onclick*="\'fr\'"], [data-i18n="btn_lang_fr"]').forEach(el => {
    if (el) el.style.display = 'none';
  });
  // Extra fallback: Hide any button that explicitly says "FR"
  document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent.trim().toUpperCase() === 'FR') {
      btn.style.display = 'none';
    }
  });

  localStorage.setItem('app_language', lang);
  document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang, isRTL } }));
}

(function initI18n() {
  let savedLang = localStorage.getItem('app_language') || 'en';
  if (!SUPPORTED_LANGS.includes(savedLang)) savedLang = 'en';
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => changeLanguage(savedLang));
  } else {
    changeLanguage(savedLang);
  }
})();
