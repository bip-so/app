import { useEffect, useRef, useState } from "react";

import useSWR from "swr";
import { Box, IconButton, Text, Truncate } from "@primer/react";
import { useStudio } from "../../../context/studioContext";
import { CanvasBranchService } from "../../Canvas/services";
import BlocksService from "../services";
import BipLoader from "../../../components/BipLoader";
import ViewOnlyEditor from "./ViewOnlyEditor";
import { usePreviewEditor } from "../../../context/previewEditorContext";
import {
  CopyIcon,
  FileIcon,
  LinkExternalIcon,
  XIcon,
} from "@primer/styled-octicons";
import { useToasts } from "react-toast-notifications";
import { AxiosError } from "axios";
import { HttpStatusCode } from "../../../commons/enums";
import RequestAccess from "../../../components/RequestAccess";
import CanvasNotFound from "../../../components/CanvasNotFound";
import { init } from "@sentry/nextjs";

interface IPreviewEditorProps {
  repoName: string;
  repoId: number;
  branchId: number;
  url: string;
}

const PreviewEditor = (props: IPreviewEditorProps) => {
  const { repoName, branchId, url } = props;
  const { currentStudio } = useStudio();
  const { setPreviewEditorData } = usePreviewEditor();
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [hasExistingRequest, setHasExistingRequest] = useState<boolean>(false);

  const handle = currentStudio?.handle;

  const editorContainerRef = useRef<HTMLDivElement>();

  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts();

  useEffect(() => {
    const init = async (branchId: number) => {
      setLoading(true);
      try {
        await CanvasBranchService.getBranch(branchId);
      } catch (error) {
        console.log(error);
        //branch error
        const err = error as AxiosError;
        if (err.status) {
          console.log(err);
          const apiStatus = parseInt(err.status);
          if (apiStatus === HttpStatusCode.FORBIDDEN) {
            setHasExistingRequest(err.data.access_requested);
            setIsPrivate(true);
          } else if (
            apiStatus === HttpStatusCode.BAD_REQUEST ||
            apiStatus === HttpStatusCode.NOT_FOUND
          ) {
            setIsNotFound(true);
          }
        }
      }

      try {
        const resp = await BlocksService.getBlocks(branchId);
        setBlocks(resp.data.data);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    };
    init(branchId);
  }, [branchId]);

  return (
    <>
      <>
        <div ref={editorContainerRef}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 8px 4px",
              borderBottom: "1px solid",
              borderBottomColor: "previewEditor.headerBorder",
              position: "sticky",
              top: "0px",
              bg: "previewEditor.headerBg",
              zIndex: 1,
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
          >
            <Text
              sx={{ fontWeight: 500, display: "flex", alignItems: "center" }}
            >
              <FileIcon color={"text.muted"} />
              <Truncate
                title={repoName}
                sx={{ marginLeft: "8px", color: "previewEditor.canvasTitle" }}
              >
                {repoName}
              </Truncate>
            </Text>
            <Box sx={{ display: "inline-flex", gap: "4px" }}>
              <IconButton
                variant="invisible"
                icon={CopyIcon}
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + url);
                  addToast("Copied link to clipboard", {
                    appearance: "success",
                    autoDismiss: true,
                  });
                }}
                sx={{ color: "text.muted", padding: "2px 4px" }}
              />
              <IconButton
                variant="invisible"
                icon={LinkExternalIcon}
                size="small"
                onClick={() => {
                  window.open(url, "_blank");
                }}
                sx={{ color: "text.muted", padding: "2px 4px" }}
              />
              <IconButton
                variant="invisible"
                icon={XIcon}
                size="small"
                onClick={() => {
                  setPreviewEditorData(null);
                  setBlocks([]);
                }}
                sx={{ color: "text.muted", padding: "2px 4px" }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              overflowY: "scroll",
              height: "560px",
              maxHeight: "80vh",
              paddingLeft: "4px",
              paddingBottom: "120px",
              paddingTop: "16px",
              bg: "previewEditor.bg",
            }}
          >
            {loading && <BipLoader sx={{ marginTop: "120px" }} />}
            {!isPrivate && !isNotFound && blocks && (
              <ViewOnlyEditor
                blocks={blocks}
                parentRef={editorContainerRef}
                withCanvasTitle={false}
              />
            )}
            {isPrivate && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: "80px",
                }}
              >
                <RequestAccess
                  branchId={branchId}
                  hasExistingRequest={hasExistingRequest}
                  setHasExistingRequest={setHasExistingRequest}
                />
              </Box>
            )}
            {isNotFound && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: "80px",
                }}
              >
                <CanvasNotFound />
              </Box>
            )}
          </Box>
        </div>
      </>
    </>
  );
};

export default PreviewEditor;
