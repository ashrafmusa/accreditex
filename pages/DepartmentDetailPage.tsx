import React, { useMemo, useState } from "react";
// FIX: Corrected import path for types
import {
  Department,
  User,
  Project,
  UserRole,
  ChecklistItem,
  ComplianceStatus,
  NavigationState,
} from "../types";
import { useTranslation } from "../hooks/useTranslation";
import {
  BuildingOffice2Icon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
} from "../components/icons";
import StatCard from "../components/common/StatCard";
import DepartmentUserList from "../components/departments/DepartmentUserList";
import DepartmentTaskTable from "../components/departments/DepartmentTaskTable";
import DepartmentalPerformanceChart from "../components/analytics/DepartmentalPerformanceChart";
import DepartmentModal from "../components/departments/DepartmentModal";
import { useAppStore } from "../stores/useAppStore";

interface DepartmentDetailPageProps {
  department: Department;
  users: User[];
  projects: Project[];
  currentUser: User;
  setNavigation: (state: NavigationState) => void;
}

const DepartmentDetailPage: React.FC<DepartmentDetailPageProps> = ({
  department,
  users,
  projects,
  currentUser,
  setNavigation,
}) => {
  const { t, lang } = useTranslation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { updateDepartment, deleteDepartment } = useAppStore();

  const usersInDept = useMemo(
    () => users.filter((u) => u.departmentId === department.id),
    [users, department.id]
  );

  const departmentTasks = useMemo(() => {
    const userIds = new Set(usersInDept.map((u) => u.id));
    return projects.flatMap((p) =>
      p.checklist
        .filter((item) => item.assignedTo && userIds.has(item.assignedTo))
        .map((item) => ({ ...item, projectName: p.name }))
    );
  }, [projects, usersInDept]);

  const stats = useMemo(() => {
    const applicableTasks = departmentTasks.filter(
      (t) => t.status !== ComplianceStatus.NotApplicable
    );
    const score = applicableTasks.reduce((acc, item) => {
      if (item.status === ComplianceStatus.Compliant) return acc + 1;
      if (item.status === ComplianceStatus.PartiallyCompliant) return acc + 0.5;
      return acc;
    }, 0);
    const complianceRate =
      applicableTasks.length > 0
        ? Math.round((score / applicableTasks.length) * 100)
        : 0;
    return {
      userCount: usersInDept.length,
      taskCount: departmentTasks.length,
      complianceRate: `${complianceRate}%`,
    };
  }, [usersInDept, departmentTasks]);

  const canModify = currentUser.role === UserRole.Admin;

  const handleDelete = () => {
    if (window.confirm(t("areYouSureDeleteDepartment"))) {
      deleteDepartment(department.id);
      setNavigation({ view: "departments" });
    }
  };

  const handleSaveDepartment = (dept: Department | Omit<Department, "id">) => {
    if ("id" in dept) {
      updateDepartment(dept);
    }
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-brand-surface dark:bg-dark-brand-surface p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-brand-border">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-brand-primary-500 to-brand-primary-700 text-white flex items-center justify-center">
                <BuildingOffice2Icon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-brand-text-primary dark:text-dark-brand-text-primary">
                  {department.name[lang]}
                </h1>
                <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary">
                  {t("departmentDetails")}
                </p>
              </div>
            </div>
            {canModify && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 text-gray-500 hover:text-brand-primary"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-500 hover:text-red-600"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title={t("assignedUsers")}
            value={stats.userCount}
            icon={UsersIcon}
            color="bg-emerald-600"
          />
          <StatCard
            title={t("tasksAssigned")}
            value={stats.taskCount}
            icon={ClipboardDocumentCheckIcon}
            color="bg-indigo-600"
          />
          <StatCard
            title={t("complianceRate")}
            value={stats.complianceRate}
            color="bg-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DepartmentUserList users={usersInDept} />
          </div>
          <div className="lg:col-span-2">
            {/* FIX: Pass the setNavigation prop to DepartmentalPerformanceChart. */}
            <DepartmentalPerformanceChart
              projects={projects}
              departments={[department]}
              users={usersInDept}
              setNavigation={setNavigation}
            />
          </div>
        </div>

        <DepartmentTaskTable tasks={departmentTasks} users={users} />
      </div>
      {isEditModalOpen && (
        <DepartmentModal
          department={department}
          onSave={handleSaveDepartment}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
};

export default DepartmentDetailPage;
