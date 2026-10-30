
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useNavigate
} from "react-router-dom";
import "./App.css";

const initialFoods = [
  { id: 1, name: "Rice", category: "Grains", quantity: 50, unit: "kg" },
  { id: 2, name: "Fresh Vegetables", category: "Vegetables", quantity: 20, unit: "kg" },
  { id: 3, name: "Bread", category: "Bakery", quantity: 30, unit: "packets" },
  { id: 4, name: "Fresh Fruits", category: "Fruits", quantity: 15, unit: "kg" }
];

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">♻</span>
        GreenShare
      </Link>

      <nav>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/inventory">Inventory</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        <NavLink to="/login" className="login-link">Login</NavLink>
        <NavLink to="/register" className="register-link">Register</NavLink>
      </nav>
    </header>
  );
}

function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">FOOD FOR ALL • WASTE FOR NONE</span>
          <h1>Good food deserves<br />a <span>second chance.</span></h1>
          <p>
            GreenShare connects food donors, farmers and communities
            to reduce waste and make nutritious food accessible.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/inventory">Explore Inventory</Link>
            <Link className="btn secondary" to="/register">Join GreenShare</Link>
          </div>
        </div>
        <div className="hero-art" aria-label="Sustainable food illustration">
          <div className="art-circle">🌱</div>
          <div className="floating-card">🥬 Fresh food, less waste</div>
          <div className="art-leaf">🌾</div>
        </div>
      </section>

      <section className="features">
        <div className="section-heading">
          <span className="eyebrow">WHAT WE DO</span>
          <h2>Small actions. Shared impact.</h2>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon">🥗</div>
            <h3>Food Donations</h3>
            <p>Help surplus food reach people who need it.</p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">🌾</div>
            <h3>Zero-Waste Agriculture</h3>
            <p>Encourage responsible use of food and farm resources.</p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Community Support</h3>
            <p>Connect donors, volunteers and local communities.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", role: "Donor", password: ""
  });
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (form.password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    // Demonstration only: no account is securely created.
    setMessage("Registration form validated successfully!");
    setTimeout(() => navigate("/login"), 900);
  }

  return (
    <main className="form-page">
      <form className="form-card" onSubmit={handleSubmit}>
        <span className="eyebrow">BECOME A PARTNER</span>
        <h1>Create your account</h1>
        <p>Join the GreenShare community.</p>

        <label>Full name</label>
        <input required minLength="3" placeholder="Enter your name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} />

        <label>Email address</label>
        <input required type="email" placeholder="you@example.com"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} />

        <label>Account type</label>
        <select value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}>
          <option>Donor</option>
          <option>Farmer</option>
          <option>Volunteer</option>
          <option>Food Receiver</option>
        </select>

        <label>Password</label>
        <input required minLength="8" type="password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} />

        <button className="btn primary full" type="submit">Create Account</button>
        {message && <p className="form-message" role="status">{message}</p>}
        <p className="form-bottom">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setMessage("Demo form validated. Connect a backend for real login.");
  }

  return (
    <main className="form-page">
      <form className="form-card" onSubmit={handleSubmit}>
        <span className="eyebrow">WELCOME BACK</span>
        <h1>Log in</h1>
        <p>Continue making a difference.</p>

        <label>Email address</label>
        <input required type="email" placeholder="you@example.com"
          value={email} onChange={e => setEmail(e.target.value)} />

        <label>Password</label>
        <input required type="password" placeholder="Enter your password"
          value={password} onChange={e => setPassword(e.target.value)} />

        <button className="btn primary full" type="submit">Log In</button>
        {message && <p className="form-message" role="status">{message}</p>}
        <p className="form-bottom">
          New to GreenShare? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </main>
  );
}

