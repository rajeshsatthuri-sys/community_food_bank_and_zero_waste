/* =========================================================
   GreenShare - Main JavaScript
   Food Donation + User Dashboard
   ========================================================= */

"use strict";

/* =========================================================
   1. GLOBAL HELPERS
   ========================================================= */

const STORAGE_KEYS = {
    users: "greenshare_users",
    currentUser: "greenshare_current_user",
    donations: "greenshare_donations"
};

function getData(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error("Storage read error:", error);
        return defaultValue;
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function generateId(prefix = "GS") {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function getElement(id) {
    return document.getElementById(id);
}

function showMessage(message, type = "success") {
    const oldMessage = document.querySelector(".gs-message");

    if (oldMessage) {
        oldMessage.remove();
    }

    const box = document.createElement("div");
    box.className = `gs-message alert alert-${type}`;
    box.style.position = "fixed";
    box.style.top = "20px";
    box.style.right = "20px";
    box.style.zIndex = "9999";
    box.style.maxWidth = "420px";
    box.style.boxShadow = "0 5px 20px rgba(0,0,0,0.15)";
    box.textContent = message;

    document.body.appendChild(box);

    setTimeout(() => {
        box.remove();
    }, 4000);
}

/* =========================================================
   2. CURRENT USER
   ========================================================= */

function getCurrentUser() {
    return getData(STORAGE_KEYS.currentUser, null);
}

function setCurrentUser(user) {
    localStorage.setItem(
        STORAGE_KEYS.currentUser,
        JSON.stringify(user)
    );
}

function logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.currentUser);

    showMessage("You have been logged out.", "success");

    setTimeout(() => {
        window.location.href = "login.html";
    }, 700);
}

/* =========================================================
   3. NAVIGATION
   ========================================================= */

function setupNavigation() {

    document.querySelectorAll("[data-logout]").forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            logoutUser();
        });
    });

    document.querySelectorAll(".logout-btn").forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            logoutUser();
        });
    });

    document.querySelectorAll("[data-register]").forEach(link => {
        link.addEventListener("click", function () {
            window.location.href = "register.html";
        });
    });

    document.querySelectorAll("[data-login]").forEach(link => {
        link.addEventListener("click", function () {
            window.location.href = "login.html";
        });
    });
}

/* =========================================================
   4. REGISTRATION
   ========================================================= */

function setupRegistration() {

    const form =
        getElement("registerForm") ||
        document.querySelector("form[data-form='register']");

    if (!form) return;

    const roleInputs = form.querySelectorAll(
        "input[name='role'], input[name='accountType']"
    );

    const farmerSection =
        getElement("farmerInformation") ||
        getElement("farmerInfo") ||
        document.querySelector(".farmer-information");

    function updateRoleFields() {

        let selectedRole = "";

        roleInputs.forEach(input => {
            if (input.checked) {
                selectedRole = input.value.toLowerCase();
            }
        });

        if (farmerSection) {
            if (selectedRole.includes("farmer")) {
                farmerSection.style.display = "block";
            } else {
                farmerSection.style.display = "none";
            }
        }
    }

    roleInputs.forEach(input => {
        input.addEventListener("change", updateRoleFields);
    });

    updateRoleFields();

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const nameInput =
            getElement("fullName") ||
            form.querySelector("input[name='fullName']");

        const emailInput =
            getElement("email") ||
            form.querySelector("input[name='email']");

        const phoneInput =
            getElement("phone") ||
            form.querySelector("input[name='phone']");

        const locationInput =
            getElement("location") ||
            form.querySelector("input[name='location']");

        const passwordInput =
            getElement("password") ||
            form.querySelector("input[name='password']");

        const confirmPasswordInput =
            getElement("confirmPassword") ||
            form.querySelector("input[name='confirmPassword']");

        if (!nameInput || !emailInput || !phoneInput ||
            !locationInput || !passwordInput ||
            !confirmPasswordInput) {

            showMessage(
                "Registration form fields are missing. Check the input IDs.",
                "danger"
            );

            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const phone = phoneInput.value.trim();
        const location = locationInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (name.length < 3) {
            showMessage("Please enter your full name.", "danger");
            nameInput.focus();
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage("Please enter a valid email address.", "danger");
            emailInput.focus();
            return;
        }

        const cleanPhone = phone.replace(/\s/g, "");

        if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
            showMessage(
                "Please enter a valid phone number.",
                "danger"
            );
            phoneInput.focus();
            return;
        }

        if (location.length < 2) {
            showMessage("Please enter your location.", "danger");
            locationInput.focus();
            return;
        }

        if (password.length < 8) {
            showMessage(
                "Password must contain at least 8 characters.",
                "danger"
            );
            passwordInput.focus();
            return;
        }

        if (password !== confirmPassword) {
            showMessage(
                "Password and confirm password do not match.",
                "danger"
            );
            confirmPasswordInput.focus();
            return;
        }

        let role = "Food Donor";

        roleInputs.forEach(input => {
            if (input.checked) {
                role = input.value;
            }
        });

        const users = getData(STORAGE_KEYS.users, []);

        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {
            showMessage(
                "An account with this email already exists.",
                "danger"
            );
            return;
        }

        const user = {
            id: generateId("USER"),
            name: name,
            email: email,
            phone: cleanPhone,
            location: location,
            password: password,
            role: role,
            createdAt: new Date().toISOString()
        };

        /* Farmer-specific information */

        if (role.toLowerCase().includes("farmer")) {

            const farmName =
                getElement("farmName")?.value.trim() || "";

            const crop =
                getElement("mainCrop")?.value || "";

            user.farmName = farmName;
            user.mainCrop = crop;
        }

        users.push(user);

        saveData(STORAGE_KEYS.users, users);

        setCurrentUser({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            role: user.role
        });

        showMessage(
            "Account created successfully!",
            "success"
        );

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);
    });
}

