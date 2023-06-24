import { Box } from "@primer/react";
import { TelescopeIcon } from "@primer/styled-octicons";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useUser } from "../../../../context/userContext";
import UserService from "../../../User/services";

import BipMarkMessage from "./BipMarkMessage";

interface IBipMarkContainerProps {}

const BipMarkContainer: React.FunctionComponent<IBipMarkContainerProps> = (
  props
) => {
  const [bipMarks, setBipMarks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useUser();
  const { data, error } = useSWR(
    user ? [user.id, "bipMarks"] : null,
    fetchBipMarks
  );

  async function fetchBipMarks() {
    setIsLoading(true);
    try {
      const resp = await UserService.getBipMarks();
      setBipMarks(resp.data.data);
    } catch (error) {}
    setIsLoading(false);
  }

  const hasBipMarks = bipMarks.length > 0;
  const endState = (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderTop: hasBipMarks ? "1px solid" : "none",
        borderColor: hasBipMarks ? "bipMarks.border" : "",
        marginBottom: 80,
      }}
    >
      <Box sx={{ color: "bipMarks.icon", marginTop: "20px" }}>
        <TelescopeIcon size={30} />
      </Box>
      <Box sx={{ fontSize: "14px", fontWeight: "600", color: "" }}>
        {hasBipMarks ? "That's all for now" : "No Bip Marks found!"}
      </Box>
      <Box
        sx={{
          fontSize: "14px",
          color: "bipMarks.endMessage",
          textAlign: "center",
        }}
      >
        {hasBipMarks
          ? "You've reached the end!"
          : "Head over to discord and use our integration to mark a message"}
      </Box>
    </Box>
  );
  return (
    <Box
      padding="8px"
      sx={{
        overflowY: "scroll",
        height: "calc(80vh - 58px)",
        "::-webkit-scrollbar": { width: "5px" },
        "::-webkit-scrollbar-thumb": {
          backgroundColor: "bipMarks.scrollBg",
          border: "none",
        },
      }}
    >
      {bipMarks.map((bipMark) => (
        <BipMarkMessage
          key={bipMark.id}
          setBipMarks={setBipMarks}
          bipMark={bipMark}
          fromNotifications={true}
        />
      ))}
      {endState}
    </Box>
  );
};

export default BipMarkContainer;
