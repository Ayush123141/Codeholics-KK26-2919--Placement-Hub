import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  FileCode, 
  Award, 
  FolderGit2, 
  BookOpen, 
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { EvidenceBadge } from '@/components/data-display/EvidenceBadge';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/feedback/EmptyState';
import { EvidenceDetailModal } from './EvidenceDetailModal';
import { AddEvidenceModal } from './AddEvidenceModal';
import { studentApi } from '@/lib/api/studentApi';
import { EvidenceRecord, EvidenceType, EvidenceStatus } from '@/types';

export const StudentEvidence: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvidence() {
      try {
        const data = await studentApi.getEvidence();
        setEvidenceList(data);
      } catch (err) {
        console.error('Failed to load evidence records:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvidence();
  }, []);

  const handleOpenDetail = (ev: EvidenceRecord) => {
    setSelectedEvidence(ev);
    setIsDetailOpen(true);
  };

  const handleEvidenceAdded = (newEv: EvidenceRecord) => {
    setEvidenceList((prev) => [newEv, ...prev]);
  };

  const tabs = [
    { id: 'ALL', label: 'All Evidence', count: evidenceList.length },
    { id: 'ASSESSMENT', label: 'Assessments', count: evidenceList.filter((e) => e.type === 'ASSESSMENT').length },
    { id: 'PROJECT', label: 'Evaluated Projects', count: evidenceList.filter((e) => e.type === 'PROJECT').length },
    { id: 'GITHUB', label: 'GitHub Audits', count: evidenceList.filter((e) => e.type === 'GITHUB').length },
    { id: 'CERTIFICATE', label: 'Credentials', count: evidenceList.filter((e) => e.type === 'CERTIFICATE').length },
  ];

  const filteredEvidence = evidenceList.filter((ev) => {
    const matchesTab = activeTab === 'ALL' || ev.type === activeTab;
    const matchesStatus = statusFilter === 'ALL' || ev.status === statusFilter;
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Verifiable Skill Evidence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Every claimed skill is linked to proctored benchmarks, code repository AST audits, or verified credentials.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Submit Evidence Artifact</span>
        </Button>
      </div>

      {/* Tabs & Search controls */}
      <Card className="p-4 space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by skill, title, or rubric..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="REVIEWED">Reviewed Only</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Evidence Cards Grid */}
      {filteredEvidence.length === 0 ? (
        <EmptyState
          title="No evidence records found"
          description="Try adjusting your search query, status filter, or category tab."
          actionLabel="Clear Filters"
          onAction={() => {
            setActiveTab('ALL');
            setStatusFilter('ALL');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvidence.map((ev) => (
            <div
              key={ev.id}
              onClick={() => handleOpenDetail(ev)}
              className="p-5 rounded-xl border border-slate-200/90 bg-white hover:border-brand-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="info" size="sm">
                      {ev.skillName}
                    </Badge>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">
                      {ev.type}
                    </span>
                  </div>
                  <EvidenceBadge status={ev.status} size="sm" />
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                  {ev.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {ev.details}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 font-medium">
                  {ev.score && (
                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {ev.score}
                    </span>
                  )}
                  <span>• Verifier: {ev.verifier?.split('(')[0]}</span>
                </div>
                <span className="text-brand-600 font-bold group-hover:translate-x-0.5 transition-transform">
                  Inspect Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <EvidenceDetailModal
        evidence={selectedEvidence}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <AddEvidenceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onEvidenceAdded={handleEvidenceAdded}
      />
    </div>
  );
};
