import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../../api";
import "./index.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmail = (event) => {
    setEmail(event.target.value);
  };

  const handlePassword = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    const url = "/auth/login";
    const userDetails = {
      email,
      password
    }

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userDetails)
    }
    try {
      const response = await apiFetch(url, options)

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()

        if (response.ok) {
          localStorage.setItem("token", data.token);
          navigate("/");
        } else {
          setError(data.message || "Login failed");
        }
      } else {
        const text = await response.text();
        console.error("Non-JSON Server Response:", text);
        throw new Error("Server returned an invalid response. Check console for details.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <p className="error-text">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={handleEmail}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={handlePassword}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;