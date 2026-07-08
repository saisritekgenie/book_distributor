// ==============================
// STATE & NAVIGATION FOR CLASS-WISE FILTER
// ==============================
let currentViewClass = null;

function viewClass(cls) {
    currentViewClass = cls;
    loadBooks();
}
window.viewClass = viewClass;

function showClassList() {
    currentViewClass = null;
    loadBooks();
}
window.showClassList = showClassList;

// ==============================
// LOAD BOOKS & BUNDLES
// ==============================
function loadBooks() {
    let books = JSON.parse(localStorage.getItem("books")) || [];
    let table = document.getElementById("bookTableBody");
    let header = document.getElementById("bookTableHeader");
    let titleEl = document.getElementById("catalogTitle");
    let actionsContainer = document.getElementById("catalogHeaderActions");
    
    if (!table) return;

    table.innerHTML = "";

    // 1. CLASS LIST VIEW (Default / Initial state)
    if (currentViewClass === null) {
        // Set titles
        if (titleEl) {
            let currentText = titleEl.innerText || "";
            if (currentText.includes("Lists")) {
                titleEl.innerHTML = `<i class="bi bi-book-half text-success me-2"></i>Class Textbook Lists`;
            } else {
                titleEl.innerHTML = `<i class="bi bi-book-half text-success me-2"></i>Registered Textbook Catalog`;
            }
        }
        if (actionsContainer) {
            actionsContainer.innerHTML = "";
        }

        // Set table headers for Class List
        if (header) {
            header.innerHTML = `
                <tr>
                    <th>Class</th>
                    <th class="text-end">Actions</th>
                </tr>
            `;
        }

        // Determine unique list of classes
        let classes = ["5", "6", "7", "8", "9", "10"];
        books.forEach(b => {
            if (b.class && !classes.includes(String(b.class))) {
                classes.push(String(b.class));
            }
        });
        classes.sort((a, b) => {
            let numA = parseInt(a, 10);
            let numB = parseInt(b, 10);
            if (isNaN(numA) || isNaN(numB)) {
                return String(a).localeCompare(String(b));
            }
            return numA - numB;
        });

        classes.forEach(cls => {
            let classBooks = books.filter(b => String(b.class) === String(cls));
            let bookCountText = classBooks.length === 1 
                ? "1 book registered" 
                : `${classBooks.length} books registered`;

            table.innerHTML += `
                <tr style="cursor: pointer;" onclick="viewClass('${cls}')">
                    <td>
                        <div class="d-flex align-items-center py-2">
                            <span class="fs-4 text-warning me-3"><i class="bi bi-folder-fill"></i></span>
                            <div>
                                <strong class="text-dark fs-5">Class ${cls}</strong>
                                <small class="text-muted d-block">${bookCountText}</small>
                            </div>
                        </div>
                    </td>
                    <td class="text-end align-middle">
                        <button class="btn btn-outline-primary btn-sm fw-semibold px-3" onclick="event.stopPropagation(); viewClass('${cls}')">
                            View Books <i class="bi bi-chevron-right ms-1"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

    } 
    // 2. SPECIFIC CLASS BOOKS VIEW
    else {
        // Set titles
        if (titleEl) {
            let currentText = titleEl.innerText || "";
            if (currentText.includes("Lists")) {
                titleEl.innerHTML = `<i class="bi bi-book-half text-success me-2"></i>Class ${currentViewClass} Textbook List`;
            } else {
                titleEl.innerHTML = `<i class="bi bi-book-half text-success me-2"></i>Registered Textbooks - Class ${currentViewClass}`;
            }
        }
        // Set Back button
        if (actionsContainer) {
            actionsContainer.innerHTML = `
                <button class="btn btn-outline-secondary btn-sm fw-semibold" onclick="showClassList()">
                    <i class="bi bi-arrow-left me-1"></i> Back to Classes
                </button>
            `;
        }

        // Set table headers for Books List
        if (header) {
            header.innerHTML = `
                <tr>
                    <th style="width: 45%;">Book Name</th>
                    <th style="width: 20%;">Price</th>
                    <th style="width: 20%;">Quantity</th>
                    <th style="width: 15%;" class="text-end">Actions</th>
                </tr>
            `;
        }

        let filteredBooks = books.filter(book => String(book.class) === String(currentViewClass));

        if (filteredBooks.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">No books registered for Class ${currentViewClass} yet.</td>
                </tr>
            `;
        } else {
            filteredBooks.forEach((book) => {
                let originalIndex = books.findIndex(b => String(b.class) === String(book.class) && String(b.name).toLowerCase() === String(book.name).toLowerCase());
                if (originalIndex === -1) originalIndex = 0;

                let qtyDisplay = Number(book.qty) <= 0 
                    ? `<span class="badge bg-danger">Out of Stock</span>` 
                    : `<span>${book.qty}</span>`;

                let imgUrl = book.image || `../images/textbooks/default.jpg`;
                let imgHtml = `
                    <img src="${imgUrl}" 
                         width="36" 
                         height="48" 
                         style="object-fit:cover; border-radius: 4px;" 
                         class="me-2 border shadow-sm"
                         onerror="this.src='https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=100'">
                `;

                table.innerHTML += `
                    <tr>
                        <td>
                            <div class="d-flex align-items-center">
                                ${imgHtml}
                                <span class="fw-semibold text-dark">${book.name}</span>
                            </div>
                        </td>
                        <td>₹${book.price || 250}</td>
                        <td>${qtyDisplay}</td>
                        <td class="text-end">
                            <button class="btn btn-warning btn-sm me-2" onclick="editBook(${originalIndex})" title="Edit">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteBook(${originalIndex})" title="Delete">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    }

    loadBundles();
}

// ==============================
// QUEUE MANAGEMENT (ADD WITH CROSS PREVIEW)
// ==============================
let queuedBooks = [];

function renderQueue() {
    let previewSection = document.getElementById("bundlePreviewSection");
    let previewList = document.getElementById("previewBooksList");
    let countBadge = document.getElementById("queueCount");

    if (!previewSection || !previewList) return;

    if (queuedBooks.length === 0) {
        previewSection.classList.add("d-none");
        return;
    }

    previewSection.classList.remove("d-none");
    if (countBadge) countBadge.innerText = queuedBooks.length;

    previewList.innerHTML = "";
    queuedBooks.forEach((book, index) => {
        previewList.innerHTML += `
            <div class="badge bg-primary text-white p-2 d-flex align-items-center gap-2 rounded-pill" style="font-size: 0.9rem;">
                <span>Class ${book.class}: ${book.name} (₹${book.price}) x${book.qty}</span>
                <button type="button" class="btn-close btn-close-white" style="font-size: 0.6rem; padding: 0;" aria-label="Remove" onclick="removeBookFromQueue(${index})"></button>
            </div>
        `;
    });
}

function addBookToQueue() {
    let bookClassInput = document.getElementById("bookClass");
    let bookNameInput = document.getElementById("bookName");
    let bookPriceInput = document.getElementById("bookPrice");
    let bookQtyInput = document.getElementById("bookQty");

    let cls = bookClassInput.value.trim();
    let name = bookNameInput.value.trim();
    let price = Number(bookPriceInput.value) || 250;
    let qty = Number(bookQtyInput.value);

    if (!cls || !name || !qty) {
        alert("Please fill in all fields (Class, Book Name, and Quantity)");
        return;
    }

    // Check duplicate in active queue
    let inQueue = queuedBooks.find(b => b.class == cls && b.name.toLowerCase() === name.toLowerCase());
    if (inQueue) {
        alert("Book is already added to the queue!");
        return;
    }

    queuedBooks.push({
        class: cls,
        name: name,
        price: price,
        qty: qty,
        image: `../images/textbooks/${cls === '5' || cls === '6' || cls === '7' || cls === '8' || cls === '9' || cls === '10' ? (cls === '5' ? 'five' : cls === '6' ? 'six' : cls === '7' ? 'seven' : cls === '8' ? 'eight' : cls === '9' ? 'nine' : 'ten') : 'default'}${name.toLowerCase() === 'mathematics' ? 'maths' : name.toLowerCase() === 'math' ? 'math' : name.toLowerCase()}.jpg`
    });

    // Clear dropdown selection
    bookNameInput.value = "";
    bookPriceInput.value = "";

    renderQueue();
}
window.addBookToQueue = addBookToQueue;

function addBundleToQueue() {
    let targetClass = document.getElementById("bookClass").value.trim();
    let initialQty = Number(document.getElementById("bookQty").value) || 50;

    if (!targetClass) {
        alert("Please enter a Target Class (e.g. 5, 6, 7...) first.");
        return;
    }

    // Default prices based on standard configs
    const standardList = {
        5: [
            { name: "English", price: 240 },
            { name: "Mathematics", price: 260 },
            { name: "Science", price: 280 },
            { name: "Social", price: 240 },
            { name: "Telugu", price: 200 },
            { name: "Hindi", price: 220 }
        ],
        6: [
            { name: "English", price: 250 },
            { name: "Mathematics", price: 300 },
            { name: "Science", price: 320 },
            { name: "Social", price: 280 },
            { name: "Telugu", price: 220 },
            { name: "Hindi", price: 280 }
        ],
        7: [
            { name: "English", price: 260 },
            { name: "Mathematics", price: 310 },
            { name: "Science", price: 330 },
            { name: "Social", price: 290 },
            { name: "Telugu", price: 230 },
            { name: "Hindi", price: 290 }
        ],
        8: [
            { name: "English", price: 270 },
            { name: "Mathematics", price: 320 },
            { name: "Science", price: 340 },
            { name: "Social", price: 300 },
            { name: "Telugu", price: 240 },
            { name: "Hindi", price: 300 }
        ],
        9: [
            { name: "English", price: 300 },
            { name: "Mathematics", price: 350 },
            { name: "Science", price: 380 },
            { name: "Social", price: 320 },
            { name: "Telugu", price: 260 },
            { name: "Hindi", price: 320 }
        ],
        10: [
            { name: "English", price: 320 },
            { name: "Mathematics", price: 380 },
            { name: "Science", price: 400 },
            { name: "Social", price: 350 },
            { name: "Telugu", price: 280 },
            { name: "Hindi", price: 340 }
        ]
    };

    let selectedList = standardList[targetClass] || [
        { name: "English", price: 250 },
        { name: "Mathematics", price: 300 },
        { name: "Science", price: 320 },
        { name: "Social", price: 280 },
        { name: "Telugu", price: 220 },
        { name: "Hindi", price: 280 }
    ];

    let queuedCount = 0;
    selectedList.forEach(item => {
        // Prevent duplicate inside queue
        let exists = queuedBooks.find(b => b.class == targetClass && b.name.toLowerCase() === item.name.toLowerCase());
        if (!exists) {
            queuedBooks.push({
                class: targetClass,
                name: item.name,
                price: item.price,
                qty: initialQty,
                image: `../images/textbooks/${targetClass === '5' || targetClass === '6' || targetClass === '7' || targetClass === '8' || targetClass === '9' || targetClass === '10' ? (targetClass === '5' ? 'five' : targetClass === '6' ? 'six' : targetClass === '7' ? 'seven' : targetClass === '8' ? 'eight' : targetClass === '9' ? 'nine' : 'ten') : 'default'}${item.name.toLowerCase() === 'mathematics' ? 'maths' : item.name.toLowerCase() === 'math' ? 'math' : item.name.toLowerCase()}.jpg`
            });
            queuedCount++;
        }
    });

    renderQueue();
    if (queuedCount === 0) {
        alert("All standard books for this class are already in the queue.");
    }
}
window.addBundleToQueue = addBundleToQueue;

function removeBookFromQueue(index) {
    queuedBooks.splice(index, 1);
    renderQueue();
}
window.removeBookFromQueue = removeBookFromQueue;

function saveSelectedBundle() {
    if (queuedBooks.length === 0) {
        alert("The book queue is empty!");
        return;
    }

    let books = JSON.parse(localStorage.getItem("books")) || [];
    let savedCount = 0;

    queuedBooks.forEach(newBook => {
        // prevent duplicate in storage (class + name)
        let index = books.findIndex(b => b.class == newBook.class && b.name.toLowerCase() === newBook.name.toLowerCase());
        if (index !== -1) {
            // Update stock and price
            books[index].qty += newBook.qty;
            books[index].price = newBook.price;
        } else {
            books.push(newBook);
        }
        savedCount++;
    });

    localStorage.setItem("books", JSON.stringify(books));
    alert(`Successfully saved ${savedCount} books to inventory!`);
    
    // Clear inputs and queue
    queuedBooks = [];
    document.getElementById("bookClass").value = "";
    document.getElementById("bookName").value = "";
    document.getElementById("bookPrice").value = "";
    document.getElementById("bookQty").value = "50";

    renderQueue();
    currentViewClass = null;
    loadBooks();
}
window.saveSelectedBundle = saveSelectedBundle;

// ==============================
// EDIT BOOK
// ==============================
function editBook(index) {
    let books = JSON.parse(localStorage.getItem("books")) || [];
    let book = books[index];
    if (!book) return;

    let newPrice = prompt("Update Price (₹):", book.price || 250);
    let newQty = prompt("Update Stock Quantity:", book.qty);

    if (newPrice !== null) {
        book.price = Number(newPrice);
    }
    if (newQty !== null) {
        book.qty = Number(newQty);
    }

    books[index] = book;
    localStorage.setItem("books", JSON.stringify(books));
    loadBooks();
}

// ==============================
// DELETE BOOK
// ==============================
function deleteBook(index) {
    if (confirm("Are you sure you want to delete this book?")) {
        let books = JSON.parse(localStorage.getItem("books")) || [];
        books.splice(index, 1);
        localStorage.setItem("books", JSON.stringify(books));
        loadBooks();
    }
}

// ==============================
// BUNDLE PRICES
// ==============================
function loadBundles() {
    let packagePrices = JSON.parse(localStorage.getItem("packagePrices")) || {
        5: 1440,
        6: 1650,
        7: 1710,
        8: 1770,
        9: 1930,
        10: 2070
    };

    let container = document.getElementById("bundlePricesContainer");
    if (!container) return;

    container.innerHTML = "";

    Object.keys(packagePrices).forEach(cls => {
        let price = packagePrices[cls];
        container.innerHTML += `
            <div class="col-md-4 mb-3">
                <div class="card border border-light shadow-sm h-100 rounded-3">
                    <div class="card-body d-flex flex-column justify-content-between p-3">
                        <div>
                            <h6 class="card-title fw-bold text-dark">Class ${cls} Bundle</h6>
                            <h4 class="text-success fw-bold mb-3">₹${price}</h4>
                        </div>
                        <div class="input-group input-group-sm">
                            <span class="input-group-text bg-light">₹</span>
                            <input type="number" class="form-control" id="bundlePriceInput-${cls}" value="${price}">
                            <button class="btn btn-primary btn-sm" onclick="updateBundlePrice('${cls}')">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

function updateBundlePrice(cls) {
    let packagePrices = JSON.parse(localStorage.getItem("packagePrices")) || {
        5: 1440,
        6: 1650,
        7: 1710,
        8: 1770,
        9: 1930,
        10: 2070
    };

    let input = document.getElementById(`bundlePriceInput-${cls}`);
    if (input) {
        let newPrice = Number(input.value);
        if (newPrice >= 0) {
            packagePrices[cls] = newPrice;
            localStorage.setItem("packagePrices", JSON.stringify(packagePrices));
            alert(`Class ${cls} bundle package price updated to ₹${newPrice} successfully!`);
            loadBooks();
        } else {
            alert("Please enter a valid price.");
        }
    }
}
window.updateBundlePrice = updateBundlePrice;

// ==============================
// INIT
// ==============================
window.onload = loadBooks;