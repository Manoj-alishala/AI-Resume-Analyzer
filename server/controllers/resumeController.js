import Resume from "../models/Resume.js";
import { parseResume } from "../utils/resumeParser.js";
import { extractKeywords } from "../utils/keywordExtractor.js";
import { calculateATSScore } from "../utils/atsScore.js";
import { analyzeWithGemini } from "../utils/aiAnalyzer.js";

/* ========================= UPLOAD + PARSE ========================= */
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const uint8Array = new Uint8Array(req.file.buffer);
    const text = await parseResume(uint8Array);

    if (!text || text.trim().length === 0)
      return res.status(400).json({ error: "No text extracted from PDF" });

    console.log("Resume parsed. Length:", text.length);
    res.json({ success: true, preview: text.substring(0, 500), text });
  } catch (err) {
    console.error("Upload Resume Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ========================= ANALYZE ========================= */
export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription)
      return res.status(400).json({ error: "Missing resumeText or jobDescription" });

    const jdKeywords = extractKeywords(jobDescription);
    const resumeKeywords = extractKeywords(resumeText);
    const score = calculateATSScore(jdKeywords, resumeKeywords);
    console.log("ATS Score:", score);

    const suggestions = await analyzeWithGemini(resumeText, jobDescription);

    // Extract AI's compatibility score (the authoritative score)
    const aiScore =
      suggestions?.analysis?.compatibility_score ??
      suggestions?.compatibility_score ??
      score; // fall back to keyword score if AI didn't return one

    // Save to history
    await Resume.create({
      userId: req.user.id,
      text: resumeText.substring(0, 500),
      atsScore: aiScore,
      suggestions,
      jobDescription: jobDescription.substring(0, 300),
      createdAt: new Date(),
    });

    res.json({ success: true, score: aiScore, suggestions });
  } catch (err) {
    console.error("Analyze Resume Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ========================= HISTORY ========================= */
export const getHistory = async (req, res) => {
  try {
    const history = await Resume.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("atsScore jobDescription createdAt");

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};