/* =========================================================
   5. LOGIN
   ========================================================= */

function setupLogin() {

    const form =
        getElement("loginForm") ||
        document.querySelector("form[data-form='login']");

    if (!form) return;

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const emailInput =
            getElement("email") ||
            form.querySelector("input[name='email']");

        const passwordInput =
            getElement("password") ||
            form.querySelector("input[name='password']");

        if (!emailInput || !passwordInput) {
            showMessage(
                "Login fields are missing.",
                "danger"
            );
            return;
        }

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        const users = getData(STORAGE_KEYS.users, []);

        const user = users.find(
            item =>
                item.email === email &&
                item.password === password
        );

        if (!user) {
            showMessage(
                "Invalid email or password.",
                "danger"
            );
            return;
        }

        setCurrentUser({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            role: user.role
        });

        showMessage(
            `Welcome back, ${user.name}!`,
            "success"
        );

        setTimeout(() => {

            const role = user.role.toLowerCase();

            if (role.includes("farmer")) {
                window.location.href =
                    "farmer-dashboard.html";
            }
            else if (role.includes("beneficiary")) {
                window.location.href =
                    "beneficiary-dashboard.html";
            }
            else {
                window.location.href =
                    "donor-dashboard.html";
            }

        }, 800);
    });
}

/* =========================================================
   6. DONATION FORM
   ========================================================= */

