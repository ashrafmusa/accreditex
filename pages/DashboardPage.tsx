import React from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useProjectStore } from '../stores/useProjectStore';
import { UserRole } from '../types';
// FIX: Added file extensions to resolve module errors
import AdminDashboard from '../components/dashboard/AdminDashboard.tsx';
import ProjectLeadDashboard from '../components/dashboard/ProjectLeadDashboard.tsx';
import TeamMemberDashboard from '../components/dashboard/TeamMemberDashboard.tsx';
import DashboardHeader from '../components/dashboard/DashboardHeader.tsx';
import { useAppStore } from '../stores/useAppStore';

const DashboardPage: React.FC = () => {
  const { currentUser } = useUserStore();
  const { projects } = useProjectStore();
  const { users, setNavigation } = useAppStore();

  if (!currentUser) {
    return null; // Or a loading indicator
  }

  const renderDashboardByRole = () => {
    switch (currentUser.role) {
      case UserRole.Admin:
        return <AdminDashboard projects={projects} users={users} />;
      case UserRole.ProjectLead:
        return <ProjectLeadDashboard currentUser={currentUser} allProjects={projects} />;
      case UserRole.TeamMember:
        return <TeamMemberDashboard currentUser={currentUser} allProjects={projects} />;
      default:
        return <div>Unsupported user role</div>;
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader currentUser={currentUser} setNavigation={setNavigation} />
      {renderDashboardByRole()}
    </div>
  );
};

export default DashboardPage;
