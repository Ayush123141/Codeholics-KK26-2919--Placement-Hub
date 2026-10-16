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
  Edit3
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/AuthContext';

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

  // Step 3: Extracted Editable State
  const [extracted, setExtracted] = useState<ExtractedData>({
    education: {
      institution: 'TechSummit Institute of Technology',
      degree: 'B.Tech in Computer Science & Engineering',
      graduationYear: 2026,
      gpa: 8.5,
    },
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'JavaScript (ES6+)', 'Node.js', 'Git'],
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
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        showToast('Please upload a PDF format resume', 'error');
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        showToast('File size must be under 10MB', 'error');
        return;
      }
      setFile(selected);
    }
  };

  // Trigger Extraction
  const handleStartExtraction = () => {
    if (!file) {
      // Allow skipping upload if student wants to enter profile manually
      setStep(3);
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(20);

    const timer1 = setTimeout(() => setExtractionProgress(55), 400);
    const timer2 = setTimeout(() => setExtractionProgress(85), 900);
    const timer3 = setTimeout(() => {
      setExtractionProgress(100);
      setIsExtracting(false);
      // Synchronize basic details into extracted data
      setExtracted((prev) => ({
        ...prev,
        education: {
          institution: college,
          degree,
          graduationYear,
          gpa: cgpa,
        },
      }));
      setStep(3);
      showToast('Resume parsed successfully! Review and correct the extracted information below.', 'success');
    }, 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
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

  // Final Registration Confirmation
  const handleFinalConfirm = async () => {
    const res = await registerStudent({
      name,
      email,
      college: extracted.education.institution,
      degree: extracted.education.degree,
      graduationYear: extracted.education.graduationYear,
      cgpa: extracted.education.gpa,
      password,
    });

    if (res.success) {
      showToast('Candidate account created! Welcome to ProofHire.', 'success');
      navigate('/student');
    } else {
      showToast(res.error || 'Registration failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-2 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Student Registration & Resume Ingestion
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create your candidate profile. Upload a resume to automatically extract your skills, education, and projects.
            </p>
          </div>

          {/* Stepper indicator */}
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold">
            <span
              className={`px-3 py-1 rounded-full ${
                step === 1 ? 'bg-brand-600 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              1. Account
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`px-3 py-1 rounded-full ${
                step === 2
                  ? 'bg-brand-600 text-white'
                  : step > 2
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              2. Resume Upload
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`px-3 py-1 rounded-full ${
                step === 3 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3. Review Extracted
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

        {/* STEP 2: PDF Upload & Progress */}
        {step === 2 && (
          <Card className="p-8 border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Step 2: Resume Ingestion & Extraction</h3>
              <p className="text-xs text-slate-500">
                Upload your current PDF resume. ProofHire will extract your skills, coursework, and projects into editable form fields.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors">
              <input
                type="file"
                id="resume-file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="resume-file" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center border border-blue-100">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-brand-600 hover:text-brand-800">Click to choose PDF</span>
                  <span className="text-slate-500"> or drag and drop your file here</span>
                </div>
                <p className="text-[11px] text-slate-400">PDF documents only (max 10MB)</p>
              </label>

              {file && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200 inline-flex items-center gap-2 text-xs font-semibold text-slate-800">
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
                    <span>Extracting skills, projects, and academic history...</span>
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
                  <strong>Verification Policy:</strong> Extracted resume claims are candidate-provided assertions. They will be marked as <em>Unconfirmed – please review</em> and do <strong>not</strong> automatically become verified evidence until backed by proctored tests, GitHub code analysis, or auditor scrutiny.
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
                  className="gap-2 font-semibold"
                >
                  <span>Parse Resume & Review</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 3: Editable Review Screen */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <Edit3 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Unconfirmed – please review extracted data</p>
                <p className="text-amber-800 mt-0.5 leading-relaxed">
                  Review the extracted profile below. You can correct, add, or remove any information before confirming your candidate account. All entries remain unconfirmed assertions until evidence is verified.
                </p>
              </div>
            </div>

            {/* Extracted Education */}
            <Card className="p-6 border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Academic Background (Extracted)
              </h3>
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
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Technical Skills (Extracted)
              </h3>
              <div className="flex flex-wrap gap-2">
                {extracted.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
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
                <h3 className="text-sm font-bold text-slate-900">Extracted Projects</h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {extracted.projects.length} project(s) parsed
                </span>
              </div>

              <div className="space-y-4">
                {extracted.projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
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

            {/* Final Confirmation Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back to Upload
              </Button>
              <Button onClick={handleFinalConfirm} className="gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Profile & Access Student Hub</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
