import express from 'express';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';
import { auth } from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const generatePrompt = (type, content, context = {}) => {
  const prompts = {
    improveBullet: `Improve this resume bullet point to be more impactful, action-oriented, and quantified. Return ONLY the improved bullet point, nothing else. Original: "${content}"`,
    rewriteSummary: `Rewrite this professional summary to be more compelling, ATS-friendly, and specific. Return ONLY the rewritten summary. Current: "${content}"${context.targetRole ? ` Target role: ${context.targetRole}` : ''}`,
    suggestSkills: `Based on this experience description, suggest exactly 10 relevant technical and soft skills as a simple comma-separated list. Experience: "${content}"`,
    generateBullets: `Generate exactly 4 strong resume bullet points for a ${context.position || 'professional'} at ${context.company || 'company'}. Return each bullet on a new line starting with "• ". Focus on achievements with metrics. Context: ${content}`,
    optimizeKeywords: `Analyze this resume content and list exactly 8 missing keywords that would improve ATS scoring for a ${context.targetRole || 'software engineer'} role. Return as comma-separated list. Content: "${content}"`,
    fixGrammar: `Fix grammar, improve clarity, and make more professional. Return ONLY the corrected text. Original: "${content}"`
  };
  return prompts[type] || prompts.improveBullet;
};

router.post('/suggest', [
  body('type').isIn(['improveBullet', 'rewriteSummary', 'suggestSkills', 'generateBullets', 'optimizeKeywords', 'fixGrammar']),
  body('content').trim().notEmpty(),
  body('context').optional().isObject()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const openai = getOpenAI();
  if (!openai) {
    return res.status(503).json({
      message: 'AI service not configured. Add OPENAI_API_KEY to server .env file.',
      suggestion: null
    });
  }

  try {
    const { type, content, context = {} } = req.body;
    const prompt = generatePrompt(type, content, context);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert resume writer and career coach. Provide concise, actionable suggestions. Return only the requested content without explanations.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const suggestion = completion.choices[0]?.message?.content?.trim() || '';
    res.json({ suggestion, type });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ message: 'AI suggestion failed', error: err.message });
  }
});

router.post('/ats-score', [
  body('resume').isObject(),
  body('jobDescription').optional().trim()
], async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;

    const openai = getOpenAI();
    if (!openai) {
      const localScore = calculateLocalATSScore(resume, jobDescription);
      return res.json(localScore);
    }

    const resumeText = formatResumeText(resume);

    const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume${jobDescription ? ` against this job description` : ''} and provide a detailed ATS score.

RESUME:
${resumeText}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : ''}

Return your response as a JSON object with this exact structure (no markdown, just raw JSON):
{
  "overall": <number 0-100>,
  "sections": {
    "formatting": <number 0-100>,
    "keywords": <number 0-100>,
    "experience": <number 0-100>,
    "education": <number 0-100>,
    "skills": <number 0-100>
  },
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "improvements": ["<improvement1>", "<improvement2>", "<improvement3>"],
  "missingKeywords": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "suggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an ATS scoring expert. Always respond with valid JSON only, no markdown formatting.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || '';
    let scoreData;
    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      scoreData = JSON.parse(cleaned);
    } catch {
      scoreData = calculateLocalATSScore(resume, jobDescription);
    }

    res.json(scoreData);
  } catch (err) {
    console.error('ATS score error:', err);
    const localScore = calculateLocalATSScore(req.body.resume, req.body.jobDescription);
    res.json(localScore);
  }
});

router.post('/analyze', [
  body('resume').isObject()
], async (req, res) => {
  const openai = getOpenAI();
  if (!openai) {
    return res.status(503).json({ message: 'AI service not configured' });
  }

  try {
    const { resume } = req.body;
    const resumeText = JSON.stringify(resume, null, 2);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an ATS expert and resume reviewer. Analyze the resume and provide specific, actionable feedback.' },
        { role: 'user', content: `Analyze this resume and provide: 1) Overall score (0-100), 2) Top 5 strengths, 3) Top 5 areas for improvement, 4) Missing keywords for software engineering roles, 5) Specific suggestions for each section. Resume: ${resumeText}` }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    const analysis = completion.choices[0]?.message?.content?.trim() || '';
    res.json({ analysis });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ message: 'AI analysis failed', error: err.message });
  }
});

