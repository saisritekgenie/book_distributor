// ==============================
// CONFIG
// ==============================
const BASE_URL = "https://book-distributor.onrender.com/api";

// ==============================
// GLOBAL STATE
// ==============================
let books = [];
let orders = [];
let invoices = [];

// ==============================
// ID NORMALIZER HELPER
// ==============================
function cleanId(val) {
    if (!val) return "";
    let s = val.toString().replace("ORD", "").replace("INV", "").trim();
    let n = Number(s);
    if (!isNaN(n) && n > 1719758500000) {
        return (n - 1719758500000).toString();
    }
    return s;
}

function cleanupLegacyStorageIds() {
    let baseId = 1719758500000;
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let invoices = JSON.parse(localStorage.getItem("invoices")) || [];
    
    // Find the maximum VALID sequential ID in orders first
    let maxOrdSeq = 0;
    orders.forEach(o => {
        let idStr = (o.id || "").toString().replace("ORD", "");
        let num = Number(idStr);
        if (!isNaN(num) && num > baseId) {
            let offset = num - baseId;
            if (offset < 1000000 && offset > maxOrdSeq) {
                maxOrdSeq = offset;
            }
        }
    });

    // Find the maximum VALID sequential ID in invoices first
    let maxInvSeq = 0;
    invoices.forEach(inv => {
        let idStr = (inv.invoiceId || "").toString().replace("INV", "");
        let num = Number(idStr);
        if (!isNaN(num) && num > baseId) {
            let offset = num - baseId;
            if (offset < 1000000 && offset > maxInvSeq) {
                maxInvSeq = offset;
            }
        }
    });

    let orderIdMap = {};
    let ordersChanged = false;
    
    orders.forEach(o => {
        let idStr = (o.id || "").toString().replace("ORD", "");
        let num = Number(idStr);
        if (!isNaN(num) && num > baseId) {
            let offset = num - baseId;
            if (offset < 1000000) {
                let correctId = "ORD171975850000" + offset;
                if (o.id !== correctId) {
                    let oldId = o.id;
                    o.id = correctId;
                    orderIdMap[oldId] = correctId;
                    ordersChanged = true;
                    console.log(`Self-healed ID format: ${oldId} -> ${correctId}`);
                }
            } else {
                maxOrdSeq += 1;
                let oldId = o.id;
                let newId = "ORD171975850000" + maxOrdSeq;
                orderIdMap[oldId] = newId;
                o.id = newId;
                ordersChanged = true;
                console.log(`Cleaned legacy order ID: ${oldId} -> ${newId}`);
            }
        }
    });
    
    if (ordersChanged) {
        localStorage.setItem("orders", JSON.stringify(orders));
    }

    let invoicesChanged = false;
    invoices.forEach(inv => {
        if (inv.orderId && orderIdMap[inv.orderId]) {
            inv.orderId = orderIdMap[inv.orderId];
            invoicesChanged = true;
        }
        
        let idStr = (inv.invoiceId || "").toString().replace("INV", "");
        let num = Number(idStr);
        if (!isNaN(num) && num > baseId) {
            let offset = num - baseId;
            if (offset < 1000000) {
                let correctInvId = "INV171975850000" + offset;
                if (inv.invoiceId !== correctInvId) {
                    let oldInvId = inv.invoiceId;
                    inv.invoiceId = correctInvId;
                    invoicesChanged = true;
                    console.log(`Self-healed invoice ID format: ${oldInvId} -> ${correctInvId}`);
                }
            } else {
                maxInvSeq += 1;
                let oldInvId = inv.invoiceId;
                inv.invoiceId = "INV171975850000" + maxInvSeq;
                invoicesChanged = true;
                console.log(`Cleaned legacy invoice ID: ${oldInvId} -> ${inv.invoiceId}`);
            }
        }
    });
    
    if (invoicesChanged) {
        localStorage.setItem("invoices", JSON.stringify(invoices));
    }
}
cleanupLegacyStorageIds();

