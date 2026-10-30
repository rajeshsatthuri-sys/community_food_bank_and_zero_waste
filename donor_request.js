// =====================================================
// GreenShare - Donor Request Management
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =================================================
    // ELEMENTS
    // =================================================

    const requestsContainer =
        document.getElementById("requestsContainer");

    const noRequests =
        document.getElementById("noRequests");

    const searchRequests =
        document.getElementById("searchRequests");

    const statusFilter =
        document.getElementById("statusFilter");

    const totalRequests =
        document.getElementById("totalRequests");

    const pendingRequests =
        document.getElementById("pendingRequests");

    const approvedRequests =
        document.getElementById("approvedRequests");

    const distributedRequests =
        document.getElementById("distributedRequests");


    // =================================================
    // LOAD DATA
    // =================================================

    let requests =
        JSON.parse(
            localStorage.getItem("greenShareRequests")
        ) || [];


    let donations =
        JSON.parse(
            localStorage.getItem("greenShareDonations")
        ) || [];


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
            return "-";
        }

        const date =
            new Date(dateString);

        if (isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleString("en-IN", {

            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"

        });

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
                        <i class="bi bi-heart-fill"></i>
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
    // UPDATE STATISTICS
    // =================================================

    function updateStatistics() {

        totalRequests.textContent =
            requests.length;


        pendingRequests.textContent =
            requests.filter(function (request) {

                return request.status === "Requested";

            }).length;


        approvedRequests.textContent =
            requests.filter(function (request) {

                return (
                    request.status === "Accepted" ||
                    request.status === "Pickup"
                );

            }).length;


        distributedRequests.textContent =
            requests.filter(function (request) {

                return request.status === "Distributed";

            }).length;

    }


    // =================================================
    // UPDATE STORAGE
    // =================================================

    function saveRequests() {

        localStorage.setItem(
            "greenShareRequests",
            JSON.stringify(requests)
        );

    }


    // =================================================
    // UPDATE DONATION STATUS
    // =================================================

    function updateDonation(request) {

        const index =
            donations.findIndex(function (donation) {

                return Number(donation.id) ===
                    Number(request.donationId);

            });


        if (index !== -1) {

            donations[index].status =
                request.status;

            donations[index].request =
                request;


            localStorage.setItem(
                "greenShareDonations",
                JSON.stringify(donations)
            );

        }

    }


    // =================================================
    // SHOW TOAST
    // =================================================

    function showToast(message) {

        const toastElement =
            document.getElementById("requestToast");

        const messageElement =
            document.getElementById("requestToastMessage");


        if (!toastElement) {
            return;
        }


        messageElement.textContent =
            message;


        const toast =
            bootstrap.Toast.getOrCreateInstance(
                toastElement
            );


        toast.show();

    }


    // =================================================
    // CHANGE STATUS
    // =================================================

    function changeRequestStatus(
        requestId,
        newStatus
    ) {

        const request =
            requests.find(function (item) {

                return Number(item.id) ===
                    Number(requestId);

            });


        if (!request) {

            showToast(
                "Request not found."
            );

            return;

        }


        request.status =
            newStatus;


        request.updatedAt =
            new Date().toISOString();


        saveRequests();

        updateDonation(request);

        displayRequests();

        updateStatistics();


        const messages = {

            "Accepted":
                "Food request accepted successfully.",

            "Pickup":
                "Pickup process started.",

            "Distributed":
                "Food marked as distributed.",

            "Rejected":
                "Food request rejected."

        };


        showToast(
            messages[newStatus] ||
            "Request updated successfully."
        );

    }


    // =================================================
    // CREATE REQUEST CARD
    // =================================================

    function createRequestCard(request) {

        const col =
            document.createElement("div");

        col.className =
            "col-12";


        let actionButtons = "";


        // ---------------------------------------------
        // REQUESTED
        // ---------------------------------------------

        if (request.status === "Requested") {

            actionButtons = `

                <div class="d-flex flex-wrap gap-2 mt-3">

                    <button
                        class="btn btn-success"
                        data-action="accept"
                        data-id="${request.id}">

                        <i class="bi bi-check-circle"></i>

                        Accept Request

                    </button>


                    <button
                        class="btn btn-danger"
                        data-action="reject"
                        data-id="${request.id}">

                        <i class="bi bi-x-circle"></i>

                        Reject Request

                    </button>

                </div>

            `;

        }


        // ---------------------------------------------
        // ACCEPTED
        // ---------------------------------------------

        else if (request.status === "Accepted") {

            actionButtons = `

                <div class="mt-3">

                    <button
                        class="btn btn-info text-dark"
                        data-action="pickup"
                        data-id="${request.id}">

                        <i class="bi bi-truck"></i>

                        Start Pickup Process

                    </button>

                </div>

            `;

        }


        // ---------------------------------------------
        // PICKUP
        // ---------------------------------------------

        else if (request.status === "Pickup") {

            actionButtons = `

                <div class="mt-3">

                    <button
                        class="btn btn-primary"
                        data-action="distributed"
                        data-id="${request.id}">

                        <i class="bi bi-box2-heart"></i>

                        Mark Food Distributed

                    </button>

                </div>

            `;

        }


        // ---------------------------------------------
        // DISTRIBUTED
        // ---------------------------------------------

        else if (request.status === "Distributed") {

            actionButtons = `

                <div class="alert alert-success mt-3 mb-0">

                    <i class="bi bi-check-circle-fill"></i>

                    Food has been successfully distributed.

                </div>

            `;

        }


        // ---------------------------------------------
        // REJECTED
        // ---------------------------------------------

        else if (request.status === "Rejected") {

            actionButtons = `

                <div class="alert alert-danger mt-3 mb-0">

                    <i class="bi bi-x-circle-fill"></i>

                    This request was rejected.

                </div>

            `;

        }


        col.innerHTML = `

            <div class="card shadow-sm border-0">

                <div class="card-body p-4">

                    <div class="row g-4">


                        <!-- FOOD -->

                        <div class="col-lg-4">

                            <div class="d-flex align-items-center gap-3">

                                <div
                                    style="
                                    font-size:2.8rem;
                                    background:#e8f5e9;
                                    padding:12px;
                                    border-radius:15px;
                                    ">

                                    🍱

                                </div>


                                <div>

                                    <h4 class="mb-1">

                                        ${escapeHTML(
                                            request.foodName
                                        )}

                                    </h4>

                                    ${getStatusBadge(
                                        request.status
                                    )}

                                </div>

                            </div>


                            <hr>


                            <p class="mb-1">

                                <strong>
                                    Quantity:
                                </strong>

                                ${escapeHTML(
                                    request.quantity
                                )}

                                ${escapeHTML(
                                    request.quantityUnit
                                )}

                            </p>

                        </div>


                        <!-- USER -->

                        <div class="col-lg-4">

                            <h6 class="text-success">

                                <i class="bi bi-person"></i>

                                Requester Details

                            </h6>


                            <p class="mb-1">

                                <strong>
                                    Name:
                                </strong>

                                ${escapeHTML(
                                    request.userName
                                )}

                            </p>


                            <p class="mb-1">

                                <strong>
                                    Phone:
                                </strong>

                                ${escapeHTML(
                                    request.userPhone
                                )}

                            </p>


                            <p class="mb-1">

                                <strong>
                                    Address:
                                </strong>

                                ${escapeHTML(
                                    request.userAddress
                                )}

                            </p>

                        </div>


                        <!-- REQUEST -->

                        <div class="col-lg-4">

                            <h6 class="text-success">

                                <i class="bi bi-clock-history"></i>

                                Request Information

                            </h6>


                            <p class="mb-1">

                                <strong>
                                    Requested:
                                </strong>

                                ${formatDate(
                                    request.requestedAt
                                )}

                            </p>


                            <p class="mb-1">

                                <strong>
                                    Donor:
                                </strong>

                                ${escapeHTML(
                                    request.donorName
                                )}

                            </p>


                            ${actionButtons}

                        </div>

                    </div>

                </div>

            </div>

        `;


        return col;

    }


    // =================================================
    // DISPLAY REQUESTS
    // =================================================

    function displayRequests() {

        const search =
            searchRequests
                ? searchRequests.value
                    .trim()
                    .toLowerCase()
                : "";


        const status =
            statusFilter
                ? statusFilter.value
                : "all";


        const filtered =
            requests.filter(function (request) {

                const matchesSearch =

                    request.foodName
                        .toLowerCase()
                        .includes(search)

                    ||

                    request.userName
                        .toLowerCase()
                        .includes(search);


                const matchesStatus =
                    status === "all" ||
                    request.status === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            });


        requestsContainer.innerHTML = "";


        if (filtered.length === 0) {

            noRequests.classList.remove(
                "d-none"
            );

            return;

        }


        noRequests.classList.add(
            "d-none"
        );


        filtered.forEach(function (request) {

            const card =
                createRequestCard(request);

            requestsContainer.appendChild(card);

        });


        attachActionButtons();

    }


    // =================================================
    // ACTION BUTTONS
    // =================================================

    function attachActionButtons() {

        document
            .querySelectorAll("[data-action]")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const action =
                            button.dataset.action;

                        const id =
                            Number(
                                button.dataset.id
                            );


                        if (action === "accept") {

                            changeRequestStatus(
                                id,
                                "Accepted"
                            );

                        }


                        else if (action === "reject") {

                            changeRequestStatus(
                                id,
                                "Rejected"
                            );

                        }


                        else if (action === "pickup") {

                            changeRequestStatus(
                                id,
                                "Pickup"
                            );

                        }


                        else if (action === "distributed") {

                            changeRequestStatus(
                                id,
                                "Distributed"
                            );

                        }

                    }
                );

            });

    }


    // =================================================
    // SEARCH
    // =================================================

    if (searchRequests) {

        searchRequests.addEventListener(
            "input",
            displayRequests
        );

    }


    // =================================================
    // FILTER
    // =================================================

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            displayRequests
        );

    }


    // =================================================
    // INITIAL LOAD
    // =================================================

    updateStatistics();

    displayRequests();

});