
package com.greenshare;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/greenshare")
public class GreenShareController extends HttpServlet {

    private final Map<String, String> donors = new LinkedHashMap<>();
    private final Map<String, Integer> inventory = new LinkedHashMap<>();
    private final List<Transaction> history = new ArrayList<>();

    private int nextTransactionId = 1;

    private static class Transaction {
        String id;
        String type;
        String reference;
        String item;
        int quantity;
        String description;
        String timestamp;

        Transaction(String id, String type, String reference,
                    String item, int quantity, String description) {
            this.id = id;
            this.type = type;
            this.reference = reference;
            this.item = item;
            this.quantity = quantity;
            this.description = description;
            this.timestamp = LocalDateTime.now().format(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            );
        }
    }

    @Override
    public void init() {
        donors.put("D101", "Ravi Kumar");
        inventory.put("Rice", 50);
        record("OPENING", "SYS001", "Rice", 50,
               "Initial inventory entered");
    }

    private synchronized void record(String type, String reference,
                                     String item, int quantity,
                                     String description) {
        String id = String.format("TXN%04d", nextTransactionId++);
        history.add(new Transaction(id, type, reference,
                                    item, quantity, description));
    }

    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws IOException {

        response.setContentType("text/html;charset=UTF-8");
        PrintWriter out = response.getWriter();

        synchronized (this) {
            out.println("<html><head><title>GreenShare History</title></head><body>");
            out.println("<h1>GreenShare Transaction Management</h1>");

            out.println("<h2>Record a Transaction</h2>");
            out.println("<form method='post' action='greenshare'>");

            out.println("Transaction: <select name='action'>");
            out.println("<option value='donation'>Donation Received</option>");
            out.println("<option value='movement'>Inventory Movement</option>");
            out.println("<option value='distribution'>Food Distribution</option>");
            out.println("</select><br><br>");

            out.println("Reference ID: <input name='reference' required><br><br>");
            out.println("Item Name: <input name='item' required><br><br>");
            out.println("Quantity: <input type='number' name='quantity' min='1' required><br><br>");
            out.println("Description / Receiver: <input name='description' required><br><br>");
            out.println("<button type='submit'>Save Transaction</button>");
            out.println("</form>");

            out.println("<h2>Current Inventory</h2><table border='1' cellpadding='8'>");
            out.println("<tr><th>Food Item</th><th>Quantity</th></tr>");

            for (Map.Entry<String, Integer> entry : inventory.entrySet()) {
                out.println("<tr><td>" + escape(entry.getKey())
                    + "</td><td>" + entry.getValue() + "</td></tr>");
            }
            out.println("</table>");

            out.println("<h2>Transaction History</h2>");
            out.println("<table border='1' cellpadding='8'>");
            out.println("<tr><th>Transaction ID</th><th>Date/Time</th>"
                + "<th>Type</th><th>Reference</th><th>Item</th>"
                + "<th>Quantity</th><th>Description</th></tr>");

            for (Transaction t : history) {
                out.println("<tr><td>" + escape(t.id)
                    + "</td><td>" + escape(t.timestamp)
                    + "</td><td>" + escape(t.type)
                    + "</td><td>" + escape(t.reference)
                    + "</td><td>" + escape(t.item)
                    + "</td><td>" + t.quantity
                    + "</td><td>" + escape(t.description)
                    + "</td></tr>");
            }

            out.println("</table></body></html>");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response)
            throws IOException {

        request.setCharacterEncoding("UTF-8");

        String action = request.getParameter("action");
        String reference = request.getParameter("reference");
        String item = request.getParameter("item");
        String description = request.getParameter("description");
        String quantityText = request.getParameter("quantity");

        if (isBlank(action) || isBlank(reference)
                || isBlank(item) || isBlank(description)
                || isBlank(quantityText)) {
            response.sendError(400, "All fields are required.");
            return;
        }

        int quantity;
        try {
            quantity = Integer.parseInt(quantityText);
            if (quantity <= 0) {
                throw new NumberFormatException();
            }
        } catch (NumberFormatException e) {
            response.sendError(400, "Quantity must be a positive integer.");
            return;
        }

        synchronized (this) {
            int currentStock = inventory.getOrDefault(item, 0);

            switch (action) {
                case "donation":
                    if (!donors.containsKey(reference)) {
                        response.sendError(400, "Register the donor ID first.");
                        return;
                    }

                    inventory.put(item, currentStock + quantity);
                    record("DONATION", reference, item, quantity,
                           description);
                    break;

                case "movement":
                    // Reference must identify the source of the movement.
                    if (quantity > currentStock) {
                        response.sendError(400, "Insufficient inventory.");
                        return;
                    }

                    inventory.put(item, currentStock - quantity);
                    record("ISSUE", reference, item, quantity,
                           description);
                    break;

                case "distribution":
                    if (quantity > currentStock) {
                        response.sendError(400, "Insufficient inventory.");
                        return;
                    }

                    inventory.put(item, currentStock - quantity);
                    record("DISTRIBUTION", reference, item, quantity,
                           description);
                    break;

                default:
                    response.sendError(400, "Invalid transaction type.");
                    return;
            }
        }

        response.sendRedirect(request.getContextPath() + "/greenshare");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String escape(String value) {
        return value.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#39;");
    }
}