function generateMissingInvoices(invoicesList, ordersList) {
    let merged = [...invoicesList];
    ordersList.forEach(order => {
        let orderId = order.orderId || order.id;
        if (!orderId) return;
        
        let cleanOrdId = cleanId(orderId);
        let hasInvoice = invoicesList.some(inv => {
            let invOrdId = inv.orderId || inv.invoiceNumber || inv.invoiceId || "";
            return cleanId(invOrdId) === cleanOrdId;
        });

        if (!hasInvoice) {
            let total = order.total !== undefined ? order.total : (order.totalAmount !== undefined ? order.totalAmount : 0);
            let date = order.orderDate || order.date || new Date().toLocaleDateString();
            let parentName = order.parent || order.studentName || "Parent";
            let studentName = order.student || order.studentName || "-";
            
            let mockInvoice = {
                invoiceId: order.orderId ? "INV171975850000" + order.orderId : cleanId(order.id),
                invoiceNumber: order.orderId ? "INV171975850000" + order.orderId : (order.id ? "INV171975850000" + cleanId(order.id) : "INV" + Date.now()),
                orderId: orderId,
                totalAmount: total,
                generatedDate: date,
                invoiceDate: date,
                parentName: parentName,
                studentName: studentName,
                studentClass: order.studentClass || "Grade 6",
                books: order.books || "Curriculum Package",
                paymentMethod: order.paymentMethod || "Online",
                paymentStatus: order.status || order.paymentStatus || "Paid"
            };
            merged.push(mockInvoice);
        }
    });
    return merged;
}

// ==============================
// LOAD ORDERS (API & LOCAL MERGED)
// ==============================
async function loadOrders() {
    let dbOrders = [];
    try {
        let res = await fetch(`${BASE_URL}/orders`);
        if (res.ok) {
            dbOrders = await res.json();
        }
    } catch (e) {
        console.log("API not available for orders");
    }

    let localOrders = JSON.parse(localStorage.getItem("orders")) || [];
    let mergedOrders = [...dbOrders];

    localOrders.forEach(localOrd => {
        let matchedDbOrd = null;
        if (localOrd.orderId) {
            matchedDbOrd = mergedOrders.find(dbOrd => dbOrd.orderId === localOrd.orderId);
        }
        if (!matchedDbOrd) {
            let cleanLocalId = cleanId(localOrd.id);
            matchedDbOrd = mergedOrders.find(dbOrd => dbOrd.orderId.toString() === cleanLocalId);
        }

        if (matchedDbOrd) {
            if (localOrd.books) {
                matchedDbOrd.books = localOrd.books;
            }
            if (localOrd.id) {
                matchedDbOrd.id = localOrd.id;
            }
            if (localOrd.parent) {
                matchedDbOrd.parent = localOrd.parent;
            }
        } else {
            mergedOrders.push(localOrd);
        }
    });

    orders = mergedOrders;
    renderOrdersListAdmin();
}

