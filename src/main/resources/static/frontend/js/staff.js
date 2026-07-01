let orders = [];

// ==============================
// LOAD ORDERS
// ==============================
async function loadStaffOrders() {
    let table = document.getElementById("staffOrdersTable");
    if (!table) return;

    try {
        let res = await fetch("http://localhost:8081/api/orders");
        orders = await res.json();
    } catch (e) {
        console.log("API not available, loading orders from localstorage");
        orders = JSON.parse(localStorage.getItem("orders")) || [];
    }

    table.innerHTML = "";

    if (orders.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    No Orders Found
                </td>
            </tr>
        `;
        return;
    }

    orders.forEach(order => {
        let id = order.id || (order.orderId ? "ORD" + (1719758500000 + order.orderId) : "-");
        let parentName = order.parent || order.studentName || "-";
        let total = order.total !== undefined ? order.total : (order.totalAmount !== undefined ? order.totalAmount : 0);
        let status = order.status || order.paymentStatus || "Pending";

        let statusBadge = "";

        if (status === "Pending") {
            statusBadge = `<span class="badge bg-warning">Pending</span>`;
        } else if (status === "Approved") {
            statusBadge = `<span class="badge bg-primary">Approved</span>`;
        } else if (status === "Delivered") {
            statusBadge = `<span class="badge bg-success">Delivered</span>`;
        }

        table.innerHTML += `
            <tr>
                <td>${id}</td>
                <td>${parentName}</td>
                <td>${formatBooks(order.books, order)}</td>
                <td>₹${total}</td>
                <td>${statusBadge}</td>
                <td>
                    ${status === "Pending" ? `
                        <button class="btn btn-primary btn-sm" onclick="approveOrder('${id}')">
                            Approve
                        </button>
                    ` : ""}

                    ${status === "Approved" ? `
                        <button class="btn btn-success btn-sm" onclick="deliverOrder('${id}')">
                            Deliver
                        </button>
                    ` : ""}
                </td>
            </tr>
        `;
    });
}

// ==============================
// FORMAT BOOKS (IMPORTANT FIX)
// ==============================
function formatBooks(books, order) {
    if (books) {
        if (Array.isArray(books)) {
            return books.map(b => b.name || b).join(", ");
        }
        return books;
    }

    if (order) {
        let id = order.id || order.orderId;
        let invoices = JSON.parse(localStorage.getItem("invoices")) || [];
        let matched = invoices.find(inv => inv.orderId == id || inv.invoiceId == id);
        if (matched && matched.books) {
            if (Array.isArray(matched.books)) {
                return matched.books.map(b => b.name || b).join(", ");
            }
            return matched.books;
        }
    }

    return "Class 6 Package";
}

// ==============================
// APPROVE ORDER
// ==============================
function getDatabaseId(id) {
    if (!id) return null;
    let clean = id.toString().replace("ORD", "");
    let num = Number(clean);
    if (num > 1719758500000) {
        return num - 1719758500000;
    }
    return num;
}

async function approveOrder(id) {
    let dbId = getDatabaseId(id);
    let order = orders.find(o => (o.id === id || o.orderId == dbId));
    if (!order) return;

    let orderId = order.orderId || order.id;
    let isApi = order.orderId !== undefined;

    if (isApi) {
        try {
            let res = await fetch(`http://localhost:8081/api/orders/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    totalAmount: Number(order.totalAmount || order.total || 0),
                    status: "Approved",
                    studentId: Number(order.studentId || 1)
                })
            });
            if (res.ok) {
                alert("Order Approved Successfully");
            } else {
                alert("Failed to approve order on backend.");
            }
        } catch (err) {
            console.error("API update error:", err);
            alert("Could not connect to backend server.");
        }
    } else {
        orders = orders.map(o => {
            if (o.id === id) o.status = "Approved";
            return o;
        });
        localStorage.setItem("orders", JSON.stringify(orders));
        alert("Order Approved Locally");
    }

    await loadStaffOrders();
}

