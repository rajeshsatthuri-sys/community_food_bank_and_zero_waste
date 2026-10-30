
package com.greenshare;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/session")
public class SessionController extends HttpServlet {


    public void init() throws ServletException {
        // Protect the session ID cookie from JavaScript access.
        getServletContext().getSessionCookieConfig().setHttpOnly(true);

        // Enable only when deployed over HTTPS.
        // Configure Secure=true in production HTTPS deployments.
    }

   
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws IOException {

        response.setContentType("text/html;charset=UTF-8");
        response.setHeader("Cache-Control", "no-store");

        PrintWriter out = response.getWriter();
        HttpSession session = request.getSession(false);

        out.println("<html><head><title>GreenShare Sessions</title></head><body>");
        out.println("<h1>GreenShare Login and Session Demo</h1>");

        if (session == null || session.getAttribute("userId") == null) {
            out.println("<h2>Login</h2>");
            out.println("<form method='post' action='session'>");
            out.println("<input type='hidden' name='action' value='login'>");
            out.println("User ID: <input name='userId' required><br><br>");
            out.println("Role: <select name='role'>");
            out.println("<option value='donor'>Donor</option>");
            out.println("<option value='farmer'>Farmer</option>");
            out.println("</select><br><br>");
            out.println("Demo password: <input type='password' name='password' required><br><br>");
            out.println("<button type='submit'>Login</button>");
            out.println("</form>");
        } else {
            String userId = (String) session.getAttribute("userId");
            String role = (String) session.getAttribute("role");

            out.println("<h2>Welcome, " + escape(userId) + "</h2>");
            out.println("<p>Role: " + escape(role) + "</p>");

            out.println("<p><a href='session?action=inventory'>View Inventory</a></p>");
            out.println("<p><a href='session?action=distribution'>Distribution Workflow</a></p>");

            out.println("<form method='post' action='session'>");
            out.println("<input type='hidden' name='action' value='preference'>");
            out.println("Display preference: <select name='theme'>");
            out.println("<option value='light'>Light</option>");
            out.println("<option value='dark'>Dark</option>");
            out.println("</select>");
            out.println("<button type='submit'>Save Preference Cookie</button>");
            out.println("</form>");

            out.println("<form method='post' action='session'>");
            out.println("<input type='hidden' name='action' value='logout'>");
            out.println("<button type='submit'>Logout</button>");
            out.println("</form>");

            String action = request.getParameter("action");

            if ("inventory".equals(action)) {
                out.println("<h3>Inventory</h3>");
                out.println("<p>Inventory access requires an authenticated session.</p>");
            } else if ("distribution".equals(action)) {
                if ("donor".equals(role) || "farmer".equals(role)) {
                    out.println("<h3>Distribution Workflow</h3>");
                    out.println("<p>Session verified. You may continue to the distribution module.</p>");
                }
            }
        }

        out.println("</body></html>");
    }

   
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response)
            throws IOException {

        request.setCharacterEncoding("UTF-8");

        String action = request.getParameter("action");

        if ("login".equals(action)) {
            String userId = request.getParameter("userId");
            String role = request.getParameter("role");
            String password = request.getParameter("password");

            // DEMO ONLY: replace with database-backed authentication.
            boolean validRole = "donor".equals(role) || "farmer".equals(role);
            boolean valid = userId != null && !userId.isBlank()
                    && validRole && "Demo@123".equals(password);

            if (!valid) {
                response.sendError(401, "Invalid demo login.");
                return;
            }

            // Prevent session fixation by changing the session ID.
            HttpSession session = request.getSession(true);
            request.changeSessionId();

            session.setAttribute("userId", userId);
            session.setAttribute("role", role);
            session.setMaxInactiveInterval(15 * 60);

            response.sendRedirect(request.getContextPath() + "/session");
            return;
        }

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            response.sendError(401, "Please log in first.");
            return;
        }

        if ("preference".equals(action)) {
            String theme = request.getParameter("theme");

            if (!"light".equals(theme) && !"dark".equals(theme)) {
                response.sendError(400, "Invalid theme.");
                return;
            }

            Cookie cookie = new Cookie("greenshareTheme", theme);
            cookie.setHttpOnly(true);
            cookie.setPath(request.getContextPath().isEmpty()
                    ? "/" : request.getContextPath());
            cookie.setMaxAge(7 * 24 * 60 * 60);

            // Set Secure=true when running on HTTPS.
            response.addCookie(cookie);

            response.sendRedirect(request.getContextPath() + "/session");
            return;
        }

        if ("logout".equals(action)) {
            session.invalidate();

            Cookie cookie = new Cookie("greenshareTheme", "");
            cookie.setMaxAge(0);
            cookie.setHttpOnly(true);
            cookie.setPath(request.getContextPath().isEmpty()
                    ? "/" : request.getContextPath());
            response.addCookie(cookie);

            response.sendRedirect(request.getContextPath() + "/session");
            return;
        }

        response.sendError(400, "Unknown action.");
    }

    private String escape(String value) {
        return value.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#39;");
    }
}


