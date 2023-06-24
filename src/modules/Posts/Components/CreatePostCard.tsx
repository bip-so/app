import { GlobeIcon, TriangleDownIcon } from "@primer/octicons-react";
import {
  ActionList,
  ActionMenu,
  AnchoredOverlay,
  Avatar,
  AvatarPair,
  Box,
  Button,
  Text,
  Textarea,
  TextInput,
  Tooltip,
  useOnOutsideClick,
  useTheme,
} from "@primer/react";
import { SearchIcon } from "@primer/styled-octicons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createEditor, Editor, Transforms } from "slate";
import { withHistory } from "slate-history";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";
import {
  AVATAR_PLACEHOLDER,
  GITHUB_AVATAR_PLACEHOLDER,
} from "../../../commons/constants";
import ImageWithName from "../../../components/ImageWithName";
import { useStudio } from "../../../context/studioContext";
import { useUser } from "../../../context/userContext";
import Colors from "../../../utils/Colors";
import { StudioType } from "../../Studio/types";
import { CreatePostType } from "../types";
import PostsEditor from "./PostsEditor";
import PostToMenu from "./PostToMenu";

interface CreatePostCardProps {
  createPost: (
    payload: CreatePostType,
    resetEditor?: () => void,
    studio?: StudioType | null
  ) => void;
  creatingPost?: boolean;
}

