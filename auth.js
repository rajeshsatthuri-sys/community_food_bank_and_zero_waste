// ===============================
// GREENSHARE AUTHENTICATION
// ===============================


// ---------- PASSWORD VISIBILITY ----------

function togglePassword(id) {

    const input = document.getElementById(id);

    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}


// ---------- REGISTER PAGE ----------

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    const roles = document.querySelectorAll(
        'input[name="role"]'
    );

    const farmerInformation =
        document.getElementById("farmerInformation");


    function updateRoleFields() {

        const selectedRole =
            document.querySelector(
                'input[name="role"]:checked'
            );

        if (!selectedRole) return;

        if (selectedRole.value === "farmer") {

            farmerInformation.style.display = "block";

        } else {

            farmerInformation.style.display = "none";

        }
    }


    roles.forEach(function(role) {

        role.addEventListener(
            "change",
            updateRoleFields
        );

    });


    updateRoleFields();


    registerForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document.getElementById("name").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const phone =
                document.getElementById("phone").value.trim();

            const location =
                document.getElementById("location").value.trim();

            const password =
                document.getElementById("password").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;

            const terms =
                document.getElementById("terms").checked;

            const role =
                document.querySelector(
                    'input[name="role"]:checked'
                ).value;


            const message =
                document.getElementById("registerMessage");


            // ---------- VALIDATION ----------

            if (name.length < 3) {

                showMessage(
                    message,
                    "Please enter your full name.",
                    "error"
                );

                return;
            }


            if (!isValidEmail(email)) {

                showMessage(
                    message,
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            if (phone.replace(/\D/g, "").length < 10) {

                showMessage(
                    message,
                    "Please enter a valid phone number.",
                    "error"
                );

                return;
            }


            if (password.length < 8) {

                showMessage(
                    message,
                    "Password must contain at least 8 characters.",
                    "error"
                );

                return;
            }


            if (password !== confirmPassword) {

                showMessage(
                    message,
                    "Passwords do not match.",
                    "error"
                );

                return;
            }


            if (!terms) {

                showMessage(
                    message,
                    "Please accept the Terms & Conditions.",
                    "error"
                );

                return;
            }


            // ---------- FARMER DATA ----------

            let farmerData = {};

            if (role === "farmer") {

                farmerData = {

                    farmName:
                        document.getElementById("farmName").value.trim(),

                    crop:
                        document.getElementById("crop").value

                };

            }


            // ---------- USER OBJECT ----------

            const user = {

                name: name,

                email: email,

                phone: phone,

                location: location,

                role: role,

                ...farmerData

            };


            // ---------- SAVE USER ----------

            localStorage.setItem(
                "greenShareUser",
                JSON.stringify(user)
            );


            localStorage.setItem(
                "greenSharePassword",
                password
            );


            showMessage(
                message,
                "Account created successfully! Redirecting...",
                "success"
            );


            setTimeout(function() {

                window.location.href =
                    "login.html";

            }, 1200);

        }
    );

}


// ---------- LOGIN PAGE ----------

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            const savedUser =
                localStorage.getItem(
                    "greenShareUser"
                );

            const savedPassword =
                localStorage.getItem(
                    "greenSharePassword"
                );


            if (!savedUser || !savedPassword) {

                showMessage(
                    message,
                    "No account found. Please register first.",
                    "error"
                );

                return;
            }


            const user =
                JSON.parse(savedUser);


            if (
                email === user.email &&
                password === savedPassword
            ) {

                localStorage.setItem(
                    "greenShareLoggedIn",
                    "true"
                );


                showMessage(
                    message,
                    "Login successful! Redirecting...",
                    "success"
                );


                setTimeout(function() {

                    if (user.role === "farmer") {

                        window.location.href =
                            "agriculture.html";

                    } else {

                        window.location.href =
                            "index.html";

                    }

                }, 1000);


            } else {

                showMessage(
                    message,
                    "Incorrect email or password.",
                    "error"
                );

            }

        }
    );

}


// ---------- HELPERS ----------

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


function showMessage(
    element,
    text,
    type
) {

    if (!element) return;

    element.textContent = text;

    element.className =
        "message " + type;

}