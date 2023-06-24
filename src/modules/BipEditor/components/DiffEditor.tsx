import React, { useCallback, useEffect, useState } from "react";
import { Editable, Slate, withReact } from "slate-react";
import { createEditor, Text } from "slate";
import { withHistory } from "slate-history";
import Element from "./blocks/Element";
import { withCustomInlineVoid } from "../slatePlugins";
import { v4 as uuidv4 } from "uuid";
import Prism from "prismjs";
import { diff, getLength } from "../utils";
import Leaf from "./blocks/Leaf";
import CanvasTitle from "../../../components/CanvasTitle";
import { Box } from "@primer/react";
import BipLoader from "../../../components/BipLoader";
import { ALLOWED_LANGUAGES } from "../constants";

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

const DiffEditor = (props: any) => {
  const [editor] = useState(
    withCustomInlineVoid(withHistory(withReact(createEditor())))
  );

  const {
    conflicts,
    setConflicts,
    mergeRequest,
    withCanvasTitle = false,
  } = props;

  useEffect(() => {
    const { destinationBlocks = [], sourceBlocks = [] } = props.blocks ?? {};
    const { resultValue, changedBlockIds } = diff(
      destinationBlocks,
      sourceBlocks
    );
    editor.children = resultValue;
    editor.onChange();
    const newChangedBlocksId = changedBlockIds.map((block) => {
      return {
        ...block,
        status: "Unchanged",
      };
    });
    setConflicts(newChangedBlocksId);
  }, [props.blocks]);

  const renderElement = useCallback(
    (elementProps: any) => (
      <Element
        {...elementProps}
        data={{
          readOnly: true,
          ...props.data,
          conflicts,
          mergeRequest,
        }}
        actions={props.actions}
        isReadOnly={true}
      />
    ),
    [conflicts]
  );

  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

  const decorate = useCallback(
    ([node, path]) => {
      const ranges = [];
      if (node.type == "code") {
        let text: string = "";
        node.children.forEach((child) => {
          text += child.text;
        });

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
      // Markdown-preview for blocks only
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
      if (node?.diffPositions) {
        let charPosition = 0;
        for (let i = 0; i < node.children.length; i++) {
          let currentRange = [
            charPosition,
            charPosition +
              (node.children[i]?.mention
                ? node.children[i]?.mention?.text?.length ?? 0
                : node.children[i]?.text?.length),
          ];
          const { text, properties } = node.diffPositions;
          const changedPositions = text.concat(properties);

          for (let j = 0; j < changedPositions.length; j++) {
            const el = changedPositions[j];
            let startOffset = el[0] - charPosition,
              endOffset = el[1] - charPosition;
            if (currentRange[0] <= el[0] && currentRange[1] >= el[1]) {
              ranges.push({
                anchor: {
                  path: [...path, i],
                  offset: startOffset,
                },
                focus: {
                  path: [...path, i],
                  offset: endOffset,
                },
                diff: path[1] === 0 ? "removed" : "added",
              });
            } else if (currentRange[0] <= el[0] && currentRange[1] <= el[1]) {
              ranges.push({
                anchor: {
                  path: [...path, i],
                  offset: startOffset,
                },
                focus: {
                  path: [...path, i],
                  offset: currentRange[1] - charPosition,
                },
                diff: path[1] === 0 ? "removed" : "added",
              });
            } else if (currentRange[0] >= el[0] && currentRange[1] >= el[1]) {
              ranges.push({
                anchor: {
                  path: [...path, i],
                  offset: currentRange[0] - charPosition,
                },
                focus: {
                  path: [...path, i],
                  offset: endOffset,
                },
                diff: path[1] === 0 ? "removed" : "added",
              });
            } else if (currentRange[0] >= el[0] && currentRange[1] <= el[1]) {
              ranges.push({
                anchor: {
                  path: [...path, i],
                  offset: currentRange[0] - charPosition,
                },
                focus: {
                  path: [...path, i],
                  offset: currentRange[1] - charPosition,
                },
                diff: path[1] === 0 ? "removed" : "added",
              });
            }
          }
          charPosition += node.children[i]?.mention
            ? node.children[i]?.mention?.text?.length ?? 0
            : node.children[i]?.text?.length;
        }
      }
      return ranges;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const initialValue: any = [];

  return (
    <div className="mx-auto">
      <Slate editor={editor} value={initialValue} onChange={() => {}}>
        <Box display={"flex"} className="justify-center flex-1">
          <Box
            sx={{
              maxWidth: ["90%", "90%", "600px", "800px"],
            }}
            className="flex-1"
          >
            {withCanvasTitle && (
              <div contentEditable={false}>
                <CanvasTitle
                  viewOnly={true}
                  mergeRequestBranchId={mergeRequest?.branch?.id}
                  mergeRequestRepo={mergeRequest?.canvasRepository}
                />
              </div>
            )}
            {(editor?.children?.length === 0 ||
              props.blocks?.sourceBlocks?.length === 0) && (
              <Box
                sx={{
                  width: ["100%", "100%", "600px", "800px"],
                }}
              >
                <BipLoader />
              </Box>
            )}
            <Editable
              renderElement={renderElement}
              decorate={decorate}
              renderLeaf={renderLeaf}
              readOnly={true}
            />
          </Box>
        </Box>
      </Slate>
    </div>
  );
};

export default DiffEditor;
