// Storage Keys
const STORAGE_KEYS = {
    USER: 'cashExpenseBook_user',
    EXPENSES: 'cashExpenseBook_expenses',
    CATEGORIES: 'cashExpenseBook_categories',
    SESSION: 'cashExpenseBook_session'
};

// Default Categories
const DEFAULT_CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Other'
];

// Countries with currency
const COUNTRIES = [
    { name: 'United States', currency: 'USD', symbol: '$', timezone: 'America/New_York' },
    { name: 'India', currency: 'INR', symbol: '₹', timezone: 'Asia/Kolkata' },
    { name: 'United Kingdom', currency: 'GBP', symbol: '£', timezone: 'Europe/London' },
    { name: 'Canada', currency: 'CAD', symbol: 'C$', timezone: 'America/Toronto' },
    { name: 'Australia', currency: 'AUD', symbol: 'A$', timezone: 'Australia/Sydney' },
    { name: 'Germany', currency: 'EUR', symbol: '€', timezone: 'Europe/Berlin' },
    { name: 'France', currency: 'EUR', symbol: '€', timezone: 'Europe/Paris' },
    { name: 'Italy', currency: 'EUR', symbol: '€', timezone: 'Europe/Rome' },
    { name: 'Spain', currency: 'EUR', symbol: '€', timezone: 'Europe/Madrid' },
    { name: 'Japan', currency: 'JPY', symbol: '¥', timezone: 'Asia/Tokyo' },
    { name: 'China', currency: 'CNY', symbol: '¥', timezone: 'Asia/Shanghai' },
    { name: 'South Korea', currency: 'KRW', symbol: '₩', timezone: 'Asia/Seoul' },
    { name: 'Singapore', currency: 'SGD', symbol: 'S$', timezone: 'Asia/Singapore' },
    { name: 'Brazil', currency: 'BRL', symbol: 'R$', timezone: 'America/Sao_Paulo' },
    { name: 'Mexico', currency: 'MXN', symbol: '$', timezone: 'America/Mexico_City' },
    { name: 'Russia', currency: 'RUB', symbol: '₽', timezone: 'Europe/Moscow' },
    { name: 'South Africa', currency: 'ZAR', symbol: 'R', timezone: 'Africa/Johannesburg' },
    { name: 'UAE', currency: 'AED', symbol: 'د.إ', timezone: 'Asia/Dubai' },
    { name: 'Switzerland', currency: 'CHF', symbol: 'CHF', timezone: 'Europe/Zurich' },
    { name: 'Sweden', currency: 'SEK', symbol: 'kr', timezone: 'Europe/Stockholm' },
    { name: 'Norway', currency: 'NOK', symbol: 'kr', timezone: 'Europe/Oslo' },
    { name: 'Denmark', currency: 'DKK', symbol: 'kr', timezone: 'Europe/Copenhagen' },
    { name: 'Poland', currency: 'PLN', symbol: 'zł', timezone: 'Europe/Warsaw' },
    { name: 'Turkey', currency: 'TRY', symbol: '₺', timezone: 'Europe/Istanbul' },
    { name: 'Thailand', currency: 'THB', symbol: '฿', timezone: 'Asia/Bangkok' },
    { name: 'Malaysia', currency: 'MYR', symbol: 'RM', timezone: 'Asia/Kuala_Lumpur' },
    { name: 'Indonesia', currency: 'IDR', symbol: 'Rp', timezone: 'Asia/Jakarta' },
    { name: 'Philippines', currency: 'PHP', symbol: '₱', timezone: 'Asia/Manila' },
    { name: 'Vietnam', currency: 'VND', symbol: '₫', timezone: 'Asia/Ho_Chi_Minh' },
    { name: 'Argentina', currency: 'ARS', symbol: '$', timezone: 'America/Argentina/Buenos_Aires' },
    { name: 'Chile', currency: 'CLP', symbol: '$', timezone: 'America/Santiago' },
    { name: 'Colombia', currency: 'COP', symbol: '$', timezone: 'America/Bogota' },
    { name: 'Egypt', currency: 'EGP', symbol: '£', timezone: 'Africa/Cairo' },
    { name: 'Nigeria', currency: 'NGN', symbol: '₦', timezone: 'Africa/Lagos' },
    { name: 'Kenya', currency: 'KES', symbol: 'KSh', timezone: 'Africa/Nairobi' },
    { name: 'New Zealand', currency: 'NZD', symbol: '$', timezone: 'Pacific/Auckland' },
    { name: 'Pakistan', currency: 'PKR', symbol: '₨', timezone: 'Asia/Karachi' },
    { name: 'Bangladesh', currency: 'BDT', symbol: '৳', timezone: 'Asia/Dhaka' },
    { name: 'Sri Lanka', currency: 'LKR', symbol: 'Rs', timezone: 'Asia/Colombo' }
];

