import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../api";
import "./index.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");

  // Fetch user info & history when logged in
  useEffect(() => {
    if (!token) { setUser(null); return; }

    apiFetch("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { if (data._id) setUser(data); })
      .catch(() => { });

    apiFetch("/resume/history", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setHistory(data); })
      .catch(() => { });
  }, [token, location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setDropdownOpen(false);
    navigate("/");
  };

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  const links = [
    { label: "Home", path: "/" },
    { label: "Your Resumes", path: "/your-resumes" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/")}>
        ✦ ResumeATS
      </div>

      <div className="navbar-links">
        {links.map((link) => (
          <button
            key={link.path}
            className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </button>
        ))}
      </div>

      <div className="navbar-actions">
        {user ? (
          /* ---- USER AVATAR + DROPDOWN ---- */
          <div className="user-menu" ref={dropdownRef}>
            <button
              className="user-avatar"
              onClick={() => setDropdownOpen((o) => !o)}
              title={user.name}
            >
              {getInitials(user.name)}
            </button>

            {dropdownOpen && (
              <div className="user-dropdown">
                {/* Profile header */}
                <div className="dropdown-profile" style={{ cursor: "pointer" }} onClick={() => { navigate("/dashboard"); setDropdownOpen(false); }}>
                  <div className="dropdown-avatar-lg">{getInitials(user.name)}</div>
                  <div>
                    <p className="dropdown-name">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                  </div>
                </div>

                <div className="dropdown-divider" />

                {/* History */}
                <p className="dropdown-section-label">Recent Analyses</p>
                {history.length === 0 ? (
                  <p className="dropdown-empty">No analyses yet</p>
                ) : (
                  <ul className="dropdown-history">
                    {history.map((item, i) => (
                      <li key={i} className="history-item">
                        <div className="history-score">{item.atsScore}%</div>
                        <div className="history-info">
                          <span className="history-jd">
                            {item.jobDescription
                              ? item.jobDescription.slice(0, 40) + "…"
                              : "Resume Analysis"}
                          </span>
                          <span className="history-date">
                            {new Date(item.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="dropdown-divider" />

                <button className="dropdown-dashboard-btn" onClick={() => { navigate("/dashboard"); setDropdownOpen(false); }}>
                  📊 View Full Dashboard
                </button>

                <div className="dropdown-divider" />

                <button className="dropdown-logout" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button className="nav-btn-ghost" onClick={() => navigate("/login")}>Login</button>
            <button className="nav-btn-primary" onClick={() => navigate("/register")}>Register</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;