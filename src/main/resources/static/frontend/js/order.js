let orders = [];

// LOAD ORDERS
async function loadOrders() {
    let table = document.getElementById("ordersTable");
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
        table.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No orders found</td></tr>`;
        return;
    }

    orders.forEach((order, index) => {
        let id = order.id || (order.orderId ? "ORD" + (1719758500000 + order.orderId) : "-");
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
    let matched = invoices.find(inv => inv.orderId == id || inv.invoiceId == id);
    if (matched && matched.books) {
        if (Array.isArray(matched.books)) {
            return matched.books.map(b => b.name || b).join(", ");
        }
        return matched.books;
    }

    return "Class 6 Package";
}

// INIT
loadOrders();