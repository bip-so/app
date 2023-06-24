import { NodeModel, Tree } from "@minoru/react-dnd-treeview";
import { Box } from "@primer/react";
import { FileIcon } from "@primer/styled-octicons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Range } from "slate";
import { ReactEditor, useSelected, useSlateStatic } from "slate-react";
import LinkWithoutPrefetch from "../../../../../components/LinkWithoutPrefetch";
import { useCanvas } from "../../../../../context/canvasContext";
import { PageType, usePages } from "../../../../../context/pagesContext";
import { useStudio } from "../../../../../context/studioContext";
import BipRouteUtils from "../../../../../core/routeUtils";
import CollectionService from "../../../../Collections/services";

function TOC({ element, children, attributes }) {
  const [childrenSubPages, setChildrenSubPages] = useState<PageType[]>([]);
  const [loading, setLoading] = useState(true);
  const { repo } = useCanvas();
  const { pages } = usePages();
  const { currentStudio } = useStudio();
  const { isPublicView } = useCanvas();

  useEffect(() => {
    if (repo) {
      CollectionService.getCanvasRepo(
        {
          parentCollectionID: repo.collectionID,
          parentCanvasRepositoryID: repo.id,
        },
        isPublicView
      )
        .then((response) => {
          // const branches = responses[0]?.data;
          const subCanvases = response.data.data;

          setChildrenSubPages([repo, ...subCanvases]);
          setLoading(false);
        })
        .catch((err) => {
          console.log("Error fetching branches,subcanvases");
          setLoading(false);
        });
    }

    return () => {
      setLoading(true);
      setChildrenSubPages([]);
    };
  }, [repo]);

  const renderedJSX = (
    <Box contentEditable={false} sx={{ padding: "8px", bg: "TOCBlock.bg" }}>
      <Box
        sx={{
          marginBottom: "8px",
          color: "TOCBlock.textColor",
          //borderBottom: '1px dotted #8d8d8d',
          paddingBottom: "4px",
          fontWeight: 600,
        }}
      >
        Sub-canvases list
      </Box>
      {childrenSubPages.length > 0 && (
        <Tree
          tree={childrenSubPages as NodeModel[]}
          rootId={repo.id}
          render={(node: any, { depth, isOpen, onToggle }: any) => {
            return (
              <div
                style={{
                  marginLeft: 24 * depth,
                  marginBottom: 8,
                }}
              >
                <LinkWithoutPrefetch
                  href={BipRouteUtils.getCanvasRoute(
                    currentStudio?.handle!,
                    node.name,
                    node.defaultBranchID
                  )}
                  passHref
                  style={{
                    color: "TOCBlock.textColor",
                    //borderBottom: '1px dotted #8d8d8d',
                    paddingBottom: 4,
                  }}
                >
                  <Box
                    as={"span"}
                    sx={{ color: "TOCBlock.textColor", cursor: "pointer" }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        marginRight: 4,
                        width: 20,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {node.icon ? node.icon : <FileIcon />}
                    </span>
                    {node.name}
                  </Box>
                </LinkWithoutPrefetch>
              </div>
            );
          }}
          onDrop={() => {}}
          canDrop={() => false}
          canDrag={() => false}
          classes={{
            placeholder: "relative",
          }}
          sort={false}
          insertDroppableFirst={false}
          initialOpen={childrenSubPages.map((page) => page.id)}
        />
      )}
      {!loading && childrenSubPages.length === 0 && (
        <div
          style={{
            color: "TOCBlock.textColor",
          }}
        >
          <span style={{ fontStyle: "italic" }}>No sub-canvases found</span>
        </div>
      )}
      {loading && childrenSubPages.length === 0 && (
        <div
          style={{
            color: "TOCBlock.textColor",
          }}
        >
          <span style={{ fontStyle: "italic" }}>Loading...</span>
        </div>
      )}
    </Box>
  );

  return (
    <div
      {...attributes}
      style={{
        display: "inline-block",
        width: "95%",
        margin: "0px 1px",
        cursor: "auto",
      }}
      contentEditable={false}
    >
      {renderedJSX}
      {children}
    </div>
  );
}

export default TOC;
