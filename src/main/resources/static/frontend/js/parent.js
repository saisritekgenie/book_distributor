// =====================================
// Shopping Cart
// =====================================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// =====================================
// Books Data
// =====================================

const books = {

5: [
{name:"English",price:240,image:"../images/textbooks/fiveenglish.jpg"},
{name:"Mathematics",price:260,image:"../images/textbooks/fivemaths.jpg"},
{name:"Science",price:280,image:"../images/textbooks/fivescience.jpg"},
{name:"Social",price:240,image:"../images/textbooks/fivesocial.jpg"},
{name:"Telugu",price:200,image:"../images/textbooks/fivetelugu.jpg"},
{name:"Hindi",price:220,image:"../images/textbooks/fivehindi.jpg"}
],

6: [
{name:"English",price:250,image:"../images/textbooks/sixenglish.jpg"},
{name:"Mathematics",price:300,image:"../images/textbooks/sixmath.jpg"},
{name:"Science",price:320,image:"../images/textbooks/sixscience.jpg"},
{name:"Social",price:280,image:"../images/textbooks/sixsocial.jpg"},
{name:"Telugu",price:220,image:"../images/textbooks/sixtelugu.jpg"},
{name:"Hindi",price:280,image:"../images/textbooks/sixhindi.jpg"}
],

7: [
{name:"English",price:260,image:"../images/textbooks/sevenenglish.jpg"},
{name:"Mathematics",price:310,image:"../images/textbooks/sevenmaths.jpg"},
{name:"Science",price:330,image:"../images/textbooks/sevenscience.jpg"},
{name:"Social",price:290,image:"../images/textbooks/sevensocial.jpg"},
{name:"Telugu",price:230,image:"../images/textbooks/seventelugu.jpg"},
{name:"Hindi",price:290,image:"../images/textbooks/sevenhindi.jpg"}
],

8: [
{name:"English",price:270,image:"../images/textbooks/eightenglish.jpg"},
{name:"Mathematics",price:320,image:"../images/textbooks/eightmaths.jpg"},
{name:"Science",price:340,image:"../images/textbooks/eightscience.jpg"},
{name:"Social",price:300,image:"../images/textbooks/eightsocial.jpg"},
{name:"Telugu",price:240,image:"../images/textbooks/eighttelugu.jpg"},
{name:"Hindi",price:300,image:"../images/textbooks/eighthindi.jpg"}
],

9: [
{name:"English",price:300,image:"../images/textbooks/nineenglish.jpg"},
{name:"Mathematics",price:350,image:"../images/textbooks/ninemaths.jpg"},
{name:"Science",price:380,image:"../images/textbooks/ninescience.jpg"},
{name:"Social",price:320,image:"../images/textbooks/ninesocial.jpg"},
{name:"Telugu",price:260,image:"../images/textbooks/ninetelugu.jpg"},
{name:"Hindi",price:320,image:"../images/textbooks/ninehindi.jpg"}
],

10: [
{name:"English",price:320,image:"../images/textbooks/tenenglish.jpg"},
{name:"Mathematics",price:380,image:"../images/textbooks/tenmaths.jpg"},
{name:"Science",price:400,image:"../images/textbooks/tenscience.jpg"},
{name:"Social",price:350,image:"../images/textbooks/tensocial.jpg"},
{name:"Telugu",price:280,image:"../images/textbooks/tentelugu.jpg"},
{name:"Hindi",price:340,image:"../images/textbooks/tenhindi.jpg"}
]

};

// =====================================
// Package Prices
// =====================================

const packagePrices = {

5:1440,
6:1650,
7:1710,
8:1770,
9:1930,
10:2070

};

// =====================================
// Elements
// =====================================

const classSelect = document.getElementById("classSelect");
const bookContainer = document.getElementById("bookContainer");
const packageTitle = document.getElementById("packageTitle");
const packagePrice = document.getElementById("packagePrice");

// =====================================
// Load Books
// =====================================

function loadBooks(){

let selectedClass = classSelect.value;

let classBooks = books[selectedClass] || [];

// Read dynamically added books from localStorage
let customBooks = JSON.parse(localStorage.getItem("books")) || [];
let classCustomBooks = customBooks.filter(b => b.class == selectedClass).map(b => ({
    name: b.name,
    price: b.price || 250, // default price
    image: b.image || "../images/textbooks/default.jpg" // default image placeholder
}));

let allClassBooks = [...classBooks, ...classCustomBooks];

bookContainer.innerHTML="";

packageTitle.innerHTML="📦 Complete Class "+selectedClass+" Package";

packagePrice.innerHTML="₹"+packagePrices[selectedClass];

allClassBooks.forEach(book=>{

bookContainer.innerHTML += `

<div class="col-md-4 mb-4">

<div class="card h-100 shadow-sm">

<img src="${book.image}"
class="card-img-top"
height="220"
onerror="this.src='https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'">

<div class="card-body">

<h5>${book.name}</h5>

<p>Class ${selectedClass} ${book.name} Textbook</p>

<h5 class="text-primary">₹${book.price}</h5>

<button
class="btn btn-primary w-100"
onclick="addBook('${book.name}',${book.price},'${book.image}')">

Add to Cart

</button>

</div>

</div>

</div>

`;

});

}

classSelect.addEventListener("change",loadBooks);
// =====================================
// Add Book
// =====================================

function addBook(name, price, image) {

    const exists = cart.find(book => book.name === name);

    if (exists) {
        alert(name + " is already in your cart.");
        return;
    }

    cart.push({
        name: name,
        price: price,
        image: image
    });

    saveCart();

    alert(name + " added successfully!");
}

// =====================================
// Buy Complete Package
// =====================================

document.getElementById("buyPackage").addEventListener("click", () => {

    const selectedClass = classSelect.value;

    cart = [];

    books[selectedClass].forEach(book => {

        cart.push({
            name: book.name,
            price: book.price,
            image: book.image
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

}

// =====================================
// Load Cart
// =====================================

function loadCart() {

    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartItems || !cartTotal) return;

    cartItems.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {

        cartItems.innerHTML = `
        <li class="list-group-item text-center">
            Cart is Empty
        </li>`;

        cartTotal.innerHTML = "0";

        return;
    }

    cart.forEach((book, index) => {

        total += Number(book.price);

        cartItems.innerHTML += `

        <li class="list-group-item d-flex justify-content-between align-items-center">

            <div>

                <img src="${book.image}"
                     width="40"
                     height="50"
                     style="object-fit:cover;border-radius:5px;">

                <strong class="ms-2">${book.name}</strong>

                <br>

                <small class="ms-5">
                    ₹${book.price}
                </small>

            </div>

            <button
                class="btn btn-danger btn-sm"
                onclick="removeBook(${index})">

                <i class="bi bi-trash"></i>

            </button>

        </li>

        `;

    });

    cartTotal.innerHTML = total;

}

// =====================================
// Remove Book
// =====================================

function removeBook(index) {

    cart.splice(index, 1);

    saveCart();

}

// =====================================
// Initial Load
// =====================================

loadBooks();
loadCart();
function placeOrder() {

    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    let total = cart.reduce((sum, b) => sum + Number(b.price), 0);

    let newOrder = {
        id: "ORD" + Date.now(),
        parent: "Parent User",
        books: cart,
        total: total,
        status: "Pending"
    };

    orders.push(newOrder);

    localStorage.setItem("orders", JSON.stringify(orders));

    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Order Placed Successfully!");

    loadCart();
}