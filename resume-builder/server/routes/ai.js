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
    improveBullet: `Improve this resume bullet point to be more impactful, action-oriented, and quantified. Original: "${content}"`,
    rewriteSummary: `Rewrite this professional summary to be more compelling and ATS-friendly. Current: "${content}" Target role: ${context.targetRole || 'general'}`,
    suggestSkills: `Based on this experience: "${content}", suggest 10 relevant technical and soft skills for a ${context.targetRole || 'professional'} role. Return as comma-separated list.`,
    generateBullets: `Generate 4-5 strong resume bullet points for a ${context.position} at ${context.company}. Key responsibilities: ${content}. Focus on achievements and metrics.`,
    optimizeKeywords: `Analyze this resume section and suggest keywords to add for ATS optimization for a ${context.targetRole} role: "${content}"`,
    fixGrammar: `Fix grammar, improve clarity, and make more professional: "${content}"`
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
      message: 'AI service not configured',
      suggestion: 'Add OPENAI_API_KEY to environment variables'
    });
  }

  try {
    const { type, content, context = {} } = req.body;
    const prompt = generatePrompt(type, content, context);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert resume writer and career coach. Provide concise, actionable suggestions.' },
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

export default router;