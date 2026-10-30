
const http = require("http");
const os = require("os");
const path = require("path");
const EventEmitter = require("events");

// GreenShare application data
const inventory = new Map([
    ["Rice", 50],
    ["Vegetables", 20]
]);

const transactions = [];
let transactionId = 1;

// Event handling
const foodEvents = new EventEmitter();

function recordTransaction(type, item, quantity, details) {
    const transaction = {
        id: `TXN${String(transactionId++).padStart(4, "0")}`,
        type,
        item,
        quantity,
        details,
        timestamp: new Date().toISOString()
    };

    transactions.push(transaction);
    console.log("Transaction recorded:", transaction.id);
}

// Listen for food-related events
foodEvents.on("donationReceived", (data) => {
    const current = inventory.get(data.item) || 0;
    inventory.set(data.item, current + data.quantity);

    recordTransaction(
        "DONATION",
        data.item,
        data.quantity,
        `Donor: ${data.donor}`
    );
});

foodEvents.on("foodDistributed", (data) => {
    const current = inventory.get(data.item) || 0;

    if (data.quantity > current) {
        throw new Error("Insufficient inventory");
    }

    inventory.set(data.item, current - data.quantity);

    recordTransaction(
        "DISTRIBUTION",
        data.item,
        data.quantity,
        `Receiver: ${data.receiver}`
    );
});

// Utility: send JSON responses
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });
    res.end(JSON.stringify(data, null, 2));
}

// Read JSON request body with a size limit
function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", chunk => {
            body += chunk;

            if (body.length > 10000) {
                reject(new Error("Request body too large"));
                req.destroy();
            }
        });

        req.on("end", () => {
            try {
                resolve(JSON.parse(body || "{}"));
            } catch {
                reject(new Error("Invalid JSON"));
            }
        });

        req.on("error", reject);
    });
}

function validText(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function validQuantity(value) {
    return Number.isSafeInteger(value) && value > 0;
}

// Create custom HTTP server
const server = http.createServer(async (req, res) => {
    const parsedURL = new URL(req.url, "http://localhost");
    const route = parsedURL.pathname;

    try {
        // Home endpoint
        if (req.method === "GET" && route === "/") {
            return sendJSON(res, 200, {
                message: "Welcome to GreenShare Food Bank API",
                endpoints: [
                    "GET /api/health",
                    "GET /api/inventory",
                    "GET /api/history",
                    "POST /api/donations",
                    "POST /api/distributions"
                ]
            });
        }

        // Explore os and path modules
        if (req.method === "GET" && route === "/api/health") {
            return sendJSON(res, 200, {
                status: "Server running",
                platform: os.platform(),
                architecture: os.arch(),
                freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
                totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
                cpuCount: os.cpus().length,
                serverFile: path.basename(__filename),
                serverDirectory: path.dirname(__filename)
            });
        }

        // View available food inventory
        if (req.method === "GET" && route === "/api/inventory") {
            const items = [];

            for (const [item, quantity] of inventory) {
                items.push({ item, quantity });
            }

            return sendJSON(res, 200, { inventory: items });
        }

        // View transaction history
        if (req.method === "GET" && route === "/api/history") {
            return sendJSON(res, 200, {
                totalTransactions: transactions.length,
                transactions
            });
        }

        // Record a donation
        if (req.method === "POST" && route === "/api/donations") {
            const data = await readBody(req);

            if (!validText(data.item) ||
                !validText(data.donor) ||
                !validQuantity(data.quantity)) {
                return sendJSON(res, 400, {
                    error: "Provide item, donor and a positive integer quantity."
                });
            }

            foodEvents.emit("donationReceived", {
                item: data.item.trim(),
                donor: data.donor.trim(),
                quantity: data.quantity
            });

            return sendJSON(res, 201, {
                message: "Donation recorded successfully",
                inventoryQuantity: inventory.get(data.item.trim())
            });
        }

        // Record a food distribution
        if (req.method === "POST" &&
            route === "/api/distributions") {
            const data = await readBody(req);

            if (!validText(data.item) ||
                !validText(data.receiver) ||
                !validQuantity(data.quantity)) {
                return sendJSON(res, 400, {
                    error: "Provide item, receiver and a positive integer quantity."
                });
            }

            const item = data.item.trim();
            const receiver = data.receiver.trim();
            const available = inventory.get(item) || 0;

            if (data.quantity > available) {
                return sendJSON(res, 400, {
                    error: "Insufficient inventory",
                    available,
                    requested: data.quantity
                });
            }

            foodEvents.emit("foodDistributed", {
                item,
                receiver,
                quantity: data.quantity
            });

            return sendJSON(res, 200, {
                message: "Distribution recorded successfully",
                remainingQuantity: inventory.get(item)
            });
        }

        return sendJSON(res, 404, {
            error: "Route not found"
        });

    } catch (error) {
        console.error(error.message);

        if (!res.headersSent && !res.destroyed) {
            const status = error.message === "Invalid JSON" ? 400
                : error.message === "Request body too large" ? 413
                : 500;

            sendJSON(res, status, { error: error.message });
        }
    }
});

const PORT = 3000;

server.listen(PORT, () => {
    console.log(`GreenShare server running at http://localhost:${PORT}`);
    console.log(`Server file: ${path.join(__dirname, path.basename(__filename))}`);
    console.log(`Operating system: ${os.platform()}`);
});
