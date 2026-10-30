
const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20kb" }));

// In-memory sample data
const donors = new Map([
  ["D101", {
    id: "D101",
    name: "Ravi Kumar",
    phone: "9876543210",
    location: "Hyderabad"
  }]
]);

const foods = new Map([
  ["F101", {
    id: "F101",
    name: "Rice",
    category: "Grains",
    quantity: 50,
    unit: "kg"
  }]
]);

const distributions = new Map();

const validId = value =>
  typeof value === "string" && value.trim().length > 0;

const validText = value =>
  typeof value === "string" && value.trim().length > 0;

const validQuantity = value =>
  Number.isSafeInteger(value) && value > 0;

const sendError = (res, status, message) =>
  res.status(status).json({ error: message });

function makeId(prefix, map) {
  let id;
  do {
    id = prefix + String(map.size + 101);
  } while (map.has(id));
  return id;
}

function hasFields(body, fields) {
  return body && fields.every(field =>
    Object.prototype.hasOwnProperty.call(body, field)
  );
}

// Home
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to GreenShare REST API",
    resources: ["/api/donors", "/api/foods", "/api/distributions"]
  });
});

// ==================== DONORS ====================

// Create donor
app.post("/api/donors", (req, res) => {
  const { name, phone, location } = req.body || {};

  if (!validText(name) || !validText(phone) ||
      !validText(location)) {
    return sendError(res, 400, "Name, phone and location are required.");
  }

  const id = makeId("D", donors);
  const donor = { id, name: name.trim(), phone: phone.trim(),
                  location: location.trim() };

  donors.set(id, donor);
  res.status(201).json(donor);
});

// Get all donors
app.get("/api/donors", (req, res) => {
  res.json([...donors.values()]);
});

// Get one donor
app.get("/api/donors/:id", (req, res) => {
  const donor = donors.get(req.params.id);
  if (!donor) return sendError(res, 404, "Donor not found.");
  res.json(donor);
});

// Update donor
app.put("/api/donors/:id", (req, res) => {
  const old = donors.get(req.params.id);
  if (!old) return sendError(res, 404, "Donor not found.");

  const { name, phone, location } = req.body || {};
  if (!validText(name) || !validText(phone) ||
      !validText(location)) {
    return sendError(res, 400, "Name, phone and location are required.");
  }

  const updated = {
    id: old.id,
    name: name.trim(),
    phone: phone.trim(),
    location: location.trim()
  };

  donors.set(old.id, updated);
  res.json(updated);
});

// Delete donor
app.delete("/api/donors/:id", (req, res) => {
  if (!donors.has(req.params.id))
    return sendError(res, 404, "Donor not found.");

  // Keep donor records referenced by distribution-independent
  // business records available in this basic demonstration.
  donors.delete(req.params.id);
  res.status(204).end();
});

// ==================== FOOD INVENTORY ====================

// Create food item
app.post("/api/foods", (req, res) => {
  const { name, category, quantity, unit } = req.body || {};

  if (!validText(name) || !validText(category) ||
      !validQuantity(quantity) || !validText(unit)) {
    return sendError(res, 400,
      "Name, category, positive integer quantity and unit are required.");
  }

  const id = makeId("F", foods);
  const food = {
    id, name: name.trim(), category: category.trim(),
    quantity, unit: unit.trim()
  };

  foods.set(id, food);
  res.status(201).json(food);
});

// Get all food items
app.get("/api/foods", (req, res) => {
  res.json([...foods.values()]);
});

// Get one food item
app.get("/api/foods/:id", (req, res) => {
  const food = foods.get(req.params.id);
  if (!food) return sendError(res, 404, "Food item not found.");
  res.json(food);
});

// Update food item
app.put("/api/foods/:id", (req, res) => {
  const old = foods.get(req.params.id);
  if (!old) return sendError(res, 404, "Food item not found.");

  const { name, category, quantity, unit } = req.body || {};

  if (!validText(name) || !validText(category) ||
      !validQuantity(quantity) || !validText(unit)) {
    return sendError(res, 400, "Invalid food item fields.");
  }

  const alreadyDistributed = [...distributions.values()]
    .filter(d => d.foodId === old.id)
    .reduce((sum, d) => sum + d.quantity, 0);

  if (quantity < alreadyDistributed) {
    return sendError(res, 400,
      "Quantity cannot be lower than the amount already distributed.");
  }

  const updated = {
    id: old.id, name: name.trim(), category: category.trim(),
    quantity, unit: unit.trim()
  };

  foods.set(old.id, updated);
  res.json(updated);
});

