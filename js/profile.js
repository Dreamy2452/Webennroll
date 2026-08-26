document.addEventListener('DOMContentLoaded', () => {
    // 1. Guard check: Dapat logged-in bago makapasok sa profile page
    if (!AuthController.requireAuth(['student', 'admin'])) return;

    const session = AuthController.getSession();
    
    // 2. I-populate ang user credentials sa UI
    if (session && session.profile) {
        const user = session.profile;
        const userEmail = user.email || 'N/A';
        const initial = userEmail.charAt(0).toUpperCase();

        document.getElementById('profile-id').textContent = user.id || 'STD-LOCAL';
        document.getElementById('profile-email').textContent = userEmail;
        document.getElementById('profile-name').textContent = userEmail.split('@')[0];
        document.getElementById('user-avatar').textContent = initial;
        document.getElementById('profile-role-badge').textContent = user.role.toUpperCase();
    }

    // 3. I-render ang listahan ng in-apply-an na mga college/program
    renderUserApplications();

    // 4. Logout Handler
    document.getElementById('btn-logout').addEventListener('click', () => {
        AuthController.clearSession();
        window.location.href = 'login.html';
    });
});

function renderUserApplications() {
    const listContainer = document.getElementById('user-applications-list');
    const session = AuthController.getSession();

    // Kunin ang lahat ng applications mula sa localStorage
    const allApplications = JSON.parse(localStorage.getItem('app_all_applications')) || [
        { id: 'APP-101', studentEmail: 'student@example.com', college: 'Department of Computer Science', status: 'Pending', date: '2026-02-15' },
        { id: 'APP-102', studentEmail: 'student@example.com', college: 'School of Business Analytics', status: 'Approved', date: '2026-02-14' }
    ];

    // I-filter lang ang applications ng kasalukuyang naka-login na user
    const myApps = allApplications.filter(app => 
        app.studentEmail === session.profile.email || app.studentName === session.profile.email
    );

    if (myApps.length === 0) {
        listContainer.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                    You have not submitted any enrollment applications yet.
                </td>
            </tr>
        `;
        return;
    }

    listContainer.innerHTML = myApps.map(app => `
        <tr>
            <td><strong>${AuthController.sanitizeInput(app.id)}</strong></td>
            <td>${AuthController.sanitizeInput(app.college)}</td>
            <td>${app.date || 'Recently'}</td>
            <td>
                <span class="status-badge ${app.status.toLowerCase()}">
                    ${AuthController.sanitizeInput(app.status)}
                </span>
            </td>
        </tr>
    `).join('');
}
