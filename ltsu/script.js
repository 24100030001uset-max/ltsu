let studentsData = [];

async function loadStudentData() {
    try {
        const data = await fetch('data_of_student.txt').then(r => r.json());
        studentsData = data.data || [];
    } catch (error) {
        studentsData = [];
    }
}

async function initializeApp() {
    await loadStudentData();
    await new Promise(resolve => setTimeout(resolve, 2000));
}

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const rollNoInput = document.getElementById('rollNoInput');
    const emailInput = document.getElementById('emailInput');
    const filterSearchBtn = document.getElementById('filterSearchBtn');
    const suggestions = document.getElementById('searchSuggestions');
    
    searchInput.addEventListener('input', handleInputChange);
    searchBtn.addEventListener('click', performCombinedSearch);
    rollNoInput.addEventListener('input', performCombinedSearch);
    emailInput.addEventListener('input', performCombinedSearch);
    filterSearchBtn.addEventListener('click', performCombinedSearch);
    
    [searchInput, rollNoInput, emailInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performCombinedSearch();
        });
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-section')) suggestions.classList.remove('show');
    });
});

function handleInputChange(e) {
    const query = e.target.value.trim().toLowerCase();
    const suggestions = document.getElementById('searchSuggestions');
    
    if (query.length < 2) {
        suggestions.classList.remove('show');
        return;
    }
    
    const matches = studentsData.filter(s => s.name && s.name.toLowerCase().includes(query)).slice(0, 10);
    if (matches.length > 0) displaySuggestions(matches);
    else suggestions.classList.remove('show');
}

function displaySuggestions(students) {
    const suggestions = document.getElementById('searchSuggestions');
    suggestions.innerHTML = students.map(s => 
        `<div class="suggestion-item" onclick="selectStudent('${s.name.replace(/'/g, "\\'")}')">
            ${s.name} - ${s.user_id || 'N/A'}
        </div>`
    ).join('');
    suggestions.classList.add('show');
}

