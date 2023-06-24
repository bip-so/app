import { MarkGithubIcon } from "@primer/octicons-react";
import { Avatar, Box, Button, Header, StyledOcticon } from "@primer/react";
import { EyeIcon } from "@primer/styled-octicons";
import React, { FC, useState } from "react";
import { Text } from "@primer/react";
import { ICanvasRepo } from "../modules/Canvas/interfaces";
import { useStudio } from "../context/studioContext";
import { useCanvas } from "../context/canvasContext";
import CanvasBranchService from "../modules/Canvas/services/canvasBranch";
import { useToasts } from "react-toast-notifications";
import { signOut } from "next-auth/react";
import { useUser } from "../context/userContext";
import BipRouteUtils from "../core/routeUtils";
import { useRouter } from "next/router";
import AuthService from "../modules/Auth/services";

interface IRequestAccessParams {
  branchId: number;
  hasExistingRequest: boolean;
  setHasExistingRequest: (status: boolean) => void;
}

const RequestAccess: FC<IRequestAccessParams> = ({
  branchId,
  hasExistingRequest,
  setHasExistingRequest,
}) => {
  const { addToast } = useToasts();
  const { currentStudio } = useStudio();
  const router = useRouter();
  const handle = router.query.handle as string;
  const inviteCode = router.query.inviteCode as string;
  const slug = router.query.slug as string;
  const slugTokens = slug.split("-");
  const title = slugTokens.slice(0, -1).join("-");
  const { logout, isLoggedIn } = useUser();

  const [requested, setRequested] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);

  const handleRequestAccess = async () => {
    const payload = {
      canvasBranchID: branchId,
      studioID: currentStudio?.id,
    };
    try {
      setLoading(true);
      const reqResponse = await CanvasBranchService.createAccessRequest(
        branchId,
        payload
      );
      setHasExistingRequest(true);
      addToast("Access requested!", {
        appearance: "success",
        autoDismiss: true,
      });
      setRequested(true);
      setLoading(false);
    } catch (error) {
      addToast("Error while requesting access!", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleLoginToAnotherAccount = () => {
    AuthService.logout();
    signOut().then(async (r) => {
      await logout(true);
    });
  };

  return (
    <>
      <div className="blankslate ">
        <Box
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          padding={"32px"}
          marginTop={"50px"}
        >
          <EyeIcon size={16} />
          <Text
            as="p"
            fontWeight={600}
            fontSize={"24px"}
            mt={"5px"}
            lineHeight={"36px"}
          >
            Private Canvas
          </Text>
          <Box mt={"4px"}>
            {isLoggedIn ? (
              hasExistingRequest ? (
                <>
                  <Text
                    margin={"10px 0"}
                    as="p"
                    sx={{
                      width: "500px",
                      textAlign: "center",
                      color: "text.green",
                    }}
                  >
                    Access Requested
                  </Text>
                  <Text
                    as="p"
                    margin={"10px 0"}
                    sx={{
                      width: "500px",
                      textAlign: "center",
                      color: "text.muted",
                      fontSize: "14px",
                    }}
                  >
                    You will be notified once a mod responds.
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    as="p"
                    margin={"10px 0"}
                    fontWeight={400}
                    fontSize={"14px"}
                    lineHeight={"20px"}
                    color="text.gray"
                  >
                    {isLoggedIn
                      ? "You don’t have access to this canvas"
                      : "Please login to verify your access"}
                  </Text>
                  <Button
                    disabled={loading || requested}
                    variant={"primary"}
                    sx={{ border: "none", margin: "20px auto" }}
                    onClick={handleRequestAccess}
                  >
                    Request Access
                  </Button>
                </>
              )
            ) : null}
          </Box>

          {isLoggedIn ? (
            <Button
              sx={{
                fontSize: "10px",
                marginTop: "5px",
                padding: "2px 10px",
                color: "text.grayLight",
              }}
              onClick={handleLoginToAnotherAccount}
            >
              Login to another account
            </Button>
          ) : (
            <Button
              variant={"primary"}
              sx={{ border: "none", margin: "20px 0" }}
              onClick={() =>
                window.location.replace(
                  `${BipRouteUtils.getSignInRoute()}?returnUrl=${
                    inviteCode
                      ? BipRouteUtils.getCanvasInviteCodeRoute(
                          handle,
                          inviteCode,
                          title
                        )
                      : router.asPath
                  }`
                )
              }
            >
              Login / Sign up
            </Button>
          )}
        </Box>
      </div>
    </>
  );
};

export default RequestAccess;
