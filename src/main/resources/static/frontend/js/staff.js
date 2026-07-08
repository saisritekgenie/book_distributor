let orders = [];

// ==============================
// LOAD ORDERS
// ==============================
// ==============================
// LOAD STAFF ORDERS (API & LOCAL MERGED)
// ==============================
async function loadStaffOrders() {
    let table = document.getElementById("staffOrdersTable");
    if (!table) return;

    let dbOrders = [];
    try {
        let res = await fetch("https://book-distributor.onrender.com/api/orders");
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
        let id = (order.orderId ? "ORD" + (1719758500000 + order.orderId) : order.id) || "-";
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
                    <button class="btn btn-outline-info btn-sm me-1 text-white" onclick="viewReceipt('${id}')">
                        <i class="bi bi-file-earmark-text"></i> Receipt
                    </button>
                    ${status === "Pending" ? `
                        <button class="btn btn-primary btn-sm me-1" onclick="approveOrder('${id}')">
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
        let matched = invoices.find(inv => cleanId(inv.orderId) === cleanId(id) || cleanId(inv.invoiceId) === cleanId(id));
        if (matched && matched.books) {
            if (Array.isArray(matched.books)) {
                return matched.books.map(b => b.name || b).join(", ");
            }
            return matched.books;
        }
    }

    return "Curriculum Package";
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
            let res = await fetch(`https://book-distributor.onrender.com/api/orders/${orderId}`, {
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
    await loadStaffInvoices();
}

async function deliverOrder(id) {
    let dbId = getDatabaseId(id);
    let order = orders.find(o => (o.id === id || o.orderId == dbId));
    if (!order) return;

    let orderId = order.orderId || order.id;
    let isApi = order.orderId !== undefined;

    if (isApi) {
        try {
            let res = await fetch(`https://book-distributor.onrender.com/api/orders/${orderId}`, {
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
    await loadStaffInvoices();
}

// ==============================
// SAVE + RELOAD
// ==============================
function saveAndReload(msg) {

    localStorage.setItem("orders", JSON.stringify(orders));

    alert(msg);

    loadStaffOrders();
    loadStaffInvoices();
}

// ==============================
// LOAD STAFF INVOICES (API & LOCAL MERGED)
// ==============================
let invoices = [];
async function loadStaffInvoices() {
    let table = document.getElementById("staffInvoicesTable");
    if (!table) return;

    let dbInvoices = [];
    try {
        let res = await fetch("https://book-distributor.onrender.com/api/invoices");
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

    table.innerHTML = "";

    if (invoices.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-white-50 py-4">
                    No Invoices Found
                </td>
            </tr>
        `;
        return;
    }

    invoices.forEach(invoice => {
        let invIdStr = invoice.invoiceNumber || (invoice.invoiceId ? "INV171975850000" + invoice.invoiceId : "-");
        let ordIdStr = invoice.orderId ? "ORD171975850000" + invoice.orderId : "-";
        let amount = invoice.totalAmount !== undefined ? invoice.totalAmount : 0;
        let date = invoice.generatedDate || invoice.invoiceDate || "-";
        if (date !== "-" && !isNaN(Date.parse(date))) {
            date = new Date(date).toLocaleString();
        }
        let status = invoice.paymentStatus || "Paid";

        table.innerHTML += `
            <tr>
                <td><strong>${invIdStr}</strong></td>
                <td>${ordIdStr}</td>
                <td>₹${amount}</td>
                <td>${date}</td>
                <td><span class="badge bg-success">${status}</span></td>
                <td class="text-end">
                    <button class="btn btn-outline-info btn-sm text-white" onclick="viewReceipt('${ordIdStr}')">
                        <i class="bi bi-file-earmark-text"></i> Receipt
                    </button>
                </td>
            </tr>
        `;
    });
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
        let resInv = await fetch("https://book-distributor.onrender.com/api/invoices");
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
        let dbIdClean = getDatabaseId(scannedClean);
        order = orders.find(o => 
            (o.id && o.id.toString().trim() === scannedClean) || 
            (o.orderId && o.orderId.toString().trim() === scannedClean) ||
            (o.orderId && dbIdClean && o.orderId.toString().trim() === dbIdClean.toString().trim())
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
        // Reload tables
        loadStaffOrders();
        loadStaffInvoices();
    }
});

// ==============================
// INIT
// ==============================
loadStaffOrders();
loadStaffInvoices();

// ==============================
// WEBSOCKET REAL TIME
// ==============================
if (typeof SockJS !== 'undefined' && typeof Stomp !== 'undefined') {
    try {
        let socket = new SockJS("https://book-distributor.onrender.com/ws");
        let stompClient = Stomp.over(socket);

        stompClient.connect({}, function () {
            console.log("Connected to WebSocket (Staff)");
            stompClient.subscribe("/topic/orders", function (msg) {
                let data = JSON.parse(msg.body);
                
                // Reload tables
                loadStaffOrders();
                loadStaffInvoices();
                
                showPopupNotification(`New Order <strong>${data.id || data.orderId}</strong> received via WebSocket!`);
            });
        });
    } catch (err) {
        console.warn("WebSocket connection failed, relying on local storage synchronization", err);
    }
} else {
    console.log("SockJS/Stomp not loaded. Relying on localStorage synchronization.");
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
            // Estimate books count based on average price (approx 275)
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
