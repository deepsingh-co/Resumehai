import express from 'express';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';
import { auth } from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

const getOpenAI = () => {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key || /^(your-|sk-your|placeholder|change-me)/i.test(key)) return null;
  return new OpenAI({ apiKey: key });
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

/*
 * Resume coach chat. Works with OpenAI when configured, and falls back to a
 * practical, resume-aware coach so the feature still helps without a key.
 */
router.post('/chat', [
  body('messages').isArray({ min: 1, max: 30 }),
  body('messages.*.role').isIn(['user', 'assistant']),
  body('messages.*.content').isString().trim().isLength({ min: 1, max: 4000 }),
  body('resume').optional({ values: 'null' }).isObject(),
  body('jobDescription').optional({ values: 'null' }).isString().trim().isLength({ max: 12000 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { messages, resume, jobDescription } = req.body;
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  if (!lastUserMessage) {
    return res.status(400).json({ message: 'Ask a question to start the chat.' });
  }

  const question = lastUserMessage.content.trim();
  const suggestions = getChatSuggestions(resume);

  const openai = getOpenAI();
  if (!openai) {
    return res.json({
      reply: buildLocalChatReply(question, resume, jobDescription),
      source: 'local',
      suggestions
    });
  }

  try {
    const history = messages.slice(-12).map(({ role, content }) => ({
      role,
      content: content.slice(0, 2000)
    }));

    const resumeContext = buildChatContext(resume, jobDescription);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are Resumehai Coach, a friendly and practical career coach inside a resume builder. ' +
            'Help the user clear doubts about job applications and improve their resume. ' +
            'Keep answers concise (under 180 words unless they ask for more). Use short "-" bullet lines. ' +
            'Refer to the resume details when provided. Never invent employers, dates, achievements, or numbers. ' +
            'When you suggest rewritten content, label it as an example and remind the user to keep it truthful. ' +
            'Do not use markdown headings or tables.' +
            resumeContext
        },
        ...history
      ],
      temperature: 0.6,
      max_tokens: 450
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) throw new Error('OpenAI returned an empty reply');

    res.json({ reply, source: 'ai', suggestions });
  } catch (err) {
    console.error('OpenAI chat error:', err.message);
    res.json({
      reply: buildLocalChatReply(question, resume, jobDescription),
      source: 'local',
      suggestions
    });
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

/* --------------------------------------------------------------------------
   Resume coach helpers
   -------------------------------------------------------------------------- */

const CHAT_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'you', 'your', 'yours', 'are', 'was', 'were', 'have',
  'has', 'had', 'this', 'that', 'these', 'those', 'from', 'will', 'would', 'can',
  'could', 'should', 'all', 'but', 'not', 'our', 'out', 'who', 'how', 'what', 'when',
  'where', 'why', 'job', 'jobs', 'role', 'roles', 'work', 'working', 'resume', 'cv',
  'about', 'into', 'over', 'under', 'more', 'most', 'some', 'any', 'their', 'they',
  'them', 'there', 'here', 'also', 'been', 'being', 'using', 'use', 'used', 'across',
  'within', 'while', 'able', 'good', 'great', 'strong', 'looking', 'seeking', 'plus',
  'etc', 'team', 'teams', 'company', 'business', 'candidate', 'candidates', 'years',
  'year', 'including', 'include', 'includes', 'environment', 'ability', 'knowledge',
  'understanding', 'excellent', 'skills', 'skill', 'experience', 'experiences',
  'responsibilities', 'responsibility', 'requirements', 'requirement',
  'qualifications', 'qualification', 'preferred', 'required', 'must', 'may', 'new',
  'one', 'two', 'three', 'our', 'us', 'we', 'it', 'its', 'as', 'at', 'by', 'in', 'on',
  'of', 'or', 'to', 'be', 'is', 'an', 'a', 'if', 'do', 'does', 'did', 'than', 'then',
  'their', 'there', 'through', 'per', 'via', 'own', 'other', 'such', 'well'
]);

function getChatSuggestions(resume) {
  if (resume) {
    return [
      'Review my summary',
      'What skills should I add?',
      'Is my resume ATS-ready?',
      'How can I quantify my experience?'
    ];
  }

  return [
    'What makes a resume ATS-friendly?',
    'How long should my resume be?',
    'How do I explain a career gap?',
    'How should I tailor my resume?'
  ];
}

