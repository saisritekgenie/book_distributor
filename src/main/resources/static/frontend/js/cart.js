let cart = JSON.parse(localStorage.getItem("cart")) || [];

function loadCart() {

    let table = document.getElementById("cartTable");
    table.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {

        table.innerHTML = `
        <tr>
            <td colspan="4" class="text-center">
                Your cart is empty
            </td>
        </tr>
        `;

        document.getElementById("bookCount").innerText = 0;
        document.getElementById("grandTotal").innerText = 0;
        return;
    }

    cart.forEach((book, index) => {

        total += Number(book.price);

        table.innerHTML += `
        <tr>

            <td>
                <img src="${book.image || '../images/book.png'}"
                     class="book-image">
            </td>

            <td>${book.name}</td>

            <td>₹${book.price}</td>

            <td>
                <button class="btn btn-danger btn-sm"
                        onclick="removeBook(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>

        </tr>
        `;
    });

    document.getElementById("bookCount").innerText = cart.length;
    document.getElementById("grandTotal").innerText = total;
}

function removeBook(index) {

    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();
}

loadCart();