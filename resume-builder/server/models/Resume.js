import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'My Resume'
  },
  template: {
    type: String,
    enum: ['modern', 'classic', 'minimal', 'creative'],
    default: 'modern'
  },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    github: String,
    website: String,
    summary: String,
    profilePhoto: String
  },
  experience: [{
    company: String,
    position: String,
    location: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    description: String,
    achievements: [String]
  }],
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    location: String,
    startDate: String,
    endDate: String,
    gpa: String,
    achievements: [String]
  }],
  skills: [{
    category: String,
    items: [String]
  }],
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    link: String,
    startDate: String,
    endDate: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    credentialId: String,
    url: String,
    file: String,
    fileName: String
  }],
  languages: [{
    language: String,
    proficiency: String
  }],
  customSections: [{
    title: String,
    content: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('Resume', resumeSchema);