// Delete food item
app.delete("/api/foods/:id", (req, res) => {
  if (!foods.has(req.params.id))
    return sendError(res, 404, "Food item not found.");

  const hasDistribution = [...distributions.values()]
    .some(d => d.foodId === req.params.id);

  if (hasDistribution) {
    return sendError(res, 409,
      "Cannot delete food item with distribution records.");
  }

  foods.delete(req.params.id);
  res.status(204).end();
});

// ==================== DISTRIBUTIONS ====================

// Create distribution
app.post("/api/distributions", (req, res) => {
  const { foodId, receiver, quantity, date, status } = req.body || {};

  if (!validId(foodId) || !validText(receiver) ||
      !validQuantity(quantity) || !validText(date) ||
      !["Pending", "Distributed", "Rejected"].includes(status)) {
    return sendError(res, 400, "Invalid distribution fields.");
  }

  const food = foods.get(foodId);
  if (!food) return sendError(res, 404, "Food item not found.");

  if (status === "Distributed" && quantity > food.quantity) {
    return sendError(res, 400, "Insufficient inventory.");
  }

  const id = makeId("DS", distributions);
  const distribution = {
    id, foodId, receiver: receiver.trim(),
    quantity, date, status
  };

  // Reduce stock only for completed distributions
  if (status === "Distributed") {
    food.quantity -= quantity;
  }

  distributions.set(id, distribution);
  res.status(201).json(distribution);
});

// Get all distributions
app.get("/api/distributions", (req, res) => {
  res.json([...distributions.values()]);
});

// Get one distribution
app.get("/api/distributions/:id", (req, res) => {
  const record = distributions.get(req.params.id);
  if (!record) return sendError(res, 404, "Distribution not found.");
  res.json(record);
});

// Update distribution
app.put("/api/distributions/:id", (req, res) => {
  const old = distributions.get(req.params.id);
  if (!old) return sendError(res, 404, "Distribution not found.");

  const { foodId, receiver, quantity, date, status } = req.body || {};

  if (!validId(foodId) || !validText(receiver) ||
      !validQuantity(quantity) || !validText(date) ||
      !["Pending", "Distributed", "Rejected"].includes(status)) {
    return sendError(res, 400, "Invalid distribution fields.");
  }

  const oldFood = foods.get(old.foodId);
  const newFood = foods.get(foodId);

  if (!newFood) return sendError(res, 404, "Food item not found.");

  // Restore previous stock if old record was completed.
  // Then validate and apply the updated distribution.
  const oldWasDistributed = old.status === "Distributed";
  const newWillBeDistributed = status === "Distributed";

  if (oldWasDistributed && !oldFood) {
    return sendError(res, 409, "Original inventory record is missing.");
  }

  if (oldWasDistributed) {
    oldFood.quantity += old.quantity;
  }

  if (newWillBeDistributed && quantity > newFood.quantity) {
    if (oldWasDistributed) oldFood.quantity -= old.quantity;
    return sendError(res, 400, "Insufficient inventory.");
  }

  if (newWillBeDistributed) {
    newFood.quantity -= quantity;
  }

  const updated = {
    id: old.id, foodId, receiver: receiver.trim(),
    quantity, date, status
  };

  distributions.set(old.id, updated);
  res.json(updated);
});

// Delete distribution
app.delete("/api/distributions/:id", (req, res) => {
  const record = distributions.get(req.params.id);
  if (!record) return sendError(res, 404, "Distribution not found.");

  // Restore stock if a completed distribution is deleted.
  if (record.status === "Distributed") {
    const food = foods.get(record.foodId);
    if (food) food.quantity += record.quantity;
  }

  distributions.delete(req.params.id);
  res.status(204).end();
});

// Invalid JSON handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return sendError(res, 400, "Invalid JSON request body.");
  }
  next(err);
});

// Start server
app.listen(PORT, () => {
  console.log(`GreenShare API running at http://localhost:${PORT}`);
});