const initialValue: any = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const CreatePostCard: React.FunctionComponent<CreatePostCardProps> = (
  props
) => {
  const { createPost, creatingPost } = props;

  const editor: ReactEditor = useMemo(
    () => withHistory(withReact(createEditor())),
    []
  );
  const [values, setValues] = useState(() => initialValue);

  const { user: currentUser } = useUser();
  const { studios, currentStudio } = useStudio();
  const { colorMode } = useTheme();

  const [searchName, setSearchName] = useState("");
  const [selectedStudio, setSelectedStudio] = useState(
    (): StudioType | null => null
  );

  const [showPostButtons, setShowPostButtons] = useState(false);
  const boxRef = useRef(null);

  const filteredStudios = useMemo(() => {
    const filStudios = studios.filter((studio) => !studio.isPersonalSpace);
    if (searchName.trim().length) {
      return filStudios?.filter((studio) =>
        studio.displayName.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    return filStudios;
  }, [studios, searchName]);

  useEffect(() => {
    const filStudios = studios.filter((studio) => !studio.isPersonalSpace);
    if (filStudios?.length) {
      setSelectedStudio(filStudios[0]);
    }
  }, [studios]);

  const isEmptyEditor = useMemo(() => {
    if (editor?.children?.length) {
      let text = "";
      editor.children.forEach((elm: any) => {
        text = text + elm.children[0].text;
      });
      return text.trim().length === 0;
    }
    return true;
  }, [values]);

  const postHandler = () => {
    const data: CreatePostType = {
      attributes: {},
      children: { blocks: JSON.stringify(editor.children) },
      isPublic: true,
      roleIds: [],
    };
    createPost(data, resetData, selectedStudio);
  };

  const resetData = () => {
    Transforms.delete(editor, {
      at: {
        anchor: Editor.start(editor, []),
        focus: Editor.end(editor, []),
      },
    });
    setSearchName("");
    setShowPostButtons(false);
  };

  useOnOutsideClick({
    onClickOutside: () => {
      setShowPostButtons(false);
    },
    containerRef: boxRef,
  });

  return (
    <Box //composer
      border={"1px solid"}
      borderColor={"postInFeed.border"}
      borderRadius={"12px"}
      padding={"16px"}
      bg={"postInFeed.cardBg"}
      sx={{
        width: ["360px", "500px", "600px", "600px"],
      }}
      minHeight={"64px"}
      ref={boxRef}
    >
      <Box display={"flex"} sx={{ gap: "6px" }}>
        <Box width={"40px"} position={"sticky"}>
          <AvatarPair>
            <Avatar
              sx={{ height: "32px", width: "32px" }}
              src={currentUser?.avatarUrl || AVATAR_PLACEHOLDER}
            />
            {/* <Avatar
              sx={{ height: "13px", width: "13px" }}
              src={GITHUB_AVATAR_PLACEHOLDER}
            /> */}
          </AvatarPair>
        </Box>

        <PostsEditor
          editor={editor}
          onChange={(values) => {
            setValues(values);
          }}
          onFocus={() => {
            setShowPostButtons(true);
          }}
        />
      </Box>

      {showPostButtons ? (
        <Box display={"flex"} justifyContent={"space-between"} mt="60px">
          <Box>
            {currentStudio?.id ? null : (
              <ActionMenu>
                <ActionMenu.Button
                  sx={{
                    cursor: "pointer",
                    color: "postInFeed.text",
                    borderColor: "postInFeed.border",
                    ":focus:not([disabled])": { boxShadow: "none" },
                  }}
                >
                  {selectedStudio
                    ? selectedStudio.displayName
                    : "Select Studio"}
                </ActionMenu.Button>
                <ActionMenu.Overlay width="medium">
                  <Box sx={{ margin: "8px" }}>
                    <TextInput
                      sx={{
                        border: "1px solid",
                        borderColor: "postInFeed.border",
                        boxShadow: "none",
                        height: "28px",
                        width: "100%",
                        bg: "transparent",
                        color: "text.grayUltraLight",
                        "input::placeholder": { color: "text.gray" },
                      }}
                      leadingVisual={() => <SearchIcon color={"text.gray"} />}
                      aria-label="Studios"
                      name="Studios"
                      placeholder="Choose a workspace"
                      value={searchName}
                      onChange={(e) =>
                        setSearchName(e.target.value.toLowerCase())
                      }
                    />
                  </Box>
                  <ActionList
                    selectionVariant="single"
                    sx={{ maxHeight: "400px", overflowY: "overlay" }}
                  >
                    {filteredStudios.map((studio) => (
                      <ActionList.Item
                        key={studio.id}
                        selected={selectedStudio?.id === studio.id}
                        onSelect={() => {
                          setSelectedStudio(studio);
                        }}
                        sx={{ alignItems: "center" }}
                      >
                        <Box display={"flex"} alignItems={"center"}>
                          <ImageWithName
                            sx={{
                              width: "32px",
                              height: "32px",
                              color:
                                colorMode === "day" ? Colors.gray["500"] : "",
                            }}
                            src={studio.imageUrl}
                            name={studio.displayName}
                          />
                          <Text
                            as="p"
                            sx={{
                              fontSize: "16px",
                              ml: "6px",
                              color: "postInFeed.textLight",
                            }}
                          >
                            {studio.displayName}
                          </Text>
                        </Box>
                      </ActionList.Item>
                    ))}
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            )}
          </Box>

          <Box display={"flex"} alignItems={"center"} sx={{ gap: "16px" }}>
            {!isEmptyEditor && (
              <Button
                variant="invisible"
                onClick={resetData}
                sx={{
                  px: 1,
                  width: "63px",
                  ":focus:not([disabled])": { boxShadow: "none" },
                  color: "postInFeed.textLight",
                }}
                disabled={creatingPost}
              >
                Cancel
              </Button>
            )}
            {currentStudio?.id && !currentStudio?.isJoined ? (
              <Tooltip aria-label="Please join Workspace to post">
                <Button
                  disabled={true}
                  variant="primary"
                  sx={{
                    borderColor: "postInFeed.border",
                    ":focus:not([disabled])": { boxShadow: "none" },
                  }}
                >
                  Post
                </Button>
              </Tooltip>
            ) : (
              <Button
                onClick={postHandler}
                disabled={isEmptyEditor || creatingPost}
                variant="primary"
                sx={{
                  borderColor: "postInFeed.border",
                  ":focus:not([disabled])": { boxShadow: "none" },
                }}
              >
                Post
              </Button>
            )}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export default CreatePostCard;
