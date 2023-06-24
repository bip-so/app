import { Box, Text, useTheme } from "@primer/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@primer/styled-octicons";
import { FC } from "react";
import { PageType, usePages } from "../context/pagesContext";
import { useStudio } from "../context/studioContext";
import BipRouteUtils from "../core/routeUtils";
import { ICanvasRepo } from "../modules/Canvas/interfaces";
import { CollectionDataType } from "../modules/Collections/types";
import LinkWithoutPrefetch from "./LinkWithoutPrefetch";

type PrevNextButtonsContextType = "repo" | "collection";

interface IPrevNextButtonsProps {
  context: PrevNextButtonsContextType;
  prev?: ICanvasRepo | CollectionDataType;
  next?: ICanvasRepo | CollectionDataType;
}

const PrevNextButtons: FC<IPrevNextButtonsProps> = ({
  context,
  prev,
  next,
}) => {
  const { colorMode } = useTheme();
  const { currentStudio } = useStudio();
  const { openIds, setOpenIds, pages, getCollectionCanvases, setPagesLoaded } =
    usePages();

  const getLink = (item: ICanvasRepo | CollectionDataType) => {
    if (context === "repo") {
      const repo = item as ICanvasRepo;
      return BipRouteUtils.getPublicCanvasRoute(
        currentStudio?.handle!,
        repo.name,
        repo.defaultBranchID
      );
    } else {
      const collection = item as CollectionDataType;
      return BipRouteUtils.getPublicCollectionRoute(
        currentStudio?.handle!,
        collection.id
      );
    }
  };

  const isIDExist = (id: number) => {
    const pageId = openIds.find((oID) => id === oID);
    return pageId ? true : false;
  };

  const handleRepoClick = (repo: ICanvasRepo | CollectionDataType) => {
    if (repo.parent && repo.collectionID) {
      const collection = pages.find((page) => repo.collectionID === page.id);
      if (collection) {
        if (!(collection as CollectionDataType).areCanvasesFetched) {
          getCollectionCanvases(collection as CollectionDataType, true);
        }
      }
      const newIds = [];
      if (repo.parent === repo.collectionID) {
        if (!isIDExist(repo.parent)) {
          newIds.push(repo.parent);
        }
      } else {
        if (!isIDExist(repo.collectionID)) {
          newIds.push(repo.collectionID);
        }
        let currentRepo: PageType | ICanvasRepo = repo;
        const areCanvasesFetched = pages.find(
          (page) => page.id === repo.parent
        )?.areChildrenFetched;
        if (!areCanvasesFetched) {
          setPagesLoaded(false);
        }
        while (currentRepo.id !== repo.collectionID) {
          const pRepo = pages.find((page) => page.id === currentRepo.parent);
          if (pRepo) {
            if (!isIDExist(pRepo.id)) {
              newIds.push(pRepo.id);
            }
            currentRepo = pRepo;
          } else {
            break;
          }
        }
      }
      setOpenIds([...openIds, ...newIds]);
    }
  };

  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      mt={"48px"}
      contentEditable={false}
    >
      {prev ? (
        <LinkWithoutPrefetch href={getLink(prev)}>
          <Box
            sx={{
              boxShadow:
                colorMode === "day"
                  ? "0 0 4px rgb(0 0 0 / 25%)"
                  : "0 0 4px rgb(250 250 250 / 25%)",
              borderRadius: "6px",
              width: "calc(50% - 12px)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              cursor: "pointer",
              bg: "prevNextButtons.bg",
              textDecoration: "none !important",
              ":hover": {
                opacity: 0.8,
                bg: "prevNextButtons.hoverBg",
              },
            }}
            onClick={() => {
              handleRepoClick(prev);
            }}
          >
            <ArrowLeftIcon size={24} color={"prevNextButtons.arrow"} />
            <Box
              sx={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                alignItems: "flex-end",
                overflow: "hidden",
              }}
            >
              <Text
                as="p"
                sx={{
                  fontSize: "11px",
                  color: "prevNextButtons.prevText",
                }}
              >
                Prev
              </Text>
              <Text
                as="p"
                sx={{
                  fontSize: "15px",
                  fontWeight: 500,
                  overflow: "hidden",
                  maxWidth: "100%",
                  textOverflow: "ellipsis",
                  whiteSpace: "pre",
                  color: "prevNextButtons.title",
                }}
              >
                {prev.name}
              </Text>
            </Box>
          </Box>
        </LinkWithoutPrefetch>
      ) : null}

      {next ? (
        <LinkWithoutPrefetch href={getLink(next)}>
          <Box
            sx={{
              boxShadow:
                colorMode === "day"
                  ? "0 0 4px rgb(0 0 0 / 25%)"
                  : "0 0 4px rgb(250 250 250 / 25%)",
              borderRadius: "6px",
              width: "calc(50% - 12px)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              cursor: "pointer",
              bg: "prevNextButtons.bg",
              textDecoration: "none !important",
              ":hover": {
                opacity: 0.8,
                bg: "prevNextButtons.hoverBg",
              },
            }}
            onClick={() => {
              handleRepoClick(next);
            }}
          >
            <Box
              sx={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                alignItems: "flex-start",
                overflow: "hidden",
              }}
            >
              <Text
                as="p"
                sx={{
                  fontSize: "11px",
                  color: "prevNextButtons.prevText",
                }}
              >
                Next
              </Text>
              <Text
                as="p"
                sx={{
                  fontSize: "15px",
                  fontWeight: 500,
                  overflow: "hidden",
                  maxWidth: "100%",
                  textOverflow: "ellipsis",
                  whiteSpace: "pre",
                  color: "prevNextButtons.title",
                }}
              >
                {next.name}
              </Text>
            </Box>
            <ArrowRightIcon size={24} color={"prevNextButtons.arrow"} />
          </Box>
        </LinkWithoutPrefetch>
      ) : null}
    </Box>
  );
};

export default PrevNextButtons;
