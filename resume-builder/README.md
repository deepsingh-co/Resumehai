# AI-Powered Resume Builder

A full-stack MERN application for creating professional resumes with AI-powered suggestions, multiple templates, and PDF export.

## Features

- **User Authentication** - Secure JWT-based auth with register/login
- **Resume Management** - Create, edit, duplicate, and delete resumes
- **AI Suggestions** - OpenAI-powered content improvements for:
  - Bullet point enhancement
  - Professional summary rewriting
  - Skill suggestions
  - Achievement generation
  - Grammar fixes
- **Multiple Templates** - Modern, Classic, Minimal, Creative
- **PDF Export** - High-quality PDF download
- **Real-time Preview** - Split-screen editor with live preview
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Frontend**: React 18, Vite, React Router, Tailwind-like CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI**: OpenAI GPT-3.5-turbo
- **PDF**: html2pdf.js
- **Auth**: JWT with bcrypt

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key (for AI features)

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
| `OPENAI_API_KEY` | OpenAI API key | For AI features |

## Project Structure

```
resume-builder/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service
│   │   ├── App.jsx         # Main app
│   │   └── main.jsx        # Entry point
│   └── package.json
├── server/                 # Express backend
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── index.js            # Entry point
│   └── package.json
└── package.json            # Root package.json
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
- `POST /api/ai/suggest` - Get AI suggestion
- `POST /api/ai/analyze` - Full resume analysis

## Templates

1. **Modern** - Clean, professional with blue accent
2. **Classic** - Traditional serif font, formal layout
3. **Minimal** - Ultra-clean, maximum whitespace
4. **Creative** - Gradient header, distinctive styling

## Deployment

### Backend (e.g., Render, Railway, Heroku)
1. Set environment variables
2. Build: `cd server && npm install`
3. Start: `npm start`

### Frontend (e.g., Vercel, Netlify)
1. Set `VITE_API_URL` to your backend URL
2. Build: `cd client && npm run build`
3. Deploy `dist` folder

## License

MIT