import { Box, Text } from "@primer/react";
import { prependOnceListener } from "process";
import { Transforms, Range } from "slate";
import { useReadOnly, useSelected, useSlateStatic } from "slate-react";
import Colors from "../../../../../utils/Colors";
import { ALLOWED_LANGUAGES } from "../../../constants";

interface ICodeProps {}

const Code: React.FunctionComponent = ({
  attributes,
  children,
  actions,
  element,
}: any) => {
  const editor = useSlateStatic();
  const selected = useSelected();
  const readOnly = useReadOnly();

  const setCodeLanguage = (e) => {
    let attributes = {
      ...element.attributes,
      codeLanguage: e.target.value,
    };
    Transforms.setNodes(
      editor,
      {
        attributes: attributes,
      },
      {
        at: [],
        match: (node, _) => node.uuid === element.uuid,
      }
    );
  };
  const renderedJSX = (
    <Box
      {...attributes}
      sx={{
        margin: "2px 0px 0px 0px !important",
        fontSize: "14px",
        fontWeight: "500",
        lineHeight: "24px",
        color: "codeBlock.text",
        bg: "codeBlock.bg",
        padding: "16px",
        caretColor: "codeBlock.text",
      }}
    >
      <pre
        style={{
          margin: "0px",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}
      >
        <code style={{ fontFamily: "monospace" }}>{children}</code>
      </pre>
    </Box>
  );

  return (
    <>
      <div
        contentEditable={false}
        style={{ userSelect: "none", position: "relative" }}
      >
        <select
          value={
            ALLOWED_LANGUAGES.includes(element.attributes?.codeLanguage)
              ? element.attributes?.codeLanguage
              : "markdown"
          }
          onChange={(e) => setCodeLanguage(e)}
          style={{
            userSelect: "none",
            borderRadius: "4px",
            background: "transparent",
            color: Colors.gray["500"],
            fontSize: "12px",
            position: "absolute",
            right: "4px",
            top: "4px",
            cursor: "pointer",
          }}
          disabled={readOnly}
        >
          <option value="js">JavaScript</option>
          <option value="css">CSS</option>
          <option value="html">HTML</option>
          <option value="python">Python</option>
          <option value="sql">SQL</option>
          <option value="java">Java</option>
          <option value="markdown">Others(md)</option>
        </select>
      </div>
      {renderedJSX}
      {editor.selection &&
        selected &&
        Range.isCollapsed(editor.selection) &&
        !readOnly && (
          <div contentEditable={false}>
            <Text
              color="codeBlock.hintText"
              fontSize={10}
              style={{
                float: "right",
                height: 0,
              }}
            >
              ⏎ (Enter) for new block, (shift + enter) for new line
            </Text>
          </div>
        )}
    </>
  );
};

export default Code;
