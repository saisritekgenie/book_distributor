window.onload = function(){


document.getElementById("name").value =
    localStorage.getItem("parentName") || "";

document.getElementById("email").value =
    localStorage.getItem("email") || "";

document.getElementById("mobile").value =
    localStorage.getItem("mobile") || "";

document.getElementById("studentName").value =
    localStorage.getItem("studentName") || "";

document.getElementById("className").value =
    localStorage.getItem("className") || "";


};

function saveProfile(){

localStorage.setItem(
    "parentName",
    document.getElementById("name").value
);

localStorage.setItem(
    "email",
    document.getElementById("email").value
);

localStorage.setItem(
    "mobile",
    document.getElementById("mobile").value
);

localStorage.setItem(
    "studentName",
    document.getElementById("studentName").value
);

localStorage.setItem(
    "className",
    document.getElementById("className").value
);

alert("Profile Saved Successfully");


}
