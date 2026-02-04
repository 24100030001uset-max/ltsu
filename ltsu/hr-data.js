let hrData = {
    employees: [],
    colleges: [],
    programs: [],
    departments: [],
    studentSessions: []
};

async function loadHRData() {
    try {
        const response = await fetch('https://server.ltsu.in/api/hr/data/getall');
        const data = await response.json();
        if (data.success === false) return;
        hrData.programs = data.program || [];
        hrData.colleges = data.college || [];
        hrData.employees = data.staff || [];
        hrData.departments = data.department || [];
    } catch (error) {
        // Silent fail
    }
}

async function loadStudentSessions() {
    try {
        const response = await fetch('https://server.ltsu.in/api/student/session/all?college_id=1111000&department_id=18&class_id=47');
        const data = await response.json();
        if (data.success === false) return;
        hrData.studentSessions = Array.isArray(data) ? data : (data.data || data.students || []);
    } catch (error) {
        // Silent fail
    }
}

// Search functions
function searchEmployee(query) {
    if (!query || query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    return hrData.employees.filter(emp => 
        (emp.first_name && emp.first_name.toLowerCase().includes(lowerQuery)) ||
        (emp.last_name && emp.last_name.toLowerCase().includes(lowerQuery)) ||
        (emp.email && emp.email.toLowerCase().includes(lowerQuery)) ||
        (emp.phone && emp.phone.toLowerCase().includes(lowerQuery))
    ).slice(0, 5);
}

function getCollegeName(collegeId) {
    const college = hrData.colleges.find(c => c.id === collegeId);
    return college ? college.name : 'N/A';
}

function getProgramName(programId) {
    const program = hrData.programs.find(p => p.id === programId);
    return program ? program.name : 'N/A';
}

// Card display functions
function createEmployeeCard(employee) {
    const collegeName = getCollegeName(employee.college_id);
    const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
    
    return `
        <div class="employee-card" style="border-left: 4px solid #ff6b6b;">
            <div class="card-header" style="background: #ffe3e3;">
                <h3 style="color: #c92a2a; margin: 0;">👤 ${fullName}</h3>
                <p style="color: #666; margin: 5px 0 0 0; font-size: 0.9em;">Employee/Staff</p>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Employee ID</div>
                    <div class="info-value">${employee.user_id || 'N/A'}</div>
                </div>
                
                ${employee.email ? `
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value"><a href="mailto:${employee.email}" style="color: #667eea; text-decoration: none;">${employee.email}</a></div>
                </div>
                ` : ''}
                
                ${employee.phone ? `
                <div class="info-item">
                    <div class="info-label">Phone</div>
                    <div class="info-value"><a href="tel:${employee.phone}" style="color: #667eea; text-decoration: none;">${employee.phone}</a></div>
                </div>
                ` : ''}
                
                ${employee.role ? `
                <div class="info-item">
                    <div class="info-label">Role/Designation</div>
                    <div class="info-value">${employee.role}</div>
                </div>
                ` : ''}
                
                ${employee.department_id ? `
                <div class="info-item">
                    <div class="info-label">Department</div>
                    <div class="info-value">${employee.department_id}</div>
                </div>
                ` : ''}
                
                <div class="info-item">
                    <div class="info-label">College</div>
                    <div class="info-value">${collegeName}</div>
                </div>
                
                ${employee.employee_type ? `
                <div class="info-item">
                    <div class="info-label">Employment Type</div>
                    <div class="info-value">${employee.employee_type}</div>
                </div>
                ` : ''}
                
                ${employee.date_of_joining ? `
                <div class="info-item">
                    <div class="info-label">Date of Joining</div>
                    <div class="info-value">${new Date(employee.date_of_joining).toLocaleDateString()}</div>
                </div>
                ` : ''}
                
                ${employee.qualification ? `
                <div class="info-item">
                    <div class="info-label">Qualification</div>
                    <div class="info-value">${employee.qualification}</div>
                </div>
                ` : ''}
                
                ${employee.work_experience ? `
                <div class="info-item">
                    <div class="info-label">Work Experience</div>
                    <div class="info-value">${employee.work_experience}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Session search and filter
function searchStudentSession(query) {
    if (!query || query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    return hrData.studentSessions.filter(student => 
        (student.name && student.name.toLowerCase().includes(lowerQuery)) ||
        (student.first_name && student.first_name.toLowerCase().includes(lowerQuery)) ||
        (student.last_name && student.last_name.toLowerCase().includes(lowerQuery)) ||
        (student.roll_no && student.roll_no.toLowerCase().includes(lowerQuery)) ||
        (student.user_id && student.user_id.toLowerCase().includes(lowerQuery)) ||
        (student.email && student.email.toLowerCase().includes(lowerQuery))
    ).slice(0, 10);
}

function getAllStudentSessions() {
    return hrData.studentSessions;
}

function getStudentSessionsByCollege(collegeId) {
    return hrData.studentSessions.filter(s => s.college_id === collegeId);
}

function getStudentSessionsByDepartment(departmentId) {
    return hrData.studentSessions.filter(s => s.department_id === departmentId);
}

function getStudentSessionsByClass(classId) {
    return hrData.studentSessions.filter(s => s.class_id === classId);
}

function createStudentSessionCard(student) {
    const fullName = student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim();
    
    return `
        <div class="employee-card" style="border-left: 4px solid #12b886;">
            <div class="card-header" style="background: #d3f9d8;">
                <h3 style="color: #0b7285; margin: 0;">👨‍🎓 ${fullName}</h3>
                <p style="color: #666; margin: 5px 0 0 0; font-size: 0.9em;">Student Session Record</p>
            </div>
            
            <div class="info-grid">
                ${student.roll_no ? `
                <div class="info-item">
                    <div class="info-label">Roll No</div>
                    <div class="info-value">${student.roll_no}</div>
                </div>
                ` : ''}
                
                ${student.user_id ? `
                <div class="info-item">
                    <div class="info-label">User ID</div>
                    <div class="info-value">${student.user_id}</div>
                </div>
                ` : ''}
                
                ${student.email ? `
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value"><a href="mailto:${student.email}" style="color: #667eea; text-decoration: none;">${student.email}</a></div>
                </div>
                ` : ''}
                
                ${student.phone ? `
                <div class="info-item">
                    <div class="info-label">Phone</div>
                    <div class="info-value"><a href="tel:${student.phone}" style="color: #667eea; text-decoration: none;">${student.phone}</a></div>
                </div>
                ` : ''}
                
                ${student.college_id ? `
                <div class="info-item">
                    <div class="info-label">College ID</div>
                    <div class="info-value">${student.college_id}</div>
                </div>
                ` : ''}
                
                ${student.department_id ? `
                <div class="info-item">
                    <div class="info-label">Department ID</div>
                    <div class="info-value">${student.department_id}</div>
                </div>
                ` : ''}
                
                ${student.class_id ? `
                <div class="info-item">
                    <div class="info-label">Class ID</div>
                    <div class="info-value">${student.class_id}</div>
                </div>
                ` : ''}
                
                ${student.session ? `
                <div class="info-item">
                    <div class="info-label">Session</div>
                    <div class="info-value">${student.session}</div>
                </div>
                ` : ''}
                
                ${student.enrollment_date ? `
                <div class="info-item">
                    <div class="info-label">Enrollment Date</div>
                    <div class="info-value">${new Date(student.enrollment_date).toLocaleDateString()}</div>
                </div>
                ` : ''}
                
                ${student.status ? `
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value" style="background: ${student.status === 'active' ? '#d3f9d8' : '#ffe3e3'}; padding: 4px 8px; border-radius: 4px; color: ${student.status === 'active' ? '#0b7285' : '#c92a2a'};">${student.status}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    loadHRData();
    loadStudentSessions();
});
