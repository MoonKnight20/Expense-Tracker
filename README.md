# Expense Tracker

A dynamic web app for visualizing income vs. expenses with real-time charts and date simulation tools. Perfect for testing budgeting ideas and exploring financial patterns without real data risks.

## Features
- **Interactive Charts**: Line and pie charts update dynamically as you add expenses.
- **Date Simulation**: Freely navigate between days (1-30) in September 2025 to see cumulative effects.
- **Multi-Currency Support**: Switch between USD, EUR, GBP, JPY, INR.
- **Expense Categories**: Track Food, Transport, Entertainment, Bills, Shopping, Healthcare, Education, Other.
- **Local Data Persistence**: All data saved in browser storage for quick testing.
- **Security**: CSP protects against XSS; input sanitization for notes.
- **Feedback Form**: Share thoughts directly (simulated for now; backend-ready).

## Quick Start
1. Clone or download the repo.
2. Open `index.html` in a modern browser (Chrome, Firefox, Safari).
3. Enter your monthly income, add expenses, and simulate dates to see magic happen!

## Usage
- **Set Income**: Enter amount in the form and click "Set Income".
- **Add Expense**: Fill details (amount, category, date, optional notes) and submit.
- **Simulate Day**: Change the day number to view results for any date in the month.
- **View Summary**: Click the button to see totals and investment suggestions.

Example: Add $50 on day 5 for "Food", advance to day 10, and watch the line chart climb!

## Technologies
- **Frontend**: HTML5, CSS3, JavaScript, Chart.js for visuals.
- **Security**: Content Security Policy (CSP) and input sanitization.

## Contributing
Fork the repo, make changes, and submit a pull request. Ideas welcome—let's make budgeting fun!

## License
MIT License—free to use, modify, and distribute.

## Author
https://github.com/MoonKnight20
