const API_URL = "http://localhost:8081/api/students";

loadStudents();

function loadStudents() {
    let table = document.getElementById("studentTableBody");
    if (!table) return;

    fetch(API_URL)
    .then(res => {
        if (!res.ok) throw new Error("API response error");
        return res.json();
    })
    .then(async (data) => {
        // Auto-migration: Check if local storage students are missing from backend
        let localStudents = JSON.parse(localStorage.getItem("students")) || [];
        for (let ls of localStudents) {
            let matched = data.find(ds => ds.studentName && ds.studentName.toLowerCase().trim() === ls.studentName.toLowerCase().trim());
            if (!matched && ls.studentName && ls.studentName !== "-") {
                try {
                    let resMigrate = await fetch(API_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            studentName: ls.studentName,
                            className: ls.studentClass || "Grade 10",
                            section: "A",
                            parentMobile: ls.phoneNumber || "-"
                        })
                    });
                    if (resMigrate.ok) {
                        let saved = await resMigrate.json();
                        data.push(saved);
                    }
                } catch(err) {
                    console.error("Migration failed for student", ls.studentName, err);
                }
            }
        }
        renderStudentsList(data, true);
    })
    .catch(err => {
        console.warn("API not available, loading students from localStorage:", err);
        let localStudents = JSON.parse(localStorage.getItem("students")) || [];
        renderStudentsList(localStudents, false);
    });
}

function renderStudentsList(list, isApi) {
    let table = document.getElementById("studentTableBody");
    if (!table) return;

    table.innerHTML = "";

    if (list.length === 0) {
        table.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No students registered yet</td></tr>`;
        return;
    }

    list.forEach((student, index) => {
        let roll = student.rollNumber || student.studentId || "-";
        let name = student.studentName || "-";
        let grade = student.studentClass || "Grade 10";
        let school = student.schoolName || "Greenwood High";
        let parent = student.parentName || "-";
        let phone = student.phoneNumber || "-";

        table.innerHTML += `
            <tr>
                <td><strong>${roll}</strong></td>
                <td>${name}</td>
                <td><span class="badge bg-light text-dark">${grade}</span></td>
                <td>${school}</td>
                <td>${parent}</td>
                <td>${phone}</td>
                <td class="text-end">
                    <button class="btn btn-outline-warning btn-sm me-1" onclick="editStudent(${index}, ${isApi}, ${student.studentId || null})">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="removeStudent(${index}, ${isApi}, ${student.studentId || null})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

window.removeStudent = function(index, isApi, apiId) {
    if (confirm("Are you sure you want to delete this student?")) {
        if (isApi && apiId) {
            fetch(`${API_URL}/${apiId}`, {
                method: "DELETE"
            })
            .then(() => {
                alert("Student deleted successfully");
                loadStudents();
            })
            .catch(err => {
                console.error("Failed to delete from API", err);
                alert("Could not delete from backend API.");
            });
        } else {
            let localStudents = JSON.parse(localStorage.getItem("students")) || [];
            localStudents.splice(index, 1);
            localStorage.setItem("students", JSON.stringify(localStudents));
            alert("Student deleted successfully");
            loadStudents();
        }
    }
};

window.editStudent = function(index, isApi, apiId) {
    if (isApi && apiId) {
        let newName = prompt("Edit Student Name:");
        if (newName === null) return;
        
        let student = { studentName: newName.trim() };
        fetch(`${API_URL}/${apiId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(student)
        })
        .then(res => {
            if (!res.ok) throw new Error("API update failed");
            return res.json();
        })
        .then(() => {
            alert("Student updated successfully");
            loadStudents();
        })
        .catch(err => {
            console.error("API update error:", err);
            alert("Failed to update student in API backend.");
        });
    } else {
        let localStudents = JSON.parse(localStorage.getItem("students")) || [];
        let student = localStudents[index];
        if (!student) return;

        let newName = prompt("Edit Student Name:", student.studentName || "");
        let newParent = prompt("Edit Parent Name:", student.parentName || "");
        let newPhone = prompt("Edit Phone Number:", student.phoneNumber || "");

        if (newName !== null) student.studentName = newName.trim();
        if (newParent !== null) student.parentName = newParent.trim();
        if (newPhone !== null) student.phoneNumber = newPhone.trim();

        localStudents[index] = student;
        localStorage.setItem("students", JSON.stringify(localStudents));
        alert("Student updated successfully");
        loadStudents();
    }
};