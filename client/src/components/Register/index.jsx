import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../../api";
import "./index.css";

const Register = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        const url = "/auth/register";
        const userDetails = { name, email, password };

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userDetails),
        };

        try {
            const response = await apiFetch(url, options);

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem("token", data.token);
                    navigate("/");
                } else {
                    setError(data.message || "Registration failed");
                }
            } else {
                const text = await response.text();
                console.error("Non-JSON Server Response:", text);
                throw new Error("Server returned an invalid response. Check console for details.");
            }
        } catch (err) {
            console.error("Registration Error caught in catch block:", err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h2>Register</h2>

                {error && <p className="error-text">{error}</p>}

                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>

                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;
