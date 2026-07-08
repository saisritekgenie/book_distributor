const API_URL = "https://book-distributor.onrender.com/api/students";
let currentStudents = [];
let isApiCached = true;
let selectedClassFilter = "All";

loadStudents();

function loadStudents() {
    let container = document.getElementById("studentsGroupContainer");
    if (!container) return;

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
        currentStudents = data;
        isApiCached = true;
        renderStudentsList(data, true);
    })
    .catch(err => {
        console.warn("API not available, loading students from localStorage:", err);
        let localStudents = JSON.parse(localStorage.getItem("students")) || [];
        currentStudents = localStudents;
        isApiCached = false;
        renderStudentsList(localStudents, false);
    });
}

function renderStudentsList(list, isApi) {
    let container = document.getElementById("studentsGroupContainer");
    if (!container) return;

    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = `<div class="text-center text-muted py-4">No students registered yet</div>`;
        return;
    }

    const searchInput = document.getElementById("studentSearch");
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";
    let localStudents = JSON.parse(localStorage.getItem("students")) || [];

    // Filter by search terms and quick class filter
    let filteredList = list.filter(student => {
        let matchedLocal = localStudents.find(ls => 
            ls.studentName && 
            student.studentName && 
            ls.studentName.toLowerCase().trim() === student.studentName.toLowerCase().trim()
        );

        let roll = student.rollNumber || (matchedLocal ? matchedLocal.rollNumber : null) || student.studentId || "-";
        let name = student.studentName || "-";
        let grade = student.studentClass || student.className || "Grade 10";
        let school = student.schoolName || (matchedLocal ? matchedLocal.schoolName : null) || "Greenwood High";
        let parent = student.parentName || (matchedLocal ? matchedLocal.parentName : null) || localStorage.getItem("parentName") || "-";
        let phone = student.phoneNumber || student.parentMobile || (matchedLocal ? matchedLocal.phoneNumber : null) || "-";
        
        let normalizedClass = getNormalizedClass(grade);

        // Class chip filter check
        if (selectedClassFilter !== "All" && normalizedClass !== selectedClassFilter) {
            return false;
        }

        // Text search check
        if (searchValue) {
            return roll.toString().toLowerCase().includes(searchValue) ||
                   name.toLowerCase().includes(searchValue) ||
                   school.toLowerCase().includes(searchValue) ||
                   parent.toLowerCase().includes(searchValue) ||
                   phone.toString().toLowerCase().includes(searchValue) ||
                   normalizedClass.toLowerCase().includes(searchValue);
        }

        return true;
    });

    if (filteredList.length === 0) {
        container.innerHTML = `<div class="text-center text-muted py-4">No matching students found</div>`;
        return;
    }

    // Group students by Class
    let groups = {};
    filteredList.forEach((student) => {
        let matchedLocal = localStudents.find(ls => 
            ls.studentName && 
            student.studentName && 
            ls.studentName.toLowerCase().trim() === student.studentName.toLowerCase().trim()
        );

        // Preserve original index for edit/delete actions
        let originalIndex = list.findIndex(item => item.studentName === student.studentName);

        let roll = student.rollNumber || (matchedLocal ? matchedLocal.rollNumber : null) || student.studentId || "-";
        let name = student.studentName || "-";
        let grade = student.studentClass || student.className || "Grade 10";
        let school = student.schoolName || (matchedLocal ? matchedLocal.schoolName : null) || "Greenwood High";
        let parent = student.parentName || (matchedLocal ? matchedLocal.parentName : null) || localStorage.getItem("parentName") || "-";
        let phone = student.phoneNumber || student.parentMobile || (matchedLocal ? matchedLocal.phoneNumber : null) || "-";
        
        let normalizedClass = getNormalizedClass(grade);
        if (!groups[normalizedClass]) {
            groups[normalizedClass] = [];
        }
        groups[normalizedClass].push({
            roll, name, grade, school, parent, phone, index: originalIndex, studentId: student.studentId
        });
    });

    // Helper to get normalized class name
    function getNormalizedClass(grade) {
        if (!grade) return "Unassigned Class";
        let numMatches = grade.toString().match(/\d+/);
        if (numMatches) {
            return "Class " + numMatches[0];
        }
        return grade.toString().trim();
    }

    // Sort classes numerically
    let sortedClasses = Object.keys(groups).sort((a, b) => {
        let numA = parseInt(a.match(/\d+/));
        let numB = parseInt(b.match(/\d+/));
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        return numA - numB;
    });

    sortedClasses.forEach(className => {
        let studentsInClass = groups[className];
        
        let classSection = document.createElement("div");
        classSection.className = "mb-4";
        classSection.innerHTML = `
            <div class="px-3 py-2 bg-light border-start border-primary border-4 rounded-end d-flex align-items-center justify-content-between mb-2">
                <h6 class="mb-0 fw-bold text-primary"><i class="bi bi-mortarboard-fill me-2"></i>${className}</h6>
                <span class="badge bg-primary rounded-pill">${studentsInClass.length} Students</span>
            </div>
            <div class="table-responsive">
                <table class="table table-striped table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Roll No</th>
                            <th>Student Name</th>
                            <th>School Name</th>
                            <th>Parent Name</th>
                            <th>Phone Number</th>
                            <th class="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentsInClass.map(s => `
                            <tr>
                                <td><strong>${s.roll}</strong></td>
                                <td>${s.name}</td>
                                <td>${s.school}</td>
                                <td>${s.parent}</td>
                                <td>${s.phone}</td>
                                <td class="text-end">
                                    <button class="btn btn-outline-warning btn-sm me-1" onclick="editStudent(${s.index}, ${isApi}, ${s.studentId || null})">
                                        <i class="bi bi-pencil"></i> Edit
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm" onclick="removeStudent(${s.index}, ${isApi}, ${s.studentId || null})">
                                        <i class="bi bi-trash"></i> Delete
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        container.appendChild(classSection);
    });
}

