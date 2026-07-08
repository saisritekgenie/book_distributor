// =====================================
// Dynamic Book & Package Initialization
// =====================================

if (!localStorage.getItem("books_initialized")) {
    const defaultBooks = [
        // Class 5
        { class: "5", name: "English", price: 240, qty: 50, image: "../images/textbooks/fiveenglish.jpg" },
        { class: "5", name: "Mathematics", price: 260, qty: 50, image: "../images/textbooks/fivemaths.jpg" },
        { class: "5", name: "Science", price: 280, qty: 50, image: "../images/textbooks/fivescience.jpg" },
        { class: "5", name: "Social", price: 240, qty: 50, image: "../images/textbooks/fivesocial.jpg" },
        { class: "5", name: "Telugu", price: 200, qty: 50, image: "../images/textbooks/5telugu.jpg" },
        { class: "5", name: "Hindi", price: 220, qty: 50, image: "../images/textbooks/fivehindi.jpg" },
        // Class 6
        { class: "6", name: "English", price: 250, qty: 50, image: "../images/textbooks/sixenglish.jpg" },
        { class: "6", name: "Mathematics", price: 300, qty: 50, image: "../images/textbooks/sixmath.jpg" },
        { class: "6", name: "Science", price: 320, qty: 50, image: "../images/textbooks/sixscience.jpg" },
        { class: "6", name: "Social", price: 280, qty: 50, image: "../images/textbooks/sixsocial.jpg" },
        { class: "6", name: "Telugu", price: 220, qty: 50, image: "../images/textbooks/sixtelugu.jpg" },
        { class: "6", name: "Hindi", price: 280, qty: 50, image: "../images/textbooks/sixhindi.jpg" },
        // Class 7
        { class: "7", name: "English", price: 260, qty: 50, image: "../images/textbooks/sevenenglish.jpg" },
        { class: "7", name: "Mathematics", price: 310, qty: 50, image: "../images/textbooks/sevenmaths.jpg" },
        { class: "7", name: "Science", price: 330, qty: 50, image: "../images/textbooks/sevenscience.jpg" },
        { class: "7", name: "Social", price: 290, qty: 50, image: "../images/textbooks/sevensocial.jpg" },
        { class: "7", name: "Telugu", price: 230, qty: 50, image: "../images/textbooks/seventelugu.jpg" },
        { class: "7", name: "Hindi", price: 290, qty: 50, image: "../images/textbooks/sevenhindi.jpg" },
        // Class 8
        { class: "8", name: "English", price: 270, qty: 50, image: "../images/textbooks/eightenglish.jpg" },
        { class: "8", name: "Mathematics", price: 320, qty: 50, image: "../images/textbooks/eightmaths.jpg" },
        { class: "8", name: "Science", price: 340, qty: 50, image: "../images/textbooks/eightscience.jpg" },
        { class: "8", name: "Social", price: 300, qty: 50, image: "../images/textbooks/eightsocial.jpg" },
        { class: "8", name: "Telugu", price: 240, qty: 50, image: "../images/textbooks/eighttelugu.jpg" },
        { class: "8", name: "Hindi", price: 300, qty: 50, image: "../images/textbooks/eighthindi.jpg" },
        // Class 9
        { class: "9", name: "English", price: 300, qty: 50, image: "../images/textbooks/nineenglish.jpg" },
        { class: "9", name: "Mathematics", price: 350, qty: 50, image: "../images/textbooks/ninemaths.jpg" },
        { class: "9", name: "Science", price: 380, qty: 50, image: "../images/textbooks/ninescience.jpg" },
        { class: "9", name: "Social", price: 320, qty: 50, image: "../images/textbooks/ninesocial.jpg" },
        { class: "9", name: "Telugu", price: 260, qty: 50, image: "../images/textbooks/ninetelugu.jpg" },
        { class: "9", name: "Hindi", price: 320, qty: 50, image: "../images/textbooks/ninehindi.jpg" },
        // Class 10
        { class: "10", name: "English", price: 320, qty: 50, image: "../images/textbooks/tenenglish.jpg" },
        { class: "10", name: "Mathematics", price: 380, qty: 50, image: "../images/textbooks/tenmaths.jpg" },
        { class: "10", name: "Science", price: 400, qty: 50, image: "../images/textbooks/tenscience.jpg" },
        { class: "10", name: "Social", price: 350, qty: 50, image: "../images/textbooks/tensocial.jpg" },
        { class: "10", name: "Telugu", price: 280, qty: 50, image: "../images/textbooks/tentelugu.jpg" },
        { class: "10", name: "Hindi", price: 340, qty: 50, image: "../images/textbooks/tenhindi.jpg" }
    ];
    const defaultPackagePrices = {
        5: 1440,
        6: 1650,
        7: 1710,
        8: 1770,
        9: 1930,
        10: 2070
    };
    localStorage.setItem("books", JSON.stringify(defaultBooks));
    localStorage.setItem("packagePrices", JSON.stringify(defaultPackagePrices));
    localStorage.setItem("books_initialized", "true");
}

