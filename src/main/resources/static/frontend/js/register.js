document.addEventListener("DOMContentLoaded", () => {
    const registerBtn = document.getElementById("registerBtn");
    
    if (registerBtn) {
        registerBtn.addEventListener("click", () => {
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const mobile = document.getElementById("mobile").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            // Simple validation
            if (!name || !email || !mobile || !password || !confirmPassword) {
                alert("Please fill in all fields.");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match");
                return;
            }

            // Save to localStorage
            localStorage.setItem("name", name);
            localStorage.setItem("email", email);
            localStorage.setItem("mobile", mobile);
            localStorage.setItem("password", password);

            alert("Registration Successful!");
            window.location.href = "login.html";
        });
    }
});
