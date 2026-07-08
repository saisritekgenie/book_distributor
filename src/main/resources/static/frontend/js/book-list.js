const API_URL = "https://book-distributor.onrender.com/api/books";

loadBooks();

function loadBooks() {

    fetch(API_URL)
    .then(res => res.json())
    .then(data => {

        let rows = "";

        data.forEach(book => {

            rows += `
                <tr>
                    <td>${book.bookId}</td>
                    <td>${book.bookName}</td>
                    <td>${book.price}</td>
                </tr>
            `;
        });

        document.getElementById("bookTableBody").innerHTML = rows;
    })
    .catch(error => console.error(error));
}
