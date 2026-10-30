// =====================================================
// GreenShare - User Food Request & Tracking System
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =================================================
    // ELEMENTS
    // =================================================

    const foodContainer =
        document.getElementById("foodContainer");

    const noFoodMessage =
        document.getElementById("noFoodMessage");

    const searchFood =
        document.getElementById("searchFood");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const requestTable =
        document.getElementById("requestTable");

    const availableCount =
        document.getElementById("availableCount");

    const requestCount =
        document.getElementById("requestCount");

    const approvedCount =
        document.getElementById("approvedCount");

    const foodSaved =
        document.getElementById("foodSaved");

    const confirmRequestBtn =
        document.getElementById("confirmRequestBtn");

    const userName =
        document.getElementById("userName");

    const userPhone =
        document.getElementById("userPhone");

    const userAddress =
        document.getElementById("userAddress");

    const selectedFoodDetails =
        document.getElementById("selectedFoodDetails");

    const logoutBtn =
        document.getElementById("logoutBtn");


    // =================================================
    // LOAD DONATIONS
    // =================================================

    let donations =
        JSON.parse(
            localStorage.getItem("greenShareDonations")
        ) || [];


    // =================================================
    // LOAD REQUESTS
    // =================================================

    let requests =
        JSON.parse(
            localStorage.getItem("greenShareRequests")
        ) || [];


    // =================================================
    // SELECTED DONATION
    // =================================================

    let selectedDonationId = null;


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
    // FORMAT DATE
    // =================================================

    function formatDate(dateString) {

        if (!dateString) {
            return "Not specified";
        }

        const date =
            new Date(dateString);

        if (isNaN(date.getTime())) {
            return "Not specified";
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
    // FOOD ICON
    // =================================================

    function getFoodIcon(category) {

        switch (category) {

            case "Cooked Food":
                return "🍲";

            case "Fruits":
                return "🍎";

            case "Vegetables":
                return "🥦";

            case "Bakery":
                return "🍞";

            case "Packaged Food":
                return "📦";

            case "Groceries":
                return "🛒";

            default:
                return "🍱";
        }
    }


    // =================================================
    // CHECK DONATION EXPIRY
    // =================================================

    function isDonationAvailable(donation) {

        if (!donation.availableUntil) {
            return true;
        }

        const expiry =
            new Date(donation.availableUntil);

        return expiry > new Date();
    }


    // =================================================
    // GET AVAILABLE FOOD
    // =================================================

    function getAvailableDonations() {

        return donations.filter(function (donation) {

            /*
             * Published = available
             *
             * Requested = someone has requested it,
             * but donor may still be processing it.
             */

            return (
                (
                    donation.status === "Published" ||
                    donation.status === "Requested"
                ) &&
                isDonationAvailable(donation)
            );

        });

    }


    // =================================================
    // CHECK WHETHER FOOD ALREADY REQUESTED
    // =================================================

    function hasUserRequestedDonation(donationId) {

        return requests.some(function (request) {

            return (
                Number(request.donationId) ===
                Number(donationId) &&

                request.status !== "Rejected" &&

                request.status !== "Distributed"
            );

        });

    }


    // =================================================
    // DISPLAY FOOD
    // =================================================

    function displayFood() {

        if (!foodContainer) {
            return;
        }

        const search =
            searchFood
                ? searchFood.value
                    .trim()
                    .toLowerCase()
                : "";

        const category =
            categoryFilter
                ? categoryFilter.value
                : "all";


        const available =
            getAvailableDonations();


        const filtered =
            available.filter(function (donation) {

                const foodName =
                    String(
                        donation.foodName || ""
                    ).toLowerCase();


                const matchesSearch =
                    foodName.includes(search);


                const matchesCategory =
                    category === "all" ||
                    donation.foodCategory === category;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            });


        foodContainer.innerHTML = "";


        if (filtered.length === 0) {

            if (noFoodMessage) {

                noFoodMessage.classList.remove(
                    "d-none"
                );

            }

            return;
        }


        if (noFoodMessage) {

            noFoodMessage.classList.add(
                "d-none"
            );

        }


        // =================================================
        // CREATE FOOD CARDS
        // =================================================

        filtered.forEach(function (donation) {

            const card =
                document.createElement("div");

            card.className =
                "col-md-6 col-xl-4";


            const alreadyRequested =
                hasUserRequestedDonation(
                    donation.id
                );


            let buttonHTML = "";


            if (alreadyRequested) {

                buttonHTML = `

                    <button
                        class="btn btn-secondary w-100"
                        disabled>

                        <i class="bi bi-clock-history"></i>

                        Request Pending

                    </button>

                `;

            } else {

                buttonHTML = `

                    <button
                        class="btn btn-success request-btn w-100"
                        data-id="${escapeHTML(
                            donation.id
                        )}">

                        <i class="bi bi-heart"></i>

                        Request Food

                    </button>

                `;

            }


            card.innerHTML = `

                <div class="food-card">

                    <div class="food-card-top">

                        <div class="food-icon">

                            ${getFoodIcon(
                                donation.foodCategory
                            )}

                        </div>

                    </div>


                    <div class="food-card-body">

                        <div class="food-title">

                            ${escapeHTML(
                                donation.foodName
                            )}

                        </div>


                        <div class="food-category">

                            ${escapeHTML(
                                donation.foodCategory
                            )}

                        </div>


                        <div class="food-info">

                            <div>

                                <i class="bi bi-box-seam"></i>

                                <strong>
                                    Quantity:
                                </strong>

                                ${escapeHTML(
                                    donation.quantity
                                )}

                                ${escapeHTML(
                                    donation.quantityUnit
                                )}

                            </div>


                            <div>

                                <i class="bi bi-patch-check"></i>

                                <strong>
                                    Condition:
                                </strong>

                                ${escapeHTML(
                                    donation.foodCondition
                                )}

                            </div>


                            <div>

                                <i class="bi bi-clock"></i>

                                <strong>
                                    Until:
                                </strong>

                                ${formatDate(
                                    donation.availableUntil
                                )}

                            </div>


                            <div>

                                <i class="bi bi-geo-alt"></i>

                                <strong>
                                    Pickup:
                                </strong>

                                ${escapeHTML(
                                    donation.pickupAddress
                                )}

                            </div>

                        </div>


                        ${buttonHTML}

                    </div>

                </div>

            `;


            foodContainer.appendChild(card);

        });


        attachRequestButtons();

    }


    // =================================================
    // REQUEST BUTTONS
    // =================================================

    function attachRequestButtons() {

        document
            .querySelectorAll(".request-btn")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            Number(
                                button.dataset.id
                            );

                        openRequestModal(id);

                    }
                );

            });

    }


    // =================================================
    // OPEN REQUEST MODAL
    // =================================================

    function openRequestModal(id) {

        const donation =
            donations.find(function (item) {

                return Number(item.id) === id;

            });


        if (!donation) {

            showToast(
                "Food donation not found."
            );

            return;
        }


        selectedDonationId =
            id;


        if (selectedFoodDetails) {

            selectedFoodDetails.innerHTML = `

                <div class="alert alert-success">

                    <h5>

                        ${getFoodIcon(
                            donation.foodCategory
                        )}

                        ${escapeHTML(
                            donation.foodName
                        )}

                    </h5>


                    <p class="mb-1">

                        <strong>
                            Category:
                        </strong>

                        ${escapeHTML(
                            donation.foodCategory
                        )}

                    </p>


                    <p class="mb-1">

                        <strong>
                            Quantity:
                        </strong>

                        ${escapeHTML(
                            donation.quantity
                        )}

                        ${escapeHTML(
                            donation.quantityUnit
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
                            Pickup:
                        </strong>

                        ${escapeHTML(
                            donation.pickupAddress
                        )}

                    </p>


                    <p class="mb-0">

                        <strong>
                            Available Until:
                        </strong>

                        ${formatDate(
                            donation.availableUntil
                        )}

                    </p>

                </div>

            `;

        }


        const modalElement =
            document.getElementById(
                "requestModal"
            );


        if (!modalElement) {

            showToast(
                "Request modal is missing from user.html."
            );

            return;
        }


        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        modal.show();

    }


    // =================================================
    // CONFIRM REQUEST
    // =================================================

    if (confirmRequestBtn) {

        confirmRequestBtn.addEventListener(
            "click",
            function () {

                const name =
                    userName
                        ? userName.value.trim()
                        : "";

                const phone =
                    userPhone
                        ? userPhone.value.trim()
                        : "";

                const address =
                    userAddress
                        ? userAddress.value.trim()
                        : "";


                if (!name) {

                    showToast(
                        "Please enter your name."
                    );

                    return;
                }


                if (!phone) {

                    showToast(
                        "Please enter your phone number."
                    );

                    return;
                }


                if (!address) {

                    showToast(
                        "Please enter your address."
                    );

                    return;
                }


                const donation =
                    donations.find(function (item) {

                        return Number(item.id) ===
                            Number(selectedDonationId);

                    });


                if (!donation) {

                    showToast(
                        "Food donation not found."
                    );

                    return;
                }


                // =================================================
                // PREVENT DUPLICATE REQUEST
                // =================================================

                const alreadyRequested =
                    requests.some(function (request) {

                        return (

                            Number(request.donationId) ===
                            Number(donation.id)

                            &&

                            request.status !==
                            "Rejected"

                            &&

                            request.status !==
                            "Distributed"

                        );

                    });


                if (alreadyRequested) {

                    showToast(
                        "You already have an active request for this food."
                    );

                    return;
                }


                // =================================================
                // CREATE REQUEST
                // =================================================

                const request = {

                    id:
                        Date.now(),

                    donationId:
                        donation.id,

                    foodName:
                        donation.foodName,

                    quantity:
                        donation.quantity,

                    quantityUnit:
                        donation.quantityUnit,

                    foodCategory:
                        donation.foodCategory,

                    foodCondition:
                        donation.foodCondition,

                    pickupAddress:
                        donation.pickupAddress,

                    donorName:
                        donation.donorName ||
                        "GreenShare Donor",

                    userName:
                        name,

                    userPhone:
                        phone,

                    userAddress:
                        address,

                    status:
                        "Requested",

                    requestedAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()

                };


                requests.push(request);


                // =================================================
                // SAVE REQUEST
                // =================================================

                localStorage.setItem(
                    "greenShareRequests",
                    JSON.stringify(requests)
                );


                // =================================================
                // UPDATE DONATION
                // =================================================

                const donationIndex =
                    donations.findIndex(
                        function (item) {

                            return Number(item.id) ===
                                Number(donation.id);

                        }
                    );


                if (donationIndex !== -1) {

                    donations[donationIndex].status =
                        "Requested";


                    donations[donationIndex].request =
                        request;


                    localStorage.setItem(
                        "greenShareDonations",
                        JSON.stringify(donations)
                    );

                }


                // =================================================
                // CLOSE REQUEST MODAL
                // =================================================

                const requestModalElement =
                    document.getElementById(
                        "requestModal"
                    );


                if (requestModalElement) {

                    const requestModal =
                        bootstrap.Modal.getOrCreateInstance(
                            requestModalElement
                        );

                    requestModal.hide();

                }


                // =================================================
                // RESET FORM
                // =================================================

                if (userName) {
                    userName.value = "";
                }

                if (userPhone) {
                    userPhone.value = "";
                }

                if (userAddress) {
                    userAddress.value = "";
                }


                selectedDonationId = null;


                // =================================================
                // REFRESH
                // =================================================

                displayFood();

                displayRequests();

                updateStatistics();


                // =================================================
                // SUCCESS MODAL
                // =================================================

                const successModalElement =
                    document.getElementById(
                        "successModal"
                    );


                if (successModalElement) {

                    const successModal =
                        bootstrap.Modal.getOrCreateInstance(
                            successModalElement
                        );

                    successModal.show();

                } else {

                    showToast(
                        "Food request submitted successfully!"
                    );

                }

            }
        );

    }


    // =================================================
    // GET USER REQUESTS
    // =================================================

    function getUserRequests() {

        /*
         * If your application later has user login,
         * this can be filtered by user ID.
         *
         * For now we display all requests stored
         * in this browser.
         */

        return requests;

    }


    // =================================================
    // STATUS BADGE
    // =================================================

    function getStatusBadge(status) {

        switch (status) {

            case "Requested":

                return `
                    <span class="badge bg-warning text-dark">
                        <i class="bi bi-hourglass-split"></i>
                        Requested
                    </span>
                `;


            case "Accepted":

                return `
                    <span class="badge bg-success">
                        <i class="bi bi-check-circle"></i>
                        Accepted
                    </span>
                `;


            case "Pickup":

                return `
                    <span class="badge bg-info text-dark">
                        <i class="bi bi-truck"></i>
                        Pickup Process
                    </span>
                `;


            case "Distributed":

                return `
                    <span class="badge bg-primary">
                        <i class="bi bi-check-circle-fill"></i>
                        Food Distributed
                    </span>
                `;


            case "Rejected":

                return `
                    <span class="badge bg-danger">
                        <i class="bi bi-x-circle"></i>
                        Rejected
                    </span>
                `;


            default:

                return `
                    <span class="badge bg-secondary">
                        ${escapeHTML(status)}
                    </span>
                `;

        }

    }


    // =================================================
    // DISPLAY REQUESTS
    // =================================================

    function displayRequests() {

        if (!requestTable) {
            return;
        }


        const userRequests =
            getUserRequests();


        requestTable.innerHTML = "";


        if (userRequests.length === 0) {

            requestTable.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="text-center py-5">

                        <div
                            style="font-size:3rem;">
                            📋
                        </div>

                        <h5>
                            No requests yet
                        </h5>

                        <p class="text-muted mb-0">

                            Request donated food
                            to see it here.

                        </p>

                    </td>

                </tr>

            `;

            return;
        }


        userRequests
            .slice()
            .reverse()
            .forEach(function (request) {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>

                        <strong>

                            ${escapeHTML(
                                request.foodName
                            )}

                        </strong>

                        <br>

                        <small class="text-muted">

                            ${escapeHTML(
                                request.foodCategory ||
                                ""
                            )}

                        </small>

                    </td>


                    <td>

                        ${escapeHTML(
                            request.quantity
                        )}

                        ${escapeHTML(
                            request.quantityUnit
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            request.donorName
                        )}

                    </td>


                    <td>

                        ${formatDate(
                            request.requestedAt
                        )}

                    </td>


                    <td>

                        ${getStatusBadge(
                            request.status
                        )}

                    </td>

                `;


                requestTable.appendChild(row);

            });

    }


    // =================================================
    // STATISTICS
    // =================================================

    function updateStatistics() {

        const available =
            getAvailableDonations();


        if (availableCount) {

            availableCount.textContent =
                available.length;

        }


        if (requestCount) {

            requestCount.textContent =
                requests.length;

        }


        const approved =
            requests.filter(function (request) {

                return (
                    request.status === "Accepted" ||
                    request.status === "Pickup" ||
                    request.status === "Distributed"
                );

            });


        if (approvedCount) {

            approvedCount.textContent =
                approved.length;

        }


        let saved = 0;


        requests
            .filter(function (request) {

                return (
                    request.status ===
                    "Distributed"
                );

            })
            .forEach(function (request) {

                if (
                    request.quantityUnit ===
                    "kg"
                ) {

                    saved +=
                        parseFloat(
                            request.quantity
                        ) || 0;

                }

            });


        if (foodSaved) {

            foodSaved.textContent =
                saved.toFixed(1);

        }

    }


    // =================================================
    // TOAST
    // =================================================

    function showToast(message) {

        const toastElement =
            document.getElementById(
                "userToast"
            );

        const toastMessage =
            document.getElementById(
                "toastMessage"
            );


        if (!toastElement) {

            alert(message);

            return;
        }


        if (toastMessage) {

            toastMessage.textContent =
                message;

        }


        const toast =
            bootstrap.Toast.getOrCreateInstance(
                toastElement
            );


        toast.show();

    }


    // =================================================
    // SEARCH FOOD
    // =================================================

    if (searchFood) {

        searchFood.addEventListener(
            "input",
            displayFood
        );

    }


    // =================================================
    // CATEGORY FILTER
    // =================================================

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            displayFood
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
                        "index.html";

                }

            }
        );

    }


    // =================================================
    // AUTO REFRESH
    // =================================================

    /*
     * This is important.
     *
     * When the donor accepts/rejects a request in
     * another page/tab, user.js checks localStorage
     * again and updates the status.
     */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                "greenShareRequests"
            ) {

                requests =
                    JSON.parse(
                        localStorage.getItem(
                            "greenShareRequests"
                        )
                    ) || [];


                displayRequests();

                displayFood();

                updateStatistics();

            }


            if (
                event.key ===
                "greenShareDonations"
            ) {

                donations =
                    JSON.parse(
                        localStorage.getItem(
                            "greenShareDonations"
                        )
                    ) || [];


                displayFood();

                updateStatistics();

            }

        }
    );


    // =================================================
    // PERIODIC REFRESH
    // =================================================

    setInterval(function () {

        const latestRequests =
            JSON.parse(
                localStorage.getItem(
                    "greenShareRequests"
                )
            ) || [];


        const latestDonations =
            JSON.parse(
                localStorage.getItem(
                    "greenShareDonations"
                )
            ) || [];


        requests =
            latestRequests;


        donations =
            latestDonations;


        displayRequests();

        displayFood();

        updateStatistics();

    }, 3000);


    // =================================================
    // INITIAL LOAD
    // =================================================

    displayFood();

    displayRequests();

    updateStatistics();

});