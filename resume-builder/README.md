# Resumehai - AI-Powered Resume Builder

A full-stack MERN application for creating professional resumes with AI-powered suggestions, multiple templates, PDF export, and ATS score checking.

## Features

- **Landing Page** - Hero section, feature cards, about section, contact form
- **User Authentication** - Secure JWT-based auth with register/login
- **Resume Management** - Create, edit, duplicate, and delete resumes
- **Dashboard** - Resume cards with template picker and demo resume options
- **4 Resume Templates** - Modern, Classic, Minimal, Creative
- **Real-time Preview** - Split-screen editor with live preview
- **PDF Export** - High-quality PDF download via html2pdf.js
- **AI Suggestions** - OpenAI-powered content improvements for:
  - Bullet point enhancement
  - Professional summary rewriting
  - Skill suggestions
  - Achievement generation
  - Grammar fixes
- **ATS Score Checker** - Resume scoring with category breakdown, keyword analysis, strengths/improvements, and job description matching (works with or without API key)
- **Accent Color Picker** - 9 preset colors + custom color picker
- **Font Selector** - Default, Serif, Mono, Handwriting styles
- **Profile Photo Upload** - Base64 storage with change/remove (2MB limit)
- **Certificate File Upload** - PDF/image attachments for certifications (5MB limit)
- **Dark Mode** - Full dark theme support
- **Responsive Design** - Optimized for desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, CSS custom properties
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI**: OpenAI GPT-3.5-turbo (with local fallback for ATS scoring)
- **PDF**: html2pdf.js
- **Auth**: JWT with bcrypt
- **Fonts**: Google Fonts (Inter, Caveat, Fira Code)

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key (optional, for AI features — ATS scoring works without it)

## Quick Start

1. **Clone and install dependencies**
```bash
cd resume-builder
npm run install:all
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your values
```

3. **Start MongoDB** (if local)
```bash
mongod
```

4. **Run development servers**
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Optional (AI features work without it) |

## Project Structure

```
resume-builder/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── AIAssistant.jsx      # AI suggestion popover
│   │   │   ├── ATSScore.jsx         # ATS score panel
│   │   │   ├── LoadingSpinner.jsx   # Loading indicator
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   └── ResumePreview.jsx    # Live resume preview
│   │   ├── context/        # React context (Auth)
│   │   ├── data/
│   │   │   └── demoResumes.js       # 4 demo resumes
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Resume list + template picker
│   │   │   ├── Editor.jsx           # Sidebar editor with all sections
│   │   │   ├── Landing.jsx          # Landing page
│   │   │   ├── Login.jsx            # Login form
│   │   │   ├── Preview.jsx          # Preview + ATS + Export
│   │   │   ├── Register.jsx         # Registration form
│   │   │   └── Settings.jsx         # User settings
│   │   ├── services/
│   │   │   └── api.js               # Axios API client
│   │   ├── App.jsx                  # Routing
│   │   ├── index.css                # All styles + templates
│   │   └── main.jsx                 # Entry point
│   ├── index.html                    # Google Fonts links
│   └── vite.config.js               # Port 3000, proxy to 5000
├── server/                 # Express backend
│   ├── models/
│   │   ├── Resume.js                # Resume schema (incl. accentColor, fontStyle, profilePhoto, cert files)
│   │   └── User.js                  # User schema
│   ├── routes/
│   │   ├── ai.js                    # /suggest, /ats-score, /analyze
│   │   ├── auth.js                  # /register, /login, /me
│   │   └── resumes.js               # CRUD + duplicate
│   ├── middleware/
│   │   └── auth.js                  # JWT middleware
│   ├── index.js                     # Express entry (10mb body limit)
│   └── package.json
├── .env.example
└── package.json            # Root scripts (dev, install:all)
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Resumes
- `GET /api/resumes` - List user's resumes
- `POST /api/resumes` - Create resume
- `GET /api/resumes/:id` - Get resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume
- `POST /api/resumes/:id/duplicate` - Duplicate resume

### AI
- `POST /api/ai/suggest` - Get AI suggestion for a field
- `POST /api/ai/ats-score` - Score resume (local fallback if no API key)
- `POST /api/ai/analyze` - Full resume analysis

## Templates

1. **Modern** - Clean, professional with blue accent, sans-serif
2. **Classic** - Traditional serif font, formal layout with borders
3. **Minimal** - Ultra-clean, maximum whitespace, subtle styling
4. **Creative** - Gradient header, distinctive styling with color blocks

Each template supports:
- Custom accent color (9 presets + custom picker)
- Font style override (Default, Serif, Mono, Handwriting)
- Profile photo in header (circular)
- File attachments in certifications section

## Deployment

### Backend (e.g., Render, Railway, Heroku)
1. Set environment variables
2. Build: `cd server && npm install`
3. Start: `npm start`

### Frontend (e.g., Vercel, Netlify)
1. Build: `cd client && npm run build`
2. Deploy `dist` folder
3. Configure proxy or set `VITE_API_URL` to your backend URL

## License

MIT
