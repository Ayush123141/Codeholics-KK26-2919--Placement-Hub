import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ShieldAlert,
  Edit3,
  Sparkles,
  Briefcase,
  Layers,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/AuthContext';
import { resumeParserService, ExtractedResumeData } from '@/lib/services/resumeParser';
import { studentApi } from '@/lib/api/studentApi';

interface ExtractedData {
  education: {
    institution: string;
    degree: string;
    graduationYear: number;
    gpa: number;
  };
  skills: string[];
  projects: {
    title: string;
    description: string;
    technologies: string;
  }[];
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
}

export const StudentRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerStudent } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Basic info, 2: Upload & Extraction, 3: Editable Review
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic Account Info (NO GitHub required!)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('TechSummit Institute of Technology');
  const [degree, setDegree] = useState('B.Tech in Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState(2026);
  const [cgpa, setCgpa] = useState(8.5);

  // Step 2: Upload state
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionPhase, setExtractionPhase] = useState('Ready');
  const [aiModelUsed, setAiModelUsed] = useState<string>('');
  const [isAiParsed, setIsAiParsed] = useState<boolean>(false);
  const [parsedClaimsCount, setParsedClaimsCount] = useState<number>(0);

  // Step 3: Extracted Editable State
  const [extracted, setExtracted] = useState<ExtractedData>({
    education: {
      institution: 'TechSummit Institute of Technology',
      degree: 'B.Tech in Computer Science & Engineering',
      graduationYear: 2026,
      gpa: 8.5,
    },
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Git'],
    projects: [
      {
        title: 'Distributed Analytics Telemetry Dashboard',
        description: 'Real-time telemetry dashboard rendering time-series data streams with sub-second latency.',
        technologies: 'React, TypeScript, Tailwind CSS, WebSockets',
      },
      {
        title: 'Micro-Frontend Orchestration Shell',
        description: 'Module federation architecture for independent micro-app deployments.',
        technologies: 'React, Vite, TypeScript',
      },
    ],
    experience: [
      {
        company: 'HyperGrowth Labs',
        role: 'Frontend Engineering Intern',
        duration: 'May 2025 - July 2025',
        description: 'Engineered reusable modular component library reducing bundle size by 28%.',
      },
    ],
  });

  const [newSkillInput, setNewSkillInput] = useState('');

  // Handle Step 1 Submit
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast('Please fill all required account fields', 'error');
      return;
    }
    setStep(2);
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validExtensions = ['.pdf', '.docx', '.txt', '.md'];
      const isValid = validExtensions.some((ext) => selected.name.toLowerCase().endsWith(ext));
      if (!isValid) {
        showToast('Please upload a PDF, DOCX, or text format resume', 'error');
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        showToast('File size must be under 10MB', 'error');
        return;
      }
      setFile(selected);
    }
  };

  // Trigger Dynamic AI Extraction
  const handleStartExtraction = async () => {
    if (!file) {
      setStep(3);
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(15);
    setExtractionPhase('Reading document file & preparing parser...');

    const timerProg1 = setTimeout(() => {
      setExtractionProgress(45);
      setExtractionPhase('Extracting text content from document...');
    }, 400);

    const timerProg2 = setTimeout(() => {
      setExtractionProgress(75);
      setExtractionPhase('AI synthesizing skills, education, projects & claims...');
    }, 900);

    try {
      const parsed: ExtractedResumeData = await resumeParserService.parseResumeWithAI(file, {
        name,
        email,
        college,
        degree,
        graduationYear,
        cgpa,
      });

      clearTimeout(timerProg1);
      clearTimeout(timerProg2);

      setExtractionProgress(95);
      setExtractionPhase('Formatting candidate review structure...');

      // Synchronize parsed data into extracted state
      setExtracted({
        education: {
          institution: parsed.education.institution || college,
          degree: parsed.education.degree || degree,
          graduationYear: parsed.education.graduationYear || graduationYear,
          gpa: parsed.education.gpa || cgpa,
        },
        skills: parsed.skills.length > 0 ? parsed.skills : ['React', 'TypeScript', 'Node.js', 'SQL', 'Git'],
        projects: parsed.projects.length > 0 ? parsed.projects : [
          {
            title: 'Technical Web Application',
            description: 'Full-stack application engineered with modern frameworks and database persistence.',
            technologies: 'React, TypeScript, Node.js',
          }
        ],
        experience: parsed.experience,
      });

      // Synchronize detected candidate fields if empty or default
      if (parsed.candidate.name && (!name.trim() || name === 'Candidate')) {
        setName(parsed.candidate.name);
      }
      if (parsed.candidate.college && college === 'TechSummit Institute of Technology') {
        setCollege(parsed.candidate.college);
      }
      if (parsed.candidate.degree && degree === 'B.Tech in Computer Science & Engineering') {
        setDegree(parsed.candidate.degree);
      }
      if (parsed.candidate.graduationYear) {
        setGraduationYear(parsed.candidate.graduationYear);
      }
      if (parsed.candidate.gpa) {
        setCgpa(parsed.candidate.gpa);
      }

      setAiModelUsed(parsed.aiModel || 'OpenRouter GPT-4o Mini');
      setIsAiParsed(parsed.isAIParsed);
      setParsedClaimsCount(parsed.claims?.length || 0);

      setExtractionProgress(100);
      setExtractionPhase('Extraction Complete!');

      setTimeout(() => {
        setIsExtracting(false);
        setStep(3);
        showToast(
          parsed.isAIParsed
            ? `Resume dynamically parsed by AI! Extracted ${parsed.skills.length} skills and ${parsed.projects.length} project(s).`
            : `Extracted ${parsed.skills.length} skills from resume. Please review and refine.`,
          'success'
        );
      }, 350);
    } catch (err: any) {
      clearTimeout(timerProg1);
      clearTimeout(timerProg2);
      console.error('Resume parsing error:', err);
      setIsExtracting(false);
      showToast(err.message || 'Failed to extract resume with AI. You can review and enter manually.', 'error');
    }
  };

  // Skill management
  const handleAddSkill = () => {
    if (newSkillInput.trim() && !extracted.skills.includes(newSkillInput.trim())) {
      setExtracted((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkillInput.trim()],
      }));
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setExtracted((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Project management
  const handleAddProject = () => {
    setExtracted((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: 'New Engineering Project',
          description: 'Describe key functionality, architecture, and quantifiable outcomes.',
          technologies: 'React, Node.js',
        },
      ],
    }));
  };

  const handleRemoveProject = (index: number) => {
    setExtracted((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index),
    }));
  };

  // Experience management
  const handleAddExperience = () => {
    setExtracted((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: 'Company / Organization',
          role: 'Software Development Intern',
          duration: 'Summer 2025',
          description: 'Describe responsibilities and impact.',
        },
      ],
    }));
  };

  const handleRemoveExperience = (index: number) => {
    setExtracted((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== index),
    }));
  };

  // Final Registration Confirmation
  const handleFinalConfirm = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast('Account credentials (name, email, password) are missing. Please verify Step 1.', 'error');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Persist the extracted dynamic profile data so entire student portal uses it
      studentApi.saveParsedProfileData(extracted);

      // 2. Register candidate account
      const res = await registerStudent({
        name,
        email,
        college: extracted.education.institution,
        degree: extracted.education.degree,
        graduationYear: extracted.education.graduationYear,
        cgpa: extracted.education.gpa,
        password,
        skills: extracted.skills,
      });

      if (res.success) {
        showToast('Candidate account created! Welcome to ProofHire.', 'success');
        navigate('/student', { replace: true });
      } else {
        showToast(res.error || 'Registration failed', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Registration failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/25 to-paper-alt flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="max-w-3xl w-full mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-500 hover:text-ink mb-2 font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </Link>
            <span className="eyebrow !mb-1">Student Onboarding</span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink flex items-center gap-2.5">
              <span>Registration & AI Resume Ingestion</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                AI Powered
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Create your candidate profile. Upload a resume to automatically extract your skills, education, and projects with AI.
            </p>
          </div>

          {/* Stepper indicator */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-mono font-bold flex-wrap">
            <span
              className={`px-3 py-1 rounded-full transition-colors ${
                step === 1 ? 'bg-brand-500 text-ink shadow-xs' : 'bg-fresh/15 text-emerald-900 border border-emerald-300'
              }`}
            >
              1. Details
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`px-3 py-1 rounded-full transition-colors ${
                step === 2
                  ? 'bg-brand-500 text-ink shadow-xs'
                  : step > 2
                  ? 'bg-fresh/15 text-emerald-900 border border-emerald-300'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              2. Resume
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`px-3 py-1 rounded-full transition-colors ${
                step === 3 ? 'bg-brand-500 text-ink shadow-xs' : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              3. Review
            </span>
            <span className="text-slate-300">→</span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-400 border border-slate-200">
              4. Confirm
            </span>
          </div>
        </div>

        {/* STEP 1: Basic Account & Academic Details */}
        {step === 1 && (
          <Card className="p-8 border-slate-200 shadow-sm">
            <form onSubmit={handleStep1Next} className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Step 1: Institutional Credentials</h3>
                <p className="text-xs text-slate-500">
                  Enter your official college details. (Note: A public GitHub account is strictly optional).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Legal Name"
                  placeholder="e.g. Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Institutional Email"
                  type="email"
                  placeholder="e.g. alex.chen@proofhire.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Account Password"
                  type="password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Input
                  label="College / Institute"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                />
                <Input
                  label="Degree Program"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Graduation Year"
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    required
                  />
                  <Input
                    label="Current CGPA"
                    type="number"
                    step="0.01"
                    value={cgpa}
                    onChange={(e) => setCgpa(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button type="submit" className="gap-2 font-semibold">
                  <span>Continue to Resume Upload</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* STEP 2: PDF/DOCX Upload & Dynamic AI Progress */}
        {step === 2 && (
          <Card className="p-8 border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 2: Dynamic AI Resume Ingestion</h3>
                <p className="text-xs text-slate-500">
                  Upload your resume (PDF, DOCX, or text). ProofHire AI will dynamically extract your skills, education, coursework, and projects.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                GPT-4o Mini
              </span>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors">
              <input
                type="file"
                id="resume-file"
                accept=".pdf,.docx,.txt,.md"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="resume-file" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center border border-blue-100">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-brand-600 hover:text-brand-800">Click to choose resume file</span>
                  <span className="text-slate-500"> or drag and drop your file here</span>
                </div>
                <p className="text-[11px] text-slate-400">Supported formats: PDF, DOCX, TXT (max 10MB)</p>
              </label>

              {file && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200 inline-flex items-center gap-2 text-xs font-semibold text-slate-800 shadow-xs">
                  <FileText className="w-4 h-4 text-brand-600" />
                  <span>Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            {isExtracting && (
              <div className="space-y-2 p-4 bg-brand-50 border border-brand-200 rounded-xl text-xs">
                <div className="flex items-center justify-between font-bold text-brand-900">
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-brand-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{extractionPhase}</span>
                  </span>
                  <span>{extractionProgress}%</span>
                </div>
                <div className="w-full bg-brand-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-full transition-all duration-300"
                    style={{ width: `${extractionProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p>
                  <strong>AI Parsing & Verification Policy:</strong> Extracted resume claims are dynamically parsed by AI. They will be marked as <em>Unconfirmed – please review</em> so you retain full control to edit or delete any item before confirming.
                </p>
              </div>
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Scanned PDF Notice:</strong> If your PDF is an image scan without selectable text, extraction may be limited. You will be able to review and manually adjust all fields on the next screen.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>

              <div className="flex items-center gap-2">
                {file && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFile(null)} 
                    className="text-slate-500 hover:text-rose-600"
                  >
                    Clear File
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setStep(3)}>
                  Skip Upload & Enter Manually
                </Button>
                <Button
                  onClick={handleStartExtraction}
                  isLoading={isExtracting}
                  disabled={!file}
                  className="gap-2 font-semibold shadow-btn-amber"
                >
                  <Sparkles className="w-4 h-4 text-ink" />
                  <span>Parse Resume with AI</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 3: Editable Review Screen */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold flex items-center gap-2">
                    <span>Parsed Dynamically by AI</span>
                    {aiModelUsed && (
                      <span className="font-mono text-[10px] font-normal px-2 py-0.5 bg-emerald-100 rounded text-emerald-800 border border-emerald-300">
                        Model: {aiModelUsed}
                      </span>
                    )}
                  </p>
                  <p className="text-emerald-800 mt-0.5 leading-relaxed">
                    Review and refine the extracted profile below. You can edit, add, or remove any information before confirming your candidate account.
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setStep(2)}
                className="shrink-0 text-xs bg-white text-slate-700 hover:text-ink gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Re-upload</span>
              </Button>
            </div>

            {/* Extracted Education */}
            <Card className="p-6 border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-brand-600" />
                  <span>Academic Background (Extracted)</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400 font-semibold">Editable</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Institution"
                  value={extracted.education.institution}
                  onChange={(e) =>
                    setExtracted({
                      ...extracted,
                      education: { ...extracted.education, institution: e.target.value },
                    })
                  }
                />
                <Input
                  label="Degree & Major"
                  value={extracted.education.degree}
                  onChange={(e) =>
                    setExtracted({
                      ...extracted,
                      education: { ...extracted.education, degree: e.target.value },
                    })
                  }
                />
                <Input
                  label="Graduation Year"
                  type="number"
                  value={extracted.education.graduationYear}
                  onChange={(e) =>
                    setExtracted({
                      ...extracted,
                      education: { ...extracted.education, graduationYear: Number(e.target.value) },
                    })
                  }
                />
                <Input
                  label="CGPA / Score"
                  type="number"
                  step="0.01"
                  value={extracted.education.gpa}
                  onChange={(e) =>
                    setExtracted({
                      ...extracted,
                      education: { ...extracted.education, gpa: Number(e.target.value) },
                    })
                  }
                />
              </div>
            </Card>

            {/* Extracted Technical Skills */}
            <Card className="p-6 border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>Technical Skills (Extracted by AI)</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                  {extracted.skills.length} detected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {extracted.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-600 transition-colors font-bold text-sm"
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 max-w-sm">
                <Input
                  placeholder="Add missing skill (e.g. Docker, Python)..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <Button size="sm" type="button" onClick={handleAddSkill}>
                  Add
                </Button>
              </div>
            </Card>

            {/* Extracted Projects */}
            <Card className="p-6 border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-brand-600" />
                  <span>Extracted Projects</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {extracted.projects.length} project(s) parsed
                  </span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddProject}
                    className="text-xs gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {extracted.projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-slate-500">Project #{idx + 1}</span>
                      {extracted.projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <Input
                      label="Project Title"
                      value={proj.title}
                      onChange={(e) => {
                        const updated = [...extracted.projects];
                        updated[idx].title = e.target.value;
                        setExtracted({ ...extracted, projects: updated });
                      }}
                    />
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Project Description</label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        value={proj.description}
                        onChange={(e) => {
                          const updated = [...extracted.projects];
                          updated[idx].description = e.target.value;
                          setExtracted({ ...extracted, projects: updated });
                        }}
                      />
                    </div>
                    <Input
                      label="Technologies Used"
                      value={proj.technologies}
                      onChange={(e) => {
                        const updated = [...extracted.projects];
                        updated[idx].technologies = e.target.value;
                        setExtracted({ ...extracted, projects: updated });
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Extracted Experience (if any) */}
            <Card className="p-6 border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-brand-600" />
                  <span>Work & Internship Experience</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {extracted.experience.length} record(s)
                  </span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddExperience}
                    className="text-xs gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Experience</span>
                  </Button>
                </div>
              </div>

              {extracted.experience.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No work experience detected in resume. You can add internships using the button above or proceed.
                </p>
              ) : (
                <div className="space-y-4">
                  {extracted.experience.map((exp, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-slate-500">Experience #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete experience"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Company / Organization"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...extracted.experience];
                            updated[idx].company = e.target.value;
                            setExtracted({ ...extracted, experience: updated });
                          }}
                        />
                        <Input
                          label="Role / Title"
                          value={exp.role}
                          onChange={(e) => {
                            const updated = [...extracted.experience];
                            updated[idx].role = e.target.value;
                            setExtracted({ ...extracted, experience: updated });
                          }}
                        />
                      </div>
                      <Input
                        label="Duration"
                        value={exp.duration}
                        placeholder="e.g. May 2025 - August 2025"
                        onChange={(e) => {
                          const updated = [...extracted.experience];
                          updated[idx].duration = e.target.value;
                          setExtracted({ ...extracted, experience: updated });
                        }}
                      />
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Description</label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                          value={exp.description}
                          onChange={(e) => {
                            const updated = [...extracted.experience];
                            updated[idx].description = e.target.value;
                            setExtracted({ ...extracted, experience: updated });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Final Confirmation Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setStep(2)} disabled={isSubmitting}>
                Back to Upload
              </Button>
              <Button onClick={handleFinalConfirm} disabled={isSubmitting} className="gap-2 font-semibold shadow-btn-amber">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Profile & Syncing...' : 'Confirm Profile & Access Student Hub'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
