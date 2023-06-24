import React, { FC } from "react";
import { Box, Text } from "@primer/react";
import { UseTranslation } from "next-i18next";
import StudioForm, { StudioFormMode } from "../forms/StudioForm";
import { t } from "@excalidraw/excalidraw/types/i18n";
import { useTranslation } from "next-i18next";

interface CreateStudioModalProps {
  closeHandler: Function;
  mode?: StudioFormMode;
  updateStudioPic?: boolean;
}

const CreateStudioModal: FC<CreateStudioModalProps> = ({
  closeHandler,
  mode = "create",
  updateStudioPic = false,
}) => {
  const {t} = useTranslation();
  return (
    <Box width={"100%"}>
      <Text
        as="p"
        fontWeight={600}
        fontSize={"14px"}
        lineHeight={"20px"}
        color={"editModal.heading"}
        pb={"15px"}
      >
        {mode === "create" ? t("workspace.create") : t("workspace.update")}
      </Text>
      <Box
        bg={"editModal.divider"}
        mb={"20px"}
        sx={{
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "editModal.divider",
        }}
      />
      <StudioForm
        closeHandler={closeHandler}
        mode={mode}
        updateStudioPic={updateStudioPic}
      />
    </Box>
  );
};

export default CreateStudioModal;
