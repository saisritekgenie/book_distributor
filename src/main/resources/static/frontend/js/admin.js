// ==============================
// CONFIG
// ==============================
const BASE_URL = "http://localhost:8081/api";

// ==============================
// GLOBAL STATE
// ==============================
let books = [];
let orders = [];
let invoices = [];

// ==============================
// LOAD ORDERS (API)
// ==============================
async function loadOrders() {
    try {
        let res = await fetch(`${BASE_URL}/orders`);
        orders = await res.json();
    } catch (e) {
        console.log("API not available, loading from localstorage");
        orders = JSON.parse(localStorage.getItem("orders")) || [];
    }

    let table = document.getElementById("ordersTableBody");
    if (!table) return;

    table.innerHTML = "";

    if (!orders.length) {
        table.innerHTML = `<tr><td colspan="4" class="text-center">No orders</td></tr>`;
        return;
    }

    orders.forEach(order => {
        let orderId = order.id || (order.orderId ? "ORD" + (1719758500000 + order.orderId) : "-");
        let parentName = order.parent || order.studentName || "-";
        let orderTotal = order.total !== undefined ? order.total : (order.totalAmount !== undefined ? order.totalAmount : 0);
        let status = order.status || order.paymentStatus || "Pending";

        table.innerHTML += `
            <tr>
                <td>${orderId}</td>
                <td>${parentName}</td>
                <td>₹${orderTotal}</td>
                <td>
                    <span class="badge bg-${getStatusColor(status)}">
                        ${status}
                    </span>
                </td>
            </tr>
        `;
    });
}

// ==============================
// STATUS COLOR
// ==============================
function getStatusColor(status) {
    if (status === "Pending") return "warning";
    if (status === "Paid") return "info";
    if (status === "Delivered") return "success";
    return "secondary";
}

// ==============================
// REPORTS
// ==============================
function loadReports() {

    if (!orders) orders = [];

    let ordersCount = document.getElementById("ordersCount");
    if (ordersCount) ordersCount.innerText = orders.length;

    // pending calculation (checking status/paymentStatus in both schemas)
    let pending = orders.filter(o => {
        let st = o.status || o.paymentStatus || "";
        return st.toLowerCase() === "pending";
    }).length;
    let pendingEl = document.getElementById("pendingOrdersCount");
    if (pendingEl) pendingEl.innerText = pending;

    // revenue calculation (checking total/totalAmount in both schemas)
    let revenue = orders.reduce((sum, o) => {
        let val = o.total !== undefined ? o.total : (o.totalAmount !== undefined ? o.totalAmount : 0);
        return sum + Number(val);
    }, 0);
    let revenueEl = document.getElementById("revenueCount");
    if (revenueEl) revenueEl.innerText = "₹" + revenue;

    // Load dynamic counts from localStorage
    let students = JSON.parse(localStorage.getItem("students")) || [];
    let studentsCount = document.getElementById("studentsCount");
    if (studentsCount) studentsCount.innerText = students.length;

    let invoiceCount = document.getElementById("invoiceCount");
    if (invoiceCount) invoiceCount.innerText = invoices.length;

    // Dynamically calculate books count from books key in localStorage
    let booksList = JSON.parse(localStorage.getItem("books")) || [];
    let booksCount = document.getElementById("booksCount");
    if (booksCount) booksCount.innerText = booksList.length;

    // Calculate Low Stock (qty <= 5)
    let lowStockCount = booksList.filter(b => Number(b.qty || 0) <= 5).length;
    let lowStockEl = document.getElementById("criticalStockCount");
    if (lowStockEl) lowStockEl.innerText = lowStockCount;

    // Calculate Invoice Health (paid invoices vs total invoices)
    let totalInvoices = invoices.length;
    let paidInvoices = invoices.filter(i => {
        let ps = i.paymentStatus || "";
        return ps.toLowerCase() === "paid";
    }).length;

    // Fallback to checking orders status (API database) if local invoices list is empty or completely pending
    if (totalInvoices === 0 || paidInvoices === 0) {
        let totalOrdersCount = orders.length;
        let paidOrdersCount = orders.filter(o => {
            let st = o.status || o.paymentStatus || "";
            return st.toLowerCase() === "paid" || st.toLowerCase() === "delivered" || st.toLowerCase() === "approved";
        }).length;
        if (totalOrdersCount > 0) {
            totalInvoices = totalOrdersCount;
            paidInvoices = paidOrdersCount;
        }
    }

    let healthPercent = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;
    let healthEl = document.getElementById("invoiceHealthCount");
    if (healthEl) healthEl.innerText = healthPercent + "%";

    // Update progress bar
    let progressBar = document.getElementById("paymentProgressBar");
    if (progressBar) {
        progressBar.style.width = healthPercent + "%";
        progressBar.innerText = healthPercent + "%";
    }
}

