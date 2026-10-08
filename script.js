// ==================== INITIALIZATION ====================
// Each feature is initialised on its own, so a failure in one place (for example the
// Lucide icon CDN being blocked or slow) can no longer stop the Explore button, the
// FAQ accordion or the menu from working.
function safeInit(fn) {
    try { fn(); } catch (err) { console.warn("Init skipped:", fn.name, err); }
}

document.addEventListener("DOMContentLoaded", function () {
    safeInit(function createIcons() {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
        }
    });
    safeInit(initNavbar);
    safeInit(initMobileMenu);
    safeInit(initExploreFeatures);
    safeInit(initFaq);
});

// ==================== NAVBAR ====================
function initNavbar() {
    const navbar = document.getElementById("navbar");
    const navLinks = document.querySelectorAll(".nav-link, .mobile-link");

    // Navbar scroll effect
    window.addEventListener("scroll", function () {
        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // Smooth scroll (only for # links)
    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            const target = this.getAttribute("href");

            if (target.startsWith("#")) {
                e.preventDefault();
                const section = document.querySelector(target);

                if (section) {
                    window.scrollTo({
                        top: section.offsetTop - 80,
                        behavior: "smooth"
                    });
                }
            }

            // Close mobile menu after click
            const mobileMenu = document.getElementById("mobileMenu");
            if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
                toggleMobileMenu();
            }
        });
    });
}

// ==================== MOBILE MENU ====================
function initMobileMenu() {
    const mobileBtn = document.getElementById("mobileMenuBtn");
    if (mobileBtn) {
        mobileBtn.addEventListener("click", toggleMobileMenu);
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById("mobileMenu");
    const menuIcon = document.querySelector(".menu-icon");
    const closeIcon = document.querySelector(".close-icon");

    mobileMenu.classList.toggle("hidden");
    menuIcon.classList.toggle("hidden");
    closeIcon.classList.toggle("hidden");
}

// ==================== ACTIVE NAV HIGHLIGHT ====================
window.addEventListener("scroll", function () {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    let current = "";

    sections.forEach(section => {
        const top = section.offsetTop - 100;
        const height = section.offsetHeight;

        if (window.scrollY >= top && window.scrollY < top + height) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }
    });
});

// ==================== EXPLORE FEATURES BUTTON ====================
// Smoothly scrolls to the Features section (#features) on this same page.
function initExploreFeatures() {
    const btn = document.getElementById("exploreFeaturesBtn");
    if (!btn) return;

    btn.addEventListener("click", function () {
        const features = document.getElementById("features");
        if (!features) return;
        const top = features.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top: top, behavior: "smooth" });
    });
}

// ==================== FAQ ACCORDION ====================
function initFaq() {
    const items = document.querySelectorAll(".faq-item");

    items.forEach(function (item) {
        const question = item.querySelector(".faq-question");
        if (!question) return;

        question.addEventListener("click", function () {
            const wasOpen = item.classList.contains("active");

            // keep one answer open at a time
            items.forEach(function (other) {
                other.classList.remove("active");
                const q = other.querySelector(".faq-question");
                if (q) q.setAttribute("aria-expanded", "false");
            });

            if (!wasOpen) {
                item.classList.add("active");
                question.setAttribute("aria-expanded", "true");
            }
        });
    });
}