function Inventory() {
  const [foods, setFoods] = useState(initialFoods);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Grains");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [message, setMessage] = useState("");

  const filtered = foods.filter(food =>
    `${food.name} ${food.category}`.toLowerCase().includes(search.toLowerCase())
  );

  function addFood(e) {
    e.preventDefault();
    const amount = Number(quantity);

    if (!name.trim() || !Number.isSafeInteger(amount) || amount <= 0) {
      setMessage("Enter a food name and a positive whole-number quantity.");
      return;
    }

    setFoods([...foods, {
      id: Date.now(), name: name.trim(), category, quantity: amount, unit
    }]);

    setName("");
    setQuantity("");
    setMessage("Food item added to this demo inventory.");
  }

  return (
    <main className="page-container">
      <section className="page-heading">
        <span className="eyebrow">RESOURCE CENTER</span>
        <h1>Food Inventory</h1>
        <p>Explore available food and manage sample inventory records.</p>
      </section>

      <div className="inventory-toolbar">
        <input aria-label="Search inventory" placeholder="Search food..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <span className="stock-count">{filtered.length} items found</span>
      </div>

      <div className="inventory-grid">
        {filtered.map(food => (
          <article className="food-card" key={food.id}>
            <div className="food-symbol">
              {food.category === "Grains" ? "🌾" :
               food.category === "Vegetables" ? "🥦" :
               food.category === "Bakery" ? "🍞" : "🍎"}
            </div>
            <span className="category-tag">{food.category}</span>
            <h3>{food.name}</h3>
            <p className="quantity">{food.quantity} {food.unit}</p>
            <span className="available">● Available in demo</span>
          </article>
        ))}
      </div>

      {filtered.length === 0 && <p>No matching food items found.</p>}

      <section className="add-food-panel">
        <h2>Add a food item</h2>
        <form className="food-form" onSubmit={addFood}>
          <input required placeholder="Food name" value={name}
            onChange={e => setName(e.target.value)} />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option>Grains</option>
            <option>Vegetables</option>
            <option>Fruits</option>
            <option>Bakery</option>
            <option>Packaged Food</option>
          </select>
          <input required type="number" min="1" step="1"
            placeholder="Quantity" value={quantity}
            onChange={e => setQuantity(e.target.value)} />
          <select value={unit} onChange={e => setUnit(e.target.value)}>
            <option>kg</option>
            <option>packets</option>
            <option>boxes</option>
            <option>plates</option>
          </select>
          <button className="btn primary" type="submit">Add Item</button>
        </form>
        {message && <p className="form-message" role="status">{message}</p>}
      </section>
      <p className="demo-note">Demo data only. Items are not saved to a server.</p>
    </main>
  );
}

function About() {
  return (
    <main className="page-container">
      <section className="about-panel">
        <span className="eyebrow">OUR PURPOSE</span>
        <h1>About GreenShare</h1>
        <p className="lead">
          Building a world where good food is shared, resources are respected,
          and communities grow together.
        </p>
        <div className="about-grid">
          <article>
            <h2>Our Mission</h2>
            <p>Connect food donors, farmers and receivers to reduce avoidable
              food waste and improve access to available food.</p>
          </article>
          <article>
            <h2>Our Vision</h2>
            <p>Support sustainable agriculture and a community-led,
              zero-waste food ecosystem.</p>
          </article>
          <article>
            <h2>Our Values</h2>
            <p>Responsibility, compassion, transparency and collaboration.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="form-page contact-page">
      <form className="form-card" onSubmit={handleSubmit}>
        <span className="eyebrow">LET'S CONNECT</span>
        <h1>Contact us</h1>
        <p>Have a question or want to support our community?</p>

        <label>Your name</label>
        <input required minLength="3" placeholder="Full name" />

        <label>Email address</label>
        <input required type="email" placeholder="you@example.com" />

        <label>Message</label>
        <textarea required minLength="10" rows="5"
          placeholder="How can we help?" />

        <button className="btn primary full" type="submit">Send Message</button>
        {submitted && (
          <p className="form-message" role="status">
            Message validated. Connect a backend or email service to deliver it.
          </p>
        )}
      </form>
    </main>
  );
}

function NotFound() {
  return (
    <main className="page-container not-found">
      <h1>404 — Page not found</h1>
      <Link className="btn primary" to="/">Return Home</Link>
    </main>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <Link to="/" className="brand">♻ GreenShare</Link>
      <p>Share food. Reduce waste. Grow together.</p>
      <span>© {new Date().getFullYear()} GreenShare Community</span>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
