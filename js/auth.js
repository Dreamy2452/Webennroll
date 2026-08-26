/* =========================================
   WEBENROLL
   Login Authentication & Session Handler
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberInput = document.getElementById("remember");
    const loginError = document.getElementById("loginError");
    const togglePassword = document.getElementById("togglePassword");

    /* =========================================
       PASSWORD VISIBILITY
    ========================================= */
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            togglePassword.textContent = isPassword ? "Hide" : "Show";
            togglePassword.setAttribute(
                "aria-label",
                isPassword ? "Hide password" : "Show password"
            );
        });
    }

    /* =========================================
       LOGIN FORM SUBMIT
    ========================================= */
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        hideError();

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        /* Basic Validation */
        if (!email) {
            showError("Please enter your email address.");
            emailInput.focus();
            return;
        }

        if (!emailInput.checkValidity()) {
            showError("Please enter a valid email address.");
            emailInput.focus();
            return;
        }

        if (!password) {
            showError("Please enter your password.");
            passwordInput.focus();
            return;
        }

        /* Get Saved Account */
        const savedAccount = localStorage.getItem("webennrollAccount");

        if (!savedAccount) {
            showError("No WebEnroll account was found. Please create an account first.");
            return;
        }

        let account;
        try {
            account = JSON.parse(savedAccount);
        } catch (error) {
            console.error("Account data could not be read:", error);
            showError("Your account data is corrupted. Please create your account again.");
            return;
        }

        /* Email Check */
        if (!account.email || account.email.toLowerCase() !== email) {
            showError("The email address or password is incorrect.");
            return;
        }

        /* Password Check */
        const passwordHash = await hashPassword(password);

        if (!account.passwordHash || account.passwordHash !== passwordHash) {
            showError("The email address or password is incorrect.");
            return;
        }

        /* Save Unified Session */
        const profileData = {
            email: account.email,
            firstName: account.firstName || "",
            lastName: account.lastName || "",
            role: "student"
        };

        const token = "session-token-" + Date.now();

        // I-save gamit ang AuthController
        AuthController.setSession(profileData, token, rememberInput && rememberInput.checked);

        /* Success Redirect */
        window.location.href = "Index.html";
    });

    /* Clear Error While Typing */
    if (emailInput) emailInput.addEventListener("input", hideError);
    if (passwordInput) passwordInput.addEventListener("input", hideError);

    /* Error Functions */
    function showError(message) {
        if (!loginError) {
            alert(message);
            return;
        }
        loginError.textContent = message;
        loginError.hidden = false;
        loginError.classList.add("show");
    }

    function hideError() {
        if (!loginError) return;
        loginError.textContent = "";
        loginError.hidden = true;
        loginError.classList.remove("show");
    }

    /* Password Hash Function */
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
    }
});

/* =========================================
   GLOBAL AUTH CONTROLLER (Para sa app.js)
========================================= */
const AuthController = {
    SESSION_KEY: 'webennrollSession',
    TOKEN_KEY: 'webennrollToken',

    getSession() {
        try {
            const sessionData = localStorage.getItem(this.SESSION_KEY) || sessionStorage.getItem(this.SESSION_KEY);
            return sessionData ? JSON.parse(sessionData) : null;
        } catch (e) {
            console.error('Error reading session:', e);
            return null;
        }
    },

    setSession(profile, token, remember = true) {
        try {
            const sessionObj = {
                profile: profile,
                loggedInAt: new Date().toISOString()
            };

            const storage = remember ? localStorage : sessionStorage;
            storage.setItem(this.SESSION_KEY, JSON.stringify(sessionObj));
            
            if (token) {
                storage.setItem(this.TOKEN_KEY, token);
            }
            return true;
        } catch (e) {
            console.error('Error saving session:', e);
            return false;
        }
    },

    clearSession() {
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.SESSION_KEY);
        sessionStorage.removeItem(this.TOKEN_KEY);
        window.location.href = 'Index.html';
    }
};
