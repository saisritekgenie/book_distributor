const API_URL = "https://book-distributor.onrender.com/api/orders";

function loadOrders() {
    let container = document.getElementById("ordersContainer");
    if (!container) return;

    let currentParent = localStorage.getItem("parentName") || "";
    // Load from localStorage as initial / offline data
    let allLocalOrders = JSON.parse(localStorage.getItem("orders")) || [];
    
    // Filter local orders to show only this parent's orders
    let localOrders = allLocalOrders.filter(o => {
        let pName = o.parent || o.parentName || "";
        return currentParent && pName.toLowerCase().trim() === currentParent.toLowerCase().trim();
    });

    fetch(API_URL)
        .then(res => {
            if (!res.ok) throw new Error("API failed");
            return res.json();
        })
        .then(apiData => {
            console.log("Fetched orders from API:", apiData);
            
            // Filter API orders for this specific parent
            let filteredApi = apiData.filter(o => {
                let pName = o.parentName || o.parent || o.studentName || "";
                return currentParent && pName.toLowerCase().trim() === currentParent.toLowerCase().trim();
            });

            // Map API data structure to match our standard format
            let mappedApi = filteredApi.map(o => {
                let displayId = o.id || (o.orderId ? "ORD171975850000" + o.orderId : "-");
                return {
                    id: displayId,
                    student: o.studentName || "Student",
                    date: o.orderDate || new Date().toLocaleDateString(),
                    total: o.totalAmount,
                    status: o.status || "Pending",
                    paymentMethod: o.paymentMethod || "Online"
                };
            });

            // Combine both local storage and api (removing duplicates by id)
            let combined = [...mappedApi];
            localOrders.forEach(loc => {
                if (!combined.some(c => c.id === loc.id)) {
                    combined.push(loc);
                }
            });

            renderOrdersList(combined);
        })
        .catch(error => {
            console.warn("Spring Boot backend offline or failed, displaying filtered local orders only:", error);
            renderOrdersList(localOrders);
        });
}

function renderOrdersList(ordersList) {
    let container = document.getElementById("ordersContainer");
    if (!container) return;

    if (!ordersList || ordersList.length === 0) {
        // Display beautiful empty state with sad emoji
        container.innerHTML = `
            <div class="card p-5 text-center shadow-sm border-0 bg-white rounded-3 mt-3">
                <div class="mb-4" style="font-size: 5rem; animation: pulse 2s infinite alternate ease-in-out;">
                    😢
                </div>
                <h4 class="fw-bold mb-2">Oops! No Orders</h4>
                <p class="text-muted mx-auto mb-4" style="max-width: 480px;">
                    It looks like you haven't placed any textbook orders yet. Choose your child's class grade, add textbooks to the cart, and secure your package bundle.
                </p>
                <div>
                    <a href="parent.html" class="btn btn-primary px-4 py-2 fw-semibold">
                        <i class="bi bi-journal-plus me-1"></i> Order Textbooks Now
                    </a>
                </div>
            </div>
            
            <style>
                @keyframes pulse {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.08); }
                }
            </style>
        `;
        return;
    }

    // Render tables inside card
    let rowsHtml = ordersList.map(order => {
        let statusColor = "warning text-dark";
        if (order.status === "Approved") statusColor = "info text-white";
        if (order.status === "Delivered") statusColor = "success";
        if (order.status === "Paid") statusColor = "success";

        return `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>${order.student}</td>
                <td>${order.date}</td>
                <td class="fw-semibold">₹${order.total}</td>
                <td>
                    <span class="badge bg-light text-dark border">${order.paymentMethod || 'Online'}</span>
                </td>
                <td>
                    <span class="badge bg-${statusColor}">
                        ${order.status}
                    </span>
                </td>
                <td>
                    <a href="invoice.html?orderId=${order.id}" class="btn btn-outline-primary btn-sm py-1 px-3 rounded-pill fw-semibold">
                        <i class="bi bi-file-earmark-text"></i> Invoice
                    </a>
                </td>
            </tr>
        `;
    }).join("");

    container.innerHTML = `
        <div class="card p-3 shadow-sm border-0 bg-white rounded-3">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Order ID</th>
                            <th>Student Name</th>
                            <th>Date Ordered</th>
                            <th>Amount Paid</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Load cart badge quantity
function updateHeaderBadge() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let badge = document.getElementById("headerCartBadge");
    if (badge) {
        let totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
        badge.innerText = totalQty;
    }
}

// INIT
window.onload = function() {
    loadOrders();
    updateHeaderBadge();
};