function formatResumeText(resume) {
  const parts = [];
  if (resume.personalInfo) {
    const p = resume.personalInfo;
    parts.push(`Name: ${p.fullName || 'N/A'}`);
    parts.push(`Summary: ${p.summary || 'N/A'}`);
  }
  if (resume.experience?.length) {
    parts.push('Experience:');
    resume.experience.forEach(e => {
      parts.push(`- ${e.position || 'N/A'} at ${e.company || 'N/A'}: ${e.description || 'N/A'}`);
      if (e.achievements?.length) parts.push(`  Achievements: ${e.achievements.join('; ')}`);
    });
  }
  if (resume.education?.length) {
    parts.push('Education:');
    resume.education.forEach(e => {
      parts.push(`- ${e.degree || 'N/A'} in ${e.fieldOfStudy || 'N/A'} from ${e.institution || 'N/A'}`);
    });
  }
  if (resume.skills?.length) {
    parts.push('Skills:');
    resume.skills.forEach(s => {
      parts.push(`- ${s.category || 'General'}: ${(s.items || []).join(', ')}`);
    });
  }
  if (resume.projects?.length) {
    parts.push('Projects:');
    resume.projects.forEach(p => {
      parts.push(`- ${p.name || 'N/A'}: ${p.description || 'N/A'}`);
    });
  }
  return parts.join('\n');
}

function calculateLocalATSScore(resume, jobDescription) {
  let formatting = 0;
  let keywords = 0;
  let experience = 0;
  let education = 0;
  let skills = 0;

  // Formatting (0-100)
  if (resume.personalInfo?.fullName) formatting += 15;
  if (resume.personalInfo?.email) formatting += 10;
  if (resume.personalInfo?.phone) formatting += 10;
  if (resume.personalInfo?.location) formatting += 5;
  if (resume.personalInfo?.summary) formatting += 15;
  if (resume.experience?.length > 0) formatting += 15;
  if (resume.education?.length > 0) formatting += 10;
  if (resume.skills?.length > 0) formatting += 10;
  if (resume.personalInfo?.linkedin) formatting += 5;
  if (resume.personalInfo?.github) formatting += 5;

  // Experience (0-100)
  if (resume.experience?.length > 0) {
    experience += Math.min(resume.experience.length * 20, 60);
    resume.experience.forEach(exp => {
      if (exp.description && exp.description.length > 50) experience += 10;
      if (exp.achievements?.filter(Boolean).length > 0) experience += 10;
    });
    experience = Math.min(experience, 100);
  }

  // Education (0-100)
  if (resume.education?.length > 0) {
    education += Math.min(resume.education.length * 30, 60);
    resume.education.forEach(edu => {
      if (edu.degree) education += 10;
      if (edu.fieldOfStudy) education += 10;
      if (edu.institution) education += 10;
    });
    education = Math.min(education, 100);
  }

  // Skills (0-100)
  if (resume.skills?.length > 0) {
    const totalSkills = resume.skills.reduce((acc, s) => acc + (s.items?.filter(Boolean).length || 0), 0);
    skills += Math.min(totalSkills * 5, 50);
    if (resume.skills.some(s => s.category)) skills += 25;
    if (totalSkills >= 10) skills += 25;
    skills = Math.min(skills, 100);
  }

  // Keywords matching
  if (jobDescription) {
    const jobLower = jobDescription.toLowerCase();
    const resumeText = JSON.stringify(resume).toLowerCase();
    const commonKeywords = ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker', 'git', 'api', 'agile', 'scrum', 'typescript', 'java', 'css', 'html'];
    const found = commonKeywords.filter(k => jobLower.includes(k) && resumeText.includes(k));
    keywords = Math.min(Math.round((found.length / Math.min(commonKeywords.filter(k => jobLower.includes(k)).length, 10)) * 100), 100);
  } else {
    keywords = resume.skills?.length > 0 ? 70 : 40;
  }

  const overall = Math.round((formatting + keywords + experience + education + skills) / 5);

  const strengths = [];
  const improvements = [];
  const missingKeywords = [];
  const suggestions = [];

  if (resume.personalInfo?.summary) strengths.push('Has a professional summary');
  else improvements.push('Add a professional summary');

  if (resume.experience?.length >= 2) strengths.push('Multiple work experiences listed');
  else improvements.push('Add more work experience entries');

  if (resume.skills?.length > 0) strengths.push('Skills section is present');
  else improvements.push('Add a skills section');

  if (resume.projects?.length > 0) strengths.push('Projects section shows practical experience');

  if (!resume.personalInfo?.linkedin) { missingKeywords.push('LinkedIn profile'); improvements.push('Add LinkedIn profile'); }
  if (!resume.personalInfo?.phone) { improvements.push('Add phone number'); }

  if (resume.experience?.some(e => e.achievements?.filter(Boolean).length > 0)) {
    strengths.push('Includes quantified achievements');
  } else {
    improvements.push('Add bullet points with measurable achievements');
    suggestions.push('Use action verbs and include metrics (e.g., "Increased sales by 20%")');
  }

  suggestions.push('Tailor your resume keywords to match the job description');
  suggestions.push('Keep resume to 1-2 pages maximum');

  return {
    overall,
    sections: { formatting, keywords, experience, education, skills },
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    missingKeywords: missingKeywords.slice(0, 5),
    suggestions: suggestions.slice(0, 3)
  };
}

export default router;
