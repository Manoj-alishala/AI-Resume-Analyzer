import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
            const response = await fetch(url, options);
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                navigate("/");
            } else {
                setError(data.message || "Registration failed");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
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