// ==============================
// INVENTORY TABLE
// ==============================
function loadInventoryTable() {

    let booksList = JSON.parse(localStorage.getItem("books")) || [];
    let table = document.getElementById("inventoryTableBody");

    if (!table) return;

    table.innerHTML = "";

    if (!booksList.length) {
        table.innerHTML = `<tr><td colspan="4" class="text-center">No Inventory</td></tr>`;
        return;
    }

    booksList.forEach(item => {
        let className = item.class ? "Class " + item.class : "Unknown";
        table.innerHTML += `
            <tr>
                <td>${className} - ${item.name}</td>
                <td>${item.qty}</td>
                <td>10</td>
                <td>
                    <span class="badge ${item.qty > 5 ? 'bg-success' : (item.qty > 0 ? 'bg-warning text-dark' : 'bg-danger')}">
                        ${item.qty > 5 ? 'Healthy' : (item.qty > 0 ? 'Low Stock' : 'Out of Stock')}
                    </span>
                </td>
            </tr>
        `;
    });
}

// ==============================
// ADD INVENTORY BOOK
// ==============================
function addBookInventory() {

    let inventory = JSON.parse(localStorage.getItem("inventory")) || [];

    let newBook = {
        id: "B" + Date.now(),
        class: document.getElementById("bookClass").value,
        name: document.getElementById("bookName").value,
        qty: Number(document.getElementById("bookQty").value)
    };

    inventory.push(newBook);

    localStorage.setItem("inventory", JSON.stringify(inventory));

    alert("Book added successfully!");

    loadInventoryTable();
}

// ==============================
// CREATE & MANAGE STAFF
// ==============================
function createStaff() {
    let nameInput = document.getElementById("staffName");
    let usernameInput = document.getElementById("username");
    let passwordInput = document.getElementById("password");

    let name = nameInput.value.trim();
    let username = usernameInput.value.trim();
    let password = passwordInput.value.trim();

    if (!name || !username || !password) {
        alert("Please fill in all fields.");
        return;
    }

    let staffList = JSON.parse(localStorage.getItem("staff")) || [];

    // Check duplicate username
    if (staffList.some(s => s.username === username)) {
        alert("Username already exists!");
        return;
    }

    let newStaff = {
        id: "STF" + Date.now(),
        name: name,
        username: username,
        password: password,
        status: "active"
    };

    staffList.push(newStaff);
    localStorage.setItem("staff", JSON.stringify(staffList));

    // Clear inputs
    nameInput.value = "";
    usernameInput.value = "";
    passwordInput.value = "";

    alert("Staff member registered successfully!");
    loadStaffTable();
}

