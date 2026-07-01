function generateInvoice(order) {
    let box = document.getElementById("invoiceBox");

    if (!box) {
        console.error("invoiceBox missing in HTML");
        return;
    }

    box.innerHTML = `
        <div class="border p-3 rounded bg-white">
            <h6>Invoice #${order.id}</h6>
            <p><b>Name:</b> ${order.parent}</p>
            <p><b>Books:</b> ${order.books}</p>
            <p><b>Total:</b> ₹${order.total}</p>
            <p><b>Status:</b> ${order.status}</p>
            <p><b>Date:</b> ${order.date}</p>
        </div>
    `;
}

function generateQR(order) {

    let qrBox = document.getElementById("qrcode");

    if (!qrBox) {
        console.error("qrcode div missing");
        return;
    }

    qrBox.innerHTML = "";

    let text = order.id;

    new QRCode(qrBox, {
        text: text,
        width: 180,
        height: 180,
        correctLevel: QRCode.CorrectLevel.L
    });
}