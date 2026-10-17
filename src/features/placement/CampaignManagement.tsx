import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Calendar, 
  Users, 
  Building2, 
  CheckCircle2, 
  Briefcase, 
  ExternalLink,
  Edit3,
  DollarSign
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { placementApi } from '@/lib/api/placementApi';
import { Campaign } from '@/types';

export const CampaignManagement: React.FC = () => {
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCamp, setEditingCamp] = useState<Campaign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields for Creation
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('CloudScale Technologies');
  const [jobTitle, setJobTitle] = useState('Frontend Platform Engineer');
  const [salaryRange, setSalaryRange] = useState('₹14 - ₹18 LPA');
  const [cohortName, setCohortName] = useState('2026 Batch — B.Tech Computer Science & IT (240 Students)');
  const [targetHires, setTargetHires] = useState(5);
  const [deadline, setDeadline] = useState('2026-11-30');

  // Form fields for Edit
  const [editSalaryRange, setEditSalaryRange] = useState('');
  const [editTargetHires, setEditTargetHires] = useState(5);
  const [editDeadline, setEditDeadline] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'SHORTLISTING' | 'INTERVIEWING' | 'COMPLETED'>('ACTIVE');

  useEffect(() => {
    async function loadCampaigns() {
      const data = await placementApi.getCampaigns();
      setCampaigns(data);
    }
    loadCampaigns();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please specify a campaign title', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newCamp = await placementApi.createCampaign({
        title,
        companyName,
        jobId: `job-${companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
        jobTitle,
        cohortId: 'cohort-2026-cs-it',
        cohortName,
        status: 'ACTIVE',
        startDate: new Date().toISOString().split('T')[0],
        deadline,
        targetHires: Number(targetHires),
        salaryRange: salaryRange.trim() || '₹12 - ₹18 LPA',
        policyVersion: 'v1.0-deterministic-80-20',
      });
      setCampaigns([newCamp, ...campaigns]);
      showToast('New hiring campaign established and cohort notified!', 'success');
      setIsCreateOpen(false);
      setTitle('');
    } catch {
      showToast('Failed to create campaign', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (camp: Campaign) => {
    setEditingCamp(camp);
    setEditSalaryRange(camp.salaryRange || '₹14 - ₹18 LPA');
    setEditTargetHires(camp.targetHires);
    setEditDeadline(camp.deadline);
    setEditStatus(camp.status as any || 'ACTIVE');
    setIsEditOpen(true);
  };

  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCamp) return;

    setIsSubmitting(true);
    try {
      const updated = await placementApi.updateCampaign(editingCamp.id, {
        salaryRange: editSalaryRange.trim() || '₹12 - ₹18 LPA',
        targetHires: Number(editTargetHires),
        deadline: editDeadline,
        status: editStatus,
      });

      setCampaigns((prev) =>
        prev.map((c) => (c.id === editingCamp.id ? { ...c, ...updated } : c))
      );
      showToast('Placement campaign vacancy and salary details updated successfully!', 'success');
      setIsEditOpen(false);
      setEditingCamp(null);
    } catch {
      showToast('Failed to update campaign details', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Hiring Campaign Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Map corporate partner vacancies to authorized student cohorts, configure compensation brackets, and govern batch ranking.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Launch Placement Campaign</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((camp) => (
          <Card key={camp.id} className="space-y-4 hover:border-slate-300 transition-all relative">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{camp.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-semibold text-slate-700">{camp.companyName}</span>
                    <span>•</span>
                    <span className="text-brand-700 font-semibold">{camp.jobTitle}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant={camp.status === 'SHORTLISTING' ? 'purple' : camp.status === 'ACTIVE' ? 'info' : 'default'}>
                    {camp.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(camp)}
                    className="p-1 h-7 w-7 text-slate-500 hover:text-slate-900"
                    title="Edit vacancy and compensation"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Salary & Cohort Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                <div>
                  <span className="font-bold text-slate-700">Assigned Cohort: </span>
                  <span>{camp.cohortName}</span>
                </div>
                <Badge variant="warning" size="sm" className="font-mono font-bold tracking-tight">
                  💰 {camp.salaryRange || '₹14 - ₹18 LPA'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2 rounded-lg bg-slate-50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Target Hires</p>
                <p className="font-black text-slate-900 text-base">{camp.targetHires}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Applicants</p>
                <p className="font-black text-slate-900 text-base">{camp.totalApplicants}</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900">
                <p className="text-[10px] text-emerald-700 font-bold uppercase">Shortlisted</p>
                <p className="font-black text-base">{camp.shortlistedCount}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Closes: {camp.deadline}
              </span>
              <span className="font-mono text-slate-400">Policy: {camp.policyVersion}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Launch Placement Campaign"
        description="Select an approved corporate partner vacancy, configure compensation, target hires, and bind to an institute cohort."
        size="md"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <Input
            label="Campaign Name"
            placeholder="e.g. CloudScale Technologies — Campus Hiring Drive 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Hiring Partner (Company)"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            >
              <option value="CloudScale Technologies">CloudScale Technologies</option>
              <option value="Nexus FinTech Labs">Nexus FinTech Labs</option>
              <option value="Zenith Studio Labs">Zenith Studio Labs</option>
              <option value="Datablox Distributed Cloud">Datablox Distributed Cloud</option>
              <option value="Hyperion AI Systems">Hyperion AI Systems</option>
              <option value="CyberSentinel Networks">CyberSentinel Networks</option>
            </Select>

            <Select
              label="Approved Vacancy (Role)"
              value={jobTitle}
              onChange={(e) => {
                const val = e.target.value;
                setJobTitle(val);
                if (val.includes('Cloud') || val.includes('DevOps')) setSalaryRange('₹15 - ₹22 LPA');
                else if (val.includes('AI') || val.includes('ML')) setSalaryRange('₹18 - ₹26 LPA');
                else if (val.includes('Systems') || val.includes('Backend')) setSalaryRange('₹16 - ₹22 LPA');
                else setSalaryRange('₹14 - ₹18 LPA');
              }}
            >
              <option value="Frontend Platform Engineer">Frontend Platform Engineer</option>
              <option value="Full Stack Systems Engineer">Full Stack Systems Engineer</option>
              <option value="Cloud & DevOps Platform Engineer">Cloud & DevOps Platform Engineer</option>
              <option value="Backend Distributed Systems Engineer">Backend Distributed Systems Engineer</option>
              <option value="AI / ML Infrastructure Engineer">AI / ML Infrastructure Engineer</option>
              <option value="Site Reliability & Security Engineer (SRE)">Site Reliability & Security Engineer (SRE)</option>
              <option value="Data Platform & Analytics Engineer">Data Platform & Analytics Engineer</option>
              <option value="Product UI/UX Engineer">Product UI/UX Engineer</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Salary Package / CTC Range"
              placeholder="e.g. ₹16 - ₹22 LPA"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              required
            />
            <Select
              label="Eligible Student Cohort"
              value={cohortName}
              onChange={(e) => setCohortName(e.target.value)}
            >
              <option value="2026 Batch — B.Tech Computer Science & IT (240 Students)">
                2026 Batch — B.Tech Computer Science & IT (240 Students)
              </option>
              <option value="2026 Batch — Circuit Branches: ECE & EEE (180 Students)">
                2026 Batch — Circuit Branches: ECE & EEE (180 Students)
              </option>
              <option value="All Final Year Enrolled Candidates (420 Students)">
                All Final Year Enrolled Candidates (420 Students)
              </option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Hires (Openings)"
              type="number"
              value={targetHires}
              onChange={(e) => setTargetHires(Number(e.target.value))}
              required
            />
            <Input
              label="Application Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Campaign
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Drive Modal */}
      {editingCamp && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditingCamp(null);
          }}
          title={`Edit Campaign: ${editingCamp.companyName}`}
          description={`Update vacancy compensation, target openings, and drive schedule for ${editingCamp.jobTitle}.`}
          size="md"
        >
          <form onSubmit={handleUpdateCampaign} className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <p className="font-bold text-slate-800">{editingCamp.title}</p>
              <p className="text-slate-500">{editingCamp.cohortName}</p>
            </div>

            <Input
              label="Approved Salary Package / CTC Range"
              placeholder="e.g. ₹16 - ₹24 LPA"
              value={editSalaryRange}
              onChange={(e) => setEditSalaryRange(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Target Openings (Hires)"
                type="number"
                value={editTargetHires}
                onChange={(e) => setEditTargetHires(Number(e.target.value))}
                required
              />
              <Input
                label="Drive Deadline"
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                required
              />
            </div>

            <Select
              label="Campaign Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as any)}
            >
              <option value="ACTIVE">ACTIVE (Receiving Applications)</option>
              <option value="SHORTLISTING">SHORTLISTING (Reviewing Cohort Batch)</option>
              <option value="INTERVIEWING">INTERVIEWING (Conducting Technical Rounds)</option>
              <option value="COMPLETED">COMPLETED (Drive Concluded)</option>
            </Select>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingCamp(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