// Quick filter handler
window.filterByClass = function(className) {
    selectedClassFilter = className;
    
    document.querySelectorAll("#classFilters .filter-chip").forEach(btn => {
        if (btn.dataset.class === className) {
            btn.classList.remove("btn-outline-primary");
            btn.classList.add("btn-primary", "active");
        } else {
            btn.classList.remove("btn-primary", "active");
            btn.classList.add("btn-outline-primary");
        }
    });

    renderStudentsList(currentStudents, isApiCached);
};

// Event listener for live searching
document.addEventListener("DOMContentLoaded", () => {
    let studentSearch = document.getElementById("studentSearch");
    if (studentSearch) {
        studentSearch.addEventListener("input", () => {
            renderStudentsList(currentStudents, isApiCached);
        });
    }
});

window.exportToExcel = function() {
    if (!currentStudents || currentStudents.length === 0) {
        alert("No student data available to export.");
        return;
    }

    let localStudents = JSON.parse(localStorage.getItem("students")) || [];
    let excelData = currentStudents.map(student => {
        let matchedLocal = localStudents.find(ls => 
            ls.studentName && 
            student.studentName && 
            ls.studentName.toLowerCase().trim() === student.studentName.toLowerCase().trim()
        );
        return {
            "Roll Number": student.rollNumber || (matchedLocal ? matchedLocal.rollNumber : null) || student.studentId || "-",
            "Student Name": student.studentName || "-",
            "Class": student.studentClass || student.className || "Grade 10",
            "School Name": student.schoolName || (matchedLocal ? matchedLocal.schoolName : null) || "Greenwood High",
            "Parent Name": student.parentName || (matchedLocal ? matchedLocal.parentName : null) || "-",
            "Phone Number": student.phoneNumber || student.parentMobile || (matchedLocal ? matchedLocal.phoneNumber : null) || "-"
        };
    });

    let worksheet = XLSX.utils.json_to_sheet(excelData);
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students Directory");

    // Auto-fit column widths
    const max_widths = excelData.reduce((acc, row) => {
        Object.keys(row).forEach((key, colIndex) => {
            const val = row[key] ? row[key].toString() : '';
            const headerLen = key.length;
            const cellLen = val.length;
            const maxLen = Math.max(headerLen, cellLen);
            acc[colIndex] = Math.max(acc[colIndex] || 0, maxLen);
        });
        return acc;
    }, []);
    worksheet['!cols'] = max_widths.map(w => ({ wch: w + 3 }));

    XLSX.writeFile(workbook, "Student_Directory.xlsx");
};

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

document.addEventListener("DOMContentLoaded", () => {
    const addStudentForm = document.getElementById("addStudentForm");
    if (addStudentForm) {
        addStudentForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const studentName = document.getElementById("mStudentName").value.trim();
            const rollNumber = document.getElementById("mRollNumber").value.trim();
            const studentClass = document.getElementById("mStudentClass").value.trim();
            const schoolName = document.getElementById("mSchoolName").value.trim();
            const parentName = document.getElementById("mParentName").value.trim();
            const phoneNumber = document.getElementById("mPhoneNumber").value.trim();

            if (!studentName || !rollNumber || !studentClass || !schoolName || !parentName || !phoneNumber) {
                alert("Please fill in all fields.");
                return;
            }

            const student = {
                studentName: studentName,
                rollNumber: rollNumber,
                studentClass: studentClass,
                schoolName: schoolName,
                parentName: parentName,
                phoneNumber: phoneNumber
            };

            // Save locally
            let studentsList = JSON.parse(localStorage.getItem("students")) || [];
            studentsList.push(student);
            localStorage.setItem("students", JSON.stringify(studentsList));

            // Post to backend database
            try {
                let res = await fetch("https://book-distributor.onrender.com/api/students", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        studentName: studentName,
                        className: "Grade " + studentClass,
                        section: "A",
                        parentMobile: phoneNumber
                    })
                });
                if (res.ok) {
                    let saved = await res.json();
                    console.log("Saved to database", saved);
                }
            } catch (err) {
                console.warn("Backend offline, saved student locally only", err);
            }

            alert("Student created successfully!");
            addStudentForm.reset();
            
            // Hide Bootstrap modal
            const modalEl = document.getElementById("addStudentModal");
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) {
                modalInstance.hide();
            }
            
            // Refresh list
            loadStudents();
        });
    }
});
