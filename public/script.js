 
        // Initialize data
        let expenses = JSON.parse(localStorage.getItem('eggFarmExpenses')) || [];
        
        // DOM elements
        const expenseForm = document.getElementById('expense-form');
        const expenseTableBody = document.getElementById('expense-table-body');
        const emptyState = document.getElementById('empty-state');
        const totalExpensesEl = document.getElementById('total-expenses');
        const monthExpensesEl = document.getElementById('month-expenses');
        const avgMonthlyEl = document.getElementById('avg-monthly');
        const expenseCountEl = document.getElementById('expense-count');
        
        // Chart initialization
        const categoryChart = new Chart(document.getElementById('category-chart'), {
            type: 'pie',
            data: {
                labels: ['Feed', 'Health', 'Equipment', 'Labor', 'Utilities', 'Other'],
                datasets: [{
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#e8f5e8',
                        '#ffe8e8',
                        '#e8f0ff',
                        '#fff8e8',
                        '#f0e8ff',
                        '#e8e8e8'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
        
        // Format currency
        function formatCurrency(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        }
        
        // Format date
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
        
        // Get category class
        function getCategoryClass(category) {
            return category;
        }
        
        // Calculate summary statistics
        function calculateSummary() {
            const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
            totalExpensesEl.textContent = formatCurrency(total);
            
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthExpenses = expenses
                .filter(expense => {
                    const expenseDate = new Date(expense.date);
                    return expenseDate.getMonth() === currentMonth && 
                           expenseDate.getFullYear() === currentYear;
                })
                .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
            monthExpensesEl.textContent = formatCurrency(monthExpenses);
            
            // Calculate average monthly expense
            if (expenses.length > 0) {
                const firstExpenseDate = new Date(expenses[0].date);
                const monthsDiff = (new Date().getFullYear() - firstExpenseDate.getFullYear()) * 12 + 
                                  (new Date().getMonth() - firstExpenseDate.getMonth()) + 1;
                const avgMonthly = total / Math.max(monthsDiff, 1);
                avgMonthlyEl.textContent = formatCurrency(avgMonthly);
            } else {
                avgMonthlyEl.textContent = formatCurrency(0);
            }
            
            expenseCountEl.textContent = expenses.length;
        }
        
        // Update category chart
        function updateCategoryChart() {
            const categoryTotals = {
                feed: 0,
                health: 0,
                equipment: 0,
                labor: 0,
                utilities: 0,
                other: 0
            };
            
            expenses.forEach(expense => {
                categoryTotals[expense.category] += parseFloat(expense.amount);
            });
            
            categoryChart.data.datasets[0].data = [
                categoryTotals.feed,
                categoryTotals.health,
                categoryTotals.equipment,
                categoryTotals.labor,
                categoryTotals.utilities,
                categoryTotals.other
            ];
            
            categoryChart.update();
        }
        
        // Render expense table
        function renderExpenseTable() {
            if (expenses.length === 0) {
                emptyState.style.display = 'block';
                expenseTableBody.innerHTML = '';
                return;
            }
            
            emptyState.style.display = 'none';
            
            // Sort expenses by date (newest first)
            const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            expenseTableBody.innerHTML = sortedExpenses.map(expense => `
                <tr>
                    <td>${formatDate(expense.date)}</td>
                    <td>${expense.description}</td>
                    <td>
                        <span class="category-badge ${getCategoryClass(expense.category)}">
                            ${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                        </span>
                    </td>
                    <td>${formatCurrency(parseFloat(expense.amount))}</td>
                    <td class="actions">
                        <button class="action-btn btn-danger" onclick="deleteExpense('${expense.id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
        
        // Add new expense
        expenseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newExpense = {
                id: Date.now().toString(),
                date: document.getElementById('date').value,
                description: document.getElementById('description').value,
                category: document.getElementById('category').value,
                amount: parseFloat(document.getElementById('amount').value).toFixed(2),
                quantity: document.getElementById('quantity').value || null,
                unit: document.getElementById('unit').value || null
            };
            
            expenses.push(newExpense);
            localStorage.setItem('eggFarmExpenses', JSON.stringify(expenses));
            
            // Reset form
            expenseForm.reset();
            document.getElementById('date').valueAsDate = new Date();
            
            // Update UI
            renderExpenseTable();
            calculateSummary();
            updateCategoryChart();
        });
        
        // Delete expense
        function deleteExpense(id) {
            if (confirm('Are you sure you want to delete this expense?')) {
                expenses = expenses.filter(expense => expense.id !== id);
                localStorage.setItem('eggFarmExpenses', JSON.stringify(expenses));
                renderExpenseTable();
                calculateSummary();
                updateCategoryChart();
            }
        }
        
        // Initialize the app
        function init() {
            // Set default date to today
            document.getElementById('date').valueAsDate = new Date();
            
            // Render initial data
            renderExpenseTable();
            calculateSummary();
            updateCategoryChart();
        }
        
        // Start the application
        init();
   