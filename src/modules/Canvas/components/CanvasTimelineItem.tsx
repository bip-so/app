import { GitMergeIcon } from "@primer/octicons-react";
import { Avatar, Box, Text, Timeline } from "@primer/react";
import TimeAgo from "react-timeago";
import { FlameIcon, Icon } from "@primer/styled-octicons";
import { useRouter } from "next/router";
import { AVATAR_PLACEHOLDER } from "../../../commons/constants";
import { IUserMini } from "../../../commons/types";
import { timeAgoFormatter } from "../../../utils/Common";
import { CommitHistoryType } from "../interfaces";
import BipRouteUtils from "../../../core/routeUtils";
import { dateMonthYearDate, getTime } from "../../../utils/date";
import { useMemo } from "react";
import { useStudio } from "../../../context/studioContext";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import { useCanvas } from "../../../context/canvasContext";

interface ICanvasTimelineItemProps {
  commits: CommitHistoryType[];
  closeHandler?: Function;
}

const CanvasTimelineItem: React.FunctionComponent<ICanvasTimelineItemProps> = ({
  commits,
  closeHandler,
  ...props
}) => {
  const router = useRouter();
  const commitId = router.query.commitId as string;
  const { currentStudio } = useStudio();
  const handle = currentStudio?.handle;
  const slug = router.query.slug as string;
  const branchId = BipRouteUtils.getBranchIdFromCanvasSlug(slug);
  const { repo } = useCanvas();

  const { isTabletOrMobile } = useDeviceDimensions();

  const isRejected = useMemo(() => {
    if (commits.length) {
      return (
        commits[0].message.toLowerCase().includes("rejected") ||
        commits[0].message.toLowerCase().includes("ignored")
      );
    }
    return false;
  }, [commits]);

  return (
    <Timeline.Item
      sx={{
        "::before": {
          bg: "canvasTimeline.itemBg",
        },
      }}
    >
      <Timeline.Badge
        sx={{
          border: "none",
          background: "transparent",
        }}
      >
        <Box
          sx={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: isRejected ? "text.red" : "text.green",
          }}
        />
      </Timeline.Badge>
      <Timeline.Body
        sx={{ display: "flex", flexDirection: "column" }}
        className="space-y-4"
      >
        {commits.map((commit) => (
          <Box
            key={commit.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: "4px",
              cursor: "pointer",
              borderRadius: "8px",
              bg:
                commitId === commit.commitId
                  ? "canvasTimeline.commit.hoverBg"
                  : "none",
              ":hover": {
                bg: "canvasTimeline.commit.hoverBg",
              },
            }}
            onClick={() => {
              if (commitId !== commit.commitId) {
                router.push({
                  pathname: BipRouteUtils.getCommitRoute(
                    handle,
                    repo?.name,
                    branchId,
                    commit.commitId
                  ),
                });
              }
              if (isTabletOrMobile && closeHandler) {
                closeHandler();
              }
            }}
            className="space-y-4"
          >
            <Text
              as="p"
              sx={{
                fontSize: "12px",
                lineHeight: "18px",
                color: "canvasTimeline.commit.date",
              }}
            >{`${dateMonthYearDate(commit.createdAt)}, ${getTime(
              commit.createdAt
            )}`}</Text>
            <Box sx={{ display: "flex" }} className="space-x-2">
              <Avatar
                src={commit.user.avatarUrl || AVATAR_PLACEHOLDER}
                sx={{ width: "20px", height: "20px", mt: "4px", flexShrink: 0 }}
              />
              <Text
                as="p"
                sx={{
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: "canvasTimeline.commit.message",
                }}
              >
                {commit.message}
              </Text>
            </Box>
          </Box>
        ))}
      </Timeline.Body>
    </Timeline.Item>
  );
};

export default CanvasTimelineItem;
