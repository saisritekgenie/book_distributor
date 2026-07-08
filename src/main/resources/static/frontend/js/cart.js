let cart = JSON.parse(localStorage.getItem("cart")) || [];

function loadCart() {
    let table = document.getElementById("cartTable");
    if (!table) return;
    table.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        table.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4 text-muted">
                Your cart is empty
            </td>
        </tr>
        `;

        document.getElementById("bookCount").innerText = 0;
        document.getElementById("grandTotal").innerText = 0;
        return;
    }

    cart.forEach((book, index) => {
        let qty = book.qty || 1;
        let itemTotal = Number(book.price) * qty;
        total += itemTotal;

        table.innerHTML += `
        <tr>
            <td>
                <img src="${book.image || '../images/book.png'}"
                     class="book-image"
                     style="width:60px; height:80px; object-fit:cover; border-radius:8px;"
                     onerror="this.src='https://placehold.co/60x80'">
            </td>
            <td><strong>${book.name}</strong></td>
            <td>₹${book.price}</td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-outline-secondary btn-sm px-2 py-1" onclick="changeQty(${index}, -1)">-</button>
                    <span class="fw-bold px-1">${qty}</span>
                    <button class="btn btn-outline-secondary btn-sm px-2 py-1" onclick="changeQty(${index}, 1)">+</button>
                </div>
            </td>
            <td class="fw-semibold">₹${itemTotal}</td>
            <td>
                <button class="btn btn-link text-danger p-0"
                        onclick="removeBook(${index})">
                    <i class="bi bi-trash fs-5"></i>
                </button>
            </td>
        </tr>
        `;
    });

    document.getElementById("bookCount").innerText = cart.reduce((sum, b) => sum + (b.qty || 1), 0);
    document.getElementById("grandTotal").innerText = total;
}

function changeQty(index, amount) {
    if (!cart[index].qty) cart[index].qty = 1;
    cart[index].qty += amount;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
}
window.changeQty = changeQty;

function removeBook(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
}
window.removeBook = removeBook;

loadCart();