import { Box } from "@primer/react";
import React, { FC, useEffect, useMemo } from "react";
import { createEditor, Transforms } from "slate";
import { withHistory } from "slate-history";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";

interface PostsEditorProps {
  blocks?: any[];
  onChange?: (values: any[]) => void;
  readOnly?: boolean;
  editor: ReactEditor;
  onFocus?: () => void;
  onBlur?: () => void;
}

const initialValue: any = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const PostsEditor: FC<PostsEditorProps> = (props) => {
  const { onChange, editor, readOnly, blocks, onFocus, onBlur } = props;

  useEffect(() => {
    if (blocks?.length) {
      editor.children = blocks;
      editor.onChange();
    }
  }, []);

  const deselectEditor = () => {
    Transforms.deselect(editor);
  };

  useEffect(() => {
    return () => deselectEditor();
  }, []);

  return (
    <Box display={"flex"} flex={1}>
      <Box width={"100%"}>
        <Slate editor={editor} value={initialValue} onChange={onChange}>
          <Editable
            placeholder="Post questions, discussions, announcements..."
            readOnly={readOnly}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </Slate>
      </Box>
    </Box>
  );
};

export default PostsEditor;
