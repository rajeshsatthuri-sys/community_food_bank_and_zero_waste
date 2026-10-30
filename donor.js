// =====================================================
// GreenShare - Donor Dashboard
// donor.js
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("GreenShare donor.js loaded successfully");


    // =================================================
    // GET ELEMENTS
    // =================================================

    const form = document.getElementById("donationForm");

    const history =
        document.getElementById("donationHistory");

    const totalDonations =
        document.getElementById("totalDonations");

    const mealsDonated =
        document.getElementById("mealsDonated");

    const wasteReduced =
        document.getElementById("wasteReduced");

    const peopleHelped =
        document.getElementById("peopleHelped");

    const availableUntil =
        document.getElementById("availableUntil");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const successModalElement =
        document.getElementById("successModal");

    const successToastElement =
        document.getElementById("successToast");

    const toastMessage =
        document.getElementById("toastMessage");


    // =================================================
    // STORAGE KEY
    // =================================================

    const STORAGE_KEY = "greenShareDonations";


    // =================================================
    // LOAD DONATIONS
    // =================================================

    let donations = [];

    try {

        donations =
            JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            ) || [];

    } catch (error) {

        console.error(
            "Error loading donations:",
            error
        );

        donations = [];
    }


    // =================================================
    // SET MINIMUM DATE/TIME
    // =================================================

    function setMinimumDateTime() {

        if (!availableUntil) {
            return;
        }

        const now = new Date();

        const year =
            now.getFullYear();

        const month =
            String(now.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(now.getDate())
                .padStart(2, "0");

        const hours =
            String(now.getHours())
                .padStart(2, "0");

        const minutes =
            String(now.getMinutes())
                .padStart(2, "0");

        availableUntil.min =
            `${year}-${month}-${day}T${hours}:${minutes}`;
    }


    setMinimumDateTime();


    // =================================================
    // FORMAT DATE
    // =================================================

    function formatDate(value) {

        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    // =================================================
    // ESCAPE HTML
    // =================================================

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // =================================================
    // SHOW SUCCESS TOAST
    // =================================================

    function showSuccessToast(message) {

        console.log("Showing success notification");

        if (!successToastElement) {

            alert(message);

            return;
        }

        if (toastMessage) {
            toastMessage.textContent = message;
        }

        // Check Bootstrap
        if (
            typeof bootstrap !== "undefined" &&
            bootstrap.Toast
        ) {

            const toast =
                bootstrap.Toast.getOrCreateInstance(
                    successToastElement,
                    {
                        delay: 4000
                    }
                );

            toast.show();

        } else {

            // Fallback
            alert(message);

        }
    }


    // =================================================
    // SHOW SUCCESS MODAL
    // =================================================

    function showSuccessModal() {

        console.log("Showing success modal");

        if (!successModalElement) {

            alert(
                "Donation submitted successfully!"
            );

            return;
        }

        if (
            typeof bootstrap !== "undefined" &&
            bootstrap.Modal
        ) {

            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    successModalElement
                );

            modal.show();

        } else {

            alert(
                "Donation submitted successfully!"
            );

        }
    }


    // =================================================
    // UPDATE STATISTICS
    // =================================================

    function updateStatistics() {

        let meals = 0;

        let waste = 0;

        let people = 0;


        donations.forEach(function (donation) {

            const quantity =
                Number(donation.quantity) || 0;

            const unit =
                donation.quantityUnit;


            // Meals estimation

            if (unit === "kg") {

                meals +=
                    Math.round(quantity * 4);

            } else if (unit === "plates") {

                meals +=
                    Math.round(quantity);

            } else if (unit === "packets") {

                meals +=
                    Math.round(quantity);

            } else if (unit === "boxes") {

                meals +=
                    Math.round(quantity * 2);

            } else if (unit === "litres") {

                meals +=
                    Math.round(quantity * 3);

            }


            // Waste reduction

            if (unit === "kg") {

                waste += quantity;

            } else {

                waste += quantity * 0.25;

            }

        });


        people =
            Math.max(
                0,
                Math.round(meals * 0.7)
            );


        if (totalDonations) {

            totalDonations.textContent =
                donations.length;
        }


        if (mealsDonated) {

            mealsDonated.textContent =
                meals;
        }


        if (wasteReduced) {

            wasteReduced.textContent =
                waste.toFixed(1);
        }


        if (peopleHelped) {

            peopleHelped.textContent =
                people;
        }

    }


    // =================================================
    // DISPLAY HISTORY
    // =================================================

    function displayHistory() {

        if (!history) {
            return;
        }


        history.innerHTML = "";


        if (donations.length === 0) {

            history.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="text-center py-5">

                        <div style="font-size:50px;">
                            🍱
                        </div>

                        <h5 class="mt-2">
                            No donations yet
                        </h5>

                        <p class="text-muted mb-0">
                            Your submitted donations
                            will appear here.
                        </p>

                    </td>

                </tr>

            `;

            return;
        }


        donations
            .slice()
            .reverse()
            .forEach(function (donation) {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>

                        <strong>
                            ${escapeHTML(
                                donation.foodName
                            )}
                        </strong>

                        <br>

                        <small class="text-muted">
                            ${escapeHTML(
                                donation.foodCategory
                            )}
                        </small>

                    </td>


                    <td>

                        ${escapeHTML(
                            donation.quantity
                        )}

                        ${escapeHTML(
                            donation.quantityUnit
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            donation.foodCondition
                        )}

                    </td>


                    <td>

                        ${formatDate(
                            donation.availableUntil
                        )}

                    </td>


                    <td>

                        <span class="badge bg-success">
                            Published
                        </span>

                    </td>

                `;


                history.appendChild(row);

            });

    }


    // =================================================
    // FORM SUBMISSION
    // =================================================

    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                console.log(
                    "Donation form submitted"
                );


                // -----------------------------------------
                // BOOTSTRAP VALIDATION
                // -----------------------------------------

                if (!form.checkValidity()) {

                    event.stopPropagation();

                    form.classList.add(
                        "was-validated"
                    );

                    alert(
                        "Please complete all required fields."
                    );

                    return;
                }


                // -----------------------------------------
                // DATE VALIDATION
                // -----------------------------------------

                const dateValue =
                    availableUntil.value;


                const selectedDate =
                    new Date(dateValue);


                const currentDate =
                    new Date();


                if (
                    !dateValue ||
                    isNaN(selectedDate.getTime()) ||
                    selectedDate <= currentDate
                ) {

                    availableUntil.setCustomValidity(
                        "Please select a future date and time."
                    );

                    form.classList.add(
                        "was-validated"
                    );

                    alert(
                        "Please select a future date and time."
                    );

                    return;

                }


                availableUntil.setCustomValidity("");


                // -----------------------------------------
                // FOOD SAFETY
                // -----------------------------------------

                const safety =
                    document.getElementById(
                        "foodSafety"
                    );


                if (
                    !safety ||
                    !safety.checked
                ) {

                    form.classList.add(
                        "was-validated"
                    );

                    alert(
                        "Please confirm the food safety declaration."
                    );

                    return;
                }


                // -----------------------------------------
                // GET FOOD CONDITION
                // -----------------------------------------

                const condition =
                    document.querySelector(
                        'input[name="foodCondition"]:checked'
                    );


                const foodCondition =
                    condition
                        ? condition.value
                        : "Fresh";


                // -----------------------------------------
                // CREATE DONATION
                // -----------------------------------------

                const donation = {

                    id: Date.now(),

                    foodName:
                        document
                            .getElementById("foodName")
                            .value
                            .trim(),

                    foodCategory:
                        document
                            .getElementById("foodCategory")
                            .value,

                    quantity:
                        document
                            .getElementById("quantity")
                            .value,

                    quantityUnit:
                        document
                            .getElementById("quantityUnit")
                            .value,

                    foodCondition:
                        foodCondition,

                    foodDescription:
                        document
                            .getElementById("foodDescription")
                            .value
                            .trim(),

                    availableUntil:
                        dateValue,

                    pickupAddress:
                        document
                            .getElementById("pickupAddress")
                            .value
                            .trim(),

                    contactNumber:
                        document
                            .getElementById("contactNumber")
                            .value
                            .trim(),

                    donorName:
                        document
                            .getElementById("donorName")
                            .value
                            .trim(),

                    additionalNotes:
                        document
                            .getElementById("additionalNotes")
                            .value
                            .trim(),

                    status:
                        "Published",

                    createdAt:
                        new Date().toISOString()
                };


                // -----------------------------------------
                // SAVE
                // -----------------------------------------

                donations.push(donation);


                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(donations)
                );


                console.log(
                    "Donation saved:",
                    donation
                );


                // -----------------------------------------
                // UPDATE SCREEN
                // -----------------------------------------

                updateStatistics();

                displayHistory();


                // -----------------------------------------
                // RESET FORM
                // -----------------------------------------

                form.reset();

                form.classList.remove(
                    "was-validated"
                );


                // Set minimum again

                setMinimumDateTime();


                // -----------------------------------------
                // SUCCESS NOTIFICATION
                // -----------------------------------------

                showSuccessToast(
                    "🎉 Donation submitted successfully!"
                );


                // Show modal after small delay

                setTimeout(
                    function () {

                        showSuccessModal();

                    },
                    300
                );

            }
        );

    } else {

        console.error(
            "ERROR: donationForm not found."
        );

    }


    // =================================================
    // LOGOUT
    // =================================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            function () {

                const confirmLogout =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (confirmLogout) {

                    window.location.href =
                        "login.html";

                }

            }
        );

    }


    // =================================================
    // INITIALIZE
    // =================================================

    updateStatistics();

    displayHistory();


    console.log(
        "GreenShare Donor system initialized"
    );

});