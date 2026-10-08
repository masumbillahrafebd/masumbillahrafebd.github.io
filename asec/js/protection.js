(function () {
    "use strict";

    /* =========================================
       BASIC SOURCE / DEVTOOLS PROTECTION
       ========================================= */

    // Disable right-click
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    });

    // Disable common keyboard shortcuts
    document.addEventListener("keydown", function (e) {

        // F12
        if (e.key === "F12") {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl / Cmd shortcuts
        if (e.ctrlKey || e.metaKey) {

            // Ctrl + U
            if (e.key.toLowerCase() === "u") {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl + S
            if (e.key.toLowerCase() === "s") {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Ctrl + Shift shortcuts
            if (e.shiftKey) {

                // Ctrl + Shift + I
                if (e.key.toLowerCase() === "i") {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }

                // Ctrl + Shift + J
                if (e.key.toLowerCase() === "j") {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }

                // Ctrl + Shift + C
                if (e.key.toLowerCase() === "c") {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
        }
    });

    // Disable text selection
    document.addEventListener("selectstart", function (e) {
        e.preventDefault();
    });

    // Disable drag
    document.addEventListener("dragstart", function (e) {
        e.preventDefault();
    });

})();