function setupDonationForm() {

    const form =
        getElement("donationForm") ||
        document.querySelector("form[data-form='donation']");

    if (!form) return;

    const availableUntil =
        getElement("availableUntil") ||
        form.querySelector(
            "input[name='availableUntil']"
        );

    const pickupAddress =
        getElement("pickupAddress") ||
        form.querySelector(
            "textarea[name='pickupAddress']"
        );

    const contactNumber =
        getElement("contactNumber") ||
        form.querySelector(
            "input[name='contactNumber']"
        );

    /* -----------------------------------------------------
       Automatically fill contact number from logged-in user
       ----------------------------------------------------- */

    const currentUser = getCurrentUser();

    if (
        currentUser &&
        currentUser.phone &&
        contactNumber &&
        !contactNumber.value
    ) {
        contactNumber.value = currentUser.phone;
    }

    /* -----------------------------------------------------
       IMPORTANT:
       Set minimum date/time for datetime-local
       ----------------------------------------------------- */

    if (availableUntil) {

        const now = new Date();

        now.setMinutes(
            now.getMinutes() - now.getTimezoneOffset()
        );

        const minDateTime =
            now.toISOString().slice(0, 16);

        availableUntil.min = minDateTime;

        /* Fix old invalid value */

        if (
            availableUntil.value &&
            !isValidDateTimeLocal(
                availableUntil.value
            )
        ) {
            availableUntil.value = "";
        }
    }

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        /* -------------------------------------------------
           Validate date/time
           ------------------------------------------------- */

        if (!availableUntil || !availableUntil.value) {

            showMessage(
                "Please select the date and time until the food is available.",
                "danger"
            );

            availableUntil?.focus();

            return;
        }

        if (
            !isValidDateTimeLocal(
                availableUntil.value
            )
        ) {

            showMessage(
                "Please enter a valid date and time.",
                "danger"
            );

            availableUntil.focus();

            return;
        }

        const selectedDate =
            new Date(availableUntil.value);

        const currentDate =
            new Date();

        if (selectedDate <= currentDate) {

            showMessage(
                "Available Until must be a future date and time.",
                "danger"
            );

            availableUntil.focus();

            return;
        }

        /* -------------------------------------------------
           Pickup address
           ------------------------------------------------- */

        if (
            pickupAddress &&
            pickupAddress.value.trim().length < 5
        ) {

            showMessage(
                "Please enter the complete pickup address.",
                "danger"
            );

            pickupAddress.focus();

            return;
        }

        /* -------------------------------------------------
           Contact number
           ------------------------------------------------- */

        if (contactNumber) {

            const phone =
                contactNumber.value
                    .trim()
                    .replace(/\s/g, "");

            if (!/^\+?[0-9]{10,15}$/.test(phone)) {

                showMessage(
                    "Please enter a valid contact number.",
                    "danger"
                );

                contactNumber.focus();

                return;
            }
        }

        /* -------------------------------------------------
           Food condition
           ------------------------------------------------- */

        const condition =
            form.querySelector(
                "input[name='foodCondition']:checked"
            );

        if (!condition) {

            showMessage(
                "Please select the food condition.",
                "danger"
            );

            return;
        }

        /* -------------------------------------------------
           Food name/type
           ------------------------------------------------- */

        const foodName =
            getElement("foodName") ||
            form.querySelector(
                "input[name='foodName']"
            );

        if (
            foodName &&
            foodName.value.trim() === ""
        ) {

            showMessage(
                "Please enter the food name.",
                "danger"
            );

            foodName.focus();

            return;
        }

        /* -------------------------------------------------
           Quantity
           ------------------------------------------------- */

        const quantity =
            getElement("quantity") ||
            form.querySelector(
                "input[name='quantity']"
            );

        if (
            quantity &&
            (
                quantity.value === "" ||
                Number(quantity.value) <= 0
            )
        ) {

            showMessage(
                "Please enter a valid food quantity.",
                "danger"
            );

            quantity.focus();

            return;
        }

        /* -------------------------------------------------
           Safety confirmation
           ------------------------------------------------- */

        const safetyCheckbox =
            getElement("foodSafety") ||
            form.querySelector(
                "input[name='foodSafety']"
            ) ||
            form.querySelector(
                "input[type='checkbox'][required]"
            );

        if (
            safetyCheckbox &&
            !safetyCheckbox.checked
        ) {

            showMessage(
                "Please confirm that the food is safe for donation.",
                "danger"
            );

            safetyCheckbox.focus();

            return;
        }

        /* -------------------------------------------------
           Save donation
           ------------------------------------------------- */

        const donations =
            getData(
                STORAGE_KEYS.donations,
                []
            );

        const donation = {

            id: generateId("DON"),

            donorId:
                currentUser?.id || "GUEST",

            donorName:
                currentUser?.name || "Food Donor",

            foodName:
                foodName?.value.trim() || "",

            quantity:
                quantity?.value || "",

            unit:
                getElement("quantityUnit")?.value ||
                "",

            foodCondition:
                condition.value,

            availableUntil:
                selectedDate.toISOString(),

            pickupAddress:
                pickupAddress?.value.trim() || "",

            contactNumber:
                contactNumber?.value.trim() || "",

            notes:
                getElement("additionalNotes")?.value.trim() ||
                "",

            status:
                "Available",

            createdAt:
                new Date().toISOString()
        };

        donations.push(donation);

        saveData(
            STORAGE_KEYS.donations,
            donations
        );

        showMessage(
            "🎉 Food donation submitted successfully!",
            "success"
        );

        /* -------------------------------------------------
           Reset form
           ------------------------------------------------- */

        form.reset();

        if (
            currentUser &&
            currentUser.phone &&
            contactNumber
        ) {
            contactNumber.value =
                currentUser.phone;
        }

        if (availableUntil) {
            availableUntil.value = "";
        }

        /* -------------------------------------------------
           Optional dashboard refresh
           ------------------------------------------------- */

        updateDonationStatistics();
        displayDonations();

    });
}

/* =========================================================
   7. DATETIME VALIDATION
   ========================================================= */

