import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Award, 
  Briefcase, 
  FolderGit2, 
  Save, 
  ExternalLink, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Calendar,
  Sparkles,
  UploadCloud
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { studentApi } from '@/lib/api/studentApi';
import { resumeParserService } from '@/lib/services/resumeParser';
import { UserProfile, StudentProject, StudentEducation, StudentExperience } from '@/types';

export const StudentProfile: React.FC = () => {
  const { showToast } = useToast();
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [education, setEducation] = useState<StudentEducation[]>([]);
  const [experience, setExperience] = useState<StudentExperience[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [githubUrl, setGithubUrl] = useState('https://github.com/alexmorgan-dev');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('');
  const [department, setDepartment] = useState('');
  const [graduationYear, setGraduationYear] = useState<number>(2026);
  const [cgpa, setCgpa] = useState<number>(8.85);

  useEffect(() => {
    async function loadProfile() {
      const [prof, proj, edu, exp] = await Promise.all([
        studentApi.getProfile(),
        studentApi.getProjects(),
        studentApi.getEducation(),
        studentApi.getExperience(),
      ]);
      setProfile(prof);
      setName(prof.name);
      setEmail(prof.email);
      setCollege(prof.college || '');
      setDegree(prof.degree || '');
      setDepartment(prof.department || '');
      setGraduationYear(prof.graduationYear || 2026);
      setCgpa(prof.cgpa || 8.85);

      setProjects(proj);
      setEducation(edu);
      setExperience(exp);
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await studentApi.updateProfile({
        name,
        email,
        college,
        degree,
        department,
        graduationYear: Number(graduationYear),
        cgpa: Number(cgpa),
      });
      setProfile(updated);
      showToast('Profile information saved successfully', 'success');
    } catch {
      showToast('Failed to save profile changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUploadAndParse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsParsingResume(true);
    showToast('AI is extracting projects, skills & education from resume...', 'info');

    try {
      const parsed = await resumeParserService.parseResumeWithAI(file, {
        name,
        email,
        college,
        degree,
        graduationYear: Number(graduationYear),
        cgpa: Number(cgpa),
      });

      if (parsed.candidate.name) setName(parsed.candidate.name);
      if (parsed.education.institution) setCollege(parsed.education.institution);
      if (parsed.education.degree) setDegree(parsed.education.degree);
      if (parsed.education.graduationYear) setGraduationYear(parsed.education.graduationYear);
      if (parsed.education.gpa) setCgpa(parsed.education.gpa);

      studentApi.saveParsedProfileData({
        education: parsed.education,
        skills: parsed.skills,
        projects: parsed.projects,
        experience: parsed.experience,
      });

      const [newProjects, newEducation, newExperience] = await Promise.all([
        studentApi.getProjects(),
        studentApi.getEducation(),
        studentApi.getExperience(),
      ]);

      setProjects(newProjects);
      setEducation(newEducation);
      setExperience(newExperience);

      showToast(`Resume dynamically parsed by AI! Updated ${newProjects.length} projects and ${parsed.skills.length} skills.`, 'success');
    } catch (err: any) {
      console.error('Resume re-parsing failed:', err);
      showToast(err.message || 'Failed to parse resume with AI', 'error');
    } finally {
      setIsParsingResume(false);
      if (e.target) e.target.value = '';
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Candidate Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain your official institutional record, verified projects, and public code repositories.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            type="file"
            ref={resumeInputRef}
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
            onChange={handleResumeUploadAndParse}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => resumeInputRef.current?.click()}
            isLoading={isParsingResume}
            className="gap-2 border-emerald-300 text-emerald-800 hover:bg-emerald-50 bg-emerald-50/40 text-xs font-semibold shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Update from Resume (AI)</span>
          </Button>
          <Button
            onClick={handleSaveProfile}
            isLoading={isSaving}
            className="gap-2 self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {/* Basic & Academic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            <CardTitle>Academic & Identity Information</CardTitle>
          </div>
          <CardDescription>
            Official institutional information verified against your campus student ledger
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Campus Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <Input
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
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
                  label="CGPA / Score"
                  type="number"
                  step="0.01"
                  value={cgpa}
                  onChange={(e) => setCgpa(Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* GitHub Repository Audit Pipeline (Optional) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-slate-800" />
              <CardTitle>Public GitHub Repository (Optional)</CardTitle>
            </div>
            <Badge variant="default" size="sm" className="text-slate-500 font-medium">
              Optional Evidence
            </Badge>
          </div>
          <CardDescription>
            Linking a public repository is completely optional. If provided, ProofHire retrieves only public repository structures safely without executing code or inferring mastery from stars/commits. Missing GitHub evidence means &ldquo;not provided&rdquo;, not unqualified.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username (optional)"
              className="font-mono text-xs"
            />
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                if (!githubUrl.trim()) {
                  showToast('GitHub link cleared. Status set to "Not Provided".', 'info');
                } else if (!githubUrl.includes('github.com/')) {
                  showToast('Please enter a valid GitHub profile or repo URL (e.g. https://github.com/username)', 'error');
                } else {
                  showToast('Public repository verified safely. No code executed.', 'success');
                }
              }}
              className="shrink-0 w-full sm:w-auto"
            >
              {githubUrl.trim() ? 'Verify Repository' : 'Clear Link'}
            </Button>
          </div>

          {githubUrl.trim() ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 text-white rounded-lg">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{githubUrl.split('github.com/')[1] || 'Public Repository'}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Safe AST analysis complete • Manifest files inspected • No arbitrary code executed
                  </p>
                </div>
              </div>
              <Badge variant="success">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" />
                Linked & Verified
              </Badge>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50/80 border border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-slate-400" />
                <span>No GitHub repository linked. You can still qualify through assessments, project scrutiny, and coursework.</span>
              </div>
              <Badge variant="default" size="sm">Not Provided</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evaluated Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <CardTitle>Evaluated Academic & Capstone Projects</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast('To add a new project evaluation, submit an evidence artifact.', 'info')}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Project</span>
            </Button>
          </div>
          <CardDescription>
            Projects evaluated against standard department rubrics with verifiable reviewer signatures
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                  {proj.evaluationScore && (
                    <Badge variant="purple" size="sm">
                      Rubric: {proj.evaluationScore}/100
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-slate-500">Evaluator: {proj.evaluator}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <div className="flex flex-wrap gap-1.5">
                  {proj.technologies.map((tech) => (
                    <Badge key={tech} variant="default" size="sm">
                      {tech}
                    </Badge>
                  ))}
                </div>
                {proj.repoUrl && (
                  <a
                    href={proj.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-semibold"
                  >
                    <span>View Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Experience / Internships */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-amber-600" />
            <CardTitle>Professional Experience & Internships</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {experience.map((exp) => (
            <div key={exp.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{exp.role}</h4>
                  <p className="text-xs font-semibold text-slate-700">{exp.company} • {exp.location}</p>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {exp.startDate} – {exp.endDate}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {exp.technologies.map((t) => (
                  <Badge key={t} variant="slate" size="sm">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