function renderOrdersListAdmin() {
    let table = document.getElementById("ordersTableBody");
    if (!table) return;

    table.innerHTML = "";

    if (!orders.length) {
        table.innerHTML = `<tr><td colspan="4" class="text-center">No orders</td></tr>`;
        return;
    }

    const activitySearch = document.getElementById("activitySearch");
    const searchValue = activitySearch ? activitySearch.value.trim().toLowerCase() : "";

    let filtered = orders;
    if (searchValue) {
        filtered = orders.filter(order => {
            let orderId = (order.id || (order.orderId ? "ORD171975850000" + order.orderId : "-")).toString().toLowerCase();
            let parentName = (order.parent || order.studentName || "-").toLowerCase();
            let status = (order.status || order.paymentStatus || "Pending").toLowerCase();
            return orderId.includes(searchValue) || parentName.includes(searchValue) || status.includes(searchValue);
        });
    }

    if (!filtered.length) {
        table.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No matching orders found</td></tr>`;
        return;
    }

    filtered.forEach(order => {
        let orderId = order.id || (order.orderId ? "ORD171975850000" + order.orderId : "-");
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
    let phoneInput = document.getElementById("staffPhone");
    let passwordInput = document.getElementById("password");

    let name = nameInput.value.trim();
    let username = usernameInput.value.trim();
    let phone = phoneInput.value ? phoneInput.value.trim() : "";
    let password = passwordInput.value.trim();

    if (!name || !username || !phone || !password) {
        alert("Please fill in all fields (Name, Mail ID, Phone, and Password).");
        return;
    }

    let staffList = JSON.parse(localStorage.getItem("staff")) || [];

    // Check duplicate username
    if (staffList.some(s => s.username === username)) {
        alert("Username/Mail ID already exists!");
        return;
    }

    let newStaff = {
        id: "STF" + Date.now(),
        name: name,
        username: username,
        phone: phone,
        password: password,
        status: "active"
    };

    staffList.push(newStaff);
    localStorage.setItem("staff", JSON.stringify(staffList));

    // Clear inputs
    nameInput.value = "";
    usernameInput.value = "";
    phoneInput.value = "";
    passwordInput.value = "";

    alert("Staff member registered successfully and access granted!");
    loadStaffTable();
}

function loadStaffTable() {
    let staffList = JSON.parse(localStorage.getItem("staff")) || [];
    let tbody = document.getElementById("staffTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (staffList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No staff registered yet</td></tr>`;
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
                <td>${staff.phone || '-'}</td>
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
    let orderClass = order.studentClass || order.className || "";

    let cleanClass = (val) => {
        if (!val) return "";
        let matches = val.toString().match(/\d+/);
        return matches ? matches[0] : val.toString().trim().toLowerCase();
    };

    if (order.books) {
        if (Array.isArray(order.books)) {
            order.books.forEach(book => {
                let item = booksList.find(i => 
                    i.name.toLowerCase() === book.name.toLowerCase() &&
                    (!orderClass || cleanClass(i.class) === cleanClass(orderClass))
                );
                if (item && item.qty > 0) {
                    item.qty -= 1;
                }
            });
        } else if (typeof order.books === "string") {
            let orderedBookNames = order.books.split(",").map(s => s.trim().toLowerCase());
            booksList.forEach(item => {
                if (orderedBookNames.includes(item.name.toLowerCase()) && 
                    (!orderClass || cleanClass(item.class) === cleanClass(orderClass)) &&
                    item.qty > 0) {
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
    
    let dbInvoices = [];
    try {
        let res = await fetch(`${BASE_URL}/invoices`);
        if (res.ok) {
            dbInvoices = await res.json();
        }
    } catch (e) {
        console.log("API not available for invoices");
    }

    let localInvoices = JSON.parse(localStorage.getItem("invoices")) || [];
    let mergedInvoices = [...dbInvoices];

    localInvoices.forEach(localInv => {
        let isSynced = false;
        if (localInv.invoiceId) {
            isSynced = dbInvoices.some(dbInv => dbInv.invoiceId === localInv.invoiceId || dbInv.invoiceNumber === localInv.invoiceId);
        }
        if (!isSynced && localInv.orderId) {
            isSynced = dbInvoices.some(dbInv => dbInv.orderId === localInv.orderId);
        }
        if (!isSynced) {
            mergedInvoices.push(localInv);
        }
    });

    invoices = mergedInvoices;
    invoices = generateMissingInvoices(invoices, orders);
    loadReports();
    renderInvoicesListAdmin();
}

// ==============================
// RENDER INVOICES LIST (ADMIN)
// ==============================
function renderInvoicesListAdmin() {
    let table = document.getElementById("invoicesTableBody");
    if (!table) return;

    table.innerHTML = "";

    if (!invoices.length) {
        table.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No invoices found</td></tr>`;
        return;
    }

    invoices.forEach(invoice => {
        let invNum = invoice.invoiceNumber || (invoice.invoiceId ? "INV171975850000" + invoice.invoiceId : "-");
        let ordId = invoice.orderId ? "ORD171975850000" + invoice.orderId : "-";
        let amount = invoice.totalAmount !== undefined ? invoice.totalAmount : 0;
        let date = invoice.generatedDate || invoice.invoiceDate || "-";
        if (date !== "-" && !isNaN(Date.parse(date))) {
            date = new Date(date).toLocaleString();
        }

        table.innerHTML += `
            <tr>
                <td><strong>${invNum}</strong></td>
                <td>${ordId}</td>
                <td>₹${amount}</td>
                <td>${date}</td>
                <td class="text-end">
                    <button class="btn btn-outline-primary btn-sm" onclick="viewReceipt('${ordId}')">
                        <i class="bi bi-file-earmark-text"></i> Receipt
                    </button>
                </td>
            </tr>
        `;
    });
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

    let activitySearch = document.getElementById("activitySearch");
    if (activitySearch) {
        activitySearch.addEventListener("input", renderOrdersListAdmin);
    }
}

initAdmin();

// ==============================
// WEBSOCKET REAL TIME
// ==============================
if (typeof SockJS !== 'undefined' && typeof Stomp !== 'undefined') {
    try {
        let socket = new SockJS("https://book-distributor.onrender.com/ws");
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

function getDatabaseId(id) {
    if (!id) return null;
    let clean = id.toString().replace("ORD", "");
    let num = Number(clean);
    if (num > 1719758500000) {
        return num - 1719758500000;
    }
    return num;
}

function findBookPrice(name) {
    let allBooks = JSON.parse(localStorage.getItem("books")) || [];
    let matched = allBooks.find(b => b.name.toLowerCase().trim() === name.toLowerCase().trim());
    return matched ? Number(matched.price) : 250;
}

window.viewReceipt = async function(orderId) {
    // Search in local invoices first
    let invoices = JSON.parse(localStorage.getItem("invoices")) || [];
    let matchedInvoice = invoices.find(inv => cleanId(inv.orderId) === cleanId(orderId) || cleanId(inv.invoiceId) === cleanId(orderId));
    
    // If not found in invoices, let's create a mockup invoice from the order data
    let dbId = getDatabaseId(orderId);
    let order = orders.find(o => o.id === orderId || o.orderId == dbId);
    
    let invoice = matchedInvoice;
    if (!invoice && order) {
        let total = order.total !== undefined ? order.total : (order.totalAmount !== undefined ? order.totalAmount : 0);
        invoice = {
            invoiceId: order.orderId ? "INV171975850000" + order.orderId : (order.id ? "INV171975850000" + cleanId(order.id) : "INV" + Date.now()),
            orderId: orderId,
            parentName: order.parent || order.studentName || "Parent",
            studentName: order.student || order.studentName || "-",
            studentClass: order.studentClass || "Grade 6",
            books: order.books,
            totalAmount: total,
            invoiceDate: order.date || new Date().toLocaleDateString(),
            paymentMethod: order.paymentMethod || "Cash on Delivery",
            paymentStatus: order.status || order.paymentStatus || "Pending"
        };
    }
    
    if (!invoice) {
        alert("Receipt details not found for this order.");
        return;
    }

    let parentMobile = "-";
    let section = "A";
    parentMobile = invoice.parentMobile || (order ? order.parentMobile : null) || "-";
    section = invoice.section || (order ? order.section : null) || "-";
    
    // Load student mobile from localStorage and database API
    let students = JSON.parse(localStorage.getItem("students")) || [];
    try {
        let res = await fetch("https://book-distributor.onrender.com/api/students");
        if (res.ok) {
            let dbStudents = await res.json();
            dbStudents.forEach(dbS => {
                if (!students.some(s => s.studentName.toLowerCase().trim() === dbS.studentName.toLowerCase().trim())) {
                    students.push({
                        studentName: dbS.studentName,
                        rollNumber: "R" + dbS.studentId,
                        studentClass: dbS.className,
                        schoolName: "Greenwood High",
                        parentName: dbS.studentName + " Parent",
                        phoneNumber: dbS.parentMobile
                    });
                }
            });
        }
    } catch(e) {
        console.warn("Could not lookup backend student mobile details");
    }

    let matchedStd = students.find(s => s.studentName && invoice.studentName && s.studentName.toLowerCase().trim() === invoice.studentName.toLowerCase().trim());
    if (matchedStd) {
        if (parentMobile === "-" || !parentMobile) parentMobile = matchedStd.phoneNumber || matchedStd.parentMobile || "-";
        if (section === "-" || !section) section = matchedStd.section || "-";
    }
    if (section === "-") section = "A";

    const schoolName = invoice.schoolName || localStorage.getItem("schoolName") || "Greenwood International School";
    const schoolAddress = "456 Knowledge Boulevard, Tech City, IN - 500032";
    const schoolContact = "Phone: +91 40 1234 5678 | Email: contact@greenwood.edu.in";
    const schoolGST = "GSTIN: 36AAACG4892J1ZN";

    // Recover book details dynamically if missing
    let books = invoice.books;
    if (!books || (Array.isArray(books) && books.length === 0) || (typeof books === 'string' && !books.trim())) {
        let clsNum = "6";
        let clsMatch = (invoice.studentClass || "").match(/\d+/);
        if (clsMatch) clsNum = clsMatch[0];
        
        let fullList = [
            { name: "Telugu", price: 250, qty: 1 },
            { name: "Hindi", price: 250, qty: 1 },
            { name: "English", price: 250, qty: 1 },
            { name: "Mathematics", price: 300, qty: 1 },
            { name: "Science", price: 300, qty: 1 },
            { name: "Social", price: 300, qty: 1 }
        ];

        let targetTotal = Number(invoice.totalAmount || 1650);
        let packagePriceForClass = Number(localStorage.getItem("packagePrice_" + clsNum) || 1650);
        
        if (targetTotal >= packagePriceForClass) {
            books = fullList;
        } else {
            let count = Math.max(1, Math.min(6, Math.round(targetTotal / 275)));
            books = fullList.slice(0, count);
        }

        let defaultTotal = books.reduce((sum, b) => sum + b.price, 0);
        if (targetTotal !== defaultTotal && targetTotal > 0) {
            let ratio = targetTotal / defaultTotal;
            books.forEach(b => {
                b.price = Math.round(b.price * ratio);
            });
            let currentSum = books.reduce((sum, b) => sum + b.price, 0);
            let diff = targetTotal - currentSum;
            if (diff !== 0 && books.length > 0) {
                books[books.length - 1].price += diff;
            }
        }
    }

    let booksHtml = "";
    if (typeof books === 'string') {
        let list = books.split(",").map(s => s.trim()).filter(s => s);
        booksHtml = list.map((item, i) => {
            let name = item;
            let qty = 1;
            let qtyMatch = item.match(/(.+)\s*\(x(\d+)\)/);
            if (qtyMatch) {
                name = qtyMatch[1].trim();
                qty = parseInt(qtyMatch[2], 10);
            }
            let price = findBookPrice(name);
            let itemTotal = price * qty;
            return `
                <tr>
                    <td>${i+1}</td>
                    <td>${name} (x${qty})</td>
                    <td class="text-end">₹${itemTotal}</td>
                </tr>
            `;
        }).join("");
    } else {
        booksHtml = books.map((b, i) => {
            let name = b.name || b;
            let qty = b.qty || 1;
            let price = b.price || findBookPrice(name);
            let itemTotal = price * qty;
            return `
                <tr>
                    <td>${i+1}</td>
                    <td>${name} (x${qty})</td>
                    <td class="text-end">₹${itemTotal}</td>
                </tr>
            `;
        }).join("");
    }

    let codNoticeHtml = "";
    if (invoice.paymentMethod && invoice.paymentMethod.toLowerCase().includes("cash")) {
        codNoticeHtml = `
            <div class="alert alert-warning border-warning fw-bold text-center mt-3 mb-0" style="font-size: 0.9rem;">
                <i class="bi bi-exclamation-triangle-fill"></i> COD ORDER: KEEP COPY OF THIS RECEIPT FOR RECORDS
            </div>
        `;
    }

    let body = document.getElementById("receiptModalBody");
    body.innerHTML = `
        <div class="text-center mb-4">
            <h5 class="fw-bold mb-0 text-dark">${schoolName}</h5>
            <small class="text-muted d-block">${schoolAddress}</small>
            <small class="text-muted d-block">${schoolContact}</small>
            <small class="text-muted fw-bold d-block text-primary">${schoolGST}</small>
        </div>
        
        <div class="row mb-3 text-dark" style="font-size: 0.9rem;">
            <div class="col-6 text-start">
                <strong>Receipt No:</strong> ${invoice.invoiceId || 'INV-TEMP'}<br>
                <strong>Date:</strong> ${invoice.invoiceDate || new Date().toLocaleDateString()}<br>
                <strong>Order ID:</strong> ${invoice.orderId || '-'}<br>
                <strong>Parent Mobile:</strong> ${parentMobile}
            </div>
            <div class="col-6 text-end">
                <strong>Student:</strong> ${invoice.studentName || '-'}<br>
                <strong>Class:</strong> ${invoice.studentClass || '-'} - Section ${section}<br>
                <strong>Parent:</strong> ${invoice.parentName || '-'}
            </div>
        </div>
        
        <table class="table table-bordered table-sm text-dark" style="font-size: 0.9rem;">
            <thead>
                <tr class="table-light">
                    <th>#</th>
                    <th>Book / Item</th>
                    <th class="text-end">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${booksHtml}
            </tbody>
            <tfoot>
                <tr class="fw-bold">
                    <td colspan="2" class="text-end">Total Amount:</td>
                    <td class="text-end text-success">₹${invoice.totalAmount}</td>
                </tr>
            </tfoot>
        </table>
        
        <div class="mt-3 p-2 bg-light rounded text-dark" style="font-size: 0.9rem;">
            <div class="d-flex justify-content-between">
                <span><strong>Payment Method:</strong></span>
                <span>${invoice.paymentMethod || 'Online'}</span>
            </div>
            <div class="d-flex justify-content-between mt-1">
                <span><strong>Payment Status:</strong></span>
                <span class="badge ${invoice.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}">${invoice.paymentStatus || 'Pending'}</span>
            </div>
        </div>
        
        ${codNoticeHtml}
    `;

    let modal = new bootstrap.Modal(document.getElementById("receiptModal"));
    modal.show();
};