function isValidDateTimeLocal(value) {

    if (!value) return false;

    const date = new Date(value);

    return (
        !Number.isNaN(date.getTime()) &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
    );
}

/* =========================================================
   8. DONATION DISPLAY
   ========================================================= */

function displayDonations() {

    const container =
        getElement("donationList") ||
        document.querySelector(
            "[data-donation-list]"
        );

    if (!container) return;

    const donations =
        getData(
            STORAGE_KEYS.donations,
            []
        );

    const currentUser =
        getCurrentUser();

    let filteredDonations = donations;

    if (currentUser) {

        filteredDonations =
            donations.filter(
                donation =>
                    donation.donorId ===
                    currentUser.id
            );
    }

    if (filteredDonations.length === 0) {

        container.innerHTML = `
            <div class="alert alert-info">
                No food donations available yet.
            </div>
        `;

        return;
    }

    container.innerHTML =
        filteredDonations
            .map(donation => {

                const date =
                    new Date(
                        donation.availableUntil
                    );

                return `
                    <div class="card mb-3 shadow-sm">
                        <div class="card-body">

                            <div class="d-flex
                                        justify-content-between
                                        align-items-start
                                        flex-wrap">

                                <div>

                                    <h5 class="card-title">
                                        🍱
                                        ${escapeHTML(
                                            donation.foodName ||
                                            "Food Donation"
                                        )}
                                    </h5>

                                    <p class="mb-1">
                                        <strong>
                                            Quantity:
                                        </strong>
                                        ${escapeHTML(
                                            String(
                                                donation.quantity
                                            )
                                        )}
                                        ${escapeHTML(
                                            donation.unit
                                        )}
                                    </p>

                                    <p class="mb-1">
                                        <strong>
                                            Condition:
                                        </strong>
                                        ${escapeHTML(
                                            donation.foodCondition
                                        )}
                                    </p>

                                    <p class="mb-1">
                                        <strong>
                                            Available Until:
                                        </strong>
                                        ${date.toLocaleString()}
                                    </p>

                                    <p class="mb-1">
                                        <strong>
                                            Pickup:
                                        </strong>
                                        ${escapeHTML(
                                            donation.pickupAddress
                                        )}
                                    </p>

                                </div>

                                <span class="badge
                                             bg-success">
                                    ${escapeHTML(
                                        donation.status
                                    )}
                                </span>

                            </div>

                        </div>
                    </div>
                `;
            })
            .join("");
}

/* =========================================================
   9. DONATION STATISTICS
   ========================================================= */

function updateDonationStatistics() {

    const donations =
        getData(
            STORAGE_KEYS.donations,
            []
        );

    const currentUser =
        getCurrentUser();

    let userDonations = donations;

    if (currentUser) {

        userDonations =
            donations.filter(
                donation =>
                    donation.donorId ===
                    currentUser.id
            );
    }

    const total =
        userDonations.length;

    const available =
        userDonations.filter(
            donation =>
                donation.status ===
                "Available"
        ).length;

    const completed =
        userDonations.filter(
            donation =>
                donation.status ===
                "Completed"
        ).length;

    const totalElement =
        getElement("totalDonations");

    const availableElement =
        getElement("availableDonations");

    const completedElement =
        getElement("completedDonations");

    if (totalElement) {
        totalElement.textContent = total;
    }

    if (availableElement) {
        availableElement.textContent =
            available;
    }

    if (completedElement) {
        completedElement.textContent =
            completed;
    }
}

/* =========================================================
   10. PROFILE INFORMATION
   ========================================================= */

function loadUserInformation() {

    const user =
        getCurrentUser();

    if (!user) return;

    document
        .querySelectorAll("[data-user-name]")
        .forEach(element => {
            element.textContent =
                user.name;
        });

    document
        .querySelectorAll("[data-user-email]")
        .forEach(element => {
            element.textContent =
                user.email;
        });

    document
        .querySelectorAll("[data-user-phone]")
        .forEach(element => {
            element.textContent =
                user.phone;
        });

    document
        .querySelectorAll("[data-user-location]")
        .forEach(element => {
            element.textContent =
                user.location;
        });

    document
        .querySelectorAll("[data-user-role]")
        .forEach(element => {
            element.textContent =
                user.role;
        });
}

/* =========================================================
   11. PASSWORD SHOW / HIDE
   ========================================================= */

