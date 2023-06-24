import { useEffect, useRef, useState } from "react";
import { Box, Button, Text } from "@primer/react";
import { FileIcon, TrashIcon } from "@primer/styled-octicons";

import { usePages } from "../context/pagesContext";
import { useCanvas } from "../context/canvasContext";
import { useUser } from "../context/userContext";
import {
  useHasPermission,
  PermissionContextEnum,
} from "../hooks/useHasPermission";
import {
  CanvasPermissionEnum,
  CanvasPermissionGroupEnum,
} from "../modules/Permissions/enums";

import CollectionService from "../modules/Collections/services";
import EmojiPicker from "./EmojiPicker";
import ContributorsList from "./ContributorsList";
import useDeviceDimensions from "../hooks/useDeviceDimensions";
import useRefDimensions from "../hooks/useRefDimensions";
import { ReactEditor, useSlate } from "slate-react";
import { BranchAccessEnum } from "../modules/Canvas/enums";
import Link from "next/link";
import { text } from "stream/consumers";
import SmileyIcon from "../icons/SmileyIcon";
import { ImageIcon } from "@primer/octicons-react";
import { CanvasRepoService } from "../modules/Canvas/services";
import { useToasts } from "react-toast-notifications";
import { useRouter } from "next/router";
import BipRouteUtils from "../core/routeUtils";
import { sanitizeHandle } from "../utils/Common";
import BipLoader from "./BipLoader";

interface ICanvasTitleProps {
  viewOnly?: boolean;
  mergeRequestBranchId: number;
}

