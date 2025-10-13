document.addEventListener('DOMContentLoaded', () => {
    // Data storage will now come from API
    let monthlyIncome = 0; // Fetch from API if stored per user
    let expenses = [];
    let selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
    let currencySymbols = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'INR': '₹' };
    let lineChart, pieChart;

    // Fetch expenses on load
    async function loadData() {
        try {
            const response = await fetch('http://localhost:5000/api/expenses');
            expenses = await response.json();
            document.getElementById('currentIncome').textContent = `Current Income: ${getFormattedAmount(monthlyIncome)}`;
            updateStats();
            updateCharts();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Function to sanitize input to prevent XSS
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Fixed month for simulation
    const monthYear = '2025-09';
    let currentDay = localStorage.getItem('currentDay') ? parseInt(localStorage.getItem('currentDay')) : 17;
    let today = '';

    // Update current date based on day
    function updateCurrentDate() {
        const dayStr = String(currentDay).padStart(2, '0');
        today = `${monthYear}-${dayStr}`;
        document.getElementById('dayInput').value = currentDay;
        document.getElementById('dateInput').max = `${monthYear}-30`;
        document.getElementById('dateInput').value = today;
        document.getElementById('currentDayDisplay').textContent = currentDay;
        loadData(); // Refresh data on date change
    }

    // Reset data (clear server-side if implemented)
    function resetData() {
        if (confirm('Are you sure you want to reset all data? This will clear expenses and reset the day to 17.')) {
            currentDay = 17;
            localStorage.setItem('currentDay', currentDay);
            updateCurrentDate();
            // Add API call to delete all expenses if backend supports it
        }
    }

    // Initialize
    document.getElementById('currencySelect').value = selectedCurrency;
    document.getElementById('dayInput').value = currentDay;
    updateCurrentDate();

    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.querySelector('.theme-toggle').textContent = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';

    // Event Listeners
    document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
    document.querySelector('.set-income').addEventListener('click', setIncome);
    document.querySelector('.add-expense').addEventListener('click', addExpense);
    document.querySelector('.reset-data').addEventListener('click', resetData);
    document.querySelector('.summary-button').addEventListener('click', showSummary);
    document.querySelector('.close').addEventListener('click', closeSummary);
    document.querySelector('.submit-feedback').addEventListener('click', submitFeedback);

    // Day change listener (allows forward and backward)
    document.getElementById('dayInput').addEventListener('change', function() {
        const newDay = parseInt(this.value);
        if (newDay < 1 || newDay > 30) {
            alert('Please enter a day between 1 and 30.');
            this.value = currentDay;
            return;
        }
        currentDay = newDay;
        localStorage.setItem('currentDay', currentDay);
        updateCurrentDate();
    });

    // Format amount with currency
    function getFormattedAmount(amount) {
        const symbol = currencySymbols[selectedCurrency];
        return `${symbol}${amount.toFixed(2)}`;
    }

    // Toggle theme
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        document.querySelector('.theme-toggle').textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    }

    // Currency change listener
    document.getElementById('currencySelect').addEventListener('change', function() {
        selectedCurrency = this.value;
        localStorage.setItem('selectedCurrency', selectedCurrency);
        loadData();
    });

    // Set monthly income (to be updated with API)
    function setIncome() {
        const income = parseFloat(document.getElementById('incomeInput').value);
        if (isNaN(income) || income <= 0) {
            alert('Please enter a valid income amount.');
            return;
        }
        monthlyIncome = income;
        document.getElementById('incomeInput').value = '';
        loadData(); // Update UI, consider API call if stored server-side
    }

    // Add expense
    async function addExpense() {
        const amount = parseFloat(document.getElementById('amountInput').value);
        const category = document.getElementById('categoryInput').value;
        let notes = document.getElementById('notesInput').value;
        const date = document.getElementById('dateInput').value || today;

        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        notes = sanitizeInput(notes);

        if (!date.startsWith(monthYear)) {
            alert('Please enter a date in September 2025.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, category, amount, notes, type: 'expense' })
            });
            const data = await response.json();
            if (response.ok) {
                document.getElementById('amountInput').value = '';
                document.getElementById('categoryInput').value = 'Food';
                document.getElementById('notesInput').value = '';
                document.getElementById('dateInput').value = today;
                loadData();
            } else {
                alert('Failed to add expense');
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Error adding expense');
        }
    }

    // Update stats
    function updateStats() {
        const upToTodayExpenses = expenses.filter(exp => exp.date <= today);
        const monthlyExpenses = upToTodayExpenses.reduce((sum, exp) => sum + (exp.type === 'expense' ? exp.amount : -exp.amount), 0);
        const dailyExpenses = expenses.filter(exp => exp.date === today).reduce((sum, exp) => sum + (exp.type === 'expense' ? exp.amount : -exp.amount), 0);
        const remaining = monthlyIncome - monthlyExpenses;

        document.getElementById('monthlyStat').textContent = getFormattedAmount(monthlyExpenses);
        document.getElementById('dailyStat').textContent = getFormattedAmount(dailyExpenses);
        document.getElementById('remainingStat').textContent = getFormattedAmount(remaining);
    }

    // Get days up to current day
    function getDaysUpToNow() {
        const days = [];
        for (let i = 1; i <= currentDay; i++) {
            days.push(String(i).padStart(2, '0'));
        }
        return days;
    }

    // Update charts
    function updateCharts() {
        const ctxLine = document.getElementById('lineChart').getContext('2d');
        const ctxPie = document.getElementById('pieChart').getContext('2d');

        const upToTodayExpenses = expenses.filter(exp => exp.date.startsWith(monthYear) && exp.date <= today);

        const days = getDaysUpToNow();
        const dailySums = days.map(day => {
            const dayStr = `${monthYear}-${day}`;
            return expenses.filter(exp => exp.date === dayStr).reduce((sum, exp) => sum + (exp.type === 'expense' ? exp.amount : -exp.amount), 0);
        });
        let cumulative = [0];
        for (let sum of dailySums) {
            cumulative.push(cumulative[cumulative.length - 1] + sum);
        }
        cumulative.shift();

        if (lineChart) lineChart.destroy();
        lineChart = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: days,
                datasets: [
                    { label: 'Cumulative Expenses', data: cumulative, borderColor: 'red', fill: false },
                    { label: 'Total Income', data: days.map(() => monthlyIncome), borderColor: 'green', borderDash: [5, 5], fill: false }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });

        const categories = {};
        upToTodayExpenses.forEach(exp => {
            if (exp.type === 'expense') {
                categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
            }
        });
        const pieLabels = Object.keys(categories);
        const pieData = Object.values(categories);

        if (pieChart) pieChart.destroy();
        pieChart = new Chart(ctxPie, {
            type: 'pie',
            data: { labels: pieLabels, datasets: [{ data: pieData, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // Show summary
    function showSummary() {
        const upToTodayExpenses = expenses.filter(exp => exp.date.startsWith(monthYear) && exp.date <= today);
        const monthlyExpenses = upToTodayExpenses.reduce((sum, exp) => sum + (exp.type === 'expense' ? exp.amount : -exp.amount), 0);
        const saved = monthlyIncome - monthlyExpenses;

        document.getElementById('summaryContent').innerHTML = `
            <p><strong>Total Income:</strong> ${getFormattedAmount(monthlyIncome)}</p>
            <p><strong>Total Expenses (Up to Day ${currentDay}):</strong> ${getFormattedAmount(monthlyExpenses)}</p>
            <p><strong>Money Saved:</strong> ${getFormattedAmount(saved)}</p>
        `;
        document.getElementById('summaryModal').style.display = 'block';
    }

    // Close summary
    function closeSummary() {
        document.getElementById('summaryModal').style.display = 'none';
    }

    // Submit feedback
    function submitFeedback() {
        const feedbackMessage = document.getElementById('feedbackMessage').value.trim();
        if (!feedbackMessage) {
            document.getElementById('feedbackStatus').textContent = 'Please enter your feedback.';
            document.getElementById('feedbackStatus').style.color = 'var(--danger-color)';
            return;
        }

        const feedbackData = { message: sanitizeInput(feedbackMessage), timestamp: new Date().toISOString() };
        console.log('Feedback submitted:', feedbackData);
        document.getElementById('feedbackStatus').textContent = 'Thank you for your feedback!';
        document.getElementById('feedbackStatus').style.color = 'var(--primary-color)';
        document.getElementById('feedbackMessage').value = '';
    }

    // Modal close on outside click
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('summaryModal');
        if (event.target === modal) closeSummary();
    });

    // Initial load
    loadData();
});