document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("signupForm");

    if (!form) return;


    const steps =
        document.querySelectorAll(".signup-step");

    const progressFill =
        document.getElementById("progressFill");

    const stepLabel =
        document.getElementById("stepLabel");

    const progressPercent =
        document.getElementById("progressPercent");

    const formError =
        document.getElementById("formError");


    let currentStep = 0;


    function showStep(index) {

        steps.forEach((step, i) => {

            step.classList.toggle(
                "active",
                i === index
            );

        });


        const stepNumber = index + 1;

        const percentage =
            Math.round(
                (stepNumber / steps.length) * 100
            );


        progressFill.style.width =
            percentage + "%";


        stepLabel.textContent =
            `Step ${stepNumber} of ${steps.length}`;


        progressPercent.textContent =
            percentage + "%";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    function validateStep() {

        const current =
            steps[currentStep];


        const requiredFields =
            current.querySelectorAll(
                "input[required], select[required]"
            );


        for (const field of requiredFields) {

            if (
                field.type === "checkbox" &&
                !field.checked
            ) {

                return false;

            }


            if (
                field.type === "radio"
            ) {

                const group =
                    current.querySelectorAll(
                        `input[name="${field.name}"]`
                    );

                const checked =
                    [...group].some(
                        radio => radio.checked
                    );

                if (!checked) {
                    return false;
                }

            }
            else if (
                !field.value.trim()
            ) {

                return false;

            }

        }


        return true;

    }


    document
        .querySelectorAll("[data-next]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    formError.hidden = true;


                    if (!validateStep()) {

                        alert(
                            "Please complete the required information before continuing."
                        );

                        return;

                    }


                    if (
                        currentStep <
                        steps.length - 1
                    ) {

                        currentStep++;

                        showStep(currentStep);

                    }

                }
            );

        });


    document
        .querySelectorAll("[data-back]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    formError.hidden = true;


                    if (currentStep > 0) {

                        currentStep--;

                        showStep(currentStep);

                    }

                }
            );

        });


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            formError.hidden = true;


            const password =
                document
                    .getElementById("password")
                    .value;

            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;

            const terms =
                document
                    .getElementById("terms")
                    .checked;


            if (password.length < 8) {

                formError.textContent =
                    "Your password must contain at least 8 characters.";

                formError.hidden = false;

                return;

            }


            if (password !== confirmPassword) {

                formError.textContent =
                    "Your passwords do not match.";

                formError.hidden = false;

                return;

            }


            if (!terms) {

                formError.textContent =
                    "Please accept the Terms of Use and Privacy Policy.";

                formError.hidden = false;

                return;

            }


            /*
             * Collect onboarding information.
             *
             * Temporary prototype storage.
             * Later this will be connected to
             * the real authentication/database.
             */

            const profile = {

                firstName:
                    document
                        .getElementById("firstName")
                        .value.trim(),

                middleName:
                    document
                        .getElementById("middleName")
                        .value.trim(),

                lastName:
                    document
                        .getElementById("lastName")
                        .value.trim(),

                lrn:
                    document
                        .getElementById("lrn")
                        .value.trim(),

                birthDate:
                    document
                        .getElementById("birthDate")
                        .value,

                gradeLevel:
                    document
                        .getElementById("gradeLevel")
                        .value,

                school:
                    document
                        .getElementById("school")
                        .value.trim(),

                interests:
                    [
                        ...document.querySelectorAll(
                            'input[name="interest"]:checked'
                        )
                    ].map(
                        input => input.value
                    ),

                location:
                    document.querySelector(
                        'input[name="location"]:checked'
                    )?.value || "",

                schoolType:
                    document.querySelector(
                        'input[name="schoolType"]:checked'
                    )?.value || "",

                priorities:
                    [
                        ...document.querySelectorAll(
                            'input[name="priority"]:checked'
                        )
                    ].map(
                        input => input.value
                    ),

                financialAid:
                    document
                        .getElementById("financialAid")
                        .value,

                email:
                    document
                        .getElementById("email")
                        .value.trim()

            };


            sessionStorage.setItem(
                "webennrollProfile",
                JSON.stringify(profile)
            );


            /*
             * Password is deliberately NOT stored
             * in sessionStorage.
             *
             * Real authentication will handle
             * password storage securely.
             */


            alert(
                "Your WebEnnroll profile is ready. Real account creation will be connected to the authentication backend next."
            );


            window.location.href =
                "colleges.html";

        }
    );


    showStep(0);

});