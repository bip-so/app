import React, {
  FC,
  MutableRefObject,
  useCallback,
  useEffect,
  useState,
} from "react";
import { createEditor, Editor, Text } from "slate";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-java";
import "prismjs/components/prism-markdown";
import { Slate, Editable, withReact } from "slate-react";
import { v4 as uuidv4 } from "uuid";
import Element from "./blocks/Element";
import Leaf from "./blocks/Leaf";
import { getLength } from "../utils";
import { withCustomInlineVoid, withParentRef } from "../slatePlugins";
import useRefDimensions from "../../../hooks/useRefDimensions";
import TableOfContents from "../../../components/TableOfContents";
import { Box } from "@primer/react";
import CanvasTitle from "../../../components/CanvasTitle";
import {
  FIND_MULTIPLE_EMAIL_REGEX,
  FIND_MULTIPLE_LINK_REGEX,
} from "../../../utils/Constants";
import { getHttpLink } from "../../../utils/Common";
import { ALLOWED_LANGUAGES } from "../constants";

// prism token
Prism.languages.markdown=Prism.languages.extend("markup",{}),
Prism.languages.insertBefore("markdown","prolog",{
  blockquote:{pattern:/^>(?:[\t ]*>)*/m,alias:"punctuation"},
  code:[{pattern:/^(?: {4}|\t).+/m,alias:"keyword"},{pattern:/``.+?``|`[^`\n]+`/,alias:"keyword"}],
  hr:{pattern:/(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,lookbehind:!0,alias:"punctuation"},
  "url-reference":{pattern:/!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
  inside:{variable:{pattern:/^(!?\[)[^\]]+/,lookbehind:!0},
  string:/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
  punctuation:/^[\[\]!:]|[<>]/},alias:"url"},
  bold:{pattern:/(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^\*\*|^__|\*\*$|__$/}},
  italic:{pattern:/(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^[*_]|[*_]$/}},
  url:{pattern:/!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,
  inside:{variable:{pattern:/(!?\[)[^\]]+(?=\]$)/,lookbehind:!0},
  string:{pattern:/"(?:\\.|[^"\\])*"(?=\)$)/}}}}),
  Prism.languages.markdown.bold.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.italic.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.bold.inside.italic=Prism.util.clone(Prism.languages.markdown.italic),Prism.languages.markdown.italic.inside.bold=Prism.util.clone(Prism.languages.markdown.bold); // prettier-ignore

interface ViewOnlyEditorProps {
  blocks: any[];
  parentRef?: MutableRefObject<any>;
  origin: string;
  shouldShowTOC?: boolean;
  withCanvasTitle?: boolean;
  renderActions?: () => JSX.Element;
}

const ViewOnlyEditor: FC<ViewOnlyEditorProps> = (props) => {
  const {
    blocks,
    parentRef,
    shouldShowTOC = false,
    withCanvasTitle = false,
    origin,
    renderActions,
  } = props;
  const [editor] = useState(
    withCustomInlineVoid(withParentRef(withReact(createEditor()), parentRef))
  );

  const { isXtraSmall, isSmall, isLarge, isXtraLarge } =
    useRefDimensions(parentRef);

  useEffect(() => {
    if (blocks?.length) {
      editor.children = blocks;
      editor.onChange();
    }
  }, [blocks]);

  const renderElement = useCallback(
    (elementProps: any) => (
      <Element
        viewOnly={true}
        data={{
          origin: origin,
        }}
        {...elementProps}
        isReadOnly
      />
    ),
    [blocks, origin]
  );

  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

  const decorate = useCallback(([node, path]) => {
    const ranges = [];
    if (node.type == "code") {
      let text: string = "";
      node.children.forEach((child) => {
        text += child.text;
      });
      console.log(text);
      const tokens = Prism.tokenize(
        text,
        Prism.languages[
          node.attributes?.codeLanguage
            ? ALLOWED_LANGUAGES.includes(node.attributes?.codeLanguage)
              ? node.attributes?.codeLanguage
              : "markdown"
            : "js"
        ]
      );
      let start = 0;
      for (const token of tokens) {
        const length = getLength(token);
        const end = start + length;

        if (typeof token !== "string") {
          ranges.push({
            [token.type]: true,
            anchor: { path, offset: start },
            focus: { path, offset: end },
          });
        }

        start = end;
      }
    }
    // Markdown-preview
    if (!Text.isText(node)) {
      return ranges;
    }

    const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
    let start = 0;
    for (const token of tokens) {
      const length = getLength(token);
      const end = start + length;

      if (typeof token !== "string" && token?.type !== "code") {
        ranges.push({
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        });
      }
      start = end;
    }

    if (path.length === 2) {
      const matches = node.text?.matchAll(FIND_MULTIPLE_LINK_REGEX) ?? [];
      let i = 0;
      for (const link of matches) {
        let start = link.index;
        let end = start + link[0].length;
        ranges.push({
          anchor: { path, offset: start },
          focus: { path, offset: end },
          link: getHttpLink(link[0]),
        });
        i++;
      }

      const emailMatches = node.text?.matchAll(FIND_MULTIPLE_EMAIL_REGEX) ?? [];
      i = 0;
      for (const link of emailMatches) {
        let start = link.index;
        let end = start + link[0].length;
        ranges.push({
          anchor: { path, offset: start },
          focus: { path, offset: end },
          link: getHttpLink("mailto: " + link[0]),
        });
        i++;
      }
    }

    return ranges;
  }, []);

  const initialValue = [
    {
      type: "",
      uuid: uuidv4(),
      rank: 0,
      children: [
        {
          text: "",
        },
      ],
    },
  ];

  return (
    <div
      style={{
        paddingLeft: isXtraSmall ? "8px" : isSmall ? "32px" : "96px",
        paddingRight: isXtraSmall ? "8px" : isSmall ? "32px" : "96px",
        marginBottom: withCanvasTitle ? "320px" : "0px",
      }}
    >
      <Slate editor={editor} value={initialValue}>
        <Box display={"flex"} className="justify-center flex-1">
          <Box
            sx={{
              maxWidth: isXtraLarge
                ? "800px"
                : origin === "reel"
                ? "100%"
                : "600px",
              marginRight: isLarge || isXtraLarge ? "270px" : "",
            }}
            className="flex-1"
          >
            {withCanvasTitle && (
              <div contentEditable={false}>
                <CanvasTitle viewOnly={true} />
              </div>
            )}
            <Editable
              scrollSelectionIntoView={() => {}}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              decorate={decorate}
              readOnly={true}
            />

            {renderActions ? renderActions() : null}
          </Box>
        </Box>
      </Slate>

      {shouldShowTOC && (isLarge || isXtraLarge) ? (
        <TableOfContents blocks={blocks} editor={editor} defaultPinned={true} />
      ) : null}
    </div>
  );
};

export default ViewOnlyEditor;
