let orders = [];

// LOAD ORDERS (API & LOCAL MERGED)
async function loadOrders() {
    let table = document.getElementById("ordersTable");
    if (!table) return;

    let dbOrders = [];
    try {
        let res = await fetch("http://localhost:8081/api/orders");
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
        table.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No orders found</td></tr>`;
        return;
    }

    orders.forEach((order, index) => {
        let id = (order.orderId ? "ORD171975850000" + order.orderId : order.id) || "-";
        let parentName = order.parent || order.studentName || "-";
        let booksList = getBooksForOrder(order);
        let total = order.total !== undefined ? order.total : (order.totalAmount !== undefined ? order.totalAmount : 0);
        let status = order.status || order.paymentStatus || "Pending";

        table.innerHTML += `
            <tr>
                <td><strong>${id}</strong></td>
                <td>${parentName}</td>
                <td>${booksList}</td>
                <td>₹${total}</td>
                <td>
                    <span class="badge bg-${getStatusColor(status)}">
                        ${status}
                    </span>
                </td>
                <td class="text-end">
                    <button class="btn btn-outline-primary btn-sm me-1" onclick="viewReceipt('${id}')">
                        <i class="bi bi-file-earmark-text"></i> Receipt
                    </button>
                    <button class="btn btn-success btn-sm me-1" onclick="updateStatus(${index}, 'Approved')">Approve</button>
                    <button class="btn btn-primary btn-sm me-1" onclick="updateStatus(${index}, 'Delivered')">Deliver</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteOrder(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

// STATUS COLOR
function getStatusColor(status) {
    if (status === "Pending") return "warning";
    if (status === "Approved") return "info";
    if (status === "Delivered") return "success";
    return "secondary";
}

// UPDATE STATUS
async function updateStatus(index, status) {
    let order = orders[index];
    if (!order) return;

    let id = order.id || order.orderId;
    let isApi = order.orderId !== undefined;

    if (isApi) {
        try {
            let res = await fetch(`http://localhost:8081/api/orders/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    totalAmount: Number(order.totalAmount || order.total || 0),
                    status: status,
                    studentId: Number(order.studentId || 1)
                })
            });
            if (res.ok) {
                alert(`Order status updated to ${status}`);
            } else {
                alert("Failed to update status on server.");
            }
        } catch (err) {
            console.error("API update error:", err);
            alert("Could not connect to backend server.");
        }
    } else {
        orders[index].status = status;
        localStorage.setItem("orders", JSON.stringify(orders));
        alert(`Order status updated to ${status} locally`);
    }
    
    await loadOrders();
}

// DELETE ORDER
async function deleteOrder(index) {
    let order = orders[index];
    if (!order) return;

    if (confirm("Delete this order?")) {
        let id = order.id || order.orderId;
        let isApi = order.orderId !== undefined;

        if (isApi) {
            try {
                let res = await fetch(`http://localhost:8081/api/orders/${id}`, {
                    method: "DELETE"
                });
                if (res.ok) {
                    alert("Order deleted successfully");
                } else {
                    alert("Failed to delete order from server.");
                }
            } catch (err) {
                console.error("API delete error:", err);
                alert("Could not connect to backend server.");
            }
        } else {
            orders.splice(index, 1);
            localStorage.setItem("orders", JSON.stringify(orders));
            alert("Order deleted successfully locally");
        }
        
        await loadOrders();
    }
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

// GET BOOKS FOR ORDER (DYNAMIC LOOKUP)
function getBooksForOrder(order) {
    if (order.books) {
        if (Array.isArray(order.books)) {
            return order.books.map(b => b.name || b).join(", ");
        }
        return order.books;
    }

    let id = order.id || order.orderId;
    let invoices = JSON.parse(localStorage.getItem("invoices")) || [];
    let matched = invoices.find(inv => cleanId(inv.orderId) === cleanId(id) || cleanId(inv.invoiceId) === cleanId(id));
    if (matched && matched.books) {
        if (Array.isArray(matched.books)) {
            return matched.books.map(b => b.name || b).join(", ");
        }
        return matched.books;
    }

    return "Curriculum Package";
}

// INIT
loadOrders();

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
        let res = await fetch("http://localhost:8081/api/students");
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