import { Box, CounterLabel } from "@primer/react";
import { useState } from "react";
import AvatarWithPlaceholder from "../../../components/AvatarWithPlaceholder";

import ImageWithName from "../../../components/ImageWithName";
import { useStudio } from "../../../context/studioContext";

type studio = {
  id: string | number;
  imgUrl: string;
  name: string;
  count: number;
};

interface INotificationUsersProps {
  userAvatarSrc: string;
  studios?: studio[];
  type: string;
  selectedStudio: string | number;
  changeNotificationType: (type: string) => void;
  setStudioForNotifications: (studioID: string | number) => void;
}

const NotificationUsers: React.FunctionComponent<INotificationUsersProps> = (
  props
) => {
  const { notificationCount, saveNotificationCount } = useStudio();
  return (
    <Box
      sx={{
        overflowX: "scroll",
        display: "flex",
        alignItems: "center",
        // margin: "0px 0px 15px 0px",
        paddingLeft: "15px",
        height: "60px",
        flexShrink: 0,
      }}
    >
      <Box
        onClick={() => {
          props.changeNotificationType("all");
        }}
      >
        <Box
          sx={{
            height: "40px",
            width: "40px",
            color: "notifications.users.black",
            textAlign: "center",
            marginRight: "30px",
            border: "2px solid",
            borderColor:
              props.type === "all"
                ? "notifications.users.selectedBorder"
                : "notifications.users.border",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ":hover": {
              cursor: "pointer",
            },
          }}
        >
          All
        </Box>
      </Box>
      <Box onClick={() => props.changeNotificationType("personal")}>
        <Box
          sx={{
            height: "42px",
            width: "42px",
            color: "notifications.users.black",
            // padding: "1px",
            marginRight: "30px",
            borderRadius: "50%",
            border: "2px solid",
            borderColor:
              props.type === "personal"
                ? "notifications.users.selectedBorder"
                : "notifications.users.border",
            ":hover": {
              cursor: "pointer",
            },
          }}
        >
          <AvatarWithPlaceholder
            src={props.userAvatarSrc}
            sx={{
              height: "40px",
              width: "40px",
              padding: "1px",
              flexShrink: 0,
            }}
          />
        </Box>
      </Box>

      {props.studios?.map((studio) => (
        <Box
          onClick={() => {
            props.changeNotificationType("studio");

            const studiosCountCopy = notificationCount?.studio?.map(
              (studioCount) => {
                if (studioCount.studio.id === studio.id) {
                  return {
                    ...studioCount,
                    count: 0,
                  };
                } else {
                  return studioCount;
                }
              }
            );

            const countCopy = {
              ...notificationCount,
              studio: studiosCountCopy,
            };
            saveNotificationCount(countCopy);
            props.setStudioForNotifications(String(studio.id));
          }}
          key={studio.id}
        >
          {studio?.imgUrl ? (
            <Box
              sx={{
                height: "42px",
                width: "42px",
                color: "notifications.users.black",
                marginRight: "30px",
                borderRadius: "50%",
                border: "2px solid",
                borderColor:
                  props.type === "studio" &&
                  String(studio.id) === props.selectedStudio
                    ? "notifications.users.selectedBorder"
                    : "notifications.users.border",
                ":hover": {
                  cursor: "pointer",
                },
              }}
            >
              <ImageWithName
                src={studio.imgUrl}
                sx={{
                  height: "40px",
                  width: "40px",
                  padding: "1px",
                  flexShrink: 0,
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                height: "42px",
                width: "42px",
                color: "notifications.users.black",
                marginRight: "30px",
              }}
            >
              <ImageWithName
                src={null}
                sx={{
                  flexShrink: 0,
                  height: "42px",
                  width: "42px",
                  color: "notifications.users.black",
                  // marginRight: "30px",
                  border: "2px solid",
                  padding: "1px",
                  borderColor:
                    props.type === "studio" &&
                    String(studio.id) === props.selectedStudio
                      ? "notifications.users.selectedBorder"
                      : "notifications.users.border",
                  ":hover": {
                    cursor: "pointer",
                  },
                }}
                name={studio.name}
              />
            </Box>
          )}
          {studio?.count > 0 ? (
            <sup>
              <CounterLabel
                sx={{
                  position: "absolute",
                  // marginRight: "60px",
                  left: "30px",
                  top: "-40px",
                  color: "notifications.users.counter",
                  backgroundColor: "notifications.users.counterBg",
                }}
              >
                {studio?.count}
              </CounterLabel>
            </sup>
          ) : null}
        </Box>
      ))}
    </Box>
  );
};

export default NotificationUsers;
