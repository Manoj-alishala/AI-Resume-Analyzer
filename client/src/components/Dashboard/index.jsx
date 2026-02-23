import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";
import Navbar from "../Navbar";
import "./index.css";

const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

const scoreColor = (s) => {
    if (s >= 75) return "#00c896";
    if (s >= 50) return "#f59e0b";
    return "#f87171";
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) { navigate("/login"); return; }

        Promise.all([
            apiFetch("/auth/me", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
            apiFetch("/resume/history", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        ])
            .then(([userData, historyData]) => {
                if (userData._id) setUser(userData);
                if (Array.isArray(historyData)) setHistory(historyData);
            })
            .finally(() => setLoading(false));
    }, []);

    const avg = history.length
        ? Math.round(history.reduce((a, b) => a + (b.atsScore || 0), 0) / history.length)
        : 0;
    const best = history.length ? Math.max(...history.map((h) => h.atsScore || 0)) : 0;

    if (loading) return (
        <div className="dash-loading">
            <Navbar />
            <div className="dash-spinner" />
        </div>
    );

    return (
        <div className="dash-wrapper">
            <Navbar />

            <main className="dash-main">
                {/* Header */}
                <div className="dash-header">
                    <div className="dash-avatar">{getInitials(user?.name)}</div>
                    <div>
                        <h1 className="dash-name">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
                        <p className="dash-email">{user?.email}</p>
                    </div>
                    <button className="dash-analyze-btn" onClick={() => navigate("/your-resumes")}>
                        + New Analysis
                    </button>
                </div>

                {/* Stats row */}
                <div className="dash-stats">
                    {[
                        { label: "Total Analyses", value: history.length, icon: "📄" },
                        { label: "Average Score", value: `${avg}%`, icon: "📊" },
                        { label: "Best Score", value: `${best}%`, icon: "🏆" },
                    ].map((stat, i) => (
                        <div className="stat-card" key={i}>
                            <span className="stat-icon">{stat.icon}</span>
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* History table */}
                <div className="dash-section">
                    <h2 className="dash-section-title">Analysis History</h2>

                    {history.length === 0 ? (
                        <div className="dash-empty">
                            <div className="dash-empty-icon">📋</div>
                            <p>No analyses yet. Upload your first resume to get started!</p>
                            <button className="dash-analyze-btn" onClick={() => navigate("/your-resumes")}>
                                Analyze Resume
                            </button>
                        </div>
                    ) : (
                        <div className="history-grid">
                            {history.map((item, i) => (
                                <div className="history-card" key={i}>
                                    {/* Score ring */}
                                    <div className="hcard-score-wrap">
                                        <svg viewBox="0 0 80 80" className="hcard-ring">
                                            <circle cx="40" cy="40" r="34" className="hring-bg" />
                                            <circle
                                                cx="40" cy="40" r="34"
                                                className="hring-fill"
                                                style={{
                                                    stroke: scoreColor(item.atsScore),
                                                    strokeDasharray: `${2 * Math.PI * 34}`,
                                                    strokeDashoffset: `${2 * Math.PI * 34 * (1 - (item.atsScore || 0) / 100)}`,
                                                }}
                                            />
                                        </svg>
                                        <span className="hcard-score-num" style={{ color: scoreColor(item.atsScore) }}>
                                            {item.atsScore ?? "–"}%
                                        </span>
                                    </div>

                                    <div className="hcard-info">
                                        <p className="hcard-jd">
                                            {item.jobDescription
                                                ? item.jobDescription.slice(0, 80) + (item.jobDescription.length > 80 ? "…" : "")
                                                : "Resume Analysis"}
                                        </p>
                                        <span className="hcard-date">
                                            {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short", year: "numeric",
                                            })}
                                        </span>
                                        <span
                                            className="hcard-badge"
                                            style={{ background: `${scoreColor(item.atsScore)}22`, color: scoreColor(item.atsScore), borderColor: `${scoreColor(item.atsScore)}44` }}
                                        >
                                            {item.atsScore >= 75 ? "Strong Match" : item.atsScore >= 50 ? "Moderate Match" : "Needs Work"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
