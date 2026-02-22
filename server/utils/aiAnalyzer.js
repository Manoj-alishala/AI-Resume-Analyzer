import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

export const analyzeWithGemini = async (resumeText, jobDescription) => {
  try {
    if (!process.env.NVIDIA_API_KEY) {
      throw new Error("NVIDIA_API_KEY is not set in .env");
    }

    const completion = await client.chat.completions.create({
      model: "meta/llama-3.1-8b-instruct",
      messages: [
        {
          role: "system",
          content:
            "You are an expert ATS resume analyst. Provide a structured, actionable resume analysis and optimization suggestions in JSON format. Do not include any explanations outside JSON, and ensure the JSON is valid and parsable. Include sections for: target role summary (one-liner), key skills alignment, experience bullet optimization (before/after examples), keyword recommendations by ATS checkpoints, and a minimal MVP resume snippet in JSON. The output must be strictly valid JSON with no extraneous text or formatting.",
        },
        {
          role: "user",
          content: buildPrompt(resumeText, jobDescription),
        },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });

    const rawText = completion.choices?.[0]?.message?.content?.trim();

    console.log("====== LLAMA RAW OUTPUT ======");
    console.log(rawText);
    console.log("==============================");

    if (!rawText) throw new Error("Empty response from Llama");

    // Strip any accidental markdown fences
    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (parseError) {
      console.warn("JSON parse failed. Returning raw output.");
      return { success: false, raw_model_output: rawText };
    }
  } catch (err) {
    console.error("Llama Fatal Error:", err.message);
    return { success: false, error: err.message };
  }
};

const buildPrompt = (resumeText, jobDescription) => `
Analyze the resume against the job description and return ONLY this exact JSON with no extra text, no markdown, no backticks:

{
  "success": true,
  "analysis": {
    "resume_skills": [],
    "job_description_skills": [],
    "missing_skills": {
      "from_resume_for_job_description": [],
      "from_job_description_for_resume": []
    },
    "ats_optimized_bullet_point_improvements": [
      {
        "original_summary": "",
        "suggested_bullets": [],
        "reasoning": ""
      }
    ],
    "ats_optimization_tips": [],
    "compatibility_score": 0,
    "content_analysis": {
      "ats_parse_rate": 0,
      "keyword_match": 0,
      "impact_score": 0,
      "readability_score": 0
    },
    "overall_assessment": ""
  }
}

Rules for content_analysis scores (all 0-100 integers):
- ats_parse_rate: How well resume structure/format will be parsed by ATS bots (based on formatting, sections, headers).
- keyword_match: Percentage of job description keywords found in the resume.
- impact_score: How impactful and quantified the resume's bullet points are (use of metrics, action verbs, achievements).
- readability_score: Clarity, conciseness, and professionalism of the resume language.

Resume:
${resumeText}

Job Description:
${jobDescription}
`;
