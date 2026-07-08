// =============================================
// PAYMENT JS - No Backend, localStorage Only
// =============================================

const online = document.getElementById("online");
const cod = document.getElementById("cod");
const onlineSection = document.getElementById("onlineSection");
const codSection = document.getElementById("codSection");

// Toggle payment sections
online.addEventListener("change", () => {
    onlineSection.style.display = "block";
    codSection.style.display = "none";
});

cod.addEventListener("change", () => {
    onlineSection.style.display = "none";
    codSection.style.display = "block";
});

// =============================================
// PLACE ORDER + INVOICE + UPDATE ADMIN
// =============================================

async function placeOrderAndInvoice(paymentMethod, paymentStatus) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    // Get registered parent info
    let parentName = localStorage.getItem("parentName") || "Parent User";
    let studentName = localStorage.getItem("studentName") || "-";
    let studentClass = localStorage.getItem("studentClass") || "-";

    let total = cart.reduce((sum, b) => sum + Number(b.price || 0) * (b.qty || 1), 0);
    
    // Generate sequential IDs
    let ordersList = JSON.parse(localStorage.getItem("orders")) || [];
    let dbOrders = [];
    try {
        let res = await fetch("https://book-distributor.onrender.com/api/orders");
        if (res.ok) {
            dbOrders = await res.json();
        }
    } catch (e) {
        console.warn("Could not fetch database orders for ID calculation");
    }
    let allOrders = [...ordersList, ...dbOrders];

    let baseId = 1719758500000;
    let nextSeq = 1;
    if (allOrders.length > 0) {
        let maxSeq = 0;
        allOrders.forEach(o => {
            let idStr = (o.id || o.orderId || "").toString().replace("ORD", "");
            let num = Number(idStr);
            if (!isNaN(num) && num > baseId) {
                let seq = num - baseId;
                if (seq < 1000000 && seq > maxSeq) maxSeq = seq;
            }
        });
        nextSeq = maxSeq + 1;
    }
    let orderId = "ORD171975850000" + nextSeq;

    let invoicesList = JSON.parse(localStorage.getItem("invoices")) || [];
    let dbInvoices = [];
    try {
        let res = await fetch("https://book-distributor.onrender.com/api/invoices");
        if (res.ok) {
            dbInvoices = await res.json();
        }
    } catch (e) {
        console.warn("Could not fetch database invoices for ID calculation");
    }
    let allInvoices = [...invoicesList, ...dbInvoices];

    let nextInvSeq = 1;
    if (allInvoices.length > 0) {
        let maxInvSeq = 0;
        allInvoices.forEach(i => {
            let idStr = (i.invoiceId || i.invoiceNumber || "").toString().replace("INV", "");
            let num = Number(idStr);
            if (!isNaN(num) && num > baseId) {
                let seq = num - baseId;
                if (seq < 1000000 && seq > maxInvSeq) maxInvSeq = seq;
            }
        });
        nextInvSeq = maxInvSeq + 1;
    }
    let invoiceId = "INV171975850000" + nextInvSeq;


    // Register student dynamically in localStorage if not already present
    let students = JSON.parse(localStorage.getItem("students")) || [];
    let rollNumber = localStorage.getItem("rollNumber") || ("R" + Date.now());
    let schoolName = localStorage.getItem("schoolName") || "Greenwood High";
    let phoneNumber = localStorage.getItem("phoneNumber") || "-";

    let exists = students.find(s => s.studentName && s.studentName.toLowerCase().trim() === studentName.toLowerCase().trim());
    if (!exists && studentName !== "-") {
        let newStudent = {
            studentName: studentName,
            rollNumber: rollNumber,
            studentClass: studentClass,
            schoolName: schoolName,
            parentName: parentName,
            phoneNumber: phoneNumber
        };
        students.push(newStudent);
        localStorage.setItem("students", JSON.stringify(students));
    }

    // 1. Synchronize student with the Spring Boot backend database to get correct studentId
    let studentIdVal = 1; // Default fallback
    if (studentName !== "-") {
        try {
            // Check if student already exists in the backend database
            let resList = await fetch("https://book-distributor.onrender.com/api/students");
            if (resList.ok) {
                let dbStudents = await resList.json();
                let matched = dbStudents.find(s => s.studentName && s.studentName.toLowerCase().trim() === studentName.toLowerCase().trim());
                if (matched) {
                    studentIdVal = matched.studentId;
                    localStorage.setItem("studentId", studentIdVal);
                } else {
                    // Create student in the database dynamically
                    let resCreate = await fetch("https://book-distributor.onrender.com/api/students", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            studentName: studentName,
                            className: studentClass,
                            section: "A",
                            parentMobile: phoneNumber
                        })
                    });
                    if (resCreate.ok) {
                        let saved = await resCreate.json();
                        if (saved && saved.studentId) {
                            studentIdVal = saved.studentId;
                            localStorage.setItem("studentId", studentIdVal);
                        }
                    }
                }
            }
        } catch (err) {
            console.warn("Spring Boot backend offline during student verification, using local fallback", err);
            studentIdVal = Number(localStorage.getItem("studentId") || 1);
        }
    }

    // 2. Create Order
    let resolvedSection = (exists ? exists.section : null) || "A";
    let newOrder = {
        id: orderId,
        parent: parentName,
        student: studentName,
        studentClass: studentClass,
        books: cart.map(b => `${b.name || "-"} (x${b.qty || 1})`).join(", "),
        bookCount: cart.reduce((sum, b) => sum + (b.qty || 1), 0),
        total: total,
        status: "Pending",
        date: new Date().toLocaleDateString(),
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        parentMobile: phoneNumber,
        section: resolvedSection
    };

    // 3. Push to orders in localStorage (Admin reads this)
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    // 4. Create Invoice
    let invoice = {
        invoiceId: invoiceId,
        orderId: orderId,
        parentName: parentName,
        studentName: studentName,
        studentClass: studentClass,
        books: cart,
        totalAmount: total,
        invoiceDate: new Date().toLocaleDateString(),
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        parentMobile: phoneNumber,
        section: resolvedSection
    };

    // 5. Save invoice to localStorage
    let invoices = JSON.parse(localStorage.getItem("invoices")) || [];
    invoices.push(invoice);
    localStorage.setItem("invoices", JSON.stringify(invoices));

    // Also save the latest invoice separately for quick access
    localStorage.setItem("latestInvoice", JSON.stringify(invoice));

    // 6. Clear Cart & Deduct Stock
    localStorage.setItem("cart", JSON.stringify([]));

    let booksList = JSON.parse(localStorage.getItem("books")) || [];
    let cleanClass = (val) => {
        if (!val) return "";
        let matches = val.toString().match(/\d+/);
        return matches ? matches[0] : val.toString().trim().toLowerCase();
    };
    cart.forEach(cartItem => {
        let book = booksList.find(b => 
            b.name.toLowerCase() === cartItem.name.toLowerCase() && 
            cleanClass(b.class) === cleanClass(studentClass)
        );
        if (book && book.qty > 0) {
            book.qty -= (cartItem.qty || 1);
            if (book.qty < 0) book.qty = 0;
        }
    });
    localStorage.setItem("books", JSON.stringify(booksList));

    // 7. Send order to backend database if online using the verified studentIdVal
    try {
        let resOrder = await fetch("https://book-distributor.onrender.com/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                totalAmount: Number(total),
                status: paymentStatus || "Pending",
                studentId: studentIdVal
            })
        });
        if (resOrder.ok) {
            let savedOrder = await resOrder.json();
            console.log("Order saved to backend database:", savedOrder);

            // POST invoice as well if order creation succeeded
            if (savedOrder && savedOrder.orderId) {
                // Update local storage order and invoice with database orderId for tracking
                try {
                    let localOrders = JSON.parse(localStorage.getItem("orders")) || [];
                    let localOrd = localOrders.find(o => o.id === orderId);
                    if (localOrd) {
                        localOrd.orderId = savedOrder.orderId;
                        localStorage.setItem("orders", JSON.stringify(localOrders));
                    }

                    let localInvoices = JSON.parse(localStorage.getItem("invoices")) || [];
                    let localInv = localInvoices.find(i => i.invoiceId === invoiceId || i.orderId === orderId);
                    if (localInv) {
                        localInv.orderId = savedOrder.orderId;
                        localStorage.setItem("invoices", JSON.stringify(localInvoices));
                    }
                } catch (syncErr) {
                    console.error("Failed to sync local IDs with DB ID", syncErr);
                }

                try {
                    let resInvoice = await fetch("https://book-distributor.onrender.com/api/invoices", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            invoiceNumber: invoiceId,
                            orderId: savedOrder.orderId
                        })
                    });
                    if (resInvoice.ok) {
                        let savedInv = await resInvoice.json();
                        console.log("Invoice saved to backend database:", savedInv);
                    }
                } catch(invErr) {
                    console.warn("Spring Boot backend offline during invoice submission", invErr);
                }
            }
        }
    } catch (err) {
        console.warn("Spring Boot backend offline, order saved locally only", err);
    }

    // Notify other tabs (Admin and Staff)
    localStorage.setItem("newOrderNotification", JSON.stringify({
        id: orderId,
        parent: parentName,
        student: studentName,
        total: total,
        time: new Date().toLocaleTimeString()
    }));
    localStorage.removeItem("newOrderNotification");

    // 8. Redirect to Invoice page
    alert("Order Placed Successfully! Redirecting to Invoice...");
    window.location.href = "invoice.html";
}

// ONLINE PAYMENT - "I've Paid" button
document.getElementById("paidBtn").addEventListener("click", () => {
    placeOrderAndInvoice("Online", "Paid");
});

// COD - "Place Order" button
document.getElementById("codBtn").addEventListener("click", () => {
    placeOrderAndInvoice("Cash on Delivery", "Pending");
});
