const API_URL =
"http://localhost:8081/api/orders";

loadOrders();

function loadOrders(){


fetch(API_URL)
.then(res => res.json())
.then(data => {

    let rows = "";

    data.forEach(order => {

        rows += `
        <tr>
            <td>${order.orderId}</td>
            <td>${order.studentName}</td>
            <td>${order.orderDate}</td>
            <td>${order.totalAmount}</td>
            <td>${order.status}</td>
        </tr>
        `;
    });

    document.getElementById(
        "orderTableBody"
    ).innerHTML = rows;

})
.catch(error =>
    console.error(error)
);


}