function buildChatContext(resume, jobDescription) {
  if (!resume) return '';

  let context = `\n\nCURRENT RESUME:\n${formatResumeText(resume)}`;
  if (resume.skills?.length) {
    context += `\nSkills: ${resume.skills
      .map((group) => `${group.category || 'General'} - ${(group.items || []).join(', ')}`)
      .join(' | ')}`;
  }
  if (jobDescription) {
    context += `\n\nTARGET JOB DESCRIPTION:\n${jobDescription.slice(0, 3000)}`;
  }
  return context;
}

function getResumeSnapshot(resume) {
  const personal = resume?.personalInfo || {};
  const skills = (resume?.skills || []).flatMap((group) => group.items || []).filter(Boolean);
  const achievements = (resume?.experience || [])
    .flatMap((item) => item.achievements || [])
    .filter(Boolean);
  const metricAchievements = achievements.filter((item) => /\d/.test(item));

  const missingContact = [
    !personal.email && 'email address',
    !personal.phone && 'phone number',
    !personal.location && 'location',
    !personal.linkedin && 'LinkedIn URL'
  ].filter(Boolean);

  const missingSections = [
    !personal.summary && 'a professional summary',
    !(resume?.experience?.length) && 'work experience',
    !(resume?.education?.length) && 'education',
    !(resume?.skills?.length) && 'skills'
  ].filter(Boolean);

  return {
    personal,
    skills,
    achievements,
    metricAchievements,
    missingContact,
    missingSections,
    groups: resume?.skills?.length || 0,
    latestRole: resume?.experience?.[0]?.position || 'professional',
    latestCompany: resume?.experience?.[0]?.company || 'your latest role'
  };
}

function getRecommendedSkills(resume) {
  const text = JSON.stringify(resume || {}).toLowerCase();

  if (/react|frontend|front-end|typescript|javascript|next\.js/.test(text)) {
    return ['TypeScript', 'testing (Jest or React Testing Library)', 'accessibility (WCAG)', 'performance profiling', 'CI/CD'];
  }
  if (/backend|back-end|node|express|api|java|golang|python|microservice/.test(text)) {
    return ['REST or GraphQL API design', 'SQL and indexing', 'Docker', 'automated testing', 'observability'];
  }
  if (/data|analyst|analytics|machine learning|ml\b|scientist/.test(text)) {
    return ['SQL', 'Python (pandas)', 'data visualization', 'experimentation and A/B testing', 'data modeling'];
  }
  if (/product manager|product owner|roadmap|product lead/.test(text)) {
    return ['roadmapping', 'analytics and KPIs', 'A/B testing', 'stakeholder management', 'SQL'];
  }
  if (/design|ux|ui designer|figma/.test(text)) {
    return ['Figma', 'design systems', 'prototyping', 'user research', 'accessibility'];
  }
  if (/marketing|seo|content|growth|social media/.test(text)) {
    return ['SEO', 'analytics (GA4)', 'lifecycle or email marketing', 'paid social', 'conversion testing'];
  }
  return ['testing', 'CI/CD', 'data analysis', 'stakeholder communication', 'project delivery'];
}