// =====================================
// Shopping Cart
// =====================================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// =====================================
// Load Books Data & Package Prices
// =====================================

const classSelect = document.getElementById("classSelect");
if (classSelect) {
    let savedClass = localStorage.getItem("studentClass");
    if (savedClass) {
        classSelect.value = savedClass;
    }
}
const bookContainer = document.getElementById("bookContainer");
const packageTitle = document.getElementById("packageTitle");
const packagePrice = document.getElementById("packagePrice");

function loadBooks() {

    let selectedClass = classSelect.value;

    // Read dynamically managed books from localStorage
    let allBooks = JSON.parse(localStorage.getItem("books")) || [];
    let classBooks = allBooks.filter(b => b.class == selectedClass);
    let packagePrices = JSON.parse(localStorage.getItem("packagePrices")) || {
        5: 1440, 6: 1650, 7: 1710, 8: 1770, 9: 1930, 10: 2070
    };

    bookContainer.innerHTML = "";
    packageTitle.innerHTML = "📦 Complete Class " + selectedClass + " Package";
    packagePrice.innerHTML = "₹" + packagePrices[selectedClass];

    classBooks.forEach(book => {
        let isOutOfStock = Number(book.qty) <= 0;
        let isWishlisted = wishlist.includes(book.name);
        let heartIcon = isWishlisted ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary';
        let heartOverlay = `
        <div class="wishlist-heart-btn" onclick="toggleWishlist('${book.name}')" title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
            <i class="bi ${heartIcon}"></i>
        </div>
        `;

        let cartItem = cart.find(c => c.name === book.name);
        let buttonHtml = "";
        if (isOutOfStock) {
            buttonHtml = `<button class="btn btn-secondary w-100 py-2 rounded-3 fw-semibold" disabled><i class="bi bi-x-circle me-1"></i> Out of Stock</button>`;
        } else if (cartItem) {
            buttonHtml = `
            <div class="d-flex align-items-center justify-content-between border rounded-3 p-1">
                <button class="btn btn-outline-secondary btn-sm border-0 py-1 px-3 fw-bold" onclick="updateCardQty('${book.name}', -1)">-</button>
                <span class="fw-bold px-3">${cartItem.qty}</span>
                <button class="btn btn-outline-secondary btn-sm border-0 py-1 px-3 fw-bold" onclick="updateCardQty('${book.name}', 1)">+</button>
            </div>
            `;
        } else {
            buttonHtml = `<button class="btn btn-success w-100 py-2 rounded-3 fw-semibold" onclick="addBook('${book.name}',${book.price},'${book.image || ''}')"><i class="bi bi-cart-plus me-1"></i> Add to Cart</button>`;
        }

        let imageOverlay = isOutOfStock
            ? `<div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 text-white fw-bold" style="font-size: 1.2rem; pointer-events: none; border-radius: 18px 18px 0 0; z-index: 10;">⚠️ OUT OF STOCK</div>`
            : ``;

        bookContainer.innerHTML += `
        <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm border-0 product-card transition-hover position-relative">
                ${heartOverlay}
                ${imageOverlay}
                <img src="${book.image || '../images/textbooks/default.jpg'}"
                     class="card-img-top"
                     height="220"
                     style="object-fit:cover;"
                     onerror="this.src='https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'">
                <div class="card-body d-flex flex-column justify-content-between">
                     <div>
                         <h5 class="fw-bold mb-1">${book.name}</h5>
                         <p class="text-muted small mb-2">Class ${selectedClass} ${book.name} Textbook</p>
                         <h5 class="text-primary fw-bold mb-3">₹${book.price}</h5>
                     </div>
                     ${buttonHtml}
                </div>
            </div>
        </div>
        `;
    });
}

