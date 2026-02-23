import React, { useState } from "react";
import { apiFetch } from "../../api";
import Navbar from "../Navbar";
import "./index.css";

const scoreColor = (s) => s >= 75 ? "#00c896" : s >= 50 ? "#f59e0b" : "#f87171";
const scoreLabel = (s) => s >= 75 ? "Strong Match 🎯" : s >= 50 ? "Moderate Match ⚡" : "Needs Work ⚠️";

const YourResumes = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [score, setScore] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const handleUpload = async () => {
    if (!selectedFile) { setError("Please select a PDF resume."); return; }
    if (!jobDescription.trim()) { setError("Please paste a job description."); return; }
    const token = localStorage.getItem("token");
    if (!token) { setError("You must be logged in."); return; }

    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      setLoading(true); setError("");

      const up = await apiFetch("/resume/upload", {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      if (!up.ok) throw new Error(await up.text() || "Upload failed");
      const { text } = await up.json();

      const an = await apiFetch("/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resumeText: text, jobDescription: jobDescription.trim() }),
      });
      if (!an.ok) throw new Error(await an.text() || "Analysis failed");
      const result = await an.json();

      const r = result.suggestions?.analysis ?? result.suggestions ?? result;
      setScore(result.score ?? r?.compatibility_score ?? 0);
      setReport(r);
      setActiveTab("overview");
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── UPLOAD PAGE ─── */
  if (!report) return (
    <div className="yr-page">
      <Navbar />
      <div className="yr-upload-wrap">
        <div className="yr-upload-card">
          <div className="yr-upload-badge">AI-Powered</div>
          <h1 className="yr-upload-title">Resume <span className="yr-grad">ATS Analyzer</span></h1>
          <p className="yr-upload-sub">Upload your resume and paste a job description to get an instant ATS score, skill gap analysis, and AI-powered bullet point rewrites.</p>

          <label className="yr-file-label">
            <input type="file" accept=".pdf" onChange={(e) => { setSelectedFile(e.target.files[0]); setError(""); }} hidden />
            <div className="yr-drop-zone">
              <div className="yr-drop-icon">📄</div>
              <p className="yr-drop-text">{selectedFile ? `✓ ${selectedFile.name}` : "Click to upload PDF"}</p>
              <p className="yr-drop-hint">Supports PDF up to 10MB</p>
            </div>
          </label>

          <div className="yr-jd-block">
            <label className="yr-jd-label">Job Description</label>
            <textarea
              className="yr-jd-area"
              rows={7}
              placeholder="Paste the full job description here — requirements, responsibilities, skills…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <span className="yr-char">{jobDescription.length} chars</span>
          </div>

          {error && <div className="yr-error">{error}</div>}

          <button className="yr-btn" onClick={handleUpload} disabled={loading}>
            {loading ? <><span className="yr-spin" /> Analyzing…</> : "Analyze My Resume →"}
          </button>
        </div>
      </div>
    </div>
  );

  /* ─── FULL-PAGE REPORT ─── */
  const circumference = 2 * Math.PI * 52;
  const offset = circumference * (1 - score / 100);
  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "skills", label: "Skills", icon: "🛠" },
    { id: "improvements", label: "Bullet Rewrites", icon: "✏️" },
    { id: "tips", label: "ATS Tips", icon: "🎯" },
  ];

  // Real metrics from AI — fall back to derived values if model didn't return them
  const ca = report?.content_analysis ?? {};
  const jdSkills = report?.job_description_skills ?? [];
  const resumeSkills = report?.resume_skills ?? [];
  const matched = resumeSkills.filter(s => jdSkills.map(j => j.toLowerCase()).includes(s.toLowerCase()));
  const missingCount = report?.missing_skills?.from_resume_for_job_description?.length ?? 0;
  const totalJD = jdSkills.length || 1;

  const contentMetrics = [
    { label: "ATS Parse Rate", value: ca.ats_parse_rate ?? Math.min(100, Math.round(96 + (score - 50) * 0.08)), color: "#00c896" },
    { label: "Keyword Match", value: ca.keyword_match ?? (jdSkills.length ? Math.round((matched.length / jdSkills.length) * 100) : score), color: "#00A3FF" },
    { label: "Impact Score", value: ca.impact_score ?? score, color: "#8b5cf6" },
    { label: "Readability", value: ca.readability_score ?? Math.min(100, Math.max(60, Math.round(100 - (missingCount / totalJD) * 40))), color: "#f59e0b" },
  ];

  return (
    <div className="yr-page">
      <Navbar />

      {/* ── HERO ── */}
      <section className="rp-hero">
        <div className="rp-hero-bg" />
        <div className="rp-hero-content">
          {/* Score ring */}
          <div className="rp-ring-wrap">
            <svg className="rp-ring-svg" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" className="rp-ring-track" />
              <circle cx="60" cy="60" r="52" className="rp-ring-progress"
                style={{ stroke: scoreColor(score), strokeDasharray: circumference, strokeDashoffset: offset }} />
            </svg>
            <div className="rp-ring-inner">
              <span className="rp-ring-num" style={{ color: scoreColor(score) }}>{score}</span>
              <span className="rp-ring-label">/ 100</span>
            </div>
          </div>

          {/* Title block */}
          <div className="rp-hero-text">
            <span className="rp-hero-tag">ATS Analysis Report</span>
            <h1 className="rp-hero-h1">Your resume scored <span style={{ color: scoreColor(score) }}>{score}%</span></h1>
            <span className="rp-match-badge" style={{ background: `${scoreColor(score)}18`, color: scoreColor(score), border: `1px solid ${scoreColor(score)}44` }}>
              {scoreLabel(score)}
            </span>
            <p className="rp-hero-assess">{report?.overall_assessment}</p>
            <button className="rp-back-btn" onClick={() => { setReport(null); setScore(0); }}>
              ← Analyze Another
            </button>
          </div>

          {/* Content Analysis Card */}
          <div className="ca-card">
            <div className="ca-header">
              <span className="ca-logo">✦ ResumeATS</span>
              <span className="ca-score-badge">{score}/100</span>
            </div>
            <div className="ca-section-label">CONTENT ANALYSIS</div>
            {contentMetrics.map((m, i) => (
              <div className="ca-row" key={i}>
                <span className="ca-row-label">{m.label}</span>
                <div className="ca-bar">
                  <div className="ca-bar-fill" style={{ width: `${m.value}%`, background: m.color, animationDelay: `${i * 0.15}s` }} />
                </div>
                <span className="ca-pct">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ROW ── */}
      <section className="rp-stats">
        {[
          { label: "Resume Skills", value: report?.resume_skills?.length ?? 0, color: "#00c896" },
          { label: "JD Skills", value: report?.job_description_skills?.length ?? 0, color: "#00A3FF" },
          { label: "Missing Skills", value: report?.missing_skills?.from_resume_for_job_description?.length ?? 0, color: "#f87171" },
          { label: "ATS Tips", value: report?.ats_optimization_tips?.length ?? 0, color: "#a78bfa" },
        ].map((s, i) => (
          <div className="rp-stat-card" key={i} style={{ "--accent": s.color }}>
            <span className="rp-stat-num" style={{ color: s.color }}>{s.value}</span>
            <span className="rp-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── TABS ── */}
      <div className="rp-tab-bar center-tab">
        {tabs.map((t) => (
          <button key={t.id} className={`rp-tab ${activeTab === t.id ? "rp-tab--active" : ""}`} onClick={() => setActiveTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB BODY ── */}
      <main className="rp-main">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="rp-grid-2">
            <div className="rp-card">
              <h2 className="rp-card-title"><span className="rp-card-dot" style={{ background: "#f87171" }} />Missing Skills <span className="rp-count">{report?.missing_skills?.from_resume_for_job_description?.length ?? 0}</span></h2>
              <div className="chip-row">
                {report?.missing_skills?.from_resume_for_job_description?.length
                  ? report.missing_skills.from_resume_for_job_description.map((s, i) => <span key={i} className="chip chip-red">{s}</span>)
                  : <span className="rp-empty">No missing skills — great match!</span>}
              </div>
            </div>
            <div className="rp-card">
              <h2 className="rp-card-title"><span className="rp-card-dot" style={{ background: "#a78bfa" }} />Extra Skills <span className="rp-count">{report?.missing_skills?.from_job_description_for_resume?.length ?? 0}</span></h2>
              <div className="chip-row">
                {report?.missing_skills?.from_job_description_for_resume?.map((s, i) => <span key={i} className="chip chip-purple">{s}</span>)}
              </div>
            </div>
          </div>
        )}

        {/* SKILLS */}
        {activeTab === "skills" && (
          <div className="rp-grid-2">
            <div className="rp-card">
              <h2 className="rp-card-title"><span className="rp-card-dot" style={{ background: "#00c896" }} />Your Resume Skills <span className="rp-count">{report?.resume_skills?.length ?? 0}</span></h2>
              <div className="chip-row">
                {report?.resume_skills?.map((s, i) => <span key={i} className="chip chip-green">{s}</span>)}
              </div>
            </div>
            <div className="rp-card">
              <h2 className="rp-card-title"><span className="rp-card-dot" style={{ background: "#00A3FF" }} />Job Description Skills <span className="rp-count">{report?.job_description_skills?.length ?? 0}</span></h2>
              <div className="chip-row">
                {report?.job_description_skills?.map((s, i) => <span key={i} className="chip chip-blue">{s}</span>)}
              </div>
            </div>
          </div>
        )}

        {/* IMPROVEMENTS */}
        {activeTab === "improvements" && (
          <div className="rp-improve-list">
            {report?.ats_optimized_bullet_point_improvements?.map((item, i) => (
              <div className="rp-improve-card" key={i}>
                <div className="rp-improve-row">
                  <div className="rp-improve-side rp-improve-before">
                    <span className="rp-itag rp-itag-orig">Original</span>
                    <p>{item.original_summary}</p>
                  </div>
                  <div className="rp-improve-arrow">→</div>
                  <div className="rp-improve-side rp-improve-after">
                    <span className="rp-itag rp-itag-new">AI Rewrites</span>
                    <ul>{item.suggested_bullets?.map((b, j) => <li key={j}>{b}</li>)}</ul>
                  </div>
                </div>
                {item.reasoning && (
                  <div className="rp-reasoning">
                    <span className="rp-itag rp-itag-why">Why</span>
                    <p>{item.reasoning}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TIPS */}
        {activeTab === "tips" && (
          <div className="rp-tips-grid">
            {report?.ats_optimization_tips?.map((tip, i) => (
              <div className="rp-tip-card" key={i}>
                <span className="rp-tip-num">{String(i + 1).padStart(2, "0")}</span>
                <p>{tip.replace(/\*\*/g, "")}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default YourResumes;