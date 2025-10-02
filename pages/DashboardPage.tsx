

import React from 'react';
// FIX: Corrected import path for types
import { NavigationState, UserRole } from '../types';
import { useUserStore } from '../stores/useUserStore';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ProjectLeadDashboard from '../components/dashboard/ProjectLeadDashboard';
import TeamMemberDashboard from '../components/dashboard/TeamMemberDashboard';
import { useTranslation } from '../hooks/useTranslation';

interface DashboardPageProps {
  setNavigation: (state: NavigationState) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ setNavigation }) => {
  if (import.meta.env?.DEV) console.log("DEBUG: Rendering DashboardPage");
  const { currentUser } = useUserStore();
  const { t } = useTranslation();

  if (!currentUser) return null;

  const renderDashboardByRole = () => {
    switch (currentUser.role) {
      case UserRole.Admin:
        return <AdminDashboard setNavigation={setNavigation} />;
      case UserRole.ProjectLead:
        return <ProjectLeadDashboard setNavigation={setNavigation} />;
      case UserRole.TeamMember:
      case UserRole.Auditor: // Fallthrough for similar views
        return <TeamMemberDashboard setNavigation={setNavigation} />;
      default:
        return <div className="text-center p-8">{t('dashboardNotAvailable')}</div>;
    }
  };

  return (
    <div>
      {renderDashboardByRole()}
    </div>
  );
};

export default DashboardPage;