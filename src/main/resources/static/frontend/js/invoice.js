fetch("https://book-distributor.onrender.com/api/invoices")
.then(response => response.json())
.then(data => {

    let rows = "";

    data.forEach(invoice => {

        rows += `
        <tr>
            <td>${invoice.invoiceNumber}</td>
            <td>${invoice.orderId ? "ORD" + (1719758500000 + invoice.orderId) : "-"}</td>
            <td>₹${invoice.totalAmount}</td>
            <td>${invoice.generatedDate}</td>
        </tr>
        `;

    });

    document.getElementById("invoiceTableBody").innerHTML = rows;

    // Generate QR Code for latest invoice
    if (data.length > 0) {

        const latestInvoice = data[data.length - 1];

        const qrDiv = document.getElementById("qrcode");
        qrDiv.innerHTML = "";

        // Only invoice number is stored in QR
        new QRCode(qrDiv, {
            text: latestInvoice.invoiceNumber,
            width: 200,
            height: 200,
            correctLevel: QRCode.CorrectLevel.L
        });

    }

})
.catch(error => {

    console.error("Error loading invoices:", error);

});
