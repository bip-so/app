import { MutableRefObject, useEffect, useRef, useState } from "react";

import {
  Avatar,
  AvatarStack,
  Box,
  CounterLabel,
  Overlay,
  Text,
} from "@primer/react";

import { AVATAR_PLACEHOLDER } from "../commons/constants";
import CollectionService from "../modules/Collections/services";
import useDeviceDimensions from "../hooks/useDeviceDimensions";
import useRefDimensions from "../hooks/useRefDimensions";
import { useSlate } from "slate-react";
import AvatarWithPlaceholder from "./AvatarWithPlaceholder";
import { useCanvas } from "../context/canvasContext";

interface IContributorsListProps {
  canvasBranchId: string | number;
}

type IContributor = {
  avatarUrl?: string;
  name?: string;
  handle?: string;
  edits: number;
  totalEdits?: number;
};

interface IContributorsProps {
  contributors: IContributor[];
  mouseEnterHandler: (show: boolean, delay: number) => void;
  contributorsRef: MutableRefObject<HTMLDivElement>;
}

const ContributorsStack: React.FC<IContributorsProps> = (props) => {
  return (
    <Box
      ref={props.contributorsRef}
      sx={{
        display: "flex",
      }}
      onMouseEnter={() => {
        props.mouseEnterHandler(true, 350);
      }}
      onMouseLeave={() => {
        props.mouseEnterHandler(false, 150);
      }}
    >
      <AvatarStack>
        {props.contributors.map((contributor, index) => {
          if (index < 8)
            return (
              <AvatarWithPlaceholder src={contributor.avatarUrl} key={index} />
            );
          else if (index === 8)
            return (
              <Box
                sx={{
                  height: "20px",
                  width: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "contributorsList.stack.bg",
                  borderRadius: "50%",
                  fontSize: "10px",
                }}
                key={9}
              >
                +{props.contributors.length - 8}
              </Box>
            );
        })}
      </AvatarStack>
    </Box>
  );
};

const ContributorCard: React.FC<IContributor> = (props) => {
  const { branch } = useCanvas();

  return (
    <Box
      className="rounded-md"
      sx={{
        padding: "8px",
        display: "flex",
        width: "100%",
        position: "relative",
        alignItems: "center",
        ":hover": {
          bg: "contributorsList.list.cardHoverBg",
        },
      }}
    >
      <AvatarWithPlaceholder
        src={props.avatarUrl}
        sx={{ height: "32px", width: "32px" }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          marginLeft: "8px",
        }}
      >
        {props.name && (
          <Text sx={{ fontSize: "14px", color: "contributorsList.list.name" }}>
            {props.name}
          </Text>
        )}
        {props.handle && (
          <Text sx={{ color: "contributorsList.list.text", fontSize: "12px" }}>
            @{props.handle}
          </Text>
        )}
      </Box>
      <Text
        sx={{
          position: "absolute",
          right: "8px",
          color: "contributorsList.list.text",
          fontSize: "14px",
        }}
      >
        {Math.round((props.edits! * 100) / props.totalEdits!)}%
      </Text>
    </Box>
  );
};

const ContributorsListContainer: React.FC<IContributorsProps> = (props) => {
  const totalEdits = props.contributors
    .map((x) => x.edits)
    .reduce((a, b) => {
      return a! + b!;
    });
  const contributors = props.contributors.map((contributor, index) => (
    <ContributorCard {...contributor} key={index} totalEdits={totalEdits} />
  ));

  const parentRect = props.contributorsRef.current.getBoundingClientRect();

  const top = parentRect.bottom + 8;
  const left = parentRect.left;

  return (
    <Overlay
      returnFocusRef={props.contributorsRef}
      ignoreClickRefs={[props.contributorsRef]}
      onMouseEnter={() => props.mouseEnterHandler(true, 0)}
      onMouseLeave={() => props.mouseEnterHandler(false, 150)}
      onClickOutside={() => props.mouseEnterHandler(false, 0)}
      onEscape={() => props.mouseEnterHandler(false, 0)}
      width="medium"
      top={top}
      left={left}
    >
      <Box className="flex items-center justify-between mx-3 mt-3 mb-2">
        <Box className="flex items-center">
          <span
            style={{ fontSize: "16px", fontWeight: "600", marginRight: "8px" }}
          >
            Collaborators
          </span>
          <CounterLabel> {props.contributors.length}</CounterLabel>
        </Box>
        <Text
          sx={{
            fontSize: "12px",
            color: "contributorsList.list.text",
          }}
        >
          Contribution %
        </Text>
      </Box>
      <Box className="pb-3 pl-3 pr-2 overflow-y-scroll max-h-96">
        {contributors}
      </Box>
    </Overlay>
  );
};

const ContributorsList: React.FunctionComponent<IContributorsListProps> = (
  props
) => {
  const [showContributorsList, setShowContributorsList] =
    useState<boolean>(false);
  const [contributors, setContributors] = useState([]);
  const editor = useSlate();
  const { isSmall, isMedium } = useRefDimensions(editor.parentRef);
  const contributorsRef = useRef<HTMLDivElement>();

  const [hoverTimeOutFn, setHoverTimeOutFn] = useState<any>(null);

  const openCloseContributorsListWithDelay = (show: boolean, delay: number) => {
    if (hoverTimeOutFn != null) {
      clearTimeout(hoverTimeOutFn);
      setHoverTimeOutFn(null);
    }

    setHoverTimeOutFn(
      setTimeout(() => {
        setShowContributorsList(show);
      }, delay)
    );
  };

  useEffect(() => {
    (async () => {
      if (!props.canvasBranchId) {
        return;
      }

      try {
        const resp = await CollectionService.getAttributions({
          canvasBranchID: props.canvasBranchId,
        });
        const contributorsData = resp.data.data
          .sort((a: any, b: any) => b.edits - a.edits)
          .map((contributor: any) => {
            return {
              avatarUrl: contributor.user.avatarUrl,
              name: contributor.user.fullName,
              handle: contributor.user.username,
              edits: +contributor.edits,
              userId: contributor.user.id,
            };
          });
        setContributors(contributorsData);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);
  return (
    <Box
      sx={{
        marginTop: "12px",
        position: "relative",
      }}
    >
      <ContributorsStack
        contributors={contributors}
        mouseEnterHandler={openCloseContributorsListWithDelay}
        contributorsRef={contributorsRef}
      />
      {showContributorsList && contributors.length ? (
        <ContributorsListContainer
          contributors={contributors}
          mouseEnterHandler={openCloseContributorsListWithDelay}
          contributorsRef={contributorsRef}
        />
      ) : null}
    </Box>
  );
};

export default ContributorsList;