// Languages
const LANGUAGES = [
    'English',
    'Spanish',
    'French',
    'German',
    'Hindi',
    'Japanese',
    'Mandarin'
];

// App State
let currentScreen = 'loading';
let user = null;
let expenses = [];
let categories = [...DEFAULT_CATEGORIES];
let theme = 'dark';
let selectedDate = null;
let currentMonth = new Date();
let inactivityTimer = null;
let currentLang = 'english';

// Storage Helpers
const storage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    },
    remove: (key) => localStorage.removeItem(key),
    session: {
        get: (key) => sessionStorage.getItem(key),
        set: (key, value) => sessionStorage.setItem(key, value),
        remove: (key) => sessionStorage.removeItem(key)
    }
};

// Inactivity Lock
function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (currentScreen === 'app') {
        inactivityTimer = setTimeout(() => {
            lockApp();
        }, 5 * 60 * 1000); // 5 minutes
    }
}

function lockApp() {
    storage.session.remove(STORAGE_KEYS.SESSION);
    showScreen('login');
}

// Activity listeners
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('scroll', resetInactivityTimer);

// Initialize App
function init() {
    try {
        const storedUser = storage.get(STORAGE_KEYS.USER);
        const sessionUnlocked = storage.session.get(STORAGE_KEYS.SESSION);
        const storedExpenses = storage.get(STORAGE_KEYS.EXPENSES) || [];
        const storedCategories = storage.get(STORAGE_KEYS.CATEGORIES) || DEFAULT_CATEGORIES;

        expenses = storedExpenses;
        categories = storedCategories;

        if (!storedUser) {
            showScreen('landing');
        } else {
            user = storedUser;
            currentLang = (user.language || 'English').toLowerCase();
            if (!sessionUnlocked) {
                showScreen('login');
            } else {
                showScreen('app');
                resetInactivityTimer();
            }
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showScreen('landing');
    }
}

// Show Screen
function showScreen(screenName) {
    currentScreen = screenName;
    const app = document.getElementById('app');
    app.innerHTML = '';

    switch (screenName) {
        case 'landing':
            renderLanding();
            break;
        case 'setup':
            renderSetup();
            break;
        case 'login':
            renderLogin();
            break;
        case 'app':
            renderApp();
            resetInactivityTimer();
            break;
    }
}

// Render Landing Page
function renderLanding() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="landing-page">
            <div class="landing-content">
                <h1 class="landing-title">CASH EXPENSE BOOK</h1>
                <div class="landing-buttons">
                    <button class="btn-primary" onclick="showScreen('setup')">Create Account</button>
                </div>
            </div>
        </div>
    `;
}

// Render Setup Page
function renderSetup() {
    const app = document.getElementById('app');
    const lang = 'english'; // Default to English for setup
    
    app.innerHTML = `
        <div class="setup-page">
            <div class="setup-container">
                <h2 class="setup-title">${t('createAccount', lang)}</h2>
                <form id="setupForm" onsubmit="handleCreateAccount(event)">
                    <div class="form-group">
                        <label class="form-label">${t('name', lang)} ${t('required', lang)}</label>
                        <input type="text" class="form-input" name="name" required placeholder="${t('pleaseEnterName', lang)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">${t('email', lang)} ${t('required', lang)}</label>
                        <input type="email" class="form-input" name="email" required placeholder="${t('pleaseEnterEmail', lang)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">${t('monthlyBudget', lang)} ${t('required', lang)}</label>
                        <input type="number" class="form-input" name="budget" required min="0" step="0.01" placeholder="${t('pleaseEnterBudget', lang)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">${t('country', lang)} ${t('required', lang)}</label>
                        <select class="form-select" name="country" required>
                            ${COUNTRIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${t('language', lang)} ${t('required', lang)}</label>
                        <select class="form-select" name="language" required>
                            ${LANGUAGES.map(l => `<option value="${l}">${l}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${t('profilePicture', lang)}</label>
                        <div class="file-input-wrapper">
                            <label for="profilePic" class="file-input-label" id="fileLabel">${t('chooseFile', lang)}</label>
                            <input type="file" id="profilePic" name="profilePic" class="file-input" accept="image/*" onchange="updateFileName(this)">
                            <div class="file-name" id="fileName"></div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${t('pin', lang)} ${t('required', lang)}</label>
                        <input type="password" class="form-input" name="pin" required pattern="[0-9]{4,6}" maxlength="6" placeholder="${t('pleaseEnterPin', lang)}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">${t('confirmPin', lang)} ${t('required', lang)}</label>
                        <input type="password" class="form-input" name="confirmPin" required pattern="[0-9]{4,6}" maxlength="6" placeholder="${t('pleaseConfirmPin', lang)}">
                    </div>
                    <button type="submit" class="btn-submit">${t('createAccount', lang)}</button>
                    <button type="button" class="btn-back" onclick="showScreen('landing')">${t('back', lang)}</button>
                </form>
            </div>
        </div>
    `;
}

// Update file name display
function updateFileName(input) {
    const fileName = document.getElementById('fileName');
    if (input.files && input.files[0]) {
        fileName.textContent = input.files[0].name;
    }
}

// Handle Create Account
function handleCreateAccount(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const pin = formData.get('pin');
    const confirmPin = formData.get('confirmPin');

    if (pin !== confirmPin) {
        alert(t('pinsDoNotMatch', 'english'));
        return;
    }

    const countryName = formData.get('country');
    const country = COUNTRIES.find(c => c.name === countryName);
    
    // Handle profile picture
    const fileInput = document.getElementById('profilePic');
    
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const avatarData = event.target.result;
            saveUser(formData, country, avatarData);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveUser(formData, country, null);
    }
}

function saveUser(formData, country, avatarData) {
    user = {
        name: formData.get('name'),
        email: formData.get('email'),
        budget: parseFloat(formData.get('budget')),
        country: formData.get('country'),
        language: formData.get('language'),
        currency: country.currency,
        currencySymbol: country.symbol,
        timezone: country.timezone,
        pin: formData.get('pin'),
        avatar: avatarData,
        createdAt: new Date().toISOString()
    };

    currentLang = (user.language || 'English').toLowerCase();
    storage.set(STORAGE_KEYS.USER, user);
    storage.session.set(STORAGE_KEYS.SESSION, 'unlocked');
    
    setTimeout(() => {
        showScreen('app');
    }, 100);
}

// Render Login Page
function renderLogin() {
    const app = document.getElementById('app');
    const lang = user ? (user.language || 'English').toLowerCase() : 'english';
    const avatarContent = user.avatar 
        ? `<img src="${user.avatar}" alt="${user.name}">` 
        : user.name.charAt(0).toUpperCase();
    
    app.innerHTML = `
        <div class="login-page">
            <div class="login-container">
                <div class="login-app-title">${t('appName', lang)}</div>
                <div class="login-avatar">${avatarContent}</div>
                <div class="login-info">
                    <div class="login-name">${user.name}</div>
                    <div class="login-email">${user.email}</div>
                </div>
                <form onsubmit="handleLogin(event)">
                    <label class="form-label" style="text-align: center;">${t('enterPin', lang)}</label>
                    <input type="password" class="pin-input" id="loginPin" required pattern="[0-9]{4,6}" maxlength="6" autofocus>
                    <div id="pinError" class="error-message hidden"></div>
                    <button type="submit" class="btn-submit" style="margin-top: 1rem;">${t('unlock', lang)}</button>
                    <a class="forgot-pin-link" onclick="openPinRecovery()">${t('forgotPin', lang)}</a>
                </form>
            </div>
        </div>
    `;
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    const pin = document.getElementById('loginPin').value;
    const errorDiv = document.getElementById('pinError');

    if (pin === user.pin) {
        storage.session.set(STORAGE_KEYS.SESSION, 'unlocked');
        showScreen('app');
    } else {
        errorDiv.textContent = t('incorrectPin', currentLang);
        errorDiv.classList.remove('hidden');
        document.getElementById('loginPin').value = '';
    }
}

// PIN Recovery
function openPinRecovery() {
    const app = document.getElementById('app');
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${t('pinRecovery', currentLang)}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <p style="color: var(--grey-light); margin-bottom: 1rem;">${t('enterEmailRecovery', currentLang)}</p>
            <form onsubmit="handlePinRecovery(event)">
                <input type="email" class="form-input" id="recoveryEmail" required placeholder="${t('email', currentLang)}" style="margin-bottom: 1rem;">
                <button type="submit" class="btn-submit">${t('sendRecovery', currentLang)}</button>
            </form>
        </div>
    `;
    app.appendChild(modal);
}

function handlePinRecovery(e) {
    e.preventDefault();
    const email = document.getElementById('recoveryEmail').value;
    
    if (email === user.email) {
        alert(t('recoveryEmailSent', currentLang) + '\n\n' + t('pin', currentLang) + ': ' + user.pin);
        document.querySelector('.modal-overlay').remove();
    } else {
        alert(t('emailNotFound', currentLang));
    }
}

// Render Main App
function renderApp() {
    if (!user) {
        showScreen('landing');
        return;
    }
    
    const app = document.getElementById('app');
    const currentMonthExpenses = getCurrentMonthExpenses();
    const totalSpent = getTotalSpent();
    const remaining = user.budget - totalSpent;
    const avatarContent = user.avatar 
        ? `<img src="${user.avatar}" alt="${user.name}">` 
        : user.name.charAt(0).toUpperCase();

    app.innerHTML = `
        <div class="app-page ${theme}">
            <header class="app-header">
                <div class="header-content">
                    <h1 class="app-title">${t('expenseTracker', currentLang)}</h1>
                    <div class="header-actions">
                        <button class="theme-toggle" onclick="toggleTheme()">${theme === 'dark' ? '☀️' : '🌙'}</button>
                        <button class="profile-btn" onclick="toggleProfile()">${avatarContent}</button>
                    </div>
                </div>
            </header>
            <main class="main-content">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <span>💰</span>
                            <span>${t('monthlyBudget', currentLang)}</span>
                        </div>
                        <div class="stat-value">${user.currencySymbol}${user.budget.toFixed(2)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-header">
                            <span>📈</span>
                            <span>${t('totalSpent', currentLang)}</span>
                        </div>
                        <div class="stat-value">${user.currencySymbol}${totalSpent.toFixed(2)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-header">
                            <span>💵</span>
                            <span>${t('remaining', currentLang)}</span>
                        </div>
                        <div class="stat-value ${remaining < 0 ? 'negative' : ''}">${user.currencySymbol}${remaining.toFixed(2)}</div>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button class="add-expense-btn" onclick="openAddExpenseModal()">
                        <span>➕</span>
                        ${t('addExpense', currentLang)}
                    </button>
                    <button class="add-budget-btn" onclick="openAddBudgetModal()">
                        <span>💰</span>
                        ${t('addBudget', currentLang)}
                    </button>
                </div>

                <div class="export-buttons">
                    <button class="btn-export blue" onclick="exportToCSV(false)" ${currentMonthExpenses.length === 0 ? 'disabled' : ''}>
                        <span>⬇️</span>
                        ${t('exportCurrentMonth', currentLang)}
                    </button>
                    <button class="btn-export green" onclick="exportToCSV(true)" ${expenses.length === 0 ? 'disabled' : ''}>
                        <span>⬇️</span>
                        ${t('exportAllTime', currentLang)}
                    </button>
                </div>

                ${renderCalendar()}
                ${selectedDate ? renderSelectedDateExpenses() : ''}
            </main>
            
            <div id="profilePanel" class="profile-panel">
                ${renderProfilePanel()}
            </div>
        </div>
    `;
}

// Render Calendar
function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthTotal = getMonthTotal(month, year);

    let calendarHTML = `
        <div class="calendar-card">
            <div class="calendar-header">
                <button class="calendar-nav" onclick="changeMonth(-1)">←</button>
                <div class="calendar-title">
                    ${currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    <span class="calendar-total">${t('total', currentLang)}: ${user.currencySymbol}${monthTotal.toFixed(2)}</span>
                </div>
                <button class="calendar-nav" onclick="changeMonth(1)">→</button>
            </div>
            <div class="calendar-grid">
                ${[t('sun', currentLang), t('mon', currentLang), t('tue', currentLang), t('wed', currentLang), t('thu', currentLang), t('fri', currentLang), t('sat', currentLang)].map(day => 
                    `<div class="calendar-day-header">${day}</div>`
                ).join('')}
    `;

    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayExpenses = getDayExpenses(date);
        const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const isSelected = selectedDate === date;

        calendarHTML += `
            <div class="calendar-day ${isSelected ? 'selected' : ''}" onclick="selectDate('${date}')">
                <div class="calendar-day-number">${day}</div>
                ${dayTotal > 0 ? `<div class="calendar-day-total">${user.currencySymbol}${dayTotal.toFixed(2)}</div>` : ''}
            </div>
        `;
    }

    calendarHTML += `
            </div>
        </div>
    `;

    return calendarHTML;
}

// Render Selected Date Expenses
function renderSelectedDateExpenses() {
    const dayExpenses = getDayExpenses(selectedDate);
    if (dayExpenses.length === 0) return '';

    const dateObj = new Date(selectedDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return `
        <div class="expenses-list">
            <h3 class="expenses-title">${t('expensesFor', currentLang)} ${formattedDate}</h3>
            ${dayExpenses.map(exp => {
                const timestamp = new Date(exp.createdAt).toLocaleString();
                return `
                <div class="expense-item">
                    <div class="expense-info">
                        <div class="expense-title">${exp.title}</div>
                        <div class="expense-category">${exp.category}</div>
                        <div class="expense-timestamp">${t('timestamp', currentLang)}: ${timestamp}</div>
                    </div>
                    <div class="expense-right">
                        <div class="expense-amount">${user.currencySymbol}${exp.amount.toFixed(2)}</div>
                        <button class="btn-remove" onclick="removeExpense(${exp.id})">${t('remove', currentLang)}</button>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
}

// Render Profile Panel
function renderProfilePanel() {
    const allTimeSpent = getAllTimeSpent();
    const categoryStats = getCategoryStats();
    const avatarContent = user.avatar 
        ? `<img src="${user.avatar}" alt="${user.name}">` 
        : user.name.charAt(0).toUpperCase();

    return `
        <div class="profile-header">
            <h3 class="modal-title">${t('profile', currentLang)}</h3>
            <button class="modal-close" onclick="toggleProfile()">✕</button>
        </div>
        <div class="profile-user">
            <div class="profile-user-avatar">${avatarContent}</div>
            <div class="profile-user-name">${user.name}</div>
            <div class="profile-user-email">${user.email}</div>
        </div>
        <div class="profile-stat">
            <div class="profile-stat-label">${t('allTimeSpent', currentLang)}</div>
            <div class="profile-stat-value">${user.currencySymbol}${allTimeSpent.toFixed(2)}</div>
        </div>
        <div>
            <h4 class="category-stats-title">
                <span>📊</span>
                ${t('categoryExpenses', currentLang)}
            </h4>
            ${categoryStats.length > 0 ? categoryStats.map(stat => `
                <div class="category-item">
                    <div class="category-header">
                        <span>${stat.name}</span>
                        <span class="category-amount">${user.currencySymbol}${stat.value.toFixed(2)}</span>
                    </div>
                    <div class="category-bar-bg">
                        <div class="category-bar" style="width: ${(stat.value / allTimeSpent) * 100}%"></div>
                    </div>
                </div>
            `).join('') : '<p style="color: var(--grey-light); text-align: center;">No expenses yet</p>'}
        </div>
        <button class="btn-delete" onclick="openDeleteConfirmation()">
            <span>🗑️</span>
            ${t('deleteAccount', currentLang)}
        </button>
    `;
}

// Remove Expense
function removeExpense(id) {
    if (confirm('Are you sure you want to remove this expense?')) {
        expenses = expenses.filter(exp => exp.id !== id);
        storage.set(STORAGE_KEYS.EXPENSES, expenses);
        renderApp();
    }
}

// Toggle Theme
function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    renderApp();
}

// Toggle Profile
function toggleProfile() {
    const panel = document.getElementById('profilePanel');
    panel.classList.toggle('open');
}

// Change Month
function changeMonth(direction) {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
    renderApp();
}

// Select Date
function selectDate(date) {
    selectedDate = date;
    renderApp();
}

// Open Add Budget Modal
function openAddBudgetModal() {
    const app = document.getElementById('app');
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${t('addAmount', currentLang)}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <form onsubmit="handleAddBudget(event)">
                <div class="form-group">
                    <label class="form-label">${t('amountToAdd', currentLang)} ${t('required', currentLang)}</label>
                    <input type="number" class="form-input" name="amount" required min="0" step="0.01" placeholder="${t('enterAmount', currentLang)}">
                </div>
                <button type="submit" class="btn-submit">${t('add', currentLang)}</button>
            </form>
        </div>
    `;
    app.appendChild(modal);
}

// Handle Add Budget
function handleAddBudget(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amount = parseFloat(formData.get('amount'));
    
    user.budget += amount;
    storage.set(STORAGE_KEYS.USER, user);
    
    document.querySelector('.modal-overlay').remove();
    renderApp();
}

// Open Add Expense Modal
function openAddExpenseModal() {
    const app = document.getElementById('app');
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${t('addExpense', currentLang)}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <form onsubmit="handleAddExpense(event)">
                <div class="form-group">
                    <label class="form-label">${t('title', currentLang)} ${t('required', currentLang)}</label>
                    <input type="text" class="form-input" name="title" required placeholder="${t('enterTitle', currentLang)}">
                </div>
                <div class="form-group">
                    <label class="form-label">${t('amount', currentLang)} ${t('required', currentLang)}</label>
                    <input type="number" class="form-input" name="amount" required min="0" step="0.01" placeholder="${t('enterAmount', currentLang)}">
                </div>
                <div class="form-group">
                    <label class="form-label">${t('date', currentLang)} ${t('required', currentLang)}</label>
                    <input type="date" class="form-input" name="date" required value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label class="form-label">${t('category', currentLang)} ${t('required', currentLang)}</label>
                    <select class="form-select" name="category" required>
                        ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">${t('newCategory', currentLang)}</label>
                    <input type="text" class="form-input" name="newCategory" placeholder="${t('enterCategory', currentLang)}">
                </div>
                <button type="submit" class="btn-submit">${t('addExpense', currentLang)}</button>
            </form>
        </div>
    `;
    app.appendChild(modal);
}

// Handle Add Expense
function handleAddExpense(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    let finalCategory = data.category;
    if (data.newCategory && data.newCategory.trim()) {
        finalCategory = data.newCategory.trim();
        if (!categories.includes(finalCategory)) {
            categories.push(finalCategory);
            storage.set(STORAGE_KEYS.CATEGORIES, categories);
        }
    }

    const amount = parseFloat(data.amount);
    const currentMonthExpenses = getCurrentMonthExpenses();
    const totalSpent = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = user.budget - totalSpent;

    if (amount > remaining) {
        alert(t('budgetExceeded', currentLang));
        return;
    }

    if (totalSpent + amount >= user.budget * 0.9 && totalSpent < user.budget * 0.9) {
        alert(t('budgetWarning', currentLang));
    }

    const newExpense = {
        id: Date.now(),
        title: data.title,
        amount: amount,
        date: data.date,
        category: finalCategory,
        createdAt: new Date().toISOString()
    };

    expenses.push(newExpense);
    storage.set(STORAGE_KEYS.EXPENSES, expenses);

    document.querySelector('.modal-overlay').remove();
    renderApp();
}

// Open Delete Confirmation
function openDeleteConfirmation() {
    const app = document.getElementById('app');
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 class="modal-title">${t('deleteAccount', currentLang)}</h3>
            <p style="color: var(--grey-light); margin-bottom: 1rem;">${t('deleteConfirm', currentLang)}</p>
            <form onsubmit="handleDeleteAccount(event)">
                <input type="password" class="pin-input" id="deletePin" required pattern="[0-9]{4,6}" maxlength="6" placeholder="${t('enterPin', currentLang)}" style="margin-bottom: 1rem;">
                <div style="display: flex; gap: 0.75rem;">
                    <button type="submit" class="btn-delete" style="flex: 1; margin: 0;">${t('delete', currentLang)}</button>
                    <button type="button" class="btn-back" style="flex: 1; margin: 0;" onclick="this.closest('.modal-overlay').remove()">${t('cancel', currentLang)}</button>
                </div>
            </form>
        </div>
    `;
    app.appendChild(modal);
}

// Handle Delete Account
function handleDeleteAccount(e) {
    e.preventDefault();
    const pin = document.getElementById('deletePin').value;

    if (pin === user.pin) {
        storage.remove(STORAGE_KEYS.USER);
        storage.remove(STORAGE_KEYS.EXPENSES);
        storage.remove(STORAGE_KEYS.CATEGORIES);
        storage.session.remove(STORAGE_KEYS.SESSION);
        user = null;
        expenses = [];
        categories = [...DEFAULT_CATEGORIES];
        currentLang = 'english';
        showScreen('landing');
    } else {
        alert(t('incorrectPin', currentLang));
    }
}

// Export to CSV
function exportToCSV(allTime) {
    let dataToExport = expenses;

    if (!allTime) {
        const now = new Date();
        dataToExport = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
        });
    }

    if (dataToExport.length === 0) return;

    const csv = [
        ['Title', 'Amount', 'Category', 'Date', 'Timestamp'],
        ...dataToExport.map(exp => [
            exp.title, 
            exp.amount, 
            exp.category, 
            exp.date,
            new Date(exp.createdAt).toLocaleString()
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = allTime ? 'all-expenses.csv' : 'current-month-expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Helper Functions
function getCurrentMonthExpenses() {
    const now = new Date();
    return expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    });
}

function getTotalSpent() {
    return getCurrentMonthExpenses().reduce((sum, exp) => sum + exp.amount, 0);
}

function getAllTimeSpent() {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

function getCategoryStats() {
    const stats = {};
    expenses.forEach(exp => {
        stats[exp.category] = (stats[exp.category] || 0) + exp.amount;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
}

function getDayExpenses(date) {
    return expenses.filter(exp => exp.date === date);
}

function getMonthTotal(month, year) {
    return expenses
        .filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === month && expDate.getFullYear() === year;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);