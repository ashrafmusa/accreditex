import React, { useState } from 'react';
import { ChecklistItem, ComplianceStatus, Project, Standard, User, UserRole } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import {
  CheckCircleIcon, XCircleIcon, MinusCircleIcon, SlashCircleIcon, SparklesIcon,
  ChevronDownIcon, ChatBubbleLeftEllipsisIcon
} from '../icons';
import { aiService } from '../../services/ai';
import { useToast } from '../../hooks/useToast';
import ChecklistEvidence from './ChecklistEvidence';
import ChecklistComments from './ChecklistComments';
import LinkDataModal from '../common/LinkDataModal';

interface ChecklistItemProps {
  item: ChecklistItem;
  standard: Standard | undefined;
  project: Project;
  users: User[];
  currentUser: User;
  isFinalized: boolean;
  onUpdate: (itemId: string, updates: Partial<ChecklistItem>) => void;
  onAddComment: (itemId: string, commentText: string) => void;
  onUploadEvidence: (projectId: string, checklistItemId: string, fileData: any) => void;
}

const statusInfo: Record<ComplianceStatus, { icon: React.FC<any>, color: string, text: string }> = {
  [ComplianceStatus.Compliant]: { icon: CheckCircleIcon, color: 'text-green-500', text: 'compliant' },
  [ComplianceStatus.PartiallyCompliant]: { icon: MinusCircleIcon, color: 'text-yellow-500', text: 'partiallyCompliant' },
  [ComplianceStatus.NonCompliant]: { icon: XCircleIcon, color: 'text-red-500', text: 'nonCompliant' },
  [ComplianceStatus.NotApplicable]: { icon: SlashCircleIcon, color: 'text-gray-500', text: 'notApplicable' },
};

const ChecklistItemComponent: React.FC<ChecklistItemProps> = ({ item, standard, project, users, currentUser, isFinalized, onUpdate, onAddComment, onUploadEvidence }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isLinkDataModalOpen, setIsLinkDataModalOpen] = useState(false);

  const canEdit = !isFinalized && (currentUser.role === UserRole.Admin || currentUser.id === project.projectLead.id || currentUser.id === item.assignedTo);
  const { icon: StatusIcon, color, text: statusTextKey } = statusInfo[item.status];

  const handleGetAiSuggestion = async () => {
    if (!standard) return;
    setIsAiLoading(true);
    try {
      const suggestion = await aiService.suggestActionPlan(standard.description);
      onUpdate(item.id, { actionPlan: suggestion });
    } catch (error) {
      toast.error(t('actionPlanError'));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLinkData = (resource: { resourceType: string; resourceId: string; displayText: string }) => {
    const updatedLinkedResources = [...(item.linkedFhirResources || []), resource];
    onUpdate(item.id, { linkedFhirResources: updatedLinkedResources });
    setIsLinkDataModalOpen(false);
  };

  return (
    <div className="bg-brand-surface dark:bg-dark-brand-surface rounded-lg shadow-sm border dark:border-dark-brand-border">
      <div className="p-4 flex items-start gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <StatusIcon className={`w-6 h-6 flex-shrink-0 mt-1 ${color}`} />
        <div className="flex-grow">
          <p className="font-semibold text-brand-text-primary dark:text-dark-brand-text-primary">{item.item}</p>
          <p className="text-xs text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">{t('standard')}: {item.standardId}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo[item.status].color.replace('text', 'bg').replace('-500', '-100 dark:bg-opacity-20 dark:text-opacity-80')}`}>
            {t(statusTextKey as any)}
          </span>
          <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t dark:border-dark-brand-border space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('status')}</label>
              <select value={item.status} onChange={e => onUpdate(item.id, { status: e.target.value as ComplianceStatus })} disabled={!canEdit} className="w-full text-sm p-2 border rounded-md">
                {Object.values(ComplianceStatus).map(s => <option key={s} value={s}>{t((s.charAt(0).toLowerCase() + s.slice(1).replace(' ', '')) as any)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-mmedium mb-1">{t('assignedTo')}</label>
              <select value={item.assignedTo || ''} onChange={e => onUpdate(item.id, { assignedTo: e.target.value || null })} disabled={isFinalized} className="w-full text-sm p-2 border rounded-md">
                <option value="">{t('unassigned')}</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('actionPlan')}</label>
            <textarea value={item.actionPlan} onChange={e => onUpdate(item.id, { actionPlan: e.target.value })} rows={3} disabled={!canEdit} className="w-full text-sm p-2 border rounded-md" />
            {canEdit && (item.status === ComplianceStatus.NonCompliant || item.status === ComplianceStatus.PartiallyCompliant) && (
              <button onClick={handleGetAiSuggestion} disabled={isAiLoading} className="mt-1 text-sm font-semibold text-brand-primary flex items-center gap-1">
                <SparklesIcon className={`w-4 h-4 ${isAiLoading ? 'animate-pulse' : ''}`} />
                {isAiLoading ? t('generating') : t('getAiSuggestion')}
              </button>
            )}
          </div>
          
          <ChecklistEvidence 
            item={item} 
            project={project}
            isFinalized={isFinalized}
            onUpload={onUploadEvidence}
            onLinkData={() => setIsLinkDataModalOpen(true)}
          />

          <ChecklistComments 
            item={item}
            currentUser={currentUser}
            onAddComment={(text) => onAddComment(item.id, text)}
          />

        </div>
      )}
      <LinkDataModal isOpen={isLinkDataModalOpen} onClose={() => setIsLinkDataModalOpen(false)} onLink={handleLinkData} />
    </div>
  );
};

export default ChecklistItemComponent;
