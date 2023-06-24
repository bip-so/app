import { FC, useEffect, useMemo, useState } from "react";
import { ActionList, IconButton, Timeline } from "@primer/react";
import { HistoryIcon, XIcon } from "@primer/styled-octicons";
import styled from "styled-components";
import { useTranslation } from "next-i18next";
import CanvasTimelineItem from "./CanvasTimelineItem";
import { CommitHistoryType } from "../interfaces";
import { useCanvas } from "../../../context/canvasContext";
import RightRailContainer from "./RightRailContainer";
import CanvasBranchService from "../services/canvasBranch";
import BipLoader from "../../../components/BipLoader";
import BipRouteUtils from "../../../core/routeUtils";
import { useRouter } from "next/router";

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
`;

interface ICanvasHistoryRightRailProps {
  closeHandler: () => void;
}

const CanvasHistoryRightRail: FC<ICanvasHistoryRightRailProps> = ({
  closeHandler,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const slug = router.query.slug as string;
  const branchId = BipRouteUtils.getBranchIdFromCanvasSlug(slug);
  const { branch } = useCanvas();
  const [history, setHistory] = useState((): CommitHistoryType[] => []);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    getHistory();
  }, [branchId]);

  const getHistory = () => {
    if (branchId) {
      setLoadingHistory(true);
      CanvasBranchService.getCommitsHistory(branchId)
        .then((r) => {
          setHistory(r.data.logs);
          setLoadingHistory(false);
        })
        .catch((err) => {
          setLoadingHistory(false);
        });
    }
  };

  const historyByDate: { [key: string]: CommitHistoryType[] } = useMemo(() => {
    if (history?.length) {
      return history.reduce((groupByDate, log) => {
        const date = new Date(log.createdAt)
          .toDateString()
          .split(" ")
          .slice(1, 4)
          .join(" ");
        if (!groupByDate[date]) {
          groupByDate[date] = [];
        }
        groupByDate[date].push(log);
        return groupByDate;
      }, {});
    }
    return {};
  }, [history]);

  return (
    <RightRailContainer onClickOutSideRightRail={closeHandler}>
      <div className="flex items-center justify-between w-full mt-2 px-4">
        <div className="flex items-center">
          <HistoryIcon />
          <h3 className="inline-block ml-1 font-medium">Version history</h3>
        </div>
        <IconButton
          icon={XIcon}
          sx={{
            color: "text.subtle",
          }}
          size={"small"}
          variant="invisible"
          onClick={closeHandler}
        />
      </div>
      <ActionList.Divider />
      <ContentContainer className="pt-2 space-y-2 overflow-y-scroll px-4">
        {loadingHistory ? (
          <BipLoader />
        ) : (
          <Timeline
            sx={{
              paddingBottom: "200px",
            }}
          >
            {Object.values(historyByDate)?.map((commits, i) => (
              <CanvasTimelineItem
                commits={commits}
                closeHandler={closeHandler}
              />
            ))}
          </Timeline>
        )}
      </ContentContainer>
    </RightRailContainer>
  );
};

export default CanvasHistoryRightRail;
