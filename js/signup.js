/* =========================================
   WEBENNROLL
   Signup / Onboarding System
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("signupForm");

    if (!form) {
        console.error("signupForm not found.");
        return;
    }


    /* =========================================
       SETTINGS
    ========================================= */

    const steps = Array.from(
        document.querySelectorAll(".signup-step")
    );

    const TOTAL_STEPS = steps.length;

    let currentStep = 1;


    /* =========================================
       ELEMENTS
    ========================================= */

    const nextButtons =
        document.querySelectorAll("[data-next]");

    const backButtons =
        document.querySelectorAll("[data-back]");

    const stepLabel =
        document.getElementById("stepLabel");

    const progressPercent =
        document.getElementById("progressPercent");

    const progressFill =
        document.getElementById("progressFill");

    const formError =
        document.getElementById("formError");


    /* =========================================
       INITIALIZE
    ========================================= */

    showStep(currentStep);


    /* =========================================
       NEXT
    ========================================= */

    nextButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const step =
                getCurrentStepElement();

            if (!step) {
                return;
            }


            if (!validateStep(step)) {
                return;
            }


            if (currentStep < TOTAL_STEPS) {

                currentStep++;

                showStep(currentStep);

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }

        });

    });


    /* =========================================
       BACK
    ========================================= */

    backButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            clearError();

            if (currentStep > 1) {

                currentStep--;

                showStep(currentStep);

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }

        });

    });


    /* =========================================
       SUBMIT / CREATE ACCOUNT
    ========================================= */

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        clearError();


        const step =
            getCurrentStepElement();


        if (!validateStep(step)) {
            return;
        }


        if (!validatePassword()) {
            return;
        }


        if (!validateTerms()) {
            return;
        }


        const account =
            await buildAccount();


        /*
         * Save account for prototype testing.
         *
         * IMPORTANT:
         * This is NOT production authentication.
         * We will replace this with Firebase
         * Authentication later.
         */

        localStorage.setItem(
            "webennrollAccount",
            JSON.stringify(account)
        );


        localStorage.setItem(
            "webennrollOnboardingComplete",
            "true"
        );


        /*
         * We do NOT automatically mark the user
         * as logged in here.
         *
         * They will be sent to login.html.
         */

        localStorage.removeItem(
            "webennrollLoggedIn"
        );


        /*
         * Redirect to Sign In.
         */

        window.location.href = "login.html";

    });


    /* =========================================
       SHOW STEP
    ========================================= */

    function showStep(stepNumber) {

        steps.forEach(function (step) {

            const number =
                Number(step.dataset.step);


            if (number === stepNumber) {

                step.classList.add("active");

                step.removeAttribute("hidden");

            } else {

                step.classList.remove("active");

                step.setAttribute("hidden", "");

            }

        });


        updateProgress(stepNumber);

        clearError();

    }


    /* =========================================
       CURRENT STEP
    ========================================= */

    function getCurrentStepElement() {

        return document.querySelector(
            `.signup-step[data-step="${currentStep}"]`
        );

    }


    /* =========================================
       PROGRESS
    ========================================= */

    function updateProgress(stepNumber) {

        const percentage =
            Math.round(
                (stepNumber / TOTAL_STEPS) * 100
            );


        if (stepLabel) {

            stepLabel.textContent =
                `Step ${stepNumber} of ${TOTAL_STEPS}`;

        }


        if (progressPercent) {

            progressPercent.textContent =
                `${percentage}%`;

        }


        if (progressFill) {

            progressFill.style.width =
                `${percentage}%`;

        }

    }


    /* =========================================
       VALIDATE STEP
    ========================================= */

    function validateStep(step) {

        if (!step) {
            return false;
        }


        clearError();


        const stepNumber =
            Number(step.dataset.step);


        /* -------------------------------------
           Browser validation
        ------------------------------------- */

        const fields =
            step.querySelectorAll(
                "input, select, textarea"
            );


        for (const field of fields) {

            /*
             * Radio buttons are handled separately.
             */

            if (field.type === "radio") {
                continue;
            }


            /*
             * Non-required unchecked checkboxes
             * are allowed.
             */

            if (
                field.type === "checkbox" &&
                !field.required
            ) {
                continue;
            }


            if (!field.checkValidity()) {

                field.reportValidity();

                field.focus();

                return false;

            }

        }


        /* -------------------------------------
           Step 1
        ------------------------------------- */

        if (stepNumber === 1) {

            const firstName =
                document.getElementById("firstName");

            const lastName =
                document.getElementById("lastName");


            if (
                !firstName ||
                firstName.value.trim().length < 2
            ) {

                showError(
                    "Please enter your first name."
                );

                if (firstName) {
                    firstName.focus();
                }

                return false;

            }


            if (
                !lastName ||
                lastName.value.trim().length < 2
            ) {

                showError(
                    "Please enter your last name."
                );

                if (lastName) {
                    lastName.focus();
                }

                return false;

            }

        }


        /* -------------------------------------
           Step 2
        ------------------------------------- */

        if (stepNumber === 2) {

            const lrn =
                document.getElementById("lrn");


            if (lrn) {

                const cleanLRN =
                    lrn.value
                        .replace(/\D/g, "")
                        .slice(0, 12);


                lrn.value =
                    cleanLRN;


                if (cleanLRN.length !== 12) {

                    showError(
                        "Your LRN must contain exactly 12 digits."
                    );

                    lrn.focus();

                    return false;

                }

            }

        }


        /* -------------------------------------
           Step 3
        ------------------------------------- */

        if (stepNumber === 3) {

            const interests =
                document.querySelectorAll(
                    'input[name="interest"]:checked'
                );


            if (interests.length === 0) {

                showError(
                    "Please select at least one field of interest."
                );

                return false;

            }

        }


        /* -------------------------------------
           Step 4
        ------------------------------------- */

        if (stepNumber === 4) {

            const location =
                document.querySelector(
                    'input[name="location"]:checked'
                );


            if (!location) {

                showError(
                    "Please select your preferred study location."
                );

                return false;

            }

        }


        /* -------------------------------------
           Step 5
        ------------------------------------- */

        if (stepNumber === 5) {

            const schoolType =
                document.querySelector(
                    'input[name="schoolType"]:checked'
                );


            if (!schoolType) {

                showError(
                    "Please select a school type preference."
                );

                return false;

            }

        }


        /* -------------------------------------
           Step 6
        ------------------------------------- */

        if (stepNumber === 6) {

            const priorities =
                document.querySelectorAll(
                    'input[name="priority"]:checked'
                );


            if (priorities.length === 0) {

                showError(
                    "Please select at least one priority."
                );

                return false;

            }


            const financialAid =
                document.getElementById(
                    "financialAid"
                );


            if (
                financialAid &&
                !financialAid.value
            ) {

                showError(
                    "Please select your financial assistance preference."
                );

                financialAid.focus();

                return false;

            }

        }


        /* -------------------------------------
           Step 7
        ------------------------------------- */

        if (stepNumber === 7) {

            const email =
                document.getElementById("email");


            if (
                !email ||
                !email.checkValidity()
            ) {

                showError(
                    "Please enter a valid email address."
                );

                if (email) {
                    email.focus();
                }

                return false;

            }

        }


        return true;

    }


    /* =========================================
       PASSWORD VALIDATION
    ========================================= */

    function validatePassword() {

        const password =
            document.getElementById("password");

        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            );


        if (!password || !confirmPassword) {

            showError(
                "Password fields are missing."
            );

            return false;

        }


        if (password.value.length < 8) {

            showError(
                "Your password must contain at least 8 characters."
            );

            password.focus();

            return false;

        }


        if (
            password.value !==
            confirmPassword.value
        ) {

            showError(
                "Your passwords do not match."
            );

            confirmPassword.focus();

            return false;

        }


        return true;

    }


    /* =========================================
       TERMS
    ========================================= */

    function validateTerms() {

        const terms =
            document.getElementById("terms");


        if (!terms) {

            showError(
                "Terms checkbox is missing."
            );

            return false;

        }


        if (!terms.checked) {

            showError(
                "Please agree to the terms before creating your account."
            );

            terms.focus();

            return false;

        }


        return true;

    }


    /* =========================================
       BUILD ACCOUNT OBJECT
    ========================================= */

    async function buildAccount() {

        const password =
            document.getElementById(
                "password"
            ).value;


        const account = {

            /* Student information */

            firstName:
                getValue("firstName"),

            middleName:
                getValue("middleName"),

            lastName:
                getValue("lastName"),

            lrn:
                getValue("lrn"),

            birthDate:
                getValue("birthDate"),

            gradeLevel:
                getValue("gradeLevel"),

            school:
                getValue("school"),


            /* Preferences */

            interests:
                getCheckedValues("interest"),

            location:
                getCheckedValue("location"),

            schoolType:
                getCheckedValue("schoolType"),

            priorities:
                getCheckedValues("priority"),

            financialAid:
                getValue("financialAid"),


            /* Account */

            email:
                getValue("email")
                    .toLowerCase(),


            /*
             * The password itself is NEVER stored.
             * Only a cryptographic hash is saved.
             */

            passwordHash:
                await hashPassword(password),


            /* Metadata */

            createdAt:
                new Date().toISOString(),

            profileComplete:
                true

        };


        return account;

    }


    /* =========================================
       SHA-256 PASSWORD HASH
    ========================================= */

    async function hashPassword(password) {

        const encoder =
            new TextEncoder();

        const data =
            encoder.encode(password);


        const buffer =
            await crypto.subtle.digest(
                "SHA-256",
                data
            );


        const bytes =
            Array.from(
                new Uint8Array(buffer)
            );


        return bytes
            .map(function (byte) {

                return byte
                    .toString(16)
                    .padStart(2, "0");

            })
            .join("");

    }


    /* =========================================
       GET VALUE
    ========================================= */

    function getValue(id) {

        const element =
            document.getElementById(id);


        if (!element) {
            return "";
        }


        return element.value.trim();

    }


    /* =========================================
       GET CHECKED VALUES
    ========================================= */

    function getCheckedValues(name) {

        return Array.from(
            document.querySelectorAll(
                `input[name="${name}"]:checked`
            )
        ).map(function (input) {

            return input.value;

        });

    }


    /* =========================================
       GET RADIO VALUE
    ========================================= */

    function getCheckedValue(name) {

        const selected =
            document.querySelector(
                `input[name="${name}"]:checked`
            );


        return selected
            ? selected.value
            : "";

    }


    /* =========================================
       SHOW ERROR
    ========================================= */

    function showError(message) {

        if (!formError) {

            alert(message);

            return;

        }


        formError.textContent =
            message;

        formError.hidden = false;

        formError.classList.add("show");


        formError.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }


    /* =========================================
       CLEAR ERROR
    ========================================= */

    function clearError() {

        if (!formError) {
            return;
        }


        formError.textContent = "";

        formError.hidden = true;

        formError.classList.remove("show");

    }


    /* =========================================
       LRN INPUT
    ========================================= */

    const lrnInput =
        document.getElementById("lrn");


    if (lrnInput) {

        lrnInput.addEventListener(
            "input",
            function () {

                this.value =
                    this.value
                        .replace(/\D/g, "")
                        .slice(0, 12);

            }
        );

    }


    /* =========================================
       CLEAR ERROR WHILE TYPING
    ========================================= */

    form.addEventListener(
        "input",
        function (event) {

            if (
                event.target.matches(
                    "input, select, textarea"
                )
            ) {

                clearError();

            }

        }
    );


    /* =========================================
       ENTER KEY
    ========================================= */

    form.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                event.target.tagName !== "TEXTAREA"
            ) {

                event.preventDefault();


                const step =
                    getCurrentStepElement();


                const nextButton =
                    step
                        ? step.querySelector(
                            "[data-next]"
                        )
                        : null;


                if (nextButton) {

                    nextButton.click();

                }

            }

        }
    );

});