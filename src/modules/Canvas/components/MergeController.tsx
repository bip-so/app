import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import MultiButton from "../../../components/MultiButton";

const MergeController = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const btnMenuData = [];

  return (
    <div>
      <MultiButton>{t("git.merge")}</MultiButton>
    </div>
  );
};

export default MergeController;
