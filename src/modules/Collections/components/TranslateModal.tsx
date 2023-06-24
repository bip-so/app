import {
  ActionList,
  ActionMenu,
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Text,
} from "@primer/react";
import { XIcon } from "@primer/styled-octicons";
import Select from "react-select";
import React, { useState } from "react";
import { LANGUAGE_DATA } from "../../../utils/languagesData";
import { TriangleDownIcon } from "@primer/octicons-react";
import { CanvasService } from "../../Canvas/services";
import { useToasts } from "react-toast-notifications";
import { usePages } from "../../../context/pagesContext";

const customStyles = {
  option: (styles, state) => {
    return {
      ...styles,
      backgroundColor: state.isFocused ? "#ecf7ec80" : null,
      color: "#333333",
    };
  },
  container: (styles, state) => {
    return {
      ...styles,
      borderRadius: "8px",
    };
  },
};

const TranslateModal = ({ closeHandler, canvasRepo }: any) => {
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const { addToast } = useToasts();
  const { pages, updatePages } = usePages();

  const handleOnChange = (value) => {
    const arrOfLanguages = value.map((val) => val.value);
    setSelectedLanguages(arrOfLanguages);
  };

  const handleTranslate = async (autoTranslate: boolean) => {
    try {
      const res = await CanvasService.createLangugagePage({
        autoTranslate,
        canvasRepositoryID: canvasRepo.id,
        languages: selectedLanguages,
      });

      if (
        res.data.duplicateLanguageCodes?.length === 0 ||
        res.data.duplicateLanguageCodes?.length !== selectedLanguages.length
      )
        if (autoTranslate) {
          addToast("Auto Translation in progress, you will be notified soon", {
            appearance: "success",
            autoDismiss: true,
          });
        } else {
          const canvases = res.data.data;
          if (canvases) {
            updatePages([
              ...pages,
              ...canvases.map((canvas) => {
                return {
                  ...canvas,
                  parent: canvas.collectionID,
                };
              }),
            ]);
          }

          addToast("Manual Translation successfull", {
            appearance: "success",
            autoDismiss: true,
          });
        }
      if (res.data.duplicateLanguageCodes?.length) {
        addToast(
          <>
            <div>
              Translation for the langauge(s) below failed as it is already in
              progress or the translated canvas already exists.
            </div>
            <div>({res.data.duplicateLanguageCodes.join(",")})</div>
          </>,

          {
            appearance: "error",
            autoDismiss: true,
          }
        );
      }
      setSelectedLanguages([]);
      closeHandler();
    } catch (error) {
      addToast("Translation failed, please try again later", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const hasSelectedLanguages = selectedLanguages.length > 0;

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
        }}
      >
        <Text
          as="h2"
          fontWeight={600}
          fontSize={"18px"}
          lineHeight={"20px"}
          color={"home.text.bunker"}
        >
          {`Select Languages`}
        </Text>
        <IconButton
          sx={{
            border: "none",
            backgroundColor: "transparent",
            // ":hover:not([disabled]": {
            //   backgroundColor: "transparent",
            // },
          }}
          icon={XIcon}
          onClick={closeHandler}
        />
      </Box>
      <hr />
      <Box margin={"12px"}>
        <Select
          options={LANGUAGE_DATA}
          isMulti
          styles={customStyles}
          onChange={handleOnChange}
          menuPosition="fixed"
          placeholder="Search..."
          theme={(theme) => ({
            ...theme,
            borderRadius: "6px",
            colors: {
              ...theme.colors,
              primary: "#b9e4b9",
              primary50: "#b9e4b9",
            },
          })}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "8px 12px",
        }}
      >
        <ButtonGroup>
          <Button
            id={"translateBtn"}
            disabled={!hasSelectedLanguages}
            variant="primary"
            sx={{
              border: "none",
              fontSize: "12px",
            }}
            size="small"
            onClick={() => {
              handleTranslate(true);
            }}
          >
            AutoTranslate
          </Button>
          <ActionMenu>
            <ActionMenu.Anchor>
              <IconButton
                disabled={!hasSelectedLanguages}
                variant="primary"
                sx={{
                  border: "none",
                  fontSize: "12px",
                }}
                icon={TriangleDownIcon}
                size="small"
              />
            </ActionMenu.Anchor>

            <ActionMenu.Overlay
              sx={{
                zIndex: "100000",
                bg: "canvasHeaderActions.overlayBg",
              }}
              align="end"
            >
              <ActionList>
                <ActionList.Item onSelect={() => handleTranslate(false)}>
                  Manual Translate
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </ButtonGroup>
        {/* <ActionMenu>
          <ActionMenu.Anchor>
            <ActionMenu.Button
              variant="primary"
              sx={{
                border: "none",
                fontSize: "12px",
              }}
            >
              Translate
            </ActionMenu.Button>
          </ActionMenu.Anchor>

          <ActionMenu.Overlay
            sx={{
              zIndex: 100,
              bg: "#FFFFFF",
            }}
          >
            <ActionList>
              <ActionList.Item onSelect={() => alert("Auto Translating")}>
                Auto Translate
              </ActionList.Item>
              <ActionList.Item onSelect={() => alert("Manually Translating")}>
                Manual Translate
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu> */}
      </Box>
    </div>
  );
};

export default TranslateModal;
