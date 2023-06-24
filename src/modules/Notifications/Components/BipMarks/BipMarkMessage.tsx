import { Box, Avatar, IconButton } from "@primer/react";
import TimeAgo from "react-timeago";
import {
  formatDateAndTime,
  shortTimeAgoFormatter,
  timeAgoFormatter,
} from "../../../../utils/Common";
import { FileIcon, TrashIcon } from "@primer/styled-octicons";
import UserService from "../../../User/services";
import { useToasts } from "react-toast-notifications";
import AvatarWithPlaceholder from "../../../../components/AvatarWithPlaceholder";
import segmentEvents from "../../../../insights/segment";
import { useStudio } from "../../../../context/studioContext";
import { useCanvas } from "../../../../context/canvasContext";

interface IBipMarkMessageProps {
  bipMark: any;
  fromNotifications?: boolean;
  setBipMarks: any;
}

const BipMarkMessage: React.FunctionComponent<IBipMarkMessageProps> = ({
  bipMark,
  fromNotifications,
  setBipMarks,
  ...props
}) => {
  const { addToast } = useToasts();
  const { username, avatarUrl } = bipMark.author;
  const { currentStudio } = useStudio();
  const { repo } = useCanvas();

  const handleDeleteBipMark = async () => {
    try {
      segmentEvents.bipMarkDeleted(
        "discord",
        repo?.key,
        currentStudio?.handle,
        username
      );
      await UserService.deleteBipMark(bipMark.id);
      addToast("Bip Mark deleted successfully", {
        appearance: "success",
        autoDismiss: true,
      });
      setBipMarks((prev) => prev.filter((mark) => mark.id !== bipMark.id));
    } catch (error) {
      addToast("Failed to delete bip mark", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  return (
    <Box
      sx={{
        marginBottom: "4px",
        padding: fromNotifications ? "5px" : "0px",
      }}
      className="group"
    >
      <Box
        sx={{
          color: "bipMarks.bipMessage",
          display: "flex",
          justifyContent: "space-between",
          margin: "5px 0",
        }}
      >
        <Box>
          <AvatarWithPlaceholder
            src={avatarUrl}
            size={24}
            sx={{ marginRight: "8px" }}
          />
          <span style={{ fontSize: "14px" }}>{username} </span>
          <span style={{ fontSize: "12px" }}>
            <TimeAgo
              title={formatDateAndTime(bipMark.createdAt)}
              minPeriod={60}
              formatter={shortTimeAgoFormatter}
              date={bipMark.createdAt}
            />
          </span>
        </Box>
        <Box
          sx={{
            visibility: "hidden",
          }}
          className="group-hover:visible"
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            sx={{
              margin: "0 10px",
              padding: "5px",
              color: "bipMarks.trashIcon",
              border: "none",
              "&:hover": {
                backgroundColor: "bipMarks.trashIcon",
              },
            }}
            onClick={handleDeleteBipMark}
            icon={() => <TrashIcon size={16} />}
          />
        </Box>
      </Box>
      <Box sx={{ fontSize: "14px", margin: "5px 0" }}>{bipMark.text}</Box>
      <Box>
        {bipMark.attachments.map((url) => {
          const isImg = ["jpg", "jpeg", "png", "gif"].includes(
            url.split(".")[url.split(".").length - 1]
          );
          if (isImg) {
            return <img key={url} src={url} alt="attachment" />;
          }
          return (
            <div key={url}>
              <FileIcon />
              <a href={url} target="_blank" rel="noreferrer">
                {"  "}
                {url.split("/")[url.split("/").length - 1]}
              </a>
            </div>
          );
        })}
      </Box>
    </Box>
  );
};

export default BipMarkMessage;
