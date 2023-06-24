import Link from "next/link";
import { useRouter } from "next/router";
import {
  Box,
  Avatar,
  Button,
  ButtonGroup,
  ActionMenu,
  IconButton,
  ActionList,
  Text,
} from "@primer/react";
import {
  TelescopeIcon,
  InboxIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";

import NotificationService from "../services";

import { AVATAR_PLACEHOLDER } from "../../../commons/constants";
import { useToasts } from "react-toast-notifications";
import ImageWithName from "../../../components/ImageWithName";
import segmentEvents from "../../../insights/segment";
import { setTempStudioIdHeader } from "../../../utils/Common";
import { useLayout } from "../../../context/layoutContext";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import BipLoader from "../../../components/BipLoader";
import InfiniteScroll from "react-infinite-scroll-component";
import { useTranslation } from "next-i18next";
import StudioService from "../../Studio/services";
import BipRouteUtils from "../../../core/routeUtils";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";

interface INotificationMessage {
  userAvatarSrc?: string;
  segmentValues: any;
  avatarUrl?: string;
  message?: string;
  messageType?: string;
  requestStatus?: string;
  repliesText?: string;
  time?: string;
  canvasPath: {
    pathname: string;
    query: {
      repoKey: string;
    };
  };
  mergeRequestPath?: {
    pathname: string;
  };
  apiProps?: {
    canvasBranchID: string | number;
    requestID: string | number;
  };
  closeNotificationsContainer: () => void;
  studio: {
    displayName: string;
    handle: string;
    id: string | number;
    imageUrl: string;
  };
}

const RepliesNotificationMessage: React.FunctionComponent<
  INotificationMessage
> = (props) => {
  const { isTabletOrMobile } = useDeviceDimensions();
  const { setIsSideNavOpen } = useLayout();
  const router = useRouter();
  const { segmentValues: segValues } = props;

  return (
    <LinkWithoutPrefetch href={props.canvasPath}>
      <Box
        sx={{
          display: "flex",
          padding: "0px 5px",
          width: "100%",
        }}
        onClick={(e) => {
          segmentEvents.notificationClicked(
            segValues.type,
            segValues.to,
            segValues.user_id,
            segValues.discord_id,
            segValues.product_id,
            segValues.page_key,
            segValues.page_id,
            segValues.email_id,
            segValues.source
          );
          if (
            props.messageType === "joinedStudio" ||
            props.messageType === "follow-user"
          ) {
            e.preventDefault();
          } else {
            props.closeNotificationsContainer();
            isTabletOrMobile && setIsSideNavOpen(false);
          }
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            padding: "12px 10px",
            ":hover": {
              backgroundColor: "notifications.messages.hoverBg",
              cursor: "pointer",
              borderRadius: "12px",
            },
          }}
        >
          <Box display={"flex"} alignItems={"flex-start"}>
            <ImageWithName
              src={props.studio?.imageUrl}
              name={props.studio?.displayName}
              sx={{
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "notifications.messages.imageBorder",
                color: "notifications.messages.imageText",
              }}
            />
            <Avatar
              src={props.avatarUrl || props.userAvatarSrc || AVATAR_PLACEHOLDER}
              sx={{
                position: "relative",
                left: "-12px",
                width: "32px",
                height: "32px",
              }}
            />
          </Box>
          <Box
            sx={{
              paddingLeft: "5px",
              display: "flex",
              flex: 1,
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                fontSize: "14px",
                color: "notifications.messages.message",
              }}
            >
              {props.message}
            </Box>
            {props.repliesText ? (
              <Text
                color={"notifications.messages.repliesText"}
                fontSize={"14px"}
                lineHeight={"22px"}
                fontWeight={400}
                my="4px"
                sx={{
                  overflow: "hidden",
                  whiteSpace: "normal",
                  display: "-webkit-box",
                  wordBreak: "break-word",
                  WebkitLineClamp: 1,
                }}
                style={{
                  WebkitBoxOrient: "vertical",
                }}
              >
                {props.repliesText}
              </Text>
            ) : null}
            <Text
              sx={{ fontSize: "12px", color: "notifications.messages.time" }}
            >
              {props.time} ago
            </Text>
          </Box>
        </Box>
      </Box>
    </LinkWithoutPrefetch>
  );
};

const RequestNotificationMessage: React.FunctionComponent<
  INotificationMessage
> = (props) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  const router = useRouter();
  const { isTabletOrMobile } = useDeviceDimensions();
  const { setIsSideNavOpen } = useLayout();
  const { segmentValues: segValues } = props;
  const acceptMergeRequest = async () => {
    try {
      if (props.apiProps) {
        setTempStudioIdHeader(props.studio.id.toString());
        const resp = await NotificationService.acceptMergeRequest({
          canvasBranchID: props.apiProps.canvasBranchID,
          mergeRequestID: props.apiProps.requestID,
          payload: {
            status: "ACCEPTED",
            commitMessage: "Commited",
          },
        });
        router.push(props.canvasPath);
        addToast("Accepted Successfully", {
          appearance: "success",
          autoDismiss: true,
        });
      }
    } catch (err) {
      console.log(err);
      addToast("Something went wrong. Please try again", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const acceptPublishRequest = async () => {
    try {
      if (props.apiProps) {
        setTempStudioIdHeader(props.studio.id.toString());
        const resp = await NotificationService.acceptPublishRequest({
          canvasBranchID: props.apiProps.canvasBranchID,
          publishRequestID: props.apiProps.requestID,
        });
        if (resp.data.nudge) {
          addToast(t("billing.limitExceededWarning"), {
            appearance: "warning",
            autoDismiss: false,
          });
        }
        router.push(props.canvasPath);
        addToast("Published Successfully", {
          appearance: "success",
          autoDismiss: true,
        });
      }
    } catch (err) {
      console.log(err);
      addToast("Something went wrong. Please try again", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const acceptRequestHandler = () => {
    if (props.messageType === "merge-request") {
      acceptMergeRequest();
    } else {
      acceptPublishRequest();
    }
  };

  const handleAccessRequest = (status, permissionGroup) => {
    try {
      const payload = {
        status,
        canvasBranchPermissionGroup: permissionGroup,
      };
      const resp = NotificationService.handleAccessRequest(
        props?.apiProps?.canvasBranchID,
        props?.apiProps?.requestID,
        payload
      );
      const toastMsg =
        status === "REJECTED"
          ? "Rejected Access successfully"
          : `Granted access successfully`;

      props.closeNotificationsContainer();
      isTabletOrMobile && setIsSideNavOpen(false);

      addToast(toastMsg, {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      addToast("Failed to grant access", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  // const ACCESS_REQUEST_LIST = [{
  //   title: 'Grant View Access',
  //   variange: 'danger'
  // }]

  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";

  const callBackUrl = `${origin}${router.asPath}`;

  const handleUpgradePlan = async (studioId: number) => {
    const resp = await StudioService.getBillingPortalLink(
      studioId!,
      callBackUrl
    );
    window.location.replace(resp.data.url);
  };

  return (
    <LinkWithoutPrefetch
      href={props.canvasPath}
      onClick={() => {
        segmentEvents.notificationClicked(
          segValues.type,
          segValues.to,
          segValues.user_id,
          segValues.discord_id,
          segValues.product_id,
          segValues.page_key,
          segValues.page_id,
          segValues.email_id,
          segValues.source
        );
        props.closeNotificationsContainer();
        isTabletOrMobile && setIsSideNavOpen(false);
      }}
    >
      <Box
        sx={{
          display: "flex",
          padding: "0px 5px",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            padding: "12px 10px",
            ":hover": {
              backgroundColor: "notifications.messages.hoverBg",
              cursor: "pointer",
              borderRadius: "12px",
            },
          }}
        >
          <Box display={"flex"} alignItems="flex-start">
            <ImageWithName
              src={props.studio?.imageUrl}
              name={props.studio?.displayName}
              sx={{
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "notifications.messages.imageBorder",
                color: "notifications.messages.imageText",
              }}
            />
            <Avatar
              src={props.avatarUrl || props.userAvatarSrc || AVATAR_PLACEHOLDER}
              sx={{
                position: "relative",
                left: "-12px",
                width: "32px",
                height: "32px",
              }}
            />
          </Box>
          <Box
            sx={{
              paddingLeft: "5px",
              display: "flex",
              flex: 1,
              flexDirection: "column",
            }}
          >
            {props.messageType === "canvaslimitexceed" ? (
              <Box>
                <Box
                  sx={{
                    fontSize: "14px",
                    color: "notifications.messages.message",
                  }}
                >
                  <Text as={"span"}>{t("billing.canvasLimitExceededP1")}</Text>
                  <br />
                  <Text as={"span"}>{t("billing.canvasLimitExceededP2")}</Text>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  fontSize: "14px",
                  color: "notifications.messages.message",
                }}
              >
                {props.message}
              </Box>
            )}
            {props.repliesText ? (
              <Text
                color={"notifications.messages.repliesText"}
                fontSize={"14px"}
                lineHeight={"22px"}
                fontWeight={400}
                my="4px"
                sx={{
                  overflow: "hidden",
                  whiteSpace: "normal",
                  display: "-webkit-box",
                  wordBreak: "break-word",
                  WebkitLineClamp: 1,
                }}
                style={{
                  WebkitBoxOrient: "vertical",
                }}
              >
                {props.repliesText}
              </Text>
            ) : null}
            {props.requestStatus === "ACCEPTED" ||
            props.requestStatus === "REJECTED" ||
            props.requestStatus === "PARTIALLY_ACCEPTED" ? (
              props.messageType === "publish-request" ? (
                <Text
                  color={"notifications.messages.repliesText"}
                  fontSize={"14px"}
                  lineHeight={"22px"}
                  fontWeight={400}
                  mb="4px"
                >{`Publist request has been ${
                  props.requestStatus === "ACCEPTED" ? "accepted" : "rejected"
                }`}</Text>
              ) : props.messageType === "merge-request" ? (
                <Text
                  color={"notifications.messages.repliesText"}
                  fontSize={"14px"}
                  lineHeight={"22px"}
                  fontWeight={400}
                  mb="4px"
                >{`Merge request has been ${
                  props.requestStatus === "PARTIALLY_ACCEPTED"
                    ? "partially accepted"
                    : props.requestStatus === "ACCEPTED"
                    ? "accepted"
                    : "rejected"
                }`}</Text>
              ) : null
            ) : null}
            <Text
              sx={{ fontSize: "12px", color: "notifications.messages.time" }}
            >
              {props.time} ago
            </Text>

            {props.messageType === "canvaslimitexceed" ? (
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Button
                  variant="primary"
                  sx={{
                    border: "none",
                    fontSize: "12px",
                  }}
                  size="small"
                  onClick={() => {
                    props.closeNotificationsContainer();
                    router.push({
                      pathname: BipRouteUtils.getStudioAboutRoute(
                        props.studio.handle
                      ),
                      query: {
                        open_settings: true,
                      },
                    });
                    // handleUpgradePlan(props.studio.id as number);
                  }}
                >
                  Upgrade
                </Button>
              </Box>
            ) : (
              <>
                {!["ACCEPTED", "REJECTED", "PARTIALLY_ACCEPTED"].includes(
                  props?.requestStatus
                ) && (
                  <Box sx={{ display: "flex", marginTop: "10px" }}>
                    {props.messageType === "access-request" ? (
                      <>
                        <Box
                          position={"relative"}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <ButtonGroup>
                            <Button
                              variant="primary"
                              sx={{
                                border: "none",
                                fontSize: "12px",
                              }}
                              size="small"
                              onClick={() => {
                                handleAccessRequest(
                                  "ACCEPTED",
                                  "pg_canvas_branch_edit"
                                );
                              }}
                            >
                              Grant Edit Access
                            </Button>
                            <ActionMenu>
                              <ActionMenu.Anchor>
                                <IconButton
                                  variant="primary"
                                  sx={{
                                    border: "none",
                                    fontSize: "12px",
                                  }}
                                  icon={TriangleDownIcon}
                                  size="small"
                                />
                              </ActionMenu.Anchor>
                              <ActionMenu.Overlay>
                                <ActionList>
                                  <ActionList.Item
                                    onSelect={() =>
                                      handleAccessRequest(
                                        "ACCEPTED",
                                        "pg_canvas_branch_view"
                                      )
                                    }
                                  >
                                    Grant View Access
                                  </ActionList.Item>
                                  <ActionList.Item
                                    onSelect={() =>
                                      handleAccessRequest(
                                        "ACCEPTED",
                                        "pg_canvas_branch_comment"
                                      )
                                    }
                                  >
                                    Grant Comment Access
                                  </ActionList.Item>
                                  <ActionList.Item
                                    onSelect={() =>
                                      handleAccessRequest(
                                        "ACCEPTED",
                                        "pg_canvas_branch_moderate"
                                      )
                                    }
                                  >
                                    Grant Moderate Access
                                  </ActionList.Item>
                                  <ActionList.Item
                                    onSelect={() =>
                                      handleAccessRequest(
                                        "REJECTED",
                                        "pg_canvas_branch_edit"
                                      )
                                    }
                                    variant="danger"
                                  >
                                    Reject Request
                                  </ActionList.Item>
                                </ActionList>
                              </ActionMenu.Overlay>
                            </ActionMenu>
                          </ButtonGroup>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          sx={{
                            fontSize: "12px",
                            padding: "0px 10px",
                            marginRight: "20px",
                            bg: "btn.primary.bg",
                            borderStyle: "solid",
                            borderWidth: "1px",
                            borderColor: "notifications.primaryButton.border",
                            color: "notifications.primaryButton.color",
                            fontWeight: "400",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            acceptRequestHandler();
                            props.closeNotificationsContainer();
                            isTabletOrMobile && setIsSideNavOpen(false);
                          }}
                        >
                          {props.messageType === "publish-request"
                            ? "Publish"
                            : "Approve"}
                        </Button>
                        {props.messageType === "publish-request" ? (
                          <LinkWithoutPrefetch href={props.canvasPath}>
                            <Button
                              sx={{ fontSize: "12px", padding: "2px 10px" }}
                              onClick={() => {
                                props.closeNotificationsContainer();
                                isTabletOrMobile && setIsSideNavOpen(false);
                              }}
                            >
                              View
                            </Button>
                          </LinkWithoutPrefetch>
                        ) : props.mergeRequestPath ? (
                          <LinkWithoutPrefetch
                            href={{ ...props.mergeRequestPath, query: {} }}
                          >
                            <Button
                              sx={{ fontSize: "12px", padding: "2px 10px" }}
                              onClick={() => {
                                props.closeNotificationsContainer();
                                isTabletOrMobile && setIsSideNavOpen(false);
                              }}
                            >
                              View
                            </Button>
                          </LinkWithoutPrefetch>
                        ) : null}
                      </>
                    )}
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </LinkWithoutPrefetch>
  );
};

const NoNotificationsMessage: React.FC = () => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderTop: "1px solid",
        borderColor: "notifications.endBorder",
        marginBottom: "109px",
      }}
    >
      <Box sx={{ color: "notifications.inboxIcon", marginTop: "20px" }}>
        <InboxIcon size={30} />
      </Box>
      <Box
        sx={{
          fontSize: "14px",
          fontWeight: "600",
          color: "notifications.emptyHeading",
          marginBottom: "8px",
        }}
      >
        You don’t seem to have any notifications
      </Box>
      <Box
        sx={{
          fontSize: "14px",
          color: "notifications.emptyMessage",
          textAlign: "center",
        }}
      >
        You'll get a notification here if someone mentions you, reacts to your
        canvas, or invites you to a canvas.
      </Box>
    </Box>
  );
};

const EndOfNotificationMessage: React.FC = () => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderTop: "1px solid",
        borderColor: "notifications.endBorder",
        marginBottom: "109px",
      }}
    >
      <Box sx={{ color: "notifications.inboxIcon", marginTop: "20px" }}>
        <TelescopeIcon size={30} />
      </Box>
      <Box
        sx={{
          fontSize: "14px",
          fontWeight: "600",
          color: "notifications.emptyHeading",
        }}
      >
        That's all for now
      </Box>
      <Box sx={{ fontSize: "14px", color: "notifications.emptyMessage" }}>
        You've reached the end!
      </Box>
    </Box>
  );
};

type message = {
  userAvatar?: string;
  messageBody: string;
  messageType: string;
  timeCreated: string;
  requestStatus?: string;
  canvasPath: {
    pathname: string;
    query: {
      repoKey: string;
    };
  };
  apiProps?: {
    canvasBranchID: string | number;
    requestID: string | number;
  };
  mergeRequestPath?: {
    pathname: string;
  };
};

interface INotificationMessagesProps {
  userAvatarSrc?: string;
  messages: message[];
  filters: {
    unread: boolean;
    replies: boolean;
    requests: boolean;
    pr: boolean;
  };
  closeNotificationsContainer: () => void;
  skip: number;
  getNextPage: () => void;
  loadingNextPage: boolean;
}

const NotificationMessages: React.FunctionComponent<
  INotificationMessagesProps
> = (props) => {
  const { skip, loadingNextPage, getNextPage, messages } = props;

  // const messages = props.messages.filter((msg) => {
  //   if (
  //     !props.filters.pr &&
  //     !props.filters.replies &&
  //     !props.filters.requests &&
  //     !props.filters.unread
  //   ) {
  //     return msg;
  //   }
  //   if (
  //     (props.filters.pr && msg.messageType === "publish-request") ||
  //     (props.filters.replies &&
  //       (msg.messageType === "replies" ||
  //         msg.messageType === "joinedStudio")) ||
  //     (props.filters.requests && msg.messageType.includes("request")) ||
  //     (props.filters.unread && msg.messageType === "unread")
  //   ) {
  //     return msg;
  //   }
  // });

  return (
    <Box
      sx={{
        overflowY: "scroll",
        "::-webkit-scrollbar": { width: "5px" },
        "::-webkit-scrollbar-thumb": {
          backgroundColor: "lightGrey",
          border: "none",
        },
      }}
      id="notifications-messages-scroll-container"
    >
      <InfiniteScroll
        hasMore={skip !== -1}
        dataLength={messages.length}
        next={getNextPage}
        loader={""}
        scrollableTarget={"notifications-messages-scroll-container"}
        scrollThreshold={0.9}
      >
        {messages?.map((msg, index) => {
          if (
            msg.messageType === "replies" ||
            msg.messageType === "blockReact" ||
            msg.messageType === "blockmention" ||
            msg.messageType === "joinedStudio" ||
            msg.messageType === "studio-invite" ||
            msg.messageType === "canvas-invite" ||
            msg.messageType === "collection-invite" ||
            msg.messageType === "follow-user"
          ) {
            return (
              <RepliesNotificationMessage
                userAvatarSrc={props.userAvatarSrc}
                message={msg.messageBody}
                time={msg.timeCreated}
                avatarUrl={msg.userAvatar}
                key={index}
                messageType={msg.messageType}
                canvasPath={msg.canvasPath}
                mergeRequestPath={msg.mergeRequestPath}
                studio={msg?.studio}
                closeNotificationsContainer={props.closeNotificationsContainer}
                repliesText={msg.repliesText}
                segmentValues={msg?.segmentValues}
              />
            );
          }
          return (
            <RequestNotificationMessage
              userAvatarSrc={props.userAvatarSrc}
              message={msg.messageBody}
              time={msg.timeCreated}
              avatarUrl={msg.userAvatar}
              key={index}
              messageType={msg.messageType}
              canvasPath={msg.canvasPath}
              requestStatus={msg.requestStatus}
              apiProps={msg.apiProps}
              mergeRequestPath={msg.mergeRequestPath}
              closeNotificationsContainer={props.closeNotificationsContainer}
              studio={msg?.studio}
              repliesText={msg.repliesText}
              segmentValues={msg.segmentValues}
            />
          );
        })}
      </InfiniteScroll>

      {loadingNextPage ? (
        <Box display={"flex"} justifyContent={"center"} my={"16px"}>
          <BipLoader />
        </Box>
      ) : null}

      {messages.length === 0 ? (
        <NoNotificationsMessage />
      ) : skip === -1 ? (
        <EndOfNotificationMessage />
      ) : null}
    </Box>
  );
};

export default NotificationMessages;
