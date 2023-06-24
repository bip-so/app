import { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import {
  ActionList,
  ActionMenu,
  Box,
  Button,
  IconButton,
  Text,
  Truncate,
} from "@primer/react";
import {
  KebabHorizontalIcon,
  ThreeBarsIcon,
  CommentDiscussionIcon,
  CheckCircleIcon,
  SyncIcon,
  HistoryIcon,
  CheckIcon,
} from "@primer/styled-octicons";
import TimeAgo from "react-timeago";
import { useLayout } from "../../../context/layoutContext";
import {
  formatDateAndTime,
  formatTimestamp,
  timeAgoFormatter,
} from "../../../utils/Common";
import { useUser } from "../../../context/userContext";
import CanvasHeaderActions from "./CanvasHeaderActions";
import { useCanvas } from "../../../context/canvasContext";
import CanvasCommentsRightRail from "./CanvasCommentsRightRail";
import { ArrowLeftIcon } from "@primer/octicons-react";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import CanvasHistoryRightRail from "./CanvasHistoryRightRail";
import CanvasPermissionsRightRail from "./CanvasPermissionsRightRail";
import { useRouter } from "next/router";
import { useStudio } from "../../../context/studioContext";
import BipRouteUtils from "../../../core/routeUtils";
import useRefDimensions from "../../../hooks/useRefDimensions";
import segmentEvents from "../../../insights/segment";

interface ICanvasHeaderProps {
  title: string;
  isMergeRequestScreen?: boolean;
  mergeRequest?: any;
  conflicts?: any;
  showLeftArrow?: boolean;
  onClickLeftArrow?: () => void;
  readOnly?: boolean;
  editorContainerRef?: any;
}

const CanvasHeader: FC<ICanvasHeaderProps> = ({
  title,
  isMergeRequestScreen,
  mergeRequest,
  conflicts,
  showLeftArrow,
  onClickLeftArrow,
  readOnly,
  editorContainerRef,
}: ICanvasHeaderProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { repo, branch, isSaving, lastSaved, isPublicView } = useCanvas();

  const { isSideNavOpen, setIsSideNavOpen } = useLayout();
  const { isLoggedIn, user } = useUser();
  const [showPermissions, setShowPermissions] = useState<boolean>(false);
  const [showHistoryRail, setShowHistoryRail] = useState<boolean>(false);
  const [showSideComments, setShowSideComments] = useState<boolean>(false);

  const slug = router.query.slug as string;

  const { currentStudio } = useStudio();
  const commitId = router.query.commitId as string;

  const { isTabletOrMobile } = useDeviceDimensions();
  const { threads, resolvedThreads } = useCanvas();

  const shareBtnRef = useRef();
  const commentsBtnRef = useRef();

  const { isXtraSmall, isSmall } = useRefDimensions(editorContainerRef);

  useEffect(() => {
    if (commitId && !isTabletOrMobile) {
      setShowHistoryRail(true);
    }
  }, []);

  return (
    <>
      <Box
        className={`flex flex-col ${
          isTabletOrMobile ? "" : "hide-on-key-down"
        }`}
        backgroundColor="canvasHeader.bg"
        style={{ transition: "all 0.5s ease-out 0s" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 8px",
          }}
        >
          <div className="flex items-center space-x-2">
            {isTabletOrMobile ? null : !isSideNavOpen ? (
              <IconButton
                icon={ThreeBarsIcon}
                sx={{
                  color: "text.subtle",
                }}
                size={"small"}
                variant="invisible"
                onClick={(e: any) => {
                  setIsSideNavOpen(true);
                }}
              />
            ) : null}
            {showLeftArrow ? (
              <IconButton
                variant="invisible"
                onClick={() => {
                  onClickLeftArrow && onClickLeftArrow();
                }}
                sx={{
                  color: "text.muted",
                  ":hover": {
                    bg: "none",
                  },
                }}
                icon={() => <ArrowLeftIcon size={16} />}
              />
            ) : null}
            {(!isXtraSmall || mergeRequest) && (
              <Box sx={{ display: "inline-flex", alignItems: "flex-end" }}>
                <Text
                  fontSize={"14px"}
                  fontWeight={400}
                  color={"text.muted"}
                  sx={{ display: "inline-flex", alignItems: "center" }}
                >
                  {commitId && <HistoryIcon sx={{ mr: "8px" }} />}
                  <Truncate
                    title={title || repo?.name!}
                    maxWidth={isSmall ? "100px" : "300px"}
                    sx={{ display: "inline" }}
                  >
                    {title || repo?.name}
                  </Truncate>
                </Text>

                {readOnly ? null : (
                  <Text
                    fontSize={"12px"}
                    fontWeight={400}
                    color={"text.subtle"}
                    className="mx-2"
                    sx={{
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      whiteSpace: "pre",
                    }}
                  >
                    {isSaving ? (
                      <>
                        <SyncIcon className="mr-1" />
                        Saving...
                      </>
                    ) : lastSaved ? (
                      <>
                        <CheckCircleIcon className="mr-1" size={14} />
                        Saved{" "}
                        <TimeAgo
                          title={formatTimestamp(lastSaved)}
                          // title={formatDateAndTime(JSON.stringify(lastSaved))}
                          minPeriod={60}
                          date={lastSaved}
                          formatter={timeAgoFormatter}
                        />
                      </>
                    ) : null}
                  </Text>
                )}
              </Box>
            )}
          </div>
          {isPublicView && (
            <Button
              variant="invisible"
              sx={{
                color: "text.muted",
              }}
              onClick={() => {
                window.location.pathname = BipRouteUtils.getCanvasRoute(
                  currentStudio?.handle!,
                  repo?.name,
                  branch?.id
                );
              }}
              // sx={{ float: "right" }}
            >
              Click to Edit
            </Button>
          )}
          {readOnly ? null : (
            <div className="flex items-center space-x-2">
              {isLoggedIn && (
                <>
                  <CanvasHeaderActions
                    isMergeRequestScreen={isMergeRequestScreen}
                    mergeRequest={mergeRequest}
                    conflicts={conflicts}
                    setShowPermissions={setShowPermissions}
                  />
                  {!isMergeRequestScreen && (
                    <>
                      {repo?.isPublished ? (
                        <Button
                          variant="invisible"
                          sx={{
                            color: "text.muted",
                            fontWeight: 500,
                          }}
                          size={"small"}
                          onClick={(e: any) => {
                            segmentEvents.shareOptionsOpened(
                              currentStudio?.handle!,
                              slug,
                              user?.id!
                            );
                            setShowPermissions((prev) => !prev);
                          }}
                          ref={shareBtnRef}
                        >
                          Share
                        </Button>
                      ) : null}
                      {[...threads, ...resolvedThreads].length > 0 && (
                        <IconButton
                          icon={CommentDiscussionIcon}
                          sx={{
                            color: "text.subtle",
                          }}
                          size={"small"}
                          variant="invisible"
                          onClick={(e: any) => {
                            setShowSideComments((prev) => !prev);
                          }}
                          ref={commentsBtnRef}
                        />
                      )}
                      {repo?.isPublished ? (
                        <ActionMenu>
                          <ActionMenu.Anchor>
                            <IconButton
                              icon={KebabHorizontalIcon}
                              sx={{
                                color: "text.subtle",
                              }}
                              size={"small"}
                              variant="invisible"
                            />
                          </ActionMenu.Anchor>
                          <ActionMenu.Overlay>
                            <ActionList>
                              <ActionList.Item
                                onSelect={() => {
                                  setShowHistoryRail(true);
                                }}
                              >
                                <ActionList.LeadingVisual>
                                  <HistoryIcon />
                                </ActionList.LeadingVisual>
                                View history
                              </ActionList.Item>
                            </ActionList>
                          </ActionMenu.Overlay>
                        </ActionMenu>
                      ) : null}
                    </>
                  )}
                </>
              )}
            </div>
          )}
          {commitId && (
            <div className="flex items-center space-x-2">
              {isLoggedIn && repo?.isPublished && (
                <IconButton
                  icon={HistoryIcon}
                  sx={{
                    color: "text.subtle",
                  }}
                  size={"small"}
                  variant="invisible"
                  onClick={() => {
                    setShowHistoryRail(true);
                  }}
                />
              )}
            </div>
          )}
        </Box>
      </Box>
      {showPermissions && (
        <CanvasPermissionsRightRail
          closeHandler={() => setShowPermissions(false)}
          ignoredRefs={[shareBtnRef]}
        />
      )}
      {showHistoryRail && (
        <CanvasHistoryRightRail
          closeHandler={() => setShowHistoryRail(false)}
        />
      )}
      {showSideComments && (
        <CanvasCommentsRightRail
          closeHandler={() => setShowSideComments(false)}
          ignoredRefs={[commentsBtnRef]}
        />
      )}
    </>
  );
};

export default CanvasHeader;