function loadStaffTable() {
    let staffList = JSON.parse(localStorage.getItem("staff")) || [];
    let tbody = document.getElementById("staffTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (staffList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No staff registered yet</td></tr>`;
        return;
    }

    staffList.forEach((staff, index) => {
        let statusBadge = staff.status === "active" 
            ? `<span class="badge bg-success">Active</span>` 
            : `<span class="badge bg-danger">Suspended</span>`;
        let actionBtn = staff.status === "active"
            ? `<button class="btn btn-warning btn-sm me-1" onclick="toggleStaffAccess(${index})">Suspend</button>`
            : `<button class="btn btn-success btn-sm me-1" onclick="toggleStaffAccess(${index})">Activate</button>`;

        tbody.innerHTML += `
            <tr>
                <td><strong>${staff.name}</strong></td>
                <td><code>${staff.username}</code></td>
                <td>${statusBadge}</td>
                <td class="text-end">
                    ${actionBtn}
                    <button class="btn btn-danger btn-sm" onclick="deleteStaff(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

window.toggleStaffAccess = function(index) {
    let staffList = JSON.parse(localStorage.getItem("staff")) || [];
    if (staffList[index]) {
        staffList[index].status = staffList[index].status === "active" ? "inactive" : "active";
        localStorage.setItem("staff", JSON.stringify(staffList));
        loadStaffTable();
    }
};

window.deleteStaff = function(index) {
    if (confirm("Are you sure you want to delete this staff member?")) {
        let staffList = JSON.parse(localStorage.getItem("staff")) || [];
        staffList.splice(index, 1);
        localStorage.setItem("staff", JSON.stringify(staffList));
        loadStaffTable();
    }
};

// ==============================
// NOTIFICATIONS
// ==============================
setInterval(() => {

    let msg = localStorage.getItem("notification");

    if (msg) {
        alert("🔔 ADMIN ALERT: " + msg);
        localStorage.removeItem("notification");
    }

}, 2000);

// ==============================
// INVENTORY AUTO REDUCE (REAL TIME)
// ==============================
function reduceStockFromOrder(order) {

    let booksList = JSON.parse(localStorage.getItem("books")) || [];

    if (order.books) {
        if (Array.isArray(order.books)) {
            order.books.forEach(book => {
                let item = booksList.find(i => i.name.toLowerCase() === book.name.toLowerCase());
                if (item && item.qty > 0) {
                    item.qty -= 1;
                }
            });
        } else if (typeof order.books === "string") {
            let orderedBookNames = order.books.split(",").map(s => s.trim().toLowerCase());
            booksList.forEach(item => {
                if (orderedBookNames.includes(item.name.toLowerCase()) && item.qty > 0) {
                    item.qty -= 1;
                }
            });
        }
        localStorage.setItem("books", JSON.stringify(booksList));
    }
}

// ==============================
// REFRESH DASHBOARD
// ==============================
async function refreshDashboard() {
    await loadOrders();
    try {
        let res = await fetch(`${BASE_URL}/invoices`);
        invoices = await res.json();
    } catch (e) {
        console.log("API not available, loading invoices from localstorage");
        invoices = JSON.parse(localStorage.getItem("invoices")) || [];
    }
    loadReports();
}

// ==============================
// POPUP NOTIFICATION (AESTHETIC TOAST)
// ==============================
function showPopupNotification(message) {
    let container = document.getElementById("notification-toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "notification-toast-container";
        container.style.position = "fixed";
        container.style.top = "20px";
        container.style.right = "20px";
        container.style.zIndex = "9999";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast show align-items-center text-white bg-primary border-0 mb-2 shadow-lg";
    toast.role = "alert";
    toast.style.display = "block";
    toast.style.minWidth = "320px";
    toast.style.borderRadius = "12px";
    toast.style.background = "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)";
    toast.innerHTML = `
        <div class="d-flex p-3">
            <div class="toast-body">
                <h6 class="fw-bold mb-1"><i class="bi bi-bell-fill me-2"></i>New Notification</h6>
                <div>${message}</div>
            </div>
            <button type="button" class="btn-close btn-close-white ms-auto me-2" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = "opacity 0.5s ease-out";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

// ==============================
// LOCAL STORAGE STORAGE LISTENER
// ==============================
window.addEventListener('storage', (e) => {
    if (e.key === 'newOrderNotification' && e.newValue) {
        let data = JSON.parse(e.newValue);
        showPopupNotification(`New order placed! ID: <strong>${data.id}</strong> by parent <strong>${data.parent}</strong>. Total: <strong>₹${data.total}</strong>.`);
        
        // Reload dashboard
        refreshDashboard();
        loadInventoryTable();
    }
});

// ==============================
// INIT
// ==============================
async function initAdmin() {
    await refreshDashboard();
    loadInventoryTable();
    loadStaffTable();
}

initAdmin();

// ==============================
// WEBSOCKET REAL TIME
// ==============================
if (typeof SockJS !== 'undefined' && typeof Stomp !== 'undefined') {
    try {
        let socket = new SockJS("http://localhost:8081/ws");
        let stompClient = Stomp.over(socket);

        stompClient.connect({}, function () {
            console.log("Connected to WebSocket");
            stompClient.subscribe("/topic/orders", function (msg) {
                let data = JSON.parse(msg.body);

                // UPDATE ORDERS
                if (data.type === "DELETE") {
                    orders = orders.filter(o => o.id !== data.id);
                } else {
                    let index = orders.findIndex(o => o.id === data.id);

                    if (index !== -1) {
                        orders[index] = data;
                    } else {
                        orders.push(data);
                    }

                    // 🔥 STOCK REDUCE TRIGGER
                    reduceStockFromOrder(data);
                }

                showPopupNotification(`New Order <strong>${data.id || data.orderId}</strong> received via WebSocket!`);
                refreshDashboard();
                loadInventoryTable();
            });
        });
    } catch (err) {
        console.warn("WebSocket connection failed, relying on local storage synchronization", err);
    }
} else {
    console.log("SockJS/Stomp not loaded. Relying on localStorage synchronization.");
}