export const demoResumes = {
  software: {
    title: 'Software Engineer Resume',
    template: 'modern',
    personalInfo: {
      fullName: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexjohnson',
      github: 'github.com/alexj',
      website: 'alexjohnson.dev',
      summary: 'Full-stack software engineer with 5+ years of experience building scalable web applications. Passionate about clean code, user experience, and mentoring junior developers.'
    },
    experience: [
      {
        company: 'TechCorp Inc.',
        position: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        startDate: '2022-01',
        endDate: '',
        current: true,
        description: 'Leading development of microservices architecture serving 10M+ daily users.',
        achievements: [
          'Reduced API response time by 40% through query optimization',
          'Led migration from monolith to microservices, improving deployment frequency by 3x',
          'Mentored 5 junior developers and conducted 50+ code reviews'
        ]
      },
      {
        company: 'StartupXYZ',
        position: 'Software Engineer',
        location: 'Remote',
        startDate: '2019-06',
        endDate: '2021-12',
        current: false,
        description: 'Full-stack development using React, Node.js, and PostgreSQL.',
        achievements: [
          'Built real-time collaboration features using WebSockets',
          'Implemented CI/CD pipeline reducing deployment time from hours to minutes',
          'Designed and launched customer-facing dashboard used by 50K+ users'
        ]
      }
    ],
    education: [
      {
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        location: 'Berkeley, CA',
        startDate: '2015-08',
        endDate: '2019-05',
        gpa: '3.8/4.0',
        achievements: ['Dean\'s List all semesters', 'Teaching Assistant for Data Structures']
      }
    ],
    skills: [
      { category: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'Java', 'SQL'] },
      { category: 'Frontend', items: ['React', 'Next.js', 'Vue.js', 'Tailwind CSS', 'HTML5/CSS3'] },
      { category: 'Backend', items: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Redis'] },
      { category: 'DevOps', items: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Git'] }
    ],
    projects: [
      {
        name: 'Open Source CLI Tool',
        description: 'A developer productivity tool with 2K+ GitHub stars that automates common development workflows.',
        technologies: ['Node.js', 'TypeScript', 'Commander.js'],
        link: 'github.com/alexj/devtool',
        startDate: '2021-03',
        endDate: ''
      },
      {
        name: 'Real-time Chat Application',
        description: 'Scalable chat platform supporting 10K concurrent users with end-to-end encryption.',
        technologies: ['React', 'Socket.io', 'Node.js', 'Redis'],
        link: 'chatapp.alexjohnson.dev',
        startDate: '2020-06',
        endDate: '2020-12'
      }
    ],
    certifications: [
      { name: 'AWS Solutions Architect', issuer: 'Amazon Web Services', date: '2023-03', credentialId: 'AWS-SA-2023', url: '', file: '', fileName: '' },
      { name: 'Google Cloud Professional', issuer: 'Google', date: '2022-08', credentialId: 'GCP-PROF-2022', url: '', file: '', fileName: '' }
    ],
    languages: [
      { language: 'English', proficiency: 'Native' },
      { language: 'Spanish', proficiency: 'Intermediate' }
    ],
    customSections: []
  },

  designer: {
    title: 'UI/UX Designer Resume',
    template: 'creative',
    personalInfo: {
      fullName: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      phone: '+1 (555) 987-6543',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/sarahchen',
      github: '',
      website: 'sarahchen.design',
      summary: 'Creative UI/UX designer with 4+ years of experience crafting intuitive digital experiences. Skilled in user research, prototyping, and design systems.'
    },
    experience: [
      {
        company: 'DesignStudio',
        position: 'Senior UI/UX Designer',
        location: 'New York, NY',
        startDate: '2021-08',
        endDate: '',
        current: true,
        description: 'Leading design for enterprise SaaS products serving Fortune 500 clients.',
        achievements: [
          'Redesigned core product increasing user engagement by 35%',
          'Created and maintained design system used across 12 products',
          'Conducted user research with 200+ participants to inform design decisions'
        ]
      },
      {
        company: 'CreativeAgency',
        position: 'UI/UX Designer',
        location: 'New York, NY',
        startDate: '2019-01',
        endDate: '2021-07',
        current: false,
        description: 'Designed web and mobile applications for various clients.',
        achievements: [
          'Delivered 20+ client projects on time and within budget',
          'Won 3 design awards for innovative mobile app interfaces',
          'Mentored 2 junior designers'
        ]
      }
    ],
    education: [
      {
        institution: 'Parsons School of Design',
        degree: 'Bachelor of Fine Arts',
        fieldOfStudy: 'Communication Design',
        location: 'New York, NY',
        startDate: '2015-09',
        endDate: '2019-05',
        gpa: '3.9/4.0',
        achievements: ['President of Design Club', 'Graduated with Honors']
      }
    ],
    skills: [
      { category: 'Design Tools', items: ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator'] },
      { category: 'Research', items: ['User Interviews', 'A/B Testing', 'Usability Testing', 'Analytics'] },
      { category: 'Prototyping', items: ['InVision', 'Principle', 'Framer', 'Marvel'] },
      { category: 'Other', items: ['HTML/CSS', 'Design Systems', 'Accessibility', 'Wireframing'] }
    ],
    projects: [
      {
        name: 'Healthcare App Redesign',
        description: 'Complete redesign of patient portal serving 500K+ users, improving task completion rate by 45%.',
        technologies: ['Figma', 'User Research', 'Prototyping'],
        link: 'behance.net/sarahchen',
        startDate: '2022-01',
        endDate: '2022-06'
      }
    ],
    certifications: [
      { name: 'Google UX Design Certificate', issuer: 'Google', date: '2021-05', credentialId: 'GUX-2021', url: '', file: '', fileName: '' }
    ],
    languages: [
      { language: 'English', proficiency: 'Native' },
      { language: 'Mandarin', proficiency: 'Fluent' }
    ],
    customSections: [
      { title: 'Awards', content: '• Red Dot Design Award 2022\n• Awwwards Site of the Day 2021\n• UX Design Awards 2020' }
    ]
  },

  marketing: {
    title: 'Marketing Manager Resume',
    template: 'classic',
    personalInfo: {
      fullName: 'Michael Brown',
      email: 'michael.brown@email.com',
      phone: '+1 (555) 456-7890',
      location: 'Chicago, IL',
      linkedin: 'linkedin.com/in/michaelbrown',
      github: '',
      website: '',
      summary: 'Results-driven marketing manager with 6+ years of experience in digital marketing, brand strategy, and campaign management. Proven track record of increasing ROI by 150%+.'
    },
    experience: [
      {
        company: 'GrowthCo',
        position: 'Marketing Manager',
        location: 'Chicago, IL',
        startDate: '2020-03',
        endDate: '',
        current: true,
        description: 'Managing multi-channel marketing campaigns with $2M+ annual budget.',
        achievements: [
          'Increased organic traffic by 200% through SEO and content strategy',
          'Managed team of 8 marketing specialists and 3 agencies',
          'Launched 15+ successful campaigns with average 4.5x ROI'
        ]
      },
      {
        company: 'BrandAgency',
        position: 'Digital Marketing Specialist',
        location: 'Chicago, IL',
        startDate: '2018-01',
        endDate: '2020-02',
        current: false,
        description: 'Executed digital marketing strategies for B2B and B2C clients.',
        achievements: [
          'Grew client social media following by 500K+ combined',
          'Reduced cost-per-acquisition by 35% through optimization',
          'Generated $5M+ in pipeline through lead generation campaigns'
        ]
      }
    ],
    education: [
      {
        institution: 'Northwestern University',
        degree: 'Master of Science',
        fieldOfStudy: 'Integrated Marketing Communications',
        location: 'Evanston, IL',
        startDate: '2016-09',
        endDate: '2018-05',
        gpa: '3.7/4.0',
        achievements: ['Marketing Club President', 'Case Competition Winner']
      },
      {
        institution: 'University of Michigan',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'Marketing',
        location: 'Ann Arbor, MI',
        startDate: '2012-09',
        endDate: '2016-05',
        gpa: '3.6/4.0',
        achievements: ['Dean\'s List', 'Marketing Internship Program']
      }
    ],
    skills: [
      { category: 'Marketing', items: ['SEO/SEM', 'Content Marketing', 'Email Marketing', 'Social Media', 'PPC'] },
      { category: 'Analytics', items: ['Google Analytics', 'HubSpot', 'Salesforce', 'Tableau', 'Mixpanel'] },
      { category: 'Tools', items: ['Marketo', 'Mailchimp', 'Hootsuite', 'Canva', 'Adobe Creative Suite'] },
      { category: 'Strategy', items: ['Brand Strategy', 'Campaign Management', 'A/B Testing', 'Budget Planning'] }
    ],
    projects: [],
    certifications: [
      { name: 'Google Ads Certified', issuer: 'Google', date: '2023-01', credentialId: 'GA-2023', url: '', file: '', fileName: '' },
      { name: 'HubSpot Inbound Marketing', issuer: 'HubSpot', date: '2022-05', credentialId: 'HS-INB-2022', url: '', file: '', fileName: '' }
    ],
    languages: [
      { language: 'English', proficiency: 'Native' },
      { language: 'French', proficiency: 'Intermediate' }
    ],
    customSections: [
      { title: 'Key Achievements', content: '• Marketing Excellence Award 2023\n• Featured in Marketing Week Magazine\n• Speaker at Digital Marketing Summit 2022' }
    ]
  },

  freshGrad: {
    title: 'Fresh Graduate Resume',
    template: 'minimal',
    personalInfo: {
      fullName: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 321-0987',
      location: 'Austin, TX',
      linkedin: 'linkedin.com/in/emilydavis',
      github: 'github.com/emilyd',
      website: 'emilydavis.dev',
      summary: 'Recent Computer Science graduate with strong fundamentals in algorithms, data structures, and software development. Eager to contribute to a dynamic engineering team.'
    },
    experience: [
      {
        company: 'TechIntern Inc.',
        position: 'Software Engineering Intern',
        location: 'Austin, TX',
        startDate: '2023-06',
        endDate: '2023-08',
        current: false,
        description: 'Summer internship working on frontend development.',
        achievements: [
          'Built 3 React components adopted by the design system',
          'Fixed 15+ bugs and improved test coverage by 25%',
          'Presented project to 50+ team members'
        ]
      }
    ],
    education: [
      {
        institution: 'University of Texas at Austin',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        location: 'Austin, TX',
        startDate: '2019-08',
        endDate: '2023-05',
        gpa: '3.7/4.0',
        achievements: [
          'Graduated Magna Cum Laude',
          'President of Women in CS Club',
          'Teaching Assistant for Intro to Programming'
        ]
      }
    ],
    skills: [
      { category: 'Languages', items: ['Python', 'JavaScript', 'Java', 'C++', 'SQL'] },
      { category: 'Technologies', items: ['React', 'Node.js', 'Git', 'AWS', 'Docker'] },
      { category: 'Concepts', items: ['Data Structures', 'Algorithms', 'OOP', 'Agile/Scrum'] }
    ],
    projects: [
      {
        name: 'Task Management App',
        description: 'Full-stack web application for team task management with real-time updates.',
        technologies: ['React', 'Node.js', 'MongoDB', 'Socket.io'],
        link: 'github.com/emilyd/taskapp',
        startDate: '2022-09',
        endDate: '2022-12'
      },
      {
        name: 'Machine Learning Classifier',
        description: 'Image classification model achieving 94% accuracy on CIFAR-10 dataset.',
        technologies: ['Python', 'TensorFlow', 'Keras', 'NumPy'],
        link: 'github.com/emilyd/ml-classifier',
        startDate: '2022-01',
        endDate: '2022-04'
      }
    ],
    certifications: [],
    languages: [
      { language: 'English', proficiency: 'Native' }
    ],
    customSections: [
      { title: 'Activities', content: '• Hackathon Winner - UT Austin HackTX 2022\n• Volunteer - Code.org teaching kids to code\n• Member - Association for Computing Machinery' }
    ]
  }
};

export const templateInfo = {
  modern: {
    name: 'Modern',
    description: 'Clean design with blue accents, perfect for tech roles',
    color: '#2563eb',
    bestFor: 'Tech, Engineering, IT'
  },
  classic: {
    name: 'Classic',
    description: 'Traditional layout with serif fonts, ideal for formal industries',
    color: '#1e293b',
    bestFor: 'Finance, Law, Academia'
  },
  minimal: {
    name: 'Minimal',
    description: 'Simple and elegant, lets your content shine',
    color: '#64748b',
    bestFor: 'Any industry, Clean aesthetic'
  },
  creative: {
    name: 'Creative',
    description: 'Bold gradient design for creative professionals',
    color: '#7c3aed',
    bestFor: 'Design, Marketing, Media'
  }
};