function extractJdKeywords(text) {
  const words = text.toLowerCase().match(/[a-z][a-z0-9+#./-]{2,}/g) || [];
  return [...new Set(
    words
      .map((word) => word.replace(/^[./-]+|[.,/;-]+$/g, ''))
      .filter((word) => word.length > 2 && !CHAT_STOPWORDS.has(word) && !/^\d+$/.test(word))
  )];
}

function matchesQuestion(question, keywords) {
  return keywords.some((keyword) => question.includes(keyword));
}

function buildLocalChatReply(question, resume, jobDescription) {
  const text = question.toLowerCase();
  const looksLikeJobDescription =
    text.length > 240 && /(responsibilit|qualification|requirement|about the role|what you)/.test(text);
  const jdText = jobDescription || (looksLikeJobDescription ? question : '');

  if (!resume) {
    if (jdText) {
      return (
        'I can compare a job description with your resume, but no resume is selected yet.\n\n' +
        'Open one of your resumes from the dashboard, then click the coach button again. ' +
        'I will scan the posting for keywords and point out likely gaps.'
      );
    }

    if (matchesQuestion(text, ['ats', 'applicant tracking', 'keyword', 'scan', 'machine'])) {
      return (
        'ATS software reads text, not design. Start with these rules:\n' +
        '- Use a single-column layout and standard headings: Summary, Experience, Education, Skills.\n' +
        '- Mirror the exact keywords from the job description in your summary, skills, and bullets.\n' +
        '- Keep dates in one consistent format and save as a text-based PDF.\n' +
        '- Avoid tables, text boxes, graphics, and critical details in headers or footers.\n\n' +
        'When you have a resume open, ask me to check it and I will score the main sections.'
      );
    }

    if (matchesQuestion(text, ['length', 'page', 'how long', 'short', 'long'])) {
      return (
        'Most recruiters spend only a few seconds on the first pass. Aim for:\n' +
        '- One page if you have under roughly 8 years of experience.\n' +
        '- Two pages if you are senior or have deep, relevant experience.\n' +
        '- Cut duties that repeat and keep achievements with numbers.\n' +
        '- Use 10-12pt body text with consistent spacing.\n\n' +
        'Quality beats length: every line should help a recruiter decide to interview you.'
      );
    }

    if (matchesQuestion(text, ['gap', 'break', 'unemployed', 'laid off', 'career change'])) {
      return (
        'Handle a career gap directly and briefly:\n' +
        '- Add a "Career break" entry with dates and one line about what you did (caregiving, study, health, freelance).\n' +
        '- Mention skills or projects you kept current.\n' +
        '- In interviews, keep it factual: the reason, what you learned, and why you are ready now.\n' +
        '- Never hide dates or invent work.\n\n' +
        'A short, confident explanation is far stronger than a gap that looks unexplained.'
      );
    }

    if (matchesQuestion(text, ['summary', 'profile', 'about me', 'intro'])) {
      return (
        'A strong summary is 2-3 lines with four parts:\n' +
        '- Target role and years of experience.\n' +
        '- Two or three skills that match the job.\n' +
        '- One measurable win or specialty.\n' +
        '- The role you want next.\n\n' +
        'Template: "[Role] with [X] years in [skills]. Known for [measurable result]. Looking to [goal]."\n' +
        'Open a resume and ask me to review your summary for a specific rewrite.'
      );
    }

    if (matchesQuestion(text, ['skill', 'technology', 'tech stack', 'tools'])) {
      return (
        'Group skills so a recruiter can scan them:\n' +
        '- Languages and frameworks\n' +
        '- Tools and platforms\n' +
        '- Data and analytics\n' +
        '- Collaboration and communication\n\n' +
        'Only list tools you can discuss in an interview. Mirror the job description wording, ' +
        'and drop generic soft skills unless the posting explicitly asks for them.'
      );
    }

    if (matchesQuestion(text, ['tailor', 'job description', 'job posting', 'match', 'jd'])) {
      return (
        'Tailoring beats editing for hours:\n' +
        '- Pull the 8-12 repeated nouns from the job description.\n' +
        '- Put the most important ones in your summary and top skills.\n' +
        '- Rewrite your two most recent bullets so the outcome matches the role.\n' +
        '- Keep one master resume and save a tailored copy per application.\n\n' +
        'Paste a job description here and I will point out likely keywords to mirror.'
      );
    }

    if (matchesQuestion(text, ['cover letter'])) {
      return (
        'Keep a cover letter to three short paragraphs:\n' +
        '- Why this company and role, specifically.\n' +
        '- One proof point with a measurable result.\n' +
        '- What you would focus on in the first 90 days.\n\n' +
        'Stay under 250 words and address a person when possible. A tailored half page beats a generic full page.'
      );
    }

    if (matchesQuestion(text, ['interview', 'star method', 'behavioral'])) {
      return (
        'For behavioral interviews, answer with STAR:\n' +
        '- Situation: one sentence of context.\n' +
        '- Task: what you owned.\n' +
        '- Action: the two or three steps you took.\n' +
        '- Result: a number or clear outcome.\n\n' +
        'Prepare six stories that cover leadership, conflict, failure, ambiguity, influence, and delivery.'
      );
    }

    return (
      'Happy to help. I can explain ATS basics, resume length, career gaps, summaries, skills, ' +
      'tailoring, cover letters, or interview stories.\n\n' +
      'Open one of your resumes from the dashboard and ask a specific question, and I will use ' +
      'its content in my answer.'
    );
  }

  const snapshot = getResumeSnapshot(resume);
  const title = resume.title || 'this resume';
  const wantsJdComparison =
    Boolean(jobDescription) &&
    matchesQuestion(text, ['match', 'tailor', 'job description', 'job posting', 'keyword', 'compare', 'jd', 'fit']);

  if (jdText && (looksLikeJobDescription || wantsJdComparison)) {
    const resumeText = JSON.stringify(resume).toLowerCase();
    const keywords = extractJdKeywords(jdText);
    const matched = keywords.filter((word) => resumeText.includes(word));
    const missing = keywords.filter((word) => !resumeText.includes(word));
    const missingTop = missing.slice(0, 8);
    const matchedTop = matched.slice(0, 8);

    let reply =
      `I compared the job description with "${title}".\n\n` +
      `Keywords already in your resume: ${matchedTop.length ? matchedTop.join(', ') : 'none detected yet'}.\n\n`;

    if (missingTop.length) {
      reply +=
        `Possible gaps to review: ${missingTop.join(', ')}.\n\n` +
        'How to use this:\n' +
        '- Add a missing keyword only if it is true for you (skills, summary, or a bullet).\n' +
        '- Mirror the posting wording, for example "REST APIs" rather than "web services".\n' +
        '- Put the two or three most important gaps in your top skills and latest role.\n\n';
    } else {
      reply +=
        'No obvious keyword gaps from this scan. Make sure the top three keywords appear in your ' +
        'summary and latest experience, not only in the skills list.\n\n';
    }

    reply += 'Want a targeted rewrite? Paste the exact bullet or summary you want me to adjust.';
    return reply;
  }

  if (matchesQuestion(text, ['ats', 'applicant tracking', 'keyword', 'scan', 'machine'])) {
    const score = calculateLocalATSScore(resume, jobDescription);
    const weakest = Object.entries(score.sections).sort((a, b) => a[1] - b[1])[0];
    const improvements = score.improvements.slice(0, 3);
    let reply =
      `Quick ATS check for "${title}": ${score.overall}/100.\n\n` +
      `Section scores: formatting ${score.sections.formatting}, keywords ${score.sections.keywords}, ` +
      `experience ${score.sections.experience}, education ${score.sections.education}, ` +
      `skills ${score.sections.skills}.\n` +
      `Weakest area: ${weakest[0]}.\n\n`;

    if (improvements.length) {
      reply += 'Top fixes:\n' + improvements.map((item) => `- ${item}`).join('\n') + '\n\n';
    }
    if (score.missingKeywords?.length) {
      reply += `Missing keywords to consider: ${score.missingKeywords.join(', ')}.\n\n`;
    }
    reply += 'Ask me to review a section and I will get more specific.';
    return reply;
  }

  if (matchesQuestion(text, ['summary', 'profile', 'about me', 'intro'])) {
    const summary = (snapshot.personal.summary || '').trim();
    const wordCount = summary ? summary.split(/\s+/).length : 0;

    if (!summary) {
      const skillList = snapshot.skills.slice(0, 4).join(', ') || '[2-3 relevant skills]';
      const proof = snapshot.metricAchievements[0]
        ? `Recent impact: ${snapshot.metricAchievements[0]}.`
        : `Add one measurable result from ${snapshot.latestCompany}.`;

      return (
        'You do not have a summary yet. Add one before applying - it is the first thing a recruiter reads.\n\n' +
        'Draft example (adjust it so it stays truthful):\n' +
        `"${snapshot.latestRole} with hands-on experience in ${skillList}. ${proof} ` +
        'Looking to apply that experience to [target role]."\n\n' +
        'Keep it to 2-3 lines and name the role you are targeting.'
      );
    }

    const lengthNote =
      wordCount > 80
        ? 'It is on the long side; trim it to 2-3 lines.'
        : wordCount < 25
          ? 'It is quite short; add the role, a skill, and a measurable win.'
          : 'Length is in a good range.';

    return (
      `Your summary is ${wordCount} words. ${lengthNote}\n\n` +
      'Check these four things:\n' +
      '- Name the target role in the first line.\n' +
      '- Include two or three skills from the job description.\n' +
      '- Add one measurable outcome.\n' +
      '- Cut generic phrases like "hard-working professional".\n\n' +
      `Current opening: "${summary.slice(0, 160)}${summary.length > 160 ? '...' : ''}"\n\n` +
      `Rewrite pattern: "${snapshot.latestRole} with [X] years in [2-3 skills]. ` +
      'Known for [measurable result]. Looking to [target role]."'
    );
  }

  if (matchesQuestion(text, ['skill', 'technology', 'tech stack', 'tools'])) {
    const groups = (resume.skills || []).map(
      (group) =>
        `${group.category || 'General'}: ${(group.items || []).filter(Boolean).join(', ') || 'empty'}`
    );
    const recommended = getRecommendedSkills(resume);

    return (
      `You currently list ${snapshot.skills.length} skills across ${snapshot.groups} group(s).\n` +
      (groups.length ? groups.map((group) => `- ${group}`).join('\n') : '- No skill groups yet.') +
      '\n\nRole-aware additions to consider, only if they are true for you:\n' +
      recommended.map((skill) => `- ${skill}`).join('\n') +
      '\n\nTips: mirror the job description, put your strongest 6-8 skills first, and drop any tool ' +
      'you would not want to discuss in an interview.'
    );
  }

  if (matchesQuestion(text, ['experience', 'bullet', 'achievement', 'quantif', 'metric', 'impact'])) {
    if (!resume.experience?.length) {
      return (
        'No work experience is listed yet. Add internships, freelance work, volunteering, or a ' +
        'substantial project with dates and outcomes.\n\n' +
        'Use this pattern for each bullet: Action verb + what you did + how + measurable result.\n' +
        'Example: "Built [feature] for [users], reducing [metric] by [X]% in [timeframe]."'
      );
    }

    const metricNote =
      snapshot.metricAchievements.length > 0
        ? `You already have ${snapshot.metricAchievements.length} bullet(s) with a number. Make sure each number is verifiable.`
        : 'None of your achievement bullets include a number yet.';

    return (
      `You have ${resume.experience.length} role(s) and ${snapshot.achievements.length} achievement bullet(s); ` +
      `${snapshot.metricAchievements.length} include a number.\n\n${metricNote}\n\n` +
      'Use this pattern for every bullet: Action verb + what you did + how + measurable result.\n' +
      `Example based on your role at ${snapshot.latestCompany}:\n` +
      `"- Led [project] at ${snapshot.latestCompany}, improving [metric] by [X]% in [timeframe]."\n\n` +
      'Add at least one number to your two most recent roles: percent, dollars, time saved, users, ' +
      'or volume. Then remove bullets that only describe duties.'
    );
  }

  if (matchesQuestion(text, ['project', 'portfolio'])) {
    if (!resume.projects?.length) {
      return (
        'Add one or two projects that prove the skills in the job description.\n\n' +
        'For each project include:\n' +
        '- What it does and who it is for.\n' +
        '- The stack or methods you used.\n' +
        '- One measurable outcome or user result.\n' +
        '- A live link or repository if it is public.\n\n' +
        'A focused project with a clear result is stronger than a long list of tutorials.'
      );
    }

    return (
      `You have ${resume.projects.length} project(s) listed. Make each one scannable:\n` +
      '- One line on what it does and who it is for.\n' +
      '- The stack or methods you used.\n' +
      '- One measurable outcome or user result.\n' +
      '- A working link, repository, or demo.\n\n' +
      'Put the project that best matches the target role first.'
    );
  }

  if (matchesQuestion(text, ['contact', 'email', 'phone', 'linkedin'])) {
    if (snapshot.missingContact.length) {
      return (
        `A recruiter needs a fast way to reach you. Missing from the header: ${snapshot.missingContact.join(', ')}.\n\n` +
        'Add them in this order: name, phone, email, location, LinkedIn, then portfolio or GitHub. ' +
        'Use a professional email and a full LinkedIn URL (linkedin.com/in/your-name).'
      );
    }

    return (
      'Your contact details look complete. Now tighten them:\n' +
      '- Use a professional email address.\n' +
      '- Customize your LinkedIn URL and remove outdated links.\n' +
      '- Keep the header to two or three lines so it does not push content down.\n' +
      '- Make sure the same details appear in your PDF.'
    );
  }

  if (matchesQuestion(text, ['education', 'degree', 'college', 'university', 'certification'])) {
    if (!resume.education?.length) {
      return (
        'No education section is listed. If you have a degree or certification, add it with the ' +
        'institution, credential, field, and dates.\n\n' +
        'If you do not, use a certifications or projects section to show proof of the skills the ' +
        'job asks for. Recruiters care about evidence, not just formal degrees.'
      );
    }

    return (
      `You have ${resume.education.length} education entr(y/ies). Keep them compact:\n` +
      '- Most recent first.\n' +
      '- Institution, degree, field, and dates on two lines.\n' +
      '- Include GPA only if it is strong or you are early-career.\n' +
      '- Add relevant coursework or honors only when they match the role.\n\n' +
      'Certifications belong in their own section if you have more than two.'
    );
  }

  if (matchesQuestion(text, ['length', 'page', 'format', 'layout', 'template', 'short', 'long'])) {
    return (
      `"${title}" has ${resume.experience?.length || 0} role(s) and ${snapshot.skills.length} skills listed.\n\n` +
      'Aim for one page if you are early-career and two pages at most otherwise. Keep standard ' +
      'headings, 10-12pt body text, and a single-column layout for ATS. Save as a text-based PDF ' +
      'and check that the preview still looks clean on a phone.'
    );
  }

  if (matchesQuestion(text, ['gap', 'break', 'unemployed', 'laid off', 'career change'])) {
    return (
      'Handle the gap directly and briefly:\n' +
      '- Add a "Career break" entry with dates and one line about what you did (caregiving, study, health, freelance).\n' +
      '- Mention skills or projects you kept current.\n' +
      '- In interviews, keep it factual: the reason, what you learned, and why you are ready now.\n\n' +
      'If the gap is already visible in the dates, a short note removes the guesswork.'
    );
  }

  if (matchesQuestion(text, ['cover letter'])) {
    return (
      'For this resume, a cover letter should add context the resume cannot:\n' +
      '- Open with why this company and role, specifically.\n' +
      `- Use one proof point from ${snapshot.latestCompany} with a measurable result.\n` +
      '- Close with what you would focus on in the first 90 days.\n\n' +
      'Keep it under 250 words and mirror the language in the job description.'
    );
  }

  if (matchesQuestion(text, ['interview', 'star method', 'behavioral'])) {
    return (
      'Prepare stories from your actual experience, not generic answers. Use STAR:\n' +
      '- Situation: one sentence of context.\n' +
      '- Task: what you owned.\n' +
      '- Action: the two or three steps you took.\n' +
      '- Result: a number or clear outcome.\n\n' +
      `Pull one story from ${snapshot.latestCompany} for each theme: leadership, conflict, ` +
      'failure, ambiguity, influence, and delivery.'
    );
  }

  const score = calculateLocalATSScore(resume, jobDescription);
  const weakest = Object.entries(score.sections).sort((a, b) => a[1] - b[1])[0];

  return (
    `Here is a quick read of "${title}":\n` +
    `- ATS check: ${score.overall}/100. Weakest area: ${weakest[0]}.\n` +
    `- ${snapshot.achievements.length} achievement bullet(s), ${snapshot.metricAchievements.length} with a number.\n` +
    `- ${snapshot.skills.length} skills across ${snapshot.groups} group(s).\n` +
    `- ${snapshot.missingSections.length ? `Missing: ${snapshot.missingSections.join(', ')}.` : 'Core sections are all present.'}\n\n` +
    'Ask me to review your summary, suggest skills, audit ATS readiness, or turn a duty into a ' +
    'measurable bullet.'
  );
}
