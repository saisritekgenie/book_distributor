
console.log("login.js loaded");

async function login() {

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value.trim();

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

    // Parent Login: check active session first
    const savedEmail =
        localStorage.getItem("email")?.trim();

    const savedPassword =
        localStorage.getItem("password")?.trim();

    if(username === savedEmail &&
       password === savedPassword) {

        window.location.href =
            "parent/parent.html";
        return;
    }

    // Dynamic Parent/Student lookup (to allow logging in any previously registered parent)
    let students = JSON.parse(localStorage.getItem("students")) || [];
    try {
        let res = await fetch("http://localhost:8081/api/students");
        if (res.ok) {
            let dbStudents = await res.json();
            dbStudents.forEach(dbS => {
                if (!students.some(s => s.studentName.toLowerCase().trim() === dbS.studentName.toLowerCase().trim())) {
                    students.push({
                        studentName: dbS.studentName,
                        rollNumber: "R" + dbS.studentId,
                        studentClass: dbS.className,
                        schoolName: "Greenwood High",
                        parentName: dbS.studentName + " Parent",
                        phoneNumber: dbS.parentMobile
                    });
                }
            });
        }
    } catch(e) {
        console.warn("Backend offline during student lookup, relying on local list");
    }

    let matchedStudent = students.find(s => {
        let cleanUsername = username.toLowerCase().trim();
        let cleanPassword = password.trim();

        let parentEmail = (s.parentName || "").toLowerCase().replace(/\s+/g, '') + "@gmail.com";
        let matchUser = (s.phoneNumber && s.phoneNumber.trim() === cleanUsername) ||
                        (s.studentName && s.studentName.toLowerCase().trim() === cleanUsername) ||
                        (cleanUsername === parentEmail);
        
        let matchPass = (s.rollNumber && s.rollNumber.trim() === cleanPassword) ||
                        (cleanPassword === "parent123");

        return matchUser && matchPass;
    });

    if (matchedStudent) {
        // Set this student as the active session
        localStorage.setItem("parentName", matchedStudent.parentName);
        localStorage.setItem("studentName", matchedStudent.studentName);
        localStorage.setItem("studentClass", matchedStudent.studentClass);
        localStorage.setItem("schoolName", matchedStudent.schoolName);
        localStorage.setItem("rollNumber", matchedStudent.rollNumber);
        localStorage.setItem("phoneNumber", matchedStudent.phoneNumber);
        localStorage.setItem("email", username);
        localStorage.setItem("password", password);

        window.location.href = "parent/parent.html";
        return;
    }

    alert("Invalid Credentials");
}