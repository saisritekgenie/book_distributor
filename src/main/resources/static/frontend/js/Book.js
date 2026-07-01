// ==============================
// LOAD BOOKS
// ==============================
function loadBooks() {

    let books = JSON.parse(localStorage.getItem("books")) || [];
    let table = document.getElementById("bookTableBody");

    table.innerHTML = "";

    if (books.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">No Books Found</td>
            </tr>
        `;
        return;
    }

    books.forEach((book, index) => {

        table.innerHTML += `
            <tr>
                <td>${book.class}</td>
                <td>${book.name}</td>
                <td>${book.qty}</td>
                <td>
                    <button class="btn btn-warning btn-sm me-2" onclick="editBook(${index})">
                        Edit
                    </button>

                    <button class="btn btn-danger btn-sm" onclick="deleteBook(${index})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

// ==============================
// ADD BOOK
// ==============================
function addBook() {

    let books = JSON.parse(localStorage.getItem("books")) || [];

    let newBook = {
        class: document.getElementById("bookClass").value,
        name: document.getElementById("bookName").value,
        qty: Number(document.getElementById("bookQty").value)
    };

    if (!newBook.class || !newBook.name || !newBook.qty) {
        alert("Fill all fields");
        return;
    }

    // prevent duplicates (class + book)
    let exists = books.find(b =>
        b.class == newBook.class && b.name.toLowerCase() === newBook.name.toLowerCase()
    );

    if (exists) {
        alert("Book already exists in this class!");
        return;
    }

    books.push(newBook);

    localStorage.setItem("books", JSON.stringify(books));

    alert("Book Added Successfully!");

    loadBooks();
}

// ==============================
// EDIT BOOK
// ==============================
function editBook(index) {

    let books = JSON.parse(localStorage.getItem("books")) || [];

    let newQty = prompt("Update Quantity:", books[index].qty);

    if (newQty !== null) {
        books[index].qty = Number(newQty);
    }

    localStorage.setItem("books", JSON.stringify(books));

    loadBooks();
}

// ==============================
// DELETE BOOK
// ==============================
function deleteBook(index) {

    let books = JSON.parse(localStorage.getItem("books")) || [];

    books.splice(index, 1);

    localStorage.setItem("books", JSON.stringify(books));

    loadBooks();
}

// ==============================
// INIT
// ==============================
window.onload = loadBooks;