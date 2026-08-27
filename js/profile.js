document.addEventListener('DOMContentLoaded', () => {
    // 1. Guard check: Dapat logged-in bago makapasok sa profile page
    if (typeof AuthController !== 'undefined' && !AuthController.requireAuth(['student', 'admin'])) return;

    loadUserProfile();
    renderUserApplications();

    // Logout Handler
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (typeof AuthController !== 'undefined') {
                AuthController.clearSession();
            } else {
                localStorage.removeItem('currentUser');
            }
            window.location.href = 'login.html';
        });
    }
});

function loadUserProfile() {
    let sessionUser = null;
    if (typeof AuthController !== 'undefined') {
        const session = AuthController.getSession();
        sessionUser = session ? session.profile : null;
    }

    const localUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    const user = sessionUser || localUser;

    const userEmail = user.email || 'student@example.com';
    const rawName = user.name || user.fullName || user.firstName || userEmail.split('@')[0];
    const initial = userEmail.charAt(0).toUpperCase();

    const profileId = document.getElementById('profile-id');
    const profileEmail = document.getElementById('profile-email');
    const profileName = document.getElementById('profile-name');
    const userAvatar = document.getElementById('user-avatar');
    const roleBadge = document.getElementById('profile-role-badge');

    if (profileId) profileId.textContent = user.id || 'STD-LOCAL';
    if (profileEmail) profileEmail.textContent = userEmail;
    if (profileName) profileName.textContent = rawName;
    if (userAvatar) userAvatar.textContent = initial;
    if (roleBadge) roleBadge.textContent = (user.role || 'STUDENT').toUpperCase();
}

function renderUserApplications() {
    const listContainer = document.getElementById('user-applications-list');
    if (!listContainer) return;

    let userEmail = 'student@example.com';
    if (typeof AuthController !== 'undefined') {
        const session = AuthController.getSession();
        if (session && session.profile) userEmail = session.profile.email;
    } else {
        const localUser = JSON.parse(localStorage.getItem('currentUser')) || {};
        userEmail = localUser.email || userEmail;
    }

    // Kunin ang lahat ng applications mula sa localStorage
    const allApplications = JSON.parse(localStorage.getItem('app_all_applications')) || [
        { id: 'APP-101', studentEmail: userEmail, college: 'Department of Computer Science', status: 'Pending', date: '2026-02-15' },
        { id: 'APP-102', studentEmail: userEmail, college: 'School of Business Analytics', status: 'Approved', date: '2026-02-14' }
    ];

    // I-filter lang ang applications ng kasalukuyang naka-login na user
    const myApps = allApplications.filter(app => 
        app.studentEmail === userEmail || app.studentName === userEmail
    );

    if (myApps.length === 0) {
        listContainer.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted, #64748b); padding: 1.5rem;">
                    You have not submitted any enrollment applications yet.
                </td>
            </tr>
        `;
        return;
    }

    const sanitize = (str) => (typeof AuthController !== 'undefined' ? AuthController.sanitizeInput(str) : str);

    listContainer.innerHTML = myApps.map(app => `
        <tr>
            <td><strong>${sanitize(app.id)}</strong></td>
            <td>${sanitize(app.college)}</td>
            <td>${app.date || 'Recently'}</td>
            <td>
                <span class="status-badge ${(app.status || 'pending').toLowerCase()}">
                    ${sanitize(app.status)}
                </span>
            </td>
        </tr>
    `).join('');
}
