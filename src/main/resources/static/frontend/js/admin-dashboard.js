const API_PATHS = {
    books: '/api/books',
    orders: '/api/orders',
    invoices: '/api/invoices',
    inventory: '/api/inventory',
    students: '/api/students'
};

let inventoryData = [];
let ordersData = [];
let paymentsData = [];
let studentsData = [];
let currentInventoryPage = 1;
const inventoryPageSize = 6;

window.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    document.getElementById('inventorySearch').addEventListener('input', () => {
        currentInventoryPage = 1;
        renderInventoryTable();
    });
});

async function initializeDashboard() {
    setDashboardDate();
    await loadAllData();
    renderDashboardCards();
    renderTables();
    renderCharts();
    renderReports();
}

function setDashboardDate() {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    document.getElementById('dashboardDate').innerText = formatted;
}

async function loadAllData() {
    const headers = getAuthHeaders();
    const requests = Object.values(API_PATHS).map(path => fetch(path, { headers }));

    try {
        const [booksRes, ordersRes, invoicesRes, inventoryRes, studentsRes] = await Promise.all(requests);
        inventoryData = await safeJson(inventoryRes);
        ordersData = await safeJson(ordersRes);
        paymentsData = await safeJson(invoicesRes);
        studentsData = await safeJson(studentsRes);
        const books = await safeJson(booksRes);
        document.querySelector('#totalBooks').dataset.count = Array.isArray(books) ? books.length : 0;
    } catch (error) {
        console.error('Unable to load dashboard data', error);
        showLoadingErrors();
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = { 'Accept': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function safeJson(response) {
    if (!response || !response.ok) {
        return [];
    }
    try {
        return await response.json();
    } catch {
        return [];
    }
}

function showLoadingErrors() {
    document.getElementById('inventoryTableBody').innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Unable to load inventory.</td></tr>';
    document.getElementById('ordersTableBody').innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Unable to load orders.</td></tr>';
    document.getElementById('paymentsTableBody').innerHTML = '<tr><td colspan="3" class="text-center text-danger py-4">Unable to load payments.</td></tr>';
}

function renderDashboardCards() {
    const bookCount = Number(document.querySelector('#totalBooks').dataset.count) || 0;
    const orderCount = Array.isArray(ordersData) ? ordersData.length : 0;
    const paymentCount = Array.isArray(paymentsData) ? paymentsData.length : 0;
    const stockCount = inventoryData.reduce((sum, item) => sum + Number(item.availableStock || 0), 0);

    document.getElementById('totalBooks').innerText = bookCount;
    document.getElementById('totalOrders').innerText = orderCount;
    document.getElementById('totalPayments').innerText = paymentCount;
    document.getElementById('inventoryStock').innerText = stockCount;
    document.getElementById('availableStock').innerText = stockCount;
    document.getElementById('reportOrders').innerText = orderCount;
    document.getElementById('reportStudents').innerText = Array.isArray(studentsData) ? studentsData.length : 0;
}

function renderTables() {
    renderInventoryTable();
    renderOrdersTable();
    renderPaymentsTable();
}

function renderInventoryTable() {
    const searchValue = document.getElementById('inventorySearch').value.trim().toLowerCase();
    let filtered = inventoryData;

    if (searchValue) {
        filtered = inventoryData.filter(item => (item.bookTitle || '').toLowerCase().includes(searchValue));
    }

    const totalItems = filtered.length;
    const start = (currentInventoryPage - 1) * inventoryPageSize;
    const paged = filtered.slice(start, start + inventoryPageSize);

    const body = document.getElementById('inventoryTableBody');
    if (!paged.length) {
        body.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No inventory items found.</td></tr>';
    } else {
        body.innerHTML = paged.map(item => {
            const stock = Number(item.availableStock || 0);
            const minimum = Number(item.minimumStock || 0);
            const status = stock <= minimum ? 'Low Stock' : 'Healthy';
            const badgeClass = stock <= minimum ? 'bg-danger' : 'bg-success';
            return `
                <tr>
                    <td>${item.bookTitle || 'Unknown'}</td>
                    <td>${stock}</td>
                    <td>${minimum}</td>
                    <td><span class="badge ${badgeClass}">${status}</span></td>
                </tr>`;
        }).join('');
    }

    renderInventoryPagination(totalItems);
    document.getElementById('inventorySummary').innerText = `Showing ${Math.min(totalItems, start + 1)} to ${Math.min(totalItems, start + inventoryPageSize)} of ${totalItems} items`;
    const lowStockCount = inventoryData.filter(item => Number(item.availableStock || 0) <= Number(item.minimumStock || 0)).length;
    const totalStock = inventoryData.reduce((sum, item) => sum + Number(item.availableStock || 0), 0);
    document.getElementById('lowStockCount').innerText = lowStockCount;
    document.getElementById('stockProgress').style.width = `${Math.min(100, totalStock / (Math.max(1, inventoryData.length) * 20) * 100)}%`;
    document.getElementById('lowStockProgress').style.width = `${Math.min(100, lowStockCount / Math.max(1, inventoryData.length) * 100)}%`;
    document.getElementById('inventoryHealthBadge').innerText = lowStockCount > 0 ? 'Watch' : 'Healthy';
}

function renderInventoryPagination(totalItems) {
    const pages = Math.max(1, Math.ceil(totalItems / inventoryPageSize));
    const pagination = document.getElementById('inventoryPagination');
    pagination.innerHTML = '';

    for (let i = 1; i <= pages; i++) {
        const activeClass = i === currentInventoryPage ? 'active' : '';
        const item = document.createElement('li');
        item.className = `page-item ${activeClass}`;
        item.innerHTML = `<button class="page-link">${i}</button>`;
        item.addEventListener('click', () => {
            currentInventoryPage = i;
            renderInventoryTable();
        });
        pagination.appendChild(item);
    }
}

function renderOrdersTable() {
    const body = document.getElementById('ordersTableBody');
    if (!ordersData.length) {
        body.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No orders available.</td></tr>';
        return;
    }

    const rows = ordersData.slice(0, 8).map(order => {
        const student = order.studentName || (order.student || {}).studentName || 'Unknown';
        return `
            <tr>
                <td>#${order.orderId || order.id || '—'}</td>
                <td>${student}</td>
                <td>${formatCurrency(Number(order.totalAmount || 0))}</td>
                <td>${renderStatusBadge(order.status)}</td>
            </tr>`;
    });
    body.innerHTML = rows.join('');
}

function renderPaymentsTable() {
    const body = document.getElementById('paymentsTableBody');
    if (!paymentsData.length) {
        body.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-4">No payments available.</td></tr>';
        return;
    }

    const rows = paymentsData.slice(0, 8).map(payment => {
        const invoice = payment.invoiceNumber || `INV-${payment.invoiceId || '000'}`;
        const date = formatDate(payment.generatedDate);
        const order = payment.orderId || (payment.order || {}).orderId || '—';
        return `
            <tr>
                <td>${invoice}</td>
                <td>${date}</td>
                <td>#${order}</td>
            </tr>`;
    });
    body.innerHTML = rows.join('');
}

function renderStatusBadge(status) {
    const key = (status || '').toLowerCase();
    if (key.includes('pending')) {
        return '<span class="badge bg-warning text-dark">Pending</span>';
    }
    if (key.includes('complete') || key.includes('paid') || key.includes('success')) {
        return '<span class="badge bg-success">Completed</span>';
    }
    if (key.includes('cancel') || key.includes('failed')) {
        return '<span class="badge bg-danger">Canceled</span>';
    }
    return '<span class="badge bg-secondary">' + (status || 'Unknown') + '</span>';
}

function renderCharts() {
    const element = document.getElementById('revenueTrend');
    if (!element) return;

    const monthly = computeMonthlyRevenue();
    const maxValue = Math.max(...monthly.map(item => item.value), 1);

    element.innerHTML = monthly.map(item => {
        const height = Math.round((item.value / maxValue) * 100);
        return `
            <div class="chart-bar">
                <span><strong style="height: ${height}%"></strong></span>
                <small>${item.label}</small>
            </div>`;
    }).join('');
}

function computeMonthlyRevenue() {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthIndex = now.getMonth();
    const recent = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), monthIndex - i, 1);
        const label = monthLabels[date.getMonth()];
        const revenue = ordersData.reduce((sum, order) => {
            const orderDate = new Date(order.orderDate || order.createdAt || order.date || null);
            if (!orderDate || orderDate.getMonth() !== date.getMonth() || orderDate.getFullYear() !== date.getFullYear()) {
                return sum;
            }
            return sum + Number(order.totalAmount || 0);
        }, 0);
        recent.push({ label, value: Math.round(revenue) });
    }

    return recent;
}

function renderReports() {
    const orderCount = Array.isArray(ordersData) ? ordersData.length : 0;
    const paymentCount = Array.isArray(paymentsData) ? paymentsData.length : 0;
    const lowStockCount = inventoryData.filter(item => Number(item.availableStock || 0) <= Number(item.minimumStock || 0)).length;
    const paymentRate = orderCount ? Math.round((paymentCount / orderCount) * 100) : 0;

    document.getElementById('reportOrders').innerText = orderCount;
    document.getElementById('reportPaymentRate').innerText = `${paymentRate}%`;
    document.getElementById('reportStockAlerts').innerText = lowStockCount;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);
}

function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '—';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
