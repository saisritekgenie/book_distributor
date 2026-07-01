function placeOrder(){


const orderData = {

    studentId:
    document.getElementById("studentId").value,

    bookId:
    document.getElementById("bookId").value,

    quantity:
    document.getElementById("quantity").value
};

fetch("http://localhost:8081/api/orders",{

    method:"POST",

    headers:{
        "Content-Type":"application/json"
    },

    body:JSON.stringify(orderData)

})
.then(res => res.json())
.then(data => {

    alert("Order Placed Successfully");

});


}
