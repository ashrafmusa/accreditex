import React from "react";
import { useTranslation } from "../hooks/useTranslation";
import { ExclamationTriangleIcon } from "../components/icons";

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mb-4" />
      <h1 className="text-4xl font-bold text-brand-text-primary dark:text-dark-brand-text-primary mb-2">
        {t("pageNotFound")}
      </h1>
      <p className="text-lg text-brand-text-secondary dark:text-dark-brand-text-secondary">
        {t("pageNotFoundMessage")}
      </p>
    </div>
  );
};

export default NotFoundPage;