async function deliverOrder(id) {
    let dbId = getDatabaseId(id);
    let order = orders.find(o => (o.id === id || o.orderId == dbId));
    if (!order) return;

    let orderId = order.orderId || order.id;
    let isApi = order.orderId !== undefined;

    if (isApi) {
        try {
            let res = await fetch(`http://localhost:8081/api/orders/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    totalAmount: Number(order.totalAmount || order.total || 0),
                    status: "Delivered",
                    studentId: Number(order.studentId || 1)
                })
            });
            if (res.ok) {
                alert("Order Delivered Successfully");
            } else {
                alert("Failed to deliver order on backend.");
            }
        } catch (err) {
            console.error("API update error:", err);
            alert("Could not connect to backend server.");
        }
    } else {
        orders = orders.map(o => {
            if (o.id === id) o.status = "Delivered";
            return o;
        });
        localStorage.setItem("orders", JSON.stringify(orders));
        alert("Order Delivered Locally");
    }

    await loadStaffOrders();
}

// ==============================
// SAVE + RELOAD
// ==============================
function saveAndReload(msg) {

    localStorage.setItem("orders", JSON.stringify(orders));

    alert(msg);

    loadStaffOrders();
}

// ==============================
// QR DEMO SCAN
// ==============================
async function scanQR() {

    let qrCodeText = prompt("Enter QR Code text or Scan Invoice Number (Demo Mode):");

    if (!qrCodeText) return;
    
    let scannedClean = qrCodeText.trim();
    let order = null;

    // 1. Try to find invoice in local storage first to extract the order ID
    let invoices = JSON.parse(localStorage.getItem("invoices")) || [];
    
    // Also try to fetch backend invoices if online to align
    try {
        let resInv = await fetch("http://localhost:8081/api/invoices");
        if (resInv.ok) {
            invoices = await resInv.json();
        }
    } catch(e) {}

    let matchedInvoice = invoices.find(inv => 
        (inv.invoiceNumber && inv.invoiceNumber.trim() === scannedClean) ||
        (inv.invoiceId && inv.invoiceId.toString().trim() === scannedClean)
    );

    if (matchedInvoice) {
        let targetOrderId = matchedInvoice.orderId;
        order = orders.find(o => 
            (o.id && o.id.toString() == targetOrderId.toString()) || 
            (o.orderId && o.orderId.toString() == targetOrderId.toString())
        );
    }

    // 2. Fallback: Search directly in orders list (e.g. if they scanned order ID directly)
    if (!order) {
        order = orders.find(o => 
            (o.id && o.id.toString().trim() === scannedClean) || 
            (o.orderId && o.orderId.toString().trim() === scannedClean)
        );
    }

    if (!order) {
        alert("Invalid QR / Order Not Found");
        return;
    }

    let id = order.id || order.orderId;
    alert(
        "Order Found!\n\n" +
        "ID: " + id + "\n" +
        "Parent: " + (order.parent || order.studentName || "-") + "\n" +
        "Total: ₹" + (order.total !== undefined ? order.total : (order.totalAmount !== undefined ? order.totalAmount : 0)) + "\n" +
        "Status: " + (order.status || order.paymentStatus || "Pending")
    );
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
    toast.className = "toast show align-items-center text-white bg-success border-0 mb-2 shadow-lg";
    toast.role = "alert";
    toast.style.display = "block";
    toast.style.minWidth = "320px";
    toast.style.borderRadius = "12px";
    toast.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
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
        
        // Reload orders table
        orders = JSON.parse(localStorage.getItem("orders")) || [];
        loadStaffOrders();
    }
});

// ==============================
// INIT
// ==============================
loadStaffOrders();

// ==============================
// WEBSOCKET REAL TIME
// ==============================
if (typeof SockJS !== 'undefined' && typeof Stomp !== 'undefined') {
    try {
        let socket = new SockJS("http://localhost:8081/ws");
        let stompClient = Stomp.over(socket);

        stompClient.connect({}, function () {
            console.log("Connected to WebSocket (Staff)");
            stompClient.subscribe("/topic/orders", function (msg) {
                let data = JSON.parse(msg.body);
                
                // Reload from localstorage
                orders = JSON.parse(localStorage.getItem("orders")) || [];
                loadStaffOrders();
                
                showPopupNotification(`New Order <strong>${data.id || data.orderId}</strong> received via WebSocket!`);
            });
        });
    } catch (err) {
        console.warn("WebSocket connection failed, relying on local storage synchronization", err);
    }
} else {
    console.log("SockJS/Stomp not loaded. Relying on localStorage synchronization.");
}