function selectStudent(name) {
    document.getElementById('searchInput').value = name;
    document.getElementById('searchSuggestions').classList.remove('show');
    performSearch();
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const results = document.getElementById('results');
    
    if (!query) {
        results.innerHTML = '';
        return;
    }
    
    // Show loading
    results.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Searching...</p>
        </div>
    `;
    
    // Simulate slight delay for better UX
    setTimeout(() => {
        const matches = studentsData.filter(student => 
            student.name && student.name.toLowerCase().includes(query)
        );
        
        displayResults(matches, query);
    }, 300);
}

function performCombinedSearch() {
    const name = document.getElementById('searchInput').value.trim().toLowerCase();
    const rollNo = document.getElementById('rollNoInput').value.trim().toLowerCase();
    const emailPhone = document.getElementById('emailInput').value.trim().toLowerCase();
    const results = document.getElementById('results');
    
    if (!name && !rollNo && !emailPhone) {
        results.innerHTML = '';
        return;
    }
    
    results.innerHTML = '<div class="loading"><div class="spinner"></div><p>Searching...</p></div>';
    
    setTimeout(() => {
        const localMatches = studentsData.filter(s => {
            const nameMatch = !name || (s.name && s.name.toLowerCase().includes(name));
            const rollMatch = !rollNo || (s.user_id && s.user_id.toLowerCase().includes(rollNo)) || (s.id && s.id.toString().includes(rollNo));
            const emailMatch = !emailPhone || (s.email && s.email.toLowerCase().includes(emailPhone)) || (s.phone && s.phone.toLowerCase().includes(emailPhone));
            return nameMatch && rollMatch && emailMatch;
        });
        
        const sessionMatches = hrData.studentSessions.filter(s => {
            const sName = s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim().toLowerCase();
            const nameMatch = !name || sName.includes(name);
            const rollMatch = !rollNo || (s.user_id && s.user_id.toLowerCase().includes(rollNo)) || (s.roll_no && s.roll_no.toLowerCase().includes(rollNo));
            const emailMatch = !emailPhone || (s.email && s.email.toLowerCase().includes(emailPhone)) || (s.phone && s.phone.toLowerCase().includes(emailPhone));
            return nameMatch && rollMatch && emailMatch;
        });
        
        displayCombinedResults(localMatches, sessionMatches, name, rollNo, emailPhone);
    }, 300);
}

function displayResults(students, query) {
    const results = document.getElementById('results');
    if (students.length === 0) {
        results.innerHTML = `<div class="no-results"><h2>No Results Found</h2><p>No students matching "${query}"</p></div>`;
        return;
    }
    results.innerHTML = students.map(s => createStudentCard(s)).join('');
}

function displayCombinedResults(localMatches, sessionMatches, name, rollNo, emailPhone) {
    const results = document.getElementById('results');
    
    if (localMatches.length === 0 && sessionMatches.length === 0) {
        const terms = [name && `"${name}"`, rollNo && `"${rollNo}"`, emailPhone && `"${emailPhone}"`].filter(Boolean);
        results.innerHTML = `<div class="no-results"><h2>No Results Found</h2><p>No matches for ${terms.join(', ')}</p></div>`;
        return;
    }
    
    let output = '';
    if (localMatches.length > 0) {
        output += `<div style="border-bottom: 3px solid #667eea; margin-bottom: 30px; padding-bottom: 20px;"><h3 style="text-align: center; color: #667eea; margin-top: 0;">Local Student Records (${localMatches.length})</h3></div>`;
        output += localMatches.map(s => createStudentCard(s)).join('');
    }
    
    if (sessionMatches.length > 0) {
        output += `<div style="border-bottom: 3px solid #12b886; margin: 30px 0 20px 0; padding-bottom: 20px;"><h3 style="text-align: center; color: #12b886; margin-top: 0;">Student Session Records (${sessionMatches.length})</h3></div>`;
        output += sessionMatches.map(s => createStudentSessionCard(s)).join('');
    }
    
    if (name && typeof searchEmployee === 'function') {
        const employees = searchEmployee(name);
        if (employees.length > 0) {
            output += `<div style="border-top: 3px solid #ff6b6b; margin: 30px 0 20px 0; padding-top: 20px;"><h3 style="text-align: center; color: #ff6b6b;">HR/Staff Results (${employees.length})</h3></div>`;
            output += employees.map(e => createEmployeeCard(e)).join('');
        }
    }
    
    results.innerHTML = output;
}

function createStudentCard(student) {
    const statusClass = student.status === 'ACTIVE' ? 'status-active' : 'status-inactive';
    const dob = student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A';
    const joiningDate = student.joining_date ? new Date(student.joining_date).toLocaleDateString() : 'N/A';
    
    return `
        <div class="student-card">
            <div class="student-header">
                <h2 class="student-name">
                    ${student.name || 'N/A'}
                    <span class="status-badge ${statusClass}">${student.status || 'Unknown'}</span>
                </h2>
                <p class="student-id">User ID: ${student.user_id || 'N/A'} | Student ID: ${student.id || 'N/A'}</p>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${student.email || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Phone</div>
                    <div class="info-value">${student.phone || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Gender</div>
                    <div class="info-value">${student.gender || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Date of Birth</div>
                    <div class="info-value">${dob}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Father's Name</div>
                    <div class="info-value">${student.father_name || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Mother's Name</div>
                    <div class="info-value">${student.mother_name || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Address</div>
                    <div class="info-value">${student.address || student.current_address || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Aadhar Number</div>
                    <div class="info-value">${student.aadhar_number || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Religion</div>
                    <div class="info-value">${student.religion || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Nationality</div>
                    <div class="info-value">${student.nationality || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Joining Date</div>
                    <div class="info-value">${joiningDate}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Year of Admission</div>
                    <div class="info-value">${student.year_of_admission || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Admission Type</div>
                    <div class="info-value">${student.admission_type || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Application Status</div>
                    <div class="info-value">${student.application_status || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Current Year</div>
                    <div class="info-value">${student.current_year || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Current Semester</div>
                    <div class="info-value">${student.current_semester || 'N/A'}</div>
                </div>
            </div>
        </div>
    `;
}

function showError(message) {
    const results = document.getElementById('results');
    results.innerHTML = `
        <div class="no-results">
            <h2>Error</h2>
            <p>${message}</p>
        </div>
    `;
}
