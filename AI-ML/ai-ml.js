const gradePoints = {
    'A+': 10,
    'A': 9,
    'B+': 8,
    'B': 7,
    'C+': 6,
    'C': 5,
    'D': 4,
    'F': 0
};

// This function creates the grade dropdown dynamically
function createGradeDropdown() {
    const gradeOptions = [
        { value: 'A+', label: 'A+' },
        { value: 'A', label: 'A' },
        { value: 'B+', label: 'B+' },
        { value: 'B', label: 'B' },
        { value: 'C+', label: 'C+' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' },
        { value: 'F', label: 'F' }
    ];

    let selectElement = document.createElement('select');
    selectElement.classList.add('form-control', 'grade-select');
    selectElement.innerHTML = '<option value="">Select Grade</option>';

    gradeOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        selectElement.appendChild(optionElement);
    });

    return selectElement;
}

// Toggle between Marks and Grade input for each subject
function toggleInput(selectElement) {
    const row = selectElement.closest('tr');
    const marksInputContainer = row.querySelector('.marks-input-container');
    const gradeInputContainer = row.querySelector('.grade-input-container');

    // Clear any existing grade dropdown
    gradeInputContainer.innerHTML = '';

    if (selectElement.value === 'marks') {
        marksInputContainer.style.display = 'block';
        gradeInputContainer.style.display = 'none';
    } else if (selectElement.value === 'grade') {
        marksInputContainer.style.display = 'none';
        gradeInputContainer.style.display = 'block';
        
        // Create and append the grade dropdown dynamically
        const gradeDropdown = createGradeDropdown();
        gradeDropdown.onchange = () => calculateSGPA(1);
        gradeInputContainer.appendChild(gradeDropdown);
    }
}

// SGPA calculation logic
function calculateSGPA(semester) {
    const rows = document.querySelectorAll(`#semester${semester} tr`);
    let totalCredits = 0;
    let totalPoints = 0;

    rows.forEach(row => {
        const credit = parseInt(row.cells[2].textContent);
        const typeSelect = row.cells[3].querySelector('.type-select');  // Marks or Grade
        const marksInput = row.cells[4].querySelector('.marks-input');
        const gradeInput = row.cells[4].querySelector('.grade-select');

        let gradePoint = 0;

        if (typeSelect.value === 'marks' && marksInput.value) {
            const marks = parseInt(marksInput.value);
            if (isNaN(marks) || marks < 0 || marks > 100) {
                marksInput.style.borderColor = 'red';
                return; // Skip invalid marks
            }
            marksInput.style.borderColor = '';
            gradePoint = gradePoints[getGrade(marks)];
        } else if (typeSelect.value === 'grade' && gradeInput.value) {
            gradePoint = gradePoints[gradeInput.value] || 0;
        }

        if (gradePoint >= 4) {  // Consider only valid grade points ( >= 4)
            totalCredits += credit;
            totalPoints += credit * gradePoint;
        }
    });

    const sgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    document.getElementById(`sgpa${semester}`).textContent = sgpa;

    // Recalculate CGPA after SGPA update
    calculateCGPA();
}


function getGrade(marks) {
    if (marks >= 93) return 'A+';
    if (marks >= 85) return 'A';
    if (marks >= 77) return 'B+';
    if (marks >= 69) return 'B';
    if (marks >= 61) return 'C+';
    if (marks >= 53) return 'C';
    if (marks >= 45) return 'D';
    return 'F';
}

function calculateCGPA() {
    let totalWeightedGradePoints = 0;
    let totalCredits = 0;

    // Iterate through all the 8 semesters to calculate weighted grade points and total credits
    const semesters = [1, 2, 3, 4, 5, 6, 7, 8]; // All 8 semesters
    semesters.forEach(semester => {
        const rows = document.querySelectorAll(`#semester${semester} tr`);
        let semesterTotalCredits = 0;
        let semesterTotalGradePoints = 0;
        
        // Check if SGPA for this semester has been calculated
        const sgpaText = document.getElementById(`sgpa${semester}`).textContent;
        if (sgpaText === "0.00") {
            return; // Skip this semester if SGPA is not calculated
        }

        rows.forEach(row => {
            const credit = parseInt(row.cells[2].textContent); // Get the credit
            const marksInput = row.querySelector('.marks-input');
            const gradeSelect = row.querySelector('.grade-select');
            let gradePoint = 0;

            if (marksInput && marksInput.value) {
                const marks = parseInt(marksInput.value);
                gradePoint = gradePoints[getGrade(marks)];  // Calculate grade point based on marks
            } else if (gradeSelect && gradeSelect.value) {
                gradePoint = gradePoints[gradeSelect.value] || 0;
            }

            // Consider only valid grades (grade point >= 4)
            if (gradePoint >= 4) {
                semesterTotalCredits += credit;
                semesterTotalGradePoints += credit * gradePoint;
            }
        });

        totalCredits += semesterTotalCredits;
        totalWeightedGradePoints += semesterTotalGradePoints;
    });

    // Calculate CGPA by dividing total weighted grade points by total credits
    const cgpa = totalCredits > 0 ? (totalWeightedGradePoints / totalCredits).toFixed(2) : "0.00";
    
    // Display CGPA
    document.getElementById('cgpa').textContent = cgpa;
}


  