classSelect.addEventListener("change", loadBooks);

// =====================================
// Add Book
// =====================================

function addBook(name, price, image) {
    const exists = cart.find(book => book.name === name);

    if (exists) {
        exists.qty = (exists.qty || 1) + 1;
    } else {
        cart.push({
            name: name,
            price: price,
            image: image || "../images/textbooks/default.jpg",
            qty: 1
        });
    }

    saveCart();
    alert(name + " added to cart successfully!");
}

// =====================================
// Buy Complete Package
// =====================================

document.getElementById("buyPackage").addEventListener("click", () => {
    const selectedClass = classSelect.value;
    let allBooks = JSON.parse(localStorage.getItem("books")) || [];
    let classBooks = allBooks.filter(b => b.class == selectedClass);

    cart = [];
    classBooks.forEach(book => {
        cart.push({
            name: book.name,
            price: book.price,
            image: book.image || "../images/textbooks/default.jpg",
            qty: 1
        });
    });

    saveCart();
    alert("Complete Package Added Successfully.");
});

// =====================================
// Save Cart
// =====================================

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
    loadBooks();
}

// =====================================
// Load Cart
// =====================================

function loadCart() {
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const headerCartBadge = document.getElementById("headerCartBadge");

    let totalQty = cart.reduce((sum, b) => sum + (b.qty || 1), 0);
    if (headerCartBadge) {
        headerCartBadge.textContent = totalQty;
    }

    if (!cartItems || !cartTotal) return;

    cartItems.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `
        <li class="list-group-item text-center text-muted py-3">
            Cart is Empty
        </li>`;
        cartTotal.innerHTML = "0";
        return;
    }

    cart.forEach((book, index) => {
        let qty = book.qty || 1;
        total += Number(book.price) * qty;

        cartItems.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center border-0 border-bottom px-2 py-3">
            <div class="d-flex align-items-center">
                <img src="${book.image || '../images/textbooks/default.jpg'}"
                     width="40"
                     height="50"
                     style="object-fit:cover;border-radius:5px;"
                     onerror="this.src='https://placehold.co/40x50'">
                <div class="ms-2">
                    <strong class="small d-block">${book.name}</strong>
                    <span class="text-muted small">₹${book.price} &times; ${qty}</span>
                </div>
            </div>
            <div class="d-flex align-items-center gap-1">
                <button class="btn btn-outline-secondary btn-xs px-1 py-0" onclick="changeCartQty(${index}, -1)">-</button>
                <span class="small fw-bold px-1">${qty}</span>
                <button class="btn btn-outline-secondary btn-xs px-1 py-0" onclick="changeCartQty(${index}, 1)">+</button>
                <button
                    class="btn btn-link text-danger p-0 ms-2"
                    onclick="removeBook(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </li>
        `;
    });

    cartTotal.innerHTML = total;
}

// =====================================
// Change Quantity
// =====================================

function changeCartQty(index, amount) {
    if (!cart[index].qty) cart[index].qty = 1;
    cart[index].qty += amount;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
}
window.changeCartQty = changeCartQty;

// =====================================
// Remove Book
// =====================================

function removeBook(index) {
    cart.splice(index, 1);
    saveCart();
}
window.removeBook = removeBook;

// =====================================
// Place Order
// =====================================

async function placeOrder() {
    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    // Fetch database orders to avoid sequence duplication
    let dbOrders = [];
    try {
        let res = await fetch("http://localhost:8081/api/orders");
        if (res.ok) {
            dbOrders = await res.json();
        }
    } catch (e) {
        console.warn("Could not fetch database orders for sequential ID sync");
    }

    let allOrders = [...orders, ...dbOrders];

    let total = cart.reduce((sum, b) => sum + Number(b.price) * (b.qty || 1), 0);

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

    let newOrder = {
        id: orderId,
        parent: localStorage.getItem("parentName") || "Parent User",
        books: cart,
        total: total,
        status: "Pending"
    };

    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Order Placed Successfully!");
    saveCart();
}
window.placeOrder = placeOrder;

// =====================================
// Wishlist Logic
// =====================================
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

function toggleWishlist(name) {
    let index = wishlist.indexOf(name);
    if (index > -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push(name);
    }
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    loadWishlist();
    loadBooks();
}
window.toggleWishlist = toggleWishlist;

function loadWishlist() {
    const listItems = document.getElementById("wishlistItems");
    const countBadge = document.getElementById("wishlistCount");

    if (countBadge) {
        countBadge.textContent = wishlist.length;
    }
    if (!listItems) return;

    listItems.innerHTML = "";
    if (wishlist.length === 0) {
        listItems.innerHTML = `<li class="list-group-item text-center text-muted py-3">No items in wishlist</li>`;
        return;
    }

    let allBooks = JSON.parse(localStorage.getItem("books")) || [];

    wishlist.forEach(name => {
        let book = allBooks.find(b => b.name === name);
        let priceText = book ? `₹${book.price}` : "";
        let imgHtml = book ? `<img src="${book.image || '../images/textbooks/default.jpg'}" width="28" height="36" style="object-fit:cover;border-radius:4px;" class="me-2">` : "";

        listItems.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center px-1 py-2 border-0 border-bottom">
            <div class="d-flex align-items-center">
                ${imgHtml}
                 <div>
                     <strong class="small d-block">${name}</strong>
                     <span class="text-muted small">${priceText}</span>
                 </div>
            </div>
            <div class="d-flex align-items-center gap-2">
                <button class="btn btn-outline-success btn-xs px-2 py-0 fw-semibold" onclick="addWishlistItemToCart('${name}')" title="Add to Cart">
                    <i class="bi bi-cart-plus"></i>
                </button>
                <button class="btn btn-link text-danger p-0" onclick="toggleWishlist('${name}')" title="Remove">
                    <i class="bi bi-x-circle"></i>
                </button>
            </div>
        </li>
        `;
    });
}
window.loadWishlist = loadWishlist;

