/* header.js - adds the Login / Logout button to the shared header on pages that are
   plain .html (Resume, Feedback) so they match the Home page header exactly. */
(function () {
    function addAuthButton() {
        var links = document.querySelector(".cg-nav-links");
        if (!links || links.querySelector(".cg-auth-btn")) return;

        var a = document.createElement("a");
        a.className = "btn-login cg-auth-btn";
        a.href = "login.jsp";
        a.textContent = "Login";
        links.appendChild(a);

        fetch("session-status.jsp", { cache: "no-store", credentials: "same-origin" })
            .then(function (r) { return r.json(); })
            .then(function (s) {
                if (s && s.loggedIn) {
                    a.href = "logout.jsp";
                    a.textContent = "Logout";
                }
            })
            .catch(function () { /* keep the Login button */ });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", addAuthButton);
    } else {
        addAuthButton();
    }
})();
