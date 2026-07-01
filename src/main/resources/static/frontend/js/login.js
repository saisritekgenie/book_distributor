
console.log("login.js loaded");

function login() {

    const username =
        document.getElementById("username").value.trim();;

    const password =
        document.getElementById("password").value.trim();;

    // Admin Login
    if(username === "admin@school.com" &&
       password === "admin123") {

        window.location.href =
            "admin/admin.html";
        return;
    }

    // Staff Login
    if(username === "staff@school.com" &&
       password === "staff123") {
        window.location.href = "admin/staff.html";
        return;
    }

    // Dynamic Staff Login from localStorage
    let staffList = JSON.parse(localStorage.getItem("staff")) || [];
    let activeStaff = staffList.find(s => s.username === username && s.password === password && s.status === "active");
    if (activeStaff) {
        window.location.href = "admin/staff.html";
        return;
    }

    // Parent Login
    const savedEmail =
        localStorage.getItem("email")?.trim();;

    const savedPassword =
        localStorage.getItem("password")?.trim();;

    if(username === savedEmail &&
       password === savedPassword) {

        window.location.href =
            "parent/parent.html";
        return;
    }

    alert("Invalid Credentials");
}