function addWishlistItemToCart(name) {
    let allBooks = JSON.parse(localStorage.getItem("books")) || [];
    let book = allBooks.find(b => b.name === name);
    if (book) {
        addBook(book.name, book.price, book.image);
    }
}
window.addWishlistItemToCart = addWishlistItemToCart;

// =====================================
// Card Level Quantity Updates
// =====================================
function updateCardQty(name, delta) {
    let item = cart.find(c => c.name === name);
    if (!item) return;

    item.qty = (item.qty || 1) + delta;
    if (item.qty <= 0) {
        cart = cart.filter(c => c.name !== name);
    }
    saveCart();
}
window.updateCardQty = updateCardQty;

// =====================================
// Theme Switching (Black / White Mode)
// =====================================
function toggleTheme() {
    let currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    let newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    let btn = document.getElementById("themeToggleBtn");
    if (btn) {
        let icon = btn.querySelector("i");
        if (icon) {
            icon.className = newTheme === "dark" ? "bi bi-sun" : "bi bi-moon-stars";
        }
    }
}
window.toggleTheme = toggleTheme;

function applySavedTheme() {
    let theme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", theme);

    let btn = document.getElementById("themeToggleBtn");
    if (btn) {
        let icon = btn.querySelector("i");
        if (icon) {
            icon.className = theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars";
        }
    }
}
window.applySavedTheme = applySavedTheme;

// =====================================
// Initial Load
// =====================================

applySavedTheme();
loadBooks();
loadCart();
loadWishlist();