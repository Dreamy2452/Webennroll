/* =========================================
   WEBENNROLL
   Login Authentication
   Prototype Version
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        console.error("Login form not found.");
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

            const isPassword =
                passwordInput.type === "password";

            passwordInput.type =
                isPassword ? "text" : "password";

            togglePassword.textContent =
                isPassword ? "Hide" : "Show";

            togglePassword.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );

        });

    }


    /* =========================================
       LOGIN FORM
    ========================================= */

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        hideError();


        const email =
            emailInput.value.trim().toLowerCase();

        const password =
            passwordInput.value;


        /* =====================================
           BASIC VALIDATION
        ===================================== */

        if (!email) {

            showError(
                "Please enter your email address."
            );

            emailInput.focus();

            return;
        }


        if (!emailInput.checkValidity()) {

            showError(
                "Please enter a valid email address."
            );

            emailInput.focus();

            return;
        }


        if (!password) {

            showError(
                "Please enter your password."
            );

            passwordInput.focus();

            return;
        }


        /* =====================================
           GET SAVED ACCOUNT
        ===================================== */

        const savedAccount =
            localStorage.getItem(
                "webennrollAccount"
            );


        if (!savedAccount) {

            showError(
                "No WebEnnroll account was found. Please create an account first."
            );

            return;
        }


        let account;


        try {

            account =
                JSON.parse(savedAccount);

        } catch (error) {

            console.error(
                "Account data could not be read:",
                error
            );

            showError(
                "Your account data is corrupted. Please create your account again."
            );

            return;
        }


        /* =====================================
           EMAIL CHECK
        ===================================== */

        if (
            !account.email ||
            account.email.toLowerCase() !== email
        ) {

            showError(
                "The email address or password is incorrect."
            );

            return;
        }


        /* =====================================
           PASSWORD CHECK
        ===================================== */

        const passwordHash =
            await hashPassword(password);


        if (
            !account.passwordHash ||
            account.passwordHash !== passwordHash
        ) {

            showError(
                "The email address or password is incorrect."
            );

            return;
        }


        /* =====================================
           CREATE SESSION
        ===================================== */

        const session = {

            email: account.email,

            firstName:
                account.firstName || "",

            lastName:
                account.lastName || "",

            loggedIn: true,

            loginTime:
                new Date().toISOString()

        };


        if (rememberInput && rememberInput.checked) {

            localStorage.setItem(
                "webennrollSession",
                JSON.stringify(session)
            );

        } else {

            sessionStorage.setItem(
                "webennrollSession",
                JSON.stringify(session)
            );

        }


        localStorage.setItem(
            "webennrollLoggedIn",
            "true"
        );


        /* =====================================
           SUCCESS
        ===================================== */

        window.location.href =
            "Index.html";

    });


    /* =========================================
       CLEAR ERROR WHILE TYPING
    ========================================= */

    emailInput.addEventListener(
        "input",
        hideError
    );

    passwordInput.addEventListener(
        "input",
        hideError
    );


    /* =========================================
       ERROR FUNCTIONS
    ========================================= */

    function showError(message) {

        if (!loginError) {

            alert(message);

            return;
        }


        loginError.textContent =
            message;

        loginError.hidden = false;

        loginError.classList.add("show");

    }


    function hideError() {

        if (!loginError) {
            return;
        }


        loginError.textContent = "";

        loginError.hidden = true;

        loginError.classList.remove("show");

    }


    /* =========================================
       PASSWORD HASH
    ========================================= */

    async function hashPassword(password) {

        const encoder =
            new TextEncoder();

        const data =
            encoder.encode(password);

        const hashBuffer =
            await crypto.subtle.digest(
                "SHA-256",
                data
            );

        const hashArray =
            Array.from(
                new Uint8Array(hashBuffer)
            );

        return hashArray
            .map(
                byte =>
                    byte
                        .toString(16)
                        .padStart(2, "0")
            )
            .join("");

    }

});