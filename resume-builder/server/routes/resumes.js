import express from 'express';
import { body, validationResult } from 'express-validator';
import Resume from '../models/Resume.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', [
  body('title').optional().trim()
], async (req, res) => {
  try {
    const resume = new Resume({
      user: req.user._id,
      title: req.body.title || 'My Resume',
      template: req.body.template || 'modern',
      personalInfo: req.body.personalInfo || {},
      experience: req.body.experience || [],
      education: req.body.education || [],
      skills: req.body.skills || [],
      projects: req.body.projects || [],
      certifications: req.body.certifications || [],
      languages: req.body.languages || [],
      customSections: req.body.customSections || []
    });

    await resume.save();
    res.status(201).json(resume);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json(resume);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json(resume);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/duplicate', async (req, res) => {
  try {
    const original = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!original) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const duplicate = new Resume({
      user: req.user._id,
      title: `${original.title} (Copy)`,
      template: original.template,
      personalInfo: original.personalInfo,
      experience: original.experience,
      education: original.education,
      skills: original.skills,
      projects: original.projects,
      certifications: original.certifications,
      languages: original.languages,
      customSections: original.customSections
    });

    await duplicate.save();
    res.status(201).json(duplicate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;