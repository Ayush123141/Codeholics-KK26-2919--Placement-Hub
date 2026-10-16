export const initialProfile = {
  name: "Alex Morgan",
  role: "Student",
  email: "alex.morgan@campus.edu",
  college: "National Institute of Technology",
  degree: "B.Tech Computer Science & Engineering",
  graduationYear: "2026",
  gpa: "3.84 / 4.0",
  profileStrength: 82,
  verifiedSkillsCount: 12,
  totalSkillsCount: 15,
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  bio: "Passionate full-stack developer with demonstrable open-source contributions, component architecture experience, and verified REST API design benchmarks.",
  github: "github.com/alexmorgan-dev",
  portfolio: "alexmorgan.dev",
  linkedin: "linkedin.com/in/alexmorgan-dev"
};

export const initialJobs = [
  {
    id: "job-1",
    title: "Frontend Developer Intern",
    company: "TechNova",
    logo: "TN",
    logoColor: "from-violet-600 to-indigo-600",
    matchScore: 94,
    location: "San Francisco, CA (Hybrid)",
    workMode: "Hybrid",
    type: "Internship",
    stipend: "$45 / hr",
    postedDate: "2 days ago",
    deadline: "In 12 days",
    matchedSkills: ["React", "JavaScript", "HTML", "CSS"],
    evidenceSummary: "2 projects and 1 assessment",
    gap: "TypeScript",
    missingSkills: ["TypeScript"],
    bookmarked: true,
    applied: true,
    applicationStatus: "Interview",
    matchReason: "Direct proof found for React component trees, responsive CSS, and state management via your E-Commerce Storefront project and Proctored React Skill Check (94%).",
    description: "Join TechNova's design engineering team to architect fast, responsive interfaces using modern React, Tailwind, and cutting-edge web tooling. You will collaborate directly with staff designers and full-stack engineers.",
    requirements: [
      "Demonstrated experience with React (hooks, context, performance optimization)",
      "Strong fundamentals in ES6+ JavaScript, DOM manipulation, and responsive web design",
      "Familiarity with TypeScript and modern bundle workflows",
      "Evidence of shipped web apps or verified code repositories"
    ]
  },
  {
    id: "job-2",
    title: "Full Stack Developer Intern",
    company: "CloudBridge",
    logo: "CB",
    logoColor: "from-blue-600 to-cyan-600",
    matchScore: 87,
    location: "Bangalore, India (Hybrid)",
    workMode: "Hybrid",
    type: "Internship",
    stipend: "₹45,000 / mo",
    postedDate: "1 day ago",
    deadline: "In 8 days",
    matchedSkills: ["React", "Node.js", "REST APIs"],
    evidenceSummary: "2 projects and repository activity",
    gap: "Advanced SQL",
    missingSkills: ["PostgreSQL Optimization", "Advanced SQL"],
    bookmarked: false,
    applied: true,
    applicationStatus: "Shortlisted",
    matchReason: "Demonstrated full-stack capabilities through your Taskflow SaaS project and microservices repository with 145 active commits. SQL queries lack indexing benchmarks.",
    description: "CloudBridge is looking for a driven Full Stack Intern to build customer-facing management dashboards and scalable API endpoints across Node.js microservices.",
    requirements: [
      "Working knowledge of React frontend architecture and state management",
      "Hands-on server-side development in Node.js / Express with authenticated endpoints",
      "Understanding of relational databases (PostgreSQL/MySQL)",
      "Ability to write verifiable unit tests and API documentation"
    ]
  },
  {
    id: "job-3",
    title: "Software Engineer Intern",
    company: "NextGen Labs",
    logo: "NG",
    logoColor: "from-emerald-600 to-teal-600",
    matchScore: 76,
    location: "New York, NY (Onsite)",
    workMode: "Onsite",
    type: "Internship",
    stipend: "$50 / hr",
    postedDate: "3 days ago",
    deadline: "In 15 days",
    matchedSkills: ["Java", "Data Structures", "Git"],
    evidenceSummary: "1 project and 2 assessments",
    gap: "System design fundamentals",
    missingSkills: ["System Design", "Distributed Systems"],
    bookmarked: false,
    applied: false,
    applicationStatus: null,
    matchReason: "Strong algorithmic foundations verified by Proctored DSA Assessment (92%) and Java algorithmic repository. Needs evidence of high-concurrency systems design.",
    description: "NextGen Labs builds high-throughput low-latency telemetry pipelines. We are seeking an ambitious engineering intern to optimize backend data processing jobs.",
    requirements: [
      "Solid understanding of Object-Oriented Programming and Data Structures in Java",
      "Proficiency with Git version control and collaborative workflows",
      "Knowledge of distributed message queues or basic system architecture is a plus"
    ]
  },
  {
    id: "job-4",
    title: "AI / ML Engineering Intern",
    company: "DataForge Systems",
    logo: "DF",
    logoColor: "from-amber-600 to-orange-600",
    matchScore: 68,
    location: "Remote",
    workMode: "Remote",
    type: "Internship",
    stipend: "$42 / hr",
    postedDate: "4 days ago",
    deadline: "In 20 days",
    matchedSkills: ["Python", "Git"],
    evidenceSummary: "1 course project",
    gap: "PyTorch & Vector Databases",
    missingSkills: ["PyTorch", "RAG Pipelines", "Vector Databases"],
    bookmarked: true,
    applied: false,
    applicationStatus: null,
    matchReason: "Baseline Python scripting verified through academic repository, but prompt engineering and embedding vector pipeline evidence is currently unverified.",
    description: "Help fine-tune LLM extraction models, configure semantic search vectors, and integrate autonomous AI agents into enterprise workflows.",
    requirements: [
      "Python 3.10+ proficiency and familiarity with numpy/pandas",
      "Experience with LLM tool-calling APIs or LangChain / LlamaIndex",
      "Good understanding of embeddings and vector similarity indexing"
    ]
  },
  {
    id: "job-5",
    title: "Junior Cloud & DevOps Associate",
    company: "ScaleOps Global",
    logo: "SO",
    logoColor: "from-purple-600 to-pink-600",
    matchScore: 62,
    location: "Austin, TX (Remote)",
    workMode: "Remote",
    type: "Full-Time",
    stipend: "$78,000 / yr",
    postedDate: "5 days ago",
    deadline: "In 6 days",
    matchedSkills: ["Git", "Linux basics"],
    evidenceSummary: "CI/CD GitHub Actions workflow",
    gap: "Kubernetes & Terraform",
    missingSkills: ["Kubernetes", "Docker", "Terraform", "AWS"],
    bookmarked: false,
    applied: false,
    applicationStatus: null,
    matchReason: "GitHub Actions automated deployment pipelines are present in your repositories. Container orchestration and IaC skills remain unverified.",
    description: "Support our infrastructure reliability engineering squad in maintaining multi-region Kubernetes clusters and automated continuous deployment workflows.",
    requirements: [
      "Understanding of Linux OS internals, shell scripting, and network topologies",
      "Familiarity with containerization (Docker) and basic CI/CD",
      "Enthusiasm for automated infrastructure and telemetry monitoring"
    ]
  },
  {
    id: "job-6",
    title: "UI/UX & Design Engineer Intern",
    company: "Lumina Labs",
    logo: "LL",
    logoColor: "from-rose-600 to-red-600",
    matchScore: 91,
    location: "San Francisco, CA (Remote)",
    workMode: "Remote",
    type: "Internship",
    stipend: "$48 / hr",
    postedDate: "Just now",
    deadline: "In 18 days",
    matchedSkills: ["React", "CSS", "HTML", "JavaScript"],
    evidenceSummary: "Figma to React component library live demo",
    gap: "Web Animations / Three.js",
    missingSkills: ["Three.js", "Framer Motion"],
    bookmarked: false,
    applied: true,
    applicationStatus: "Applied",
    matchReason: "Exceptional design implementation proof verified in your interactive UI component playground with 100% Lighthouse accessibility ratings.",
    description: "Bridge the gap between product design and engineering by creating pixel-perfect, accessible component systems with interactive micro-animations.",
    requirements: [
      "Expertise in modern CSS layout (Flexbox, Grid), CSS variables, and Tailwind",
      "Experience crafting reusable React design-system components",
      "Eye for typography, visual hierarchy, micro-interactions, and accessibility (WCAG AA)"
    ]
  }
];