function setupPasswordToggle() {

    document
        .querySelectorAll("[data-password-toggle]")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const targetId =
                        this.getAttribute(
                            "data-password-toggle"
                        );

                    const password =
                        getElement(targetId);

                    if (!password) return;

                    if (
                        password.type ===
                        "password"
                    ) {

                        password.type =
                            "text";

                        this.textContent =
                            "🙈";

                    } else {

                        password.type =
                            "password";

                        this.textContent =
                            "👁️";
                    }
                }
            );
        });

    /* Common eye button implementation */

    document
        .querySelectorAll(
            ".toggle-password"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const input =
                        this.parentElement
                            ?.querySelector(
                                "input"
                            );

                    if (!input) return;

                    input.type =
                        input.type ===
                        "password"
                            ? "text"
                            : "password";
                }
            );
        });
}

/* =========================================================
   12. MOBILE NAVIGATION
   ========================================================= */

function setupMobileNavigation() {

    const toggle =
        getElement("menuToggle") ||
        document.querySelector(
            ".navbar-toggler"
        );

    const menu =
        getElement("mainNavbar") ||
        document.querySelector(
            ".navbar-collapse"
        );

    if (!toggle || !menu) return;

    toggle.addEventListener(
        "click",
        function () {

            menu.classList.toggle("show");

        }
    );
}

/* =========================================================
   13. SEARCH DONATIONS
   ========================================================= */

function setupDonationSearch() {

    const searchInput =
        getElement("donationSearch") ||
        document.querySelector(
            "[data-donation-search]"
        );

    if (!searchInput) return;

    searchInput.addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .trim()
                    .toLowerCase();

            const cards =
                document.querySelectorAll(
                    "[data-donation-card]"
                );

            cards.forEach(card => {

                const text =
                    card.textContent
                        .toLowerCase();

                card.style.display =
                    text.includes(search)
                        ? ""
                        : "none";
            });
        }
    );
}

/* =========================================================
   14. ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   15. DATE/TIME DEFAULT HELPER
   ========================================================= */

function setupDateTimeFields() {

    document
        .querySelectorAll(
            "input[type='datetime-local']"
        )
        .forEach(input => {

            const now =
                new Date();

            now.setMinutes(
                now.getMinutes() -
                now.getTimezoneOffset()
            );

            input.min =
                now.toISOString()
                    .slice(0, 16);
        });
}

/* =========================================================
   16. PREVENT OLD INVALID DATE VALUES
   ========================================================= */

function fixInvalidDateValues() {

    document
        .querySelectorAll(
            "input[type='datetime-local']"
        )
        .forEach(input => {

            if (
                input.value &&
                !isValidDateTimeLocal(
                    input.value
                )
            ) {

                input.value = "";
            }
        });
}

/* =========================================================
   17. ROLE PROTECTION
   ========================================================= */

function protectDashboard() {

    const currentUser =
        getCurrentUser();

    const path =
        window.location.pathname
            .toLowerCase();

    if (
        path.includes("donor-dashboard") &&
        !currentUser
    ) {

        window.location.href =
            "login.html";
    }

    if (
        path.includes("farmer-dashboard") &&
        !currentUser
    ) {

        window.location.href =
            "login.html";
    }

    if (
        path.includes("beneficiary-dashboard") &&
        !currentUser
    ) {

        window.location.href =
            "login.html";
    }
}

/* =========================================================
   18. BOOTSTRAP TOOLTIP
   ========================================================= */

function setupBootstrapFeatures() {

    if (
        typeof bootstrap !==
        "undefined"
    ) {

        const tooltipElements =
            document.querySelectorAll(
                '[data-bs-toggle="tooltip"]'
            );

        tooltipElements.forEach(
            element => {

                new bootstrap.Tooltip(
                    element
                );
            }
        );

        const popoverElements =
            document.querySelectorAll(
                '[data-bs-toggle="popover"]'
            );

        popoverElements.forEach(
            element => {

                new bootstrap.Popover(
                    element
                );
            }
        );
    }
}

/* =========================================================
   19. INITIALIZE APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "🌱 GreenShare application started."
        );

        setupNavigation();

        setupRegistration();

        setupLogin();

        setupDonationForm();

        displayDonations();

        updateDonationStatistics();

        loadUserInformation();

        setupPasswordToggle();

        setupMobileNavigation();

        setupDonationSearch();

        setupDateTimeFields();

        fixInvalidDateValues();

        protectDashboard();

        setupBootstrapFeatures();

    }
);