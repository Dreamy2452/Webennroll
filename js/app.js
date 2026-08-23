/* =========================================
   WEBENNROLL
   Main JavaScript
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const menuButton = document.getElementById("menuButton");
    const closeButton = document.getElementById("closeButton");
    const mobileMenu = document.getElementById("mobileMenu");

    if (!menuButton || !closeButton || !mobileMenu) {
        return;
    }


    /* =========================================
       OPEN MENU
    ========================================= */

    function openMenu() {

        mobileMenu.classList.add("open");

        document.body.classList.add("menu-open");

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        mobileMenu.setAttribute(
            "aria-hidden",
            "false"
        );
    }


    /* =========================================
       CLOSE MENU
    ========================================= */

    function closeMenu() {

        mobileMenu.classList.remove("open");

        document.body.classList.remove("menu-open");

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        mobileMenu.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    /* =========================================
       MENU BUTTON
    ========================================= */

    menuButton.addEventListener(
        "click",
        openMenu
    );


    /* =========================================
       CLOSE BUTTON
    ========================================= */

    closeButton.addEventListener(
        "click",
        closeMenu
    );


    /* =========================================
       CLOSE WHEN CLICKING A MENU LINK
    ========================================= */

    const menuLinks =
        mobileMenu.querySelectorAll("a");

    menuLinks.forEach((link) => {

        link.addEventListener(
            "click",
            () => {

                closeMenu();

            }
        );

    });


    /* =========================================
       ESC KEY
    ========================================= */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                mobileMenu.classList.contains("open")
            ) {

                closeMenu();

            }

        }
    );


    /* =========================================
       RESET MENU WHEN RESIZING
    ========================================= */

    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth > 900) {
                closeMenu();
            }

        }
    );

});