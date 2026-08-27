/* =========================================
   WEBENROLL
   Main JavaScript & Navigation Logic
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const menuButton = document.getElementById("menuButton");
    const closeButton = document.getElementById("closeButton");
    const mobileMenu = document.getElementById("mobileMenu");

    /* =========================================
       GLOBAL BROKEN IMAGE FALLBACK
    ========================================= */
    document.addEventListener('error', function (event) {
        if (event.target.tagName && event.target.tagName.toLowerCase() === 'img') {
            event.target.src = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80';
        }
    }, true);

    /* =========================================
       OPEN MENU
    ========================================= */
    function openMenu() {
        if (!mobileMenu || !menuButton) return;
        mobileMenu.classList.add("open");
        document.body.classList.add("menu-open");
        menuButton.setAttribute("aria-expanded", "true");
        mobileMenu.setAttribute("aria-hidden", "false");
    }

    /* =========================================
       CLOSE MENU
    ========================================= */
    function closeMenu() {
        if (!mobileMenu || !menuButton) return;
        mobileMenu.classList.remove("open");
        document.body.classList.remove("menu-open");
        menuButton.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("aria-hidden", "true");
    }

    if (menuButton) menuButton.addEventListener("click", openMenu);
    if (closeButton) closeButton.addEventListener("click", closeMenu);

    if (mobileMenu) {
        const menuLinks = mobileMenu.querySelectorAll("a");
        menuLinks.forEach((link) => {
            link.addEventListener("click", closeMenu);
        });
    }

    /* =========================================
       ESC KEY & RESIZE
    ========================================= */
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && mobileMenu && mobileMenu.classList.contains("open")) {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeMenu();
        }
    });

    /* =========================================
       CHECK SESSION AND UPDATE UI
    ========================================= */
    checkAndUpdateAuthUI();
});

function checkAndUpdateAuthUI() {
    let sessionProfile = null;

    if (typeof AuthController !== 'undefined') {
        const session = AuthController.getSession();
        if (session && session.profile) {
            sessionProfile = session.profile;
        }
    } else {
        const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (localUser.email) {
            sessionProfile = localUser;
        }
    }

    if (sessionProfile) {
        // 1. Update Desktop Header Actions
        const headerActions = document.getElementById('headerActions');
        if (headerActions) {
            headerActions.innerHTML = `
                <a href="profile.html" class="primary-button small">My Profile</a>
            `;
        }

        // 2. Update Mobile Menu Links
        const mobileSignIn = document.getElementById('mobileSignIn');
        const mobileSignUp = document.getElementById('mobileSignUp');
        if (mobileSignIn) mobileSignIn.style.display = 'none';
        if (mobileSignUp) {
            mobileSignUp.href = 'profile.html';
            mobileSignUp.textContent = 'My Profile';
        }

        // 3. Update Hero Button ("Create an Account" -> "My Profile")
        const heroCta = document.getElementById('heroCta');
        if (heroCta) {
            heroCta.href = 'profile.html';
            heroCta.textContent = 'My Profile';
        }
    }
}
