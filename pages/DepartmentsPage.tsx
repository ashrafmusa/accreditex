import React, { useState, useMemo } from "react";
// FIX: Corrected import path for types
import {
  Department,
  User,
  UserRole,
  Project,
  NavigationState,
  ChecklistItem,
  ComplianceStatus,
} from "../types";
import { useTranslation } from "../hooks/useTranslation";
import {
  BuildingOffice2Icon,
  PlusIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  FolderIcon,
} from "../components/icons";
import DepartmentCard from "../components/departments/DepartmentCard";
import DepartmentModal from "../components/departments/DepartmentModal";
import EmptyState from "../components/common/EmptyState";
import StatCard from "../components/common/StatCard";
import { useAppStore } from "../stores/useAppStore";

interface DepartmentsPageProps {
  departments: Department[];
  users: User[];
  projects: Project[];
  currentUser: User;
  setNavigation: (state: NavigationState) => void;
}

const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  departments,
  users,
  projects,
  currentUser,
  setNavigation,
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const { addDepartment, updateDepartment, deleteDepartment } = useAppStore();

  const canModify = currentUser.role === UserRole.Admin;

  const departmentStats = useMemo(() => {
    const allChecklistItems = projects.flatMap((p) => p.checklist);

    return departments.map((dept) => {
      const usersInDept = users.filter((u) => u.departmentId === dept.id);
      const userIdsInDept = new Set(usersInDept.map((u) => u.id));

      const tasksForDept = allChecklistItems.filter(
        (item) => item.assignedTo && userIdsInDept.has(item.assignedTo)
      );
      const applicableTasks = tasksForDept.filter(
        (c) => c.status !== ComplianceStatus.NotApplicable
      );

      let score = 0;
      applicableTasks.forEach((item) => {
        if (item.status === ComplianceStatus.Compliant) score += 1;
        if (item.status === ComplianceStatus.PartiallyCompliant) score += 0.5;
      });

      const compliance =
        applicableTasks.length > 0
          ? (score / applicableTasks.length) * 100
          : 100;

      return {
        ...dept,
        userCount: usersInDept.length,
        taskCount: tasksForDept.length,
        compliance: Math.round(compliance),
        usersInDept,
      };
    });
  }, [departments, users, projects]);

  const totalStaff = useMemo(() => users.length, [users]);
  const totalTasks = useMemo(
    () => projects.flatMap((p) => p.checklist).length,
    [projects]
  );

  const handleOpenCreateModal = () => {
    setEditingDepartment(null);
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (dept: Department) => {
    setEditingDepartment(dept);
    setIsModalOpen(true);
  };

  const handleSaveDepartment = (dept: Department | Omit<Department, "id">) => {
    if ("id" in dept) {
      updateDepartment(dept);
    } else {
      addDepartment(dept);
    }
    setIsModalOpen(false);
  };

  const handleDeleteDepartment = (deptId: string) => {
    if (window.confirm(t("areYouSureDeleteDepartment"))) {
      deleteDepartment(deptId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse self-start">
          <BuildingOffice2Icon className="h-8 w-8 text-brand-primary" />
          <div>
            <h1 className="text-3xl font-bold dark:text-dark-brand-text-primary">
              {t("departmentsHub")}
            </h1>
            <p className="text-brand-text-secondary dark:text-dark-brand-text-secondary mt-1">
              {t("departmentsPageDescription")}
            </p>
          </div>
        </div>
        {canModify && (
          <button
            onClick={handleOpenCreateModal}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 flex items-center justify-center font-semibold shadow-sm w-full md:w-auto"
          >
            <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
            {t("addNewDepartment")}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t("totalDepartments")}
          value={departments.length}
          icon={BuildingOffice2Icon}
          color="bg-blue-600"
        />
        <StatCard
          title={t("totalStaffAssigned")}
          value={totalStaff}
          icon={UsersIcon}
          color="bg-emerald-600"
        />
        <StatCard
          title={t("totalTasks")}
          value={totalTasks}
          icon={ClipboardDocumentCheckIcon}
          color="bg-indigo-600"
        />
      </div>

      {departmentStats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departmentStats.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              canModify={canModify}
              onSelect={() =>
                setNavigation({
                  view: "departmentDetail",
                  departmentId: dept.id,
                })
              }
              onEdit={() => handleOpenEditModal(dept)}
              onDelete={() => handleDeleteDepartment(dept.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BuildingOffice2Icon}
          title={t("noDepartmentsFound")}
          message={t("createDepartmentToStart")}
        />
      )}

      {isModalOpen && (
        <DepartmentModal
          department={editingDepartment}
          onSave={handleSaveDepartment}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DepartmentsPage;
