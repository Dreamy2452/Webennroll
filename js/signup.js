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

    const TOTAL_STEPS = 7;

    let currentStep = 1;


    /* =========================================
       ELEMENTS
    ========================================= */

    const steps = Array.from(
        document.querySelectorAll(".signup-step")
    );

    const nextButtons = document.querySelectorAll("[data-next]");
    const backButtons = document.querySelectorAll("[data-back]");

    const stepLabel = document.getElementById("stepLabel");
    const progressPercent = document.getElementById("progressPercent");
    const progressFill = document.getElementById("progressFill");

    const formError = document.getElementById("formError");


    /* =========================================
       INITIALIZE
    ========================================= */

    showStep(currentStep);


    /* =========================================
       NEXT BUTTONS
    ========================================= */

    nextButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const activeStep = document.querySelector(
                `.signup-step[data-step="${currentStep}"]`
            );

            if (!activeStep) {
                return;
            }


            // Validate current step
            if (!validateStep(activeStep)) {
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
       BACK BUTTONS
    ========================================= */

    backButtons.forEach(function (button) {

        button.addEventListener("click", function () {

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
       FORM SUBMIT
    ========================================= */

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        clearError();


        const activeStep = document.querySelector(
            `.signup-step[data-step="${currentStep}"]`
        );


        if (!validateStep(activeStep)) {
            return;
        }


        if (!validatePassword()) {
            return;
        }


        if (!validateTerms()) {
            return;
        }


        const userData = collectFormData();


        /*
         * For now, save the account locally.
         *
         * IMPORTANT:
         * localStorage is only for prototype/testing.
         * It should NOT be used as the real production
         * authentication system.
         */

        localStorage.setItem(
            "webennrollUser",
            JSON.stringify(userData)
        );


        localStorage.setItem(
            "webennrollLoggedIn",
            "true"
        );


        /*
         * Save onboarding completion.
         */

        localStorage.setItem(
            "webennrollOnboardingComplete",
            "true"
        );


        /*
         * Redirect to login/dashboard.
         *
         * Change this later when we connect Firebase
         * or another real authentication backend.
         */

        window.location.href = "login.html";

    });


    /* =========================================
       SHOW STEP
    ========================================= */

    function showStep(stepNumber) {

        steps.forEach(function (step) {

            const stepValue = Number(
                step.dataset.step
            );

            if (stepValue === stepNumber) {

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
       UPDATE PROGRESS
    ========================================= */

    function updateProgress(stepNumber) {

        const percentage = Math.round(
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


        /*
         * Browser validation
         */

        const inputs = step.querySelectorAll(
            "input, select, textarea"
        );


        for (const input of inputs) {

            /*
             * Skip unchecked checkboxes unless they
             * are required.
             */

            if (
                input.type === "checkbox" &&
                !input.required
            ) {
                continue;
            }


            /*
             * Radio buttons are handled separately.
             */

            if (input.type === "radio") {
                continue;
            }


            if (!input.checkValidity()) {

                input.reportValidity();

                input.focus();

                return false;

            }

        }


        /*
         * Required radio groups
         */

        const radioGroups = {};


        step.querySelectorAll(
            'input[type="radio"][required]'
        ).forEach(function (radio) {

            const name = radio.name;

            if (!radioGroups[name]) {
                radioGroups[name] = [];
            }

            radioGroups[name].push(radio);

        });


        for (const name in radioGroups) {

            const group = radioGroups[name];

            const selected = group.some(
                function (radio) {
                    return radio.checked;
                }
            );


            if (!selected) {

                showError(
                    "Please select an option before continuing."
                );

                group[0].focus();

                return false;

            }

        }


        /*
         * STEP 1
         */

        if (Number(step.dataset.step) === 1) {

            const firstName =
                document.getElementById("firstName");

            const lastName =
                document.getElementById("lastName");


            if (
                firstName &&
                firstName.value.trim().length < 2
            ) {

                showError(
                    "Please enter your first name."
                );

                firstName.focus();

                return false;

            }


            if (
                lastName &&
                lastName.value.trim().length < 2
            ) {

                showError(
                    "Please enter your last name."
                );

                lastName.focus();

                return false;

            }

        }


        /*
         * STEP 2
         */

        if (Number(step.dataset.step) === 2) {

            const lrn =
                document.getElementById("lrn");


            if (lrn) {

                const cleanLRN =
                    lrn.value.replace(/\D/g, "");


                if (cleanLRN.length !== 12) {

                    showError(
                        "Your LRN must contain exactly 12 digits."
                    );

                    lrn.focus();

                    return false;

                }


                /*
                 * Keep only numbers.
                 */

                lrn.value = cleanLRN;

            }

        }


        /*
         * STEP 3
         */

        if (Number(step.dataset.step) === 3) {

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


        /*
         * STEP 6
         */

        if (Number(step.dataset.step) === 6) {

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
            document.getElementById("confirmPassword");


        if (!password || !confirmPassword) {
            return false;
        }


        if (password.value.length < 8) {

            showError(
                "Your password must contain at least 8 characters."
            );

            password.focus();

            return false;

        }


        if (password.value !== confirmPassword.value) {

            showError(
                "Your passwords do not match."
            );

            confirmPassword.focus();

            return false;

        }


        return true;

    }


    /* =========================================
       TERMS VALIDATION
    ========================================= */

    function validateTerms() {

        const terms =
            document.getElementById("terms");


        if (!terms) {
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
       COLLECT FORM DATA
    ========================================= */

    function collectFormData() {

        const data = {};


        /*
         * Basic information
         */

        data.firstName =
            getValue("firstName");

        data.middleName =
            getValue("middleName");

        data.lastName =
            getValue("lastName");


        /*
         * Student information
         */

        data.lrn =
            getValue("lrn");

        data.birthDate =
            getValue("birthDate");

        data.gradeLevel =
            getValue("gradeLevel");

        data.school =
            getValue("school");


        /*
         * Interests
         */

        data.interests =
            getCheckedValues("interest");


        /*
         * Location
         */

        data.location =
            getCheckedValue("location");


        /*
         * School preference
         */

        data.schoolType =
            getCheckedValue("schoolType");


        /*
         * Priorities
         */

        data.priorities =
            getCheckedValues("priority");


        /*
         * Financial assistance
         */

        data.financialAid =
            getValue("financialAid");


        /*
         * Account
         */

        data.email =
            getValue("email");


        /*
         * NOTE:
         * Password is intentionally NOT stored in
         * localStorage.
         *
         * A real authentication backend should
         * securely handle passwords.
         */


        /*
         * Metadata
         */

        data.createdAt =
            new Date().toISOString();


        data.profileComplete =
            true;


        return data;

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
       GET CHECKED RADIO
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
       ERROR MESSAGE
    ========================================= */

    function showError(message) {

        if (!formError) {
            alert(message);
            return;
        }


        formError.textContent =
            message;

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

        formError.classList.remove("show");

    }


    /* =========================================
       INPUT CLEANUP
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
       CLEAR PASSWORD ERROR WHILE TYPING
    ========================================= */

    const passwordInputs =
        document.querySelectorAll(
            "#password, #confirmPassword"
        );


    passwordInputs.forEach(function (input) {

        input.addEventListener(
            "input",
            function () {

                if (formError) {
                    clearError();
                }

            }
        );

    });


    /* =========================================
       PREVENT ACCIDENTAL ENTER SUBMISSION
       ========================================= */

    form.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                event.target.tagName !== "TEXTAREA"
            ) {

                /*
                 * Prevent Enter from immediately
                 * submitting the entire form.
                 */

                event.preventDefault();

                const activeStep =
                    document.querySelector(
                        `.signup-step[data-step="${currentStep}"]`
                    );


                const nextButton =
                    activeStep
                        ? activeStep.querySelector("[data-next]")
                        : null;


                if (nextButton) {
                    nextButton.click();
                }

            }

        }
    );


});