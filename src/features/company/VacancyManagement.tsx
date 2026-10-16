import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Calendar, 
  MapPin, 
  IndianRupee, 
  CheckCircle2, 
  Briefcase 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { companyApi } from '@/lib/api/companyApi';
import { Job } from '@/types';

export const VacancyManagement: React.FC = () => {
  const { showToast } = useToast();
  const [vacancies, setVacancies] = useState<Job[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Platform Engineering');
  const [location, setLocation] = useState('Bangalore / Hybrid');
  const [type, setType] = useState<'Full-time' | 'Internship'>('Full-time');
  const [salaryRange, setSalaryRange] = useState('₹14 - 18 LPA');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('2026-11-30');

  useEffect(() => {
    async function loadVacancies() {
      const data = await companyApi.getVacancies();
      setVacancies(data);
    }
    loadVacancies();
  }, []);

  const handleCreateVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please fill out all required vacancy fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await companyApi.createVacancy({
        title,
        company: 'CloudScale Technologies',
        department,
        location,
        type,
        salaryRange,
        description,
        requiredSkills: [
          { skillId: 'skill-react', canonicalName: 'React', sourceText: 'React', weight: 50 },
          { skillId: 'skill-ts', canonicalName: 'TypeScript', sourceText: 'TypeScript', weight: 50 },
        ],
        preferredSkills: [
          { skillId: 'skill-node', canonicalName: 'Node.js', sourceText: 'NodeJS', weight: 20, isPreferred: true },
        ],
        eligibilityCriteria: {
          minimumCgpa: 7.5,
          allowedDepartments: ['Computer Science', 'Information Technology'],
          graduationYear: [2026],
        },
        deadline,
        status: 'ACTIVE',
      });

      setVacancies([created, ...vacancies]);
      showToast('New vacancy submitted to TechSummitTrainers placement cell!', 'success');
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
    } catch {
      showToast('Failed to create vacancy', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Vacancy & Role Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Submit campus openings, specify required vs preferred skills, and define institutional eligibility criteria.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Post New Vacancy</span>
        </Button>
      </div>

      <div className="space-y-4">
        {vacancies.map((v) => (
          <Card key={v.id} className="space-y-3.5 hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">{v.title}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-slate-700">{v.company}</span>
                  <span>•</span>
                  <span>{v.location}</span>
                  <span>•</span>
                  <span className="text-brand-700 font-bold">{v.salaryRange}</span>
                </div>
              </div>
              <Badge variant="info">{v.status}</Badge>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
              {v.description}
            </p>

            {/* Required / Preferred Skills summary */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Required:</span>
                {v.requiredSkills.map((req) => (
                  <Badge key={req.skillId} variant="default" size="sm">
                    {req.canonicalName} ({req.weight}%)
                  </Badge>
                ))}
              </div>

              <span className="text-[11px] text-slate-500">
                Deadline: <strong>{v.deadline}</strong>
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Vacancy Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Submit New Vacancy to Placement Hub"
        description="Specify job description, skill weights, and academic cutoff requirements."
        size="lg"
      >
        <form onSubmit={handleCreateVacancy} className="space-y-4">
          <Input
            label="Job Role Title"
            placeholder="e.g. Frontend Platform Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Department / Unit"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <Input
              label="Location / Work Mode"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Employment Type"
              value={type}
              onChange={(e) => setType(e.target.value as 'Full-time' | 'Internship')}
            >
              <option value="Full-time">Full-time (Graduate Offer)</option>
              <option value="Internship">Internship + PPO</option>
            </Select>

            <Input
              label="Compensation / CTC"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Job Description & Responsibilities <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              placeholder="Describe tech stack, key deliverables, and qualification requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <Input
            label="Application Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
            TechSummitTrainers placement parser will automatically canonicalize skill variants (e.g. ReactJS → React) and schedule batch candidate matching.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Publish Vacancy
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