export const initialSkillsEvidence = [
  {
    id: "sk-1",
    skill: "React",
    category: "Frontend",
    status: "Verified",
    evidenceScore: 94,
    evidenceType: "Project & Assessment",
    sourceName: "E-Commerce Web Platform & SkillCheck v2",
    dateAdded: "Oct 12, 2026",
    verificationMethod: "Automated Code Analysis + Timed Proctored Assessment",
    details: "Built 18 custom reusable components, custom hooks for query caching, and scored 94/100 on asynchronous state and reconciliation test.",
    artifacts: ["GitHub Repo: /alexmorgan/shop-frontend", "Score Badge #REC-94821"]
  },
  {
    id: "sk-2",
    skill: "JavaScript (ES6+)",
    category: "Programming Language",
    status: "Verified",
    evidenceScore: 91,
    evidenceType: "Assessment",
    sourceName: "Advanced JS Engine & DOM Benchmarks",
    dateAdded: "Sep 28, 2026",
    verificationMethod: "Campus Proctored Benchmark",
    details: "Demonstrated mastery of event loop, closures, Promise chaining, Proxy objects, and memory leak profiling.",
    artifacts: ["Campus Verified Credential #JS-2026-8812"]
  },
  {
    id: "sk-3",
    skill: "Node.js & Express",
    category: "Backend",
    status: "Evidence found",
    evidenceScore: 85,
    evidenceType: "Project & Repo Activity",
    sourceName: "TaskFlow SaaS REST API",
    dateAdded: "Oct 04, 2026",
    verificationMethod: "Repository Commit & Test Suite Audit",
    details: "JWT-authenticated REST API with role-based permissions, rate limiting, and 24 passing Jest integration tests.",
    artifacts: ["GitHub Repo: /alexmorgan/taskflow-api (145 commits)"]
  },
  {
    id: "sk-4",
    skill: "SQL & Relational DBs",
    category: "Databases",
    status: "Needs review",
    evidenceScore: 64,
    evidenceType: "Course Project",
    sourceName: "Database Systems Lab Coursework",
    dateAdded: "Aug 15, 2026",
    verificationMethod: "Self-Reported with Schema Files",
    details: "Basic schema creation, joins, and normal form exercises submitted. Query optimization and index profiling evidence missing.",
    artifacts: ["db_schema_v1.sql"]
  },
  {
    id: "sk-5",
    skill: "TypeScript",
    category: "Programming Language",
    status: "Unverified",
    evidenceScore: 20,
    evidenceType: "Claimed in Resume",
    sourceName: "No verified artifact linked",
    dateAdded: "Pending",
    verificationMethod: "None — Evidence Needed",
    details: "TypeScript claimed as a skill on resume, but no typed repositories, compiler configs, or test assessments have been submitted.",
    artifacts: []
  },
  {
    id: "sk-6",
    skill: "HTML5 & Semantic CSS",
    category: "Frontend",
    status: "Verified",
    evidenceScore: 96,
    evidenceType: "Project",
    sourceName: "Portfolio & Design System",
    dateAdded: "Sep 10, 2026",
    verificationMethod: "Lighthouse CI Audit & DOM Validator",
    details: "100% Accessibility score, semantic HTML landmarks, responsive media queries, and strict cross-browser compliance.",
    artifacts: ["Lighthouse Report v11.4", "Live URL: alexmorgan.dev"]
  },
  {
    id: "sk-7",
    skill: "Git & GitHub CI/CD",
    category: "DevOps & Tools",
    status: "Verified",
    evidenceScore: 90,
    evidenceType: "Repository Evidence",
    sourceName: "Active GitHub Contribution History",
    dateAdded: "Oct 14, 2026",
    verificationMethod: "GitHub Permitted OAuth Profile Audit",
    details: "312 contributions in past 12 months, feature branching, pull request reviews, and GitHub Actions workflow executions.",
    artifacts: ["GitHub OAuth Synced Audit"]
  },
  {
    id: "sk-8",
    skill: "Data Structures & Java",
    category: "Computer Science",
    status: "Verified",
    evidenceScore: 92,
    evidenceType: "Assessment",
    sourceName: "Algorithmic Problem Solving Assessment",
    dateAdded: "Jul 22, 2026",
    verificationMethod: "Automated Sandbox Unit Tests (20/20 Test Cases)",
    details: "Binary search trees, graph traversals (Dijkstra, BFS), dynamic programming, and complexity proof writeups.",
    artifacts: ["Score Certificate #DSA-JAVA-92"]
  }
];

export const initialApplications = [
  {
    id: "app-1",
    jobId: "job-1",
    role: "Frontend Developer Intern",
    company: "TechNova",
    logo: "TN",
    logoColor: "from-violet-600 to-indigo-600",
    matchScore: 94,
    status: "Interview",
    appliedDate: "Oct 10, 2026",
    nextStep: "Technical Round 2 (Pair Programming) on Oct 19 at 3:30 PM",
    verifiedSkillsCount: 4,
    notes: "Interviewer specifically complimented the verified React repository audit and Lighthouse accessibility proof."
  },
  {
    id: "app-2",
    jobId: "job-2",
    role: "Full Stack Developer Intern",
    company: "CloudBridge",
    logo: "CB",
    logoColor: "from-blue-600 to-cyan-600",
    matchScore: 87,
    status: "Shortlisted",
    appliedDate: "Oct 12, 2026",
    nextStep: "Awaiting recruiter slot assignment for hiring manager review",
    verifiedSkillsCount: 3,
    notes: "Shortlisted automatically by AI filter due to >85% evidence-verified skill threshold."
  },
  {
    id: "app-3",
    jobId: "job-6",
    role: "UI/UX & Design Engineer Intern",
    company: "Lumina Labs",
    logo: "LL",
    logoColor: "from-rose-600 to-red-600",
    matchScore: 91,
    status: "Applied",
    appliedDate: "Oct 14, 2026",
    nextStep: "Application submitted with Evidence-Backed Resume v2.4",
    verifiedSkillsCount: 4,
    notes: "Application pending recruiter review."
  },
  {
    id: "app-4",
    jobId: "job-legacy-1",
    role: "Junior Web Engineer",
    company: "Apex Digital",
    logo: "AD",
    logoColor: "from-teal-600 to-emerald-600",
    matchScore: 89,
    status: "Offer",
    appliedDate: "Sep 18, 2026",
    nextStep: "Offer Letter received! Action deadline: Oct 25",
    verifiedSkillsCount: 5,
    notes: "Received pre-placement offer for summer 2026 internship converting to full-time."
  },
  {
    id: "app-5",
    jobId: "job-legacy-2",
    role: "Software Intern",
    company: "Vanguard Systems",
    logo: "VS",
    logoColor: "from-sky-600 to-blue-700",
    matchScore: 81,
    status: "Interview",
    appliedDate: "Oct 02, 2026",
    nextStep: "HR & Cultural Fit Round scheduled for Oct 21",
    verifiedSkillsCount: 3,
    notes: "Technical coding round cleared."
  },
  {
    id: "app-6",
    jobId: "job-legacy-3",
    role: "Frontend Engineering Trainee",
    company: "Starlight Media",
    logo: "SM",
    logoColor: "from-fuchsia-600 to-pink-600",
    matchScore: 84,
    status: "Shortlisted",
    appliedDate: "Oct 06, 2026",
    nextStep: "Take-home code review pending evaluation",
    verifiedSkillsCount: 4,
    notes: "Submitted GitHub repository evidence directly via ProofHire link."
  }
];

export const recentActivities = [
  {
    id: "act-1",
    type: "assessment",
    title: "React assessment completed",
    description: "Proctored SkillCheck v2 verified with 94/100 score.",
    time: "2 hours ago",
    badge: "Verified"
  },
  {
    id: "act-2",
    type: "match",
    title: "New job matched to your profile",
    description: "TechNova Frontend Developer Intern match computed at 94%.",
    time: "5 hours ago",
    badge: "94% Fit"
  },
  {
    id: "act-3",
    type: "resume",
    title: "Resume generated for Frontend Developer Intern",
    description: "ATS-friendly truthful resume exported with 4 evidence references.",
    time: "Yesterday",
    badge: "Exported"
  },
  {
    id: "act-4",
    type: "evidence",
    title: "Project evidence added to your profile",
    description: "'TaskFlow SaaS API' audit synched with 24 passing Jest test cases.",
    time: "2 days ago",
    badge: "Synced"
  }
];

export const placementAnalytics = {
  totalStudents: 480,
  availableJobs: 38,
  matchedStudentsCount: 412,
  matchRate: 85.8,
  pipelineStats: {
    applied: 640,
    shortlisted: 184,
    interview: 72,
    placed: 45
  },
  topSkillsDemand: [
    { skill: "React", count: 32, percentage: 84 },
    { skill: "Node.js", count: 26, percentage: 68 },
    { skill: "Python", count: 24, percentage: 63 },
    { skill: "SQL / DB", count: 20, percentage: 53 },
    { skill: "Docker & Cloud", count: 17, percentage: 45 },
    { skill: "TypeScript", count: 16, percentage: 42 }
  ],
  duplicateAlerts: [
    {
      id: "dup-1",
      company: "Acme Cloud Labs",
      titleA: "Backend Software Engineer Intern",
      titleB: "Software Engineer Intern - Backend",
      similarity: "96% text match",
      postedTimes: "Oct 14 and Oct 15",
      action: "Review & Merge"
    },
    {
      id: "dup-2",
      company: "Starlight Digital",
      titleA: "Frontend Web Developer",
      titleB: "React.js Frontend Engineer",
      similarity: "88% skill overlap",
      postedTimes: "Oct 11 and Oct 13",
      action: "Flagged for Recruiter Confirmation"
    }
  ],
  candidateRankingsByJob: {
    "job-1": [
      {
        id: "cand-1",
        name: "Alex Morgan",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        department: "Computer Science",
        gpa: "3.84",
        matchScore: 94,
        matchedSkills: ["React", "JavaScript", "HTML", "CSS"],
        evidenceSummary: "2 projects + Proctored Assessment (94%)",
        missingSkills: ["TypeScript"],
        status: "Interview Scheduled"
      },
      {
        id: "cand-2",
        name: "Priya Sharma",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
        department: "Information Technology",
        gpa: "3.91",
        matchScore: 91,
        matchedSkills: ["React", "TypeScript", "CSS"],
        evidenceSummary: "1 open-source library + 2 client projects",
        missingSkills: ["State performance benchmarks"],
        status: "Shortlisted"
      },
      {
        id: "cand-3",
        name: "David Chen",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
        department: "Computer Science",
        gpa: "3.72",
        matchScore: 88,
        matchedSkills: ["React", "JavaScript", "HTML"],
        evidenceSummary: "Hackathon 1st place project + GitHub audit",
        missingSkills: ["TypeScript", "Testing suite"],
        status: "Applied"
      },
      {
        id: "cand-4",
        name: "Sara Khan",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
        department: "Electronics & CS",
        gpa: "3.65",
        matchScore: 82,
        matchedSkills: ["JavaScript", "HTML", "CSS"],
        evidenceSummary: "Portfolio site + certified web bootcamp",
        missingSkills: ["Production React experience"],
        status: "Applied"
      },
      {
        id: "cand-5",
        name: "Rohan Verma",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
        department: "Computer Science",
        gpa: "3.58",
        matchScore: 75,
        matchedSkills: ["React", "HTML"],
        evidenceSummary: "Course project only",
        missingSkills: ["JavaScript deep dive", "TypeScript"],
        status: "Under Review"
      }
    ],
    "job-2": [
      {
        id: "cand-1",
        name: "Alex Morgan",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        department: "Computer Science",
        gpa: "3.84",
        matchScore: 87,
        matchedSkills: ["React", "Node.js", "REST APIs"],
        evidenceSummary: "TaskFlow SaaS + 145 verified commits",
        missingSkills: ["Advanced SQL optimization"],
        status: "Shortlisted"
      },
      {
        id: "cand-2",
        name: "Priya Sharma",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
        department: "Information Technology",
        gpa: "3.91",
        matchScore: 89,
        matchedSkills: ["React", "Node.js", "PostgreSQL"],
        evidenceSummary: "Full-stack e-commerce project with SQL schemas",
        missingSkills: ["Microservices architecture"],
        status: "Under Review"
      }
    ]
  }
};