const CanvasTitle: React.FunctionComponent<ICanvasTitleProps> = (props) => {
  const router = useRouter();
  const handle = router.query.handle as string;
  const inviteCode = router.query.inviteCode as string;
  const title = router.query.title as string;

  const slug = router.query.slug as string;
  const branchId = BipRouteUtils.getBranchIdFromCanvasSlug(slug);

  const [pageTitleTimeOutFn, setPageTitleTimeOutFn] = useState<any>(null);
  const titleRef = useRef(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const { addToast } = useToasts();
  const { pages, updateCollection } = usePages();
  const {
    repo: canvasRepo,
    branch,
    members,
    setRepo,
    setIsSaving,
    setPendingSave,
    setLastSaved,
  } = useCanvas();
  const repo = props?.mergeRequestRepo || canvasRepo;
  const { user, isLoggedIn } = useUser();
  const [currentPage, setCurrentPage] = useState<any>();
  const inputFile = useRef(null);
  const editor = useSlate();
  const { isXtraSmall } = useRefDimensions(editor.parentRef);

  const [emojiPickerOpened, setEmojiPickerOpened] = useState<boolean>(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const currentUser = members.find((member) => member.user?.id === user?.id);
  useEffect(() => {
    const page = pages.find((page) => page.id === repo?.id);
    setCurrentPage(page);
  }, [pages, repo]);

  // // New Canvas autofocus title
  // const titleInputRef = useRef(null);

  // useEffect(() => {
  //   if (router.query.isNew) titleInputRef?.current.focus();
  // }, [titleInputRef]);

  function placeCaretAtEnd() {
    const range = document.createRange();
    range.selectNodeContents(titleRef.current);
    range.collapse(false);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  useEffect(() => {
    placeCaretAtEnd(document.querySelector("#pageTitle"));
  }, []);

  useEffect(() => {
    if (!selectionStart || document.activeElement !== titleRef.current) {
      return;
    }
    // Set the cursor position to the same position after the user modifies the heading
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(titleRef.current.childNodes[0], selectionStart);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    return () => {
      setSelectionStart(null);
    };
  }, [repo?.name]);

  const canEditBranch = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_EDIT,
    PermissionContextEnum.Canvas,
    branch?.permissionGroup?.permissions
  );

  const canEditBranchName = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_EDIT_NAME,
    PermissionContextEnum.Canvas,
    branch?.permissionGroup?.permissions
  );

  const onEditPageTitle = (event: any, code: boolean) => {
    if (pageTitleTimeOutFn != null) {
      clearTimeout(pageTitleTimeOutFn);
      setPageTitleTimeOutFn(null);
      setIsSaving(false);
      setPendingSave(false);
    }
    setIsSaving(true);
    setPendingSave(true);
    setPageTitleTimeOutFn(
      setTimeout(
        async () => {
          const title = document.getElementById("pageTitle")?.innerText;
          const selection = window.getSelection();
          setSelectionStart(selection?.anchorOffset);

          if (title) {
            const resp = CollectionService.addEmojiIcon({
              icon: repo?.icon,
              name: title,
              canvasRepoId: repo?.id,
              coverUrl: repo?.coverUrl,
            });

            if (currentPage) {
              const newPage = { ...currentPage, name: title };
              updateCollection(newPage);
              setRepo({
                ...repo!,
                name: title,
              });
            }
          }
          setIsSaving(false);
          setPendingSave(false);
          setLastSaved(Date.now());
          // router.push(
          //   {
          //     pathname: BipRouteUtils.getCanvasRoute(
          //       sanitizeHandle(handle),
          //       title || "untitled",
          //       branchId,
          //       false,
          //       !repo?.isPublished
          //     ),
          //   },
          //   undefined,
          //   { shallow: true }
          // );
        },
        !code ? 1 : 2000
      )
    );
  };

  const addEmojiIconHandler = async (emoji: string) => {
    if (currentPage) {
      const newPage = { ...currentPage, icon: emoji };
      const resp = await CollectionService.addEmojiIcon({
        icon: emoji,
        name: repo?.name,
        canvasRepoId: repo?.id,
        coverUrl: repo?.coverUrl,
      });
      updateCollection(newPage);
      setRepo({
        ...repo!,
        icon: emoji,
      });
    }
  };

    const removeEmojiIconHandler = async (emoji: string) => {
      if (currentPage) {
        const newPage = { ...currentPage, icon: emoji };
        const resp = await CollectionService.addEmojiIcon({
          icon: emoji,
          name: repo?.name,
          canvasRepoId: repo?.id,
          coverUrl: repo?.coverUrl,
        });
        updateCollection(newPage);
        setRepo({
          ...repo!,
          icon: emoji,
        });
      }
    };

  const getCanvasAccessText = () => {
    const isModerator =
      branch?.permissionGroup?.systemName ===
      CanvasPermissionGroupEnum.MODERATE;
    if (isModerator) {
      return "moderator";
    }
    const canEdit =
      branch?.permissionGroup?.systemName === CanvasPermissionGroupEnum.EDIT ||
      branch?.publicAccess === BranchAccessEnum.EDIT;
    if (canEdit) {
      return "edit";
    }
    const canComment =
      branch?.permissionGroup?.systemName ===
        CanvasPermissionGroupEnum.COMMENT ||
      branch?.publicAccess === BranchAccessEnum.COMMENT;
    if (canComment) {
      return "comment";
    }
    const canView =
      branch?.permissionGroup?.systemName === CanvasPermissionGroupEnum.VIEW ||
      branch?.publicAccess === BranchAccessEnum.VIEW;
    if (canView) {
      return "view";
    }
    return "no";
  };

  const openFiles = () => {
    if (inputFile) {
      //@ts-ignore
      inputFile.current.value = null;
      //@ts-ignore
      inputFile.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      setIsUploadingCover(true);
      try {
        const data = new FormData();
        data.append("file", files[0]);
        data.append("model", "canvasRepoCover");
        data.append("uuid", repo!?.uuid);
        data.append("repoID", repo.id);

        const { data: imageResponse } = await CanvasRepoService.uploadCover(
          data
        );
        const coverUrl = imageResponse.data;
        const resp = await CanvasRepoService.editCanvas(repo?.id, {
          coverUrl,
          icon: repo?.icon,
          name: repo?.name,
          canvasRepoId: repo?.id,
        });
        const newPage = { ...currentPage, coverUrl };
        updateCollection(newPage);
        setRepo({
          ...repo!,
          coverUrl,
        });
      } catch (error) {
        addToast("Something went wrong while uploading cover", {
          appearance: "error",
          autoDismiss: true,
        });
      }
      setIsUploadingCover(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          position: "relative",
          ":hover": {
            button: {
              visibility: "visible",
            },
          },
        }}
      >
        {isUploadingCover && <BipLoader />}
        <Box
          sx={{
            mb: "8px",
            ":hover": {
              cursor: canEditBranchName && !props?.viewOnly ? "pointer" : "",
            },
          }}
        >
          {canEditBranchName && !props?.viewOnly ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                sx={
                  currentPage?.icon
                    ? {
                        position: repo?.coverUrl ? "absolute" : "unset",
                        top: repo?.coverUrl ? "-75%" : "unset",
                        margin: 0,
                        padding: 0,
                      }
                    : {}
                }
                className="flex items-center"
              >
                <EmojiPicker
                  onEmojiPicked={addEmojiIconHandler}
                  emoji={
                    currentPage?.icon ? (
                      currentPage?.icon
                    ) : (
                      <>
                        <Button
                          variant="invisible"
                          sx={{
                            color: "text.subtle",
                            visibility: emojiPickerOpened
                              ? "visible"
                              : "hidden",
                          }}
                          leadingIcon={SmileyIcon}
                          size="small"
                        >
                          Add Icon
                        </Button>
                      </>
                    )
                  }
                  onOpen={() => {
                    setEmojiPickerOpened(true);
                  }}
                  onClose={() => {
                    setEmojiPickerOpened(false);
                  }}
                  size="64px"
                />
                {currentPage?.icon &&
                <Button
                  size="small"
                  leadingIcon={TrashIcon}
                  sx={{
                    position: "absolute",
                    top: repo?.coverUrl ? "65%" : "38%",
                    // left: repo?.coverUrl ? "70.5%" : "8.5%",
                    border: 0,
                    visibility: emojiPickerOpened
                              ? "visible"
                              : "hidden",
                    color: "text.subtle",
                    marginLeft: 8,
                    padding: 0,
                  }}
                   onClick={() => {removeEmojiIconHandler("")}}
                ></Button>
                 }
              </Box>

              <Box
                marginLeft="28px"
                sx={{
                  display: `${
                    repo?.coverUrl === "" ? "block" : "none"
                  } !important`,
                }}
              >
                <Button
                  variant="invisible"
                  sx={{
                    color: "text.subtle",
                    visibility: `${emojiPickerOpened ? "visible" : "hidden"} `,
                    marginTop: currentPage?.icon ? "30px" : "0",
                  }}
                  leadingIcon={ImageIcon}
                  onClick={openFiles}
                  size="small"
                >
                  Add Cover
                </Button>
                <input
                  ref={inputFile}
                  type="file"
                  accept={"image/*"}
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  id="studio-image-file"
                />
              </Box>
            </Box>
          ) : (
            <Text
              sx={{
                fontSize: 64,
                position: repo?.coverUrl ? "absolute" : "unset",
                top: "-75%",
              }}
            >
              {currentPage?.icon ? currentPage?.icon : null}
            </Text>
          )}
        </Box>
        <Box
          id="pageTitle"
          contentEditable={canEditBranchName && !props?.viewOnly}
          ref={titleRef}
          suppressContentEditableWarning={true}
          as={"h1"}
          // ref={titleInputRef}
          sx={{
            width: "100%",
            borderBottom: "1px solid",
            borderColor: "canvasTitle.border",
            fontSize: "40px",
            color: "canvasTitle.title",
            fontWeight: "700",
            lineHeight: "50px",
            mt: repo?.icon && repo?.coverUrl ? "2rem" : "",

            ":focus": { outline: "none" },
          }}
          placeholder="Untitled"
          onKeyDown={(event) => {
            onEditPageTitle(event, true);
          }}
        >
          {repo?.name}
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          // marginLeft: "70px"
        }}
      >
        {repo?.isPublished ? (
          <ContributorsList
            canvasBranchId={branch?.id! ?? props.mergeRequestBranchId}
          />
        ) : (
          <div></div>
        )}
        {!props.viewOnly ? (
          branch?.isRoughBranch ? (
            <Text color={"canvasTitle.hintMessage"} fontSize={12}>
              Editing in <Text fontWeight={600}>personal draft</Text>
            </Text>
          ) : isLoggedIn ? (
            <Text color={"canvasTitle.hintMessage"} fontSize={12}>
              You have <Text fontWeight={600}>{getCanvasAccessText()}</Text>{" "}
              access
            </Text>
          ) : (
            <Text as="p" color={"canvasTitle.loginMessage"} fontSize={12}>
              Please{" "}
              <Text
                as="a"
                id={"editor-login-btn"}
                sx={{ color: "canvasTitle.loginButton" }}
                href={`${BipRouteUtils.getSignInRoute()}?returnUrl=${
                  inviteCode
                    ? BipRouteUtils.getCanvasInviteCodeRoute(
                        handle,
                        inviteCode,
                        title
                      )
                    : router.asPath
                }`}
              >
                login
              </Text>{" "}
              to edit
            </Text>
          )
        ) : null}
      </Box>
    </>
  );
};

export default CanvasTitle;
