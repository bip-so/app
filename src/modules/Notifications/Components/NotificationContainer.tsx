import { useEffect, useState } from "react";
import { Box, Spinner } from "@primer/react";

import NotificationService from "../services";
import { AVATAR_PLACEHOLDER } from "../../../commons/constants";
import { useStudio } from "../../../context/studioContext";
import { useUser } from "../../../context/userContext";
import { NotificationsType } from "../types";

import NotificationUsers from "./NotificationsUsers";
import NotificationFilters from "./NotificationFilters";
import NotificationMessages from "./NotificationMessages";
import { merge } from "diff";
import BipRouteUtils from "../../../core/routeUtils";
import { CanvasService } from "../../Canvas/services";
import { useCanvas } from "../../../context/canvasContext";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import { setTempStudioIdHeader } from "../../../utils/Common";

interface INotificationContainerProps {
  closeNotificationsContainer: () => void;
}

const NotificationContainer: React.FunctionComponent<
  INotificationContainerProps
> = (props) => {
  const { isTabletOrMobile } = useDeviceDimensions();
  const [filters, setFilters] = useState({
    unread: false,
    replies: false,
    requests: false,
    pr: false,
  });
  const [messages, setMessages] = useState<any>([]);
  const [type, setType] = useState<string>("all");
  const [studioSelectedForNotfications, setStudioSelectedForNotifications] =
    useState<string | number>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { studios, notificationCount } = useStudio();
  const { user } = useUser();
  const [skip, setSkip] = useState(0);
  const [loadingPagination, setLoadingPagination] = useState(false);

  const getAppliedFilter = () => {
    const filtersText = Object.keys(filters)
      .filter((fil) => filters[fil])
      .join(",");
    return filtersText;
  };

  const getFormattedMessageData = (data: any) => {
    return data.map((notification: any) => {
      const currentTime: any = new Date(),
        creationTime: any = new Date(notification.createdAt);
      let timeCreated: any = (currentTime - creationTime) / 1000;

      let unit = "seconds";
      if (timeCreated > 60) {
        timeCreated = timeCreated / 60;
        unit = "minutes";
        if (timeCreated > 60) {
          timeCreated = timeCreated / 60;
          unit = "hours";
          if (timeCreated > 24) {
            timeCreated = timeCreated / 24;
            unit = "days";
            if (timeCreated > 7) {
              timeCreated = timeCreated / 7;
              unit = "weeks";
              if (timeCreated > 4) {
                timeCreated = timeCreated / 4;
                unit = "months";
              }
            }
          }
        }
      }
      timeCreated = Math.floor(timeCreated);
      let notificationMsg: string,
        messageType: string,
        canvasLink: string = "/",
        query: any = {},
        requestStatus: string = "",
        canvasBranchID: string | number = "",
        requestID: string | number = "",
        mergeRequestPath: string = "/";
      const { canvasRepo, canvasBranch, studio, collection } =
        notification.extraData;
      switch (notification.event?.toLowerCase()) {
        case "collectioninvitebyname":
        case "collectioninvitebygroup":
          notificationMsg = notification.text;
          messageType = "collection-invite";
          canvasLink = studio?.handle
            ? BipRouteUtils.getCollectionRoute(studio?.handle, collection.id)
            : BipRouteUtils.getHomeRoute();
          break;
        case "publishrequestedupdate":
        case "publishrequested":
          notificationMsg = notification.text;
          messageType = "publish-request";
          requestStatus = notification.extraData?.actionStatus;
          canvasBranchID = notification.extraData?.canvasBranch?.id;
          requestID = notification.objectId;
          break;
        case "mergerequestedupdate":
        case "mergerequested":
          notificationMsg = notification.text;
          messageType = "merge-request";
          canvasBranchID = notification.extraData?.canvasBranch?.id;
          requestStatus = notification.extraData?.actionStatus;
          requestID = notification.objectId;

          break;
        case "accessrequested":
          // case "accessrequestedupdate":
          notificationMsg = notification.text;
          requestStatus = notification.extraData?.actionStatus;
          if (
            ["ACCEPTED", "REJECTED"].includes(
              notification.extraData.actionStatus
            )
          ) {
            const username = notification.extraData?.user?.username;
            const canvasName = canvasRepo.name;
            if (notification.extraData.actionStatus === "ACCEPTED") {
              notificationMsg = `@${username} was given ${
                notification.extraData.permissionGroup.split("_")[3]
              } access to ${canvasName}`;
            } else {
              notificationMsg = `Access request from @${username} to ${canvasName} was Rejected`;
            }
          }

          canvasLink = BipRouteUtils.getCanvasRoute(
            studio.handle,
            canvasRepo.name,
            canvasBranch?.id
          );
          messageType = "access-request";
          canvasBranchID = canvasBranchID =
            notification.extraData?.canvasBranch?.id;
          requestID = notification.objectId;
          break;
        case "accessrequestedupdate":
          notificationMsg = notification.text;
          canvasLink = BipRouteUtils.getCanvasRoute(
            studio.handle,
            canvasRepo.name,
            canvasBranch?.id
          );
          messageType = "replies";
          break;
        case "joinedstudio":
          notificationMsg = notification.text;
          messageType = "joinedStudio";
          break;
        case "blockreact":
          notificationMsg = notification.text;
          messageType = "blockReact";
          break;
        case "blockmention":
          notificationMsg = notification.text;
          messageType = "blockmention";
          break;
        case "followuser":
          notificationMsg = notification.text;
          messageType = "follow-user";
          break;
        case "canvasinvitebyname":
          notificationMsg = notification.text;
          messageType = "canvas-invite";
          break;
        case "studioinvitebyname":
          notificationMsg = notification.text;
          messageType = "studio-invite";
          canvasLink = studio?.handle
            ? BipRouteUtils.getHandleRoute(studio?.handle)
            : BipRouteUtils.getHomeRoute();
          break;
        case "notionimport":
          notificationMsg = notification.text;
          canvasLink = studio?.handle
            ? BipRouteUtils.getHandleRoute(studio?.handle)
            : BipRouteUtils.getHomeRoute();
          messageType = "replies";
          break;
        case "discordintegrationtask":
          notificationMsg = notification.text;
          canvasLink = BipRouteUtils.getStudioAboutRoute(studio?.handle);
          query = {
            open_settings: true,
            tab: 3,
          };
          messageType = "replies";
          break;
        case "createrequesttojoinstudio":
          notificationMsg = notification.text;
          canvasLink = BipRouteUtils.getStudioAboutRoute(studio?.handle);
          query = {
            open_settings: true,
            tab: 5,
          };
          messageType = "replies";
          break;
        case "canvaslimitexceed":
          notificationMsg = notification.text;
          canvasLink = BipRouteUtils.getStudioAboutRoute(studio?.handle);
          query = {
            open_settings: true,
          };
          messageType = "canvaslimitexceed";
          break;
        default:
          notificationMsg = notification.text;
          messageType = "replies";
      }

      if (studio?.handle && canvasRepo?.key) {
        if (messageType === "replies") {
          if (notification.extraData.blockThreadUUID) {
            query.threadUUID = notification.extraData.blockThreadUUID;
          }
          // if (notification.reelUUID) {
          //   query.threadUUID = notification.extraData.blockThreadUUID;
          // }
          if (notification.extraData.reelUUID) {
            query.reelUUID = notification.extraData.reelUUID;
          }
        } else if (messageType === "blockReact") {
          query.reactionBlockUUID = notification.extraData.blockUUID;
        } else if (messageType === "blockmention") {
          query.mentionBlockUUID = notification.extraData.blockUUID;
        }
        mergeRequestPath = BipRouteUtils.getMergeRequestRoute(
          notification.extraData?.studio.handle,
          notification.extraData?.canvasRepo?.name,
          notification.extraData?.canvasBranch?.id,
          notification.objectId
        );
        if (canvasBranch) {
          canvasLink = BipRouteUtils.getCanvasRoute(
            studio.handle,
            canvasRepo.name,
            canvasBranch.id
          );
        }
        if (notification.event === "MergeRequested") {
          canvasLink = BipRouteUtils.getMergeRequestRoute(
            notification.extraData?.studio.handle,
            notification.extraData?.canvasRepo?.name,
            notification.extraData?.canvasBranch?.id,
            notification.objectId
          );
        }

        // "/@" +
        //   notification.extraData?.studio.handle +
        //   (notification.event?.toLowerCase().includes("publish")
        //     ? "/publish-request"
        //     : "/merge-request") +
        //   "/" +
        //   notification.objectId;
      }

      let repliesText = "";
      if (notification.extraData?.discordMessage?.length >= 2) {
        repliesText = notification.extraData?.discordMessage[1];
      }

      const segmentValues = {
        type: notification?.activity,
        to: "",
        user_id: user?.id,
        discord_id: null,
        product_id: notification?.extraData?.studio?.id,
        page_key: notification?.extraData?.canvasRepo?.key,
        page_id: notification?.extraData?.canvasRepo?.id,
        email_id: user?.email,
        source: "bip",
      };

      return {
        userAvatar: notification.extraData?.user?.avatarUrl,
        repliesText: repliesText,
        messageBody: notificationMsg,
        messageType: messageType,
        timeCreated: timeCreated + " " + unit,
        canvasPath: {
          pathname: canvasLink,
          query,
        },
        apiProps: {
          canvasBranchID: canvasBranchID,
          requestID: requestID,
        },
        mergeRequestPath: {
          pathname: mergeRequestPath,
        },
        requestStatus: requestStatus,
        studio: notification.extraData?.studio,
        segmentValues: segmentValues,
      };
    });
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        let requestParams: NotificationsType = { type: type };
        if (type === "studio") {
          requestParams = {
            ...requestParams,
            studioID: studioSelectedForNotfications,
          };
          setTempStudioIdHeader(parseInt(studioSelectedForNotfications));
        }
        const appliedFilter = getAppliedFilter();
        const resp = await NotificationService.getNotifications(
          requestParams,
          0,
          appliedFilter
        );

        const formatedMessagesData = getFormattedMessageData(resp.data.data);
        const parsedSkip = parseInt(resp.data.next);
        setMessages(formatedMessagesData);
        setSkip(parsedSkip);
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    })();
  }, [type, studioSelectedForNotfications, filters]);

  const getNextPageData = async () => {
    try {
      setLoadingPagination(true);
      let requestParams: NotificationsType = { type: type };
      if (type === "studio") {
        requestParams = {
          ...requestParams,
          studioID: studioSelectedForNotfications,
        };
        setTempStudioIdHeader(parseInt(studioSelectedForNotfications));
      }
      const appliedFilter = getAppliedFilter();
      const resp = await NotificationService.getNotifications(
        requestParams,
        skip,
        appliedFilter
      );

      const formatedMessagesData = getFormattedMessageData(resp.data.data);
      const parsedSkip = parseInt(resp.data.next);
      setMessages([...messages, ...formatedMessagesData]);
      setSkip(parsedSkip);
    } catch (err) {
      console.log(err);
    }
    setLoadingPagination(false);
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: isTabletOrMobile ? "column-reverse" : "column",
        height: "calc(80vh - 58px)",
      }}
    >
      <>
        <NotificationUsers
          userAvatarSrc={user?.avatarUrl || AVATAR_PLACEHOLDER}
          studios={studios.map((studio) => {
            let studioCounter = notificationCount?.studio?.find(
              (std) => std?.studio.id === studio.id
            );

            return {
              id: studio.id,
              imgUrl: studio.imageUrl,
              name: studio.displayName,
              count: studioCounter?.count || 0,
            };
          })}
          type={type}
          selectedStudio={studioSelectedForNotfications}
          changeNotificationType={(type: string) => setType(type)}
          setStudioForNotifications={(studioID: string | number) =>
            setStudioSelectedForNotifications(studioID)
          }
        />
        <NotificationFilters filters={filters} setFilters={setFilters} />
      </>
      {/* )} */}
      {loading ? (
        <Spinner
          sx={{
            margin: "auto",
            marginTop: "10px",
            color: "notifications.spinner",
          }}
        />
      ) : (
        <NotificationMessages
          userAvatarSrc={user?.avatarUrl}
          messages={messages.length ? messages : []}
          filters={filters}
          closeNotificationsContainer={props.closeNotificationsContainer}
          skip={skip}
          getNextPage={getNextPageData}
          loadingNextPage={loadingPagination}
        />
      )}
    </Box>
  );
};

export default NotificationContainer;
