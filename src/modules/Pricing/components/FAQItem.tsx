import { Box, IconButton, Text } from "@primer/react";
import { DotFillIcon, PlusIcon, XIcon } from "@primer/styled-octicons";
import React, { FC, useState } from "react";

interface FAQItemProps {
  question: string;
  answer: string;
  bulletPoints?: string[];
  answerAfterPoints?: string;
  tableRows?: string[][];
  defaultOpen?: boolean;
}

const FAQItem: FC<FAQItemProps> = (props) => {
  const {
    question,
    answer,
    bulletPoints,
    answerAfterPoints,
    tableRows,
    defaultOpen,
  } = props;
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", cursor: "pointer" }}
      onClick={() => {
        setOpen(!open);
      }}
      >
        <Box sx={{ display: "flex", flex: 1 }}>
          <Text
            as="p"
            sx={{
              fontWeight: 600,
              fontSize: ["13px", "13px", "16px", "16px"],
              lineHeight: ["18px", "18px", "24px", "24px"],
              color: "landing.faq.faqItem.question",
            }}
          >
            {question}
          </Text>
        </Box>
        <IconButton
          icon={open ? XIcon : PlusIcon}
          size="small"
          sx={{
            bg: "landing.faq.faqItem.icon.bg",
            border: "1px solid rgba(27, 31, 36, 0.15)",
            borderColor: "rgba(27, 31, 36, 0.15)",
            color: "landing.faq.faqItem.icon.text",
            ":hover:not([disabled])": {
              bg: "landing.faq.faqItem.icon.bg",
              border: "1px solid rgba(27, 31, 36, 0.15)",
              borderColor: "rgba(27, 31, 36, 0.15)",
              color: "landing.faq.faqItem.icon.text",
            },
          }}
        />
      </Box>
      <Text
        as="p"
        sx={{
          fontSize: ["13px", "13px", "16px", "16px"],
          lineHeight: ["18px", "18px", "24px", "24px"],
          color: "landing.faq.faqItem.answer",
          mt: "16px",
          display: open ? "block" : "none",
        }}
      >
        {answer}
      </Text>
      {tableRows?.length ? (
        <Box
          sx={{
            width: ["350px", "350px", "350px", "100%"],
            overflowX: "scroll",
            mt: "16px",
            display: open ? "flex" : "none",
          }}
        >
          <table>
            <tbody>
              {tableRows.map((tRow) => (
                <tr key={tRow[0]} style={{ border: "1px solid #000" }}>
                  {tRow.map((tData, index) => (
                    <td
                      key={tData + index}
                      style={{
                        color: "#000",
                        borderRight: "1px solid #000",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tData}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      ) : null}

      {bulletPoints?.length ? (
        <Box
          sx={{
            display: open ? "flex" : "none",
            flexDirection: "column",
            gap: "8px",
            mt: "16px",
          }}
        >
          {bulletPoints.map((point) => (
            <Box
              display={"flex"}
              ml={"8px"}
              alignItems={"flex-start"}
              key={point}
            >
              <DotFillIcon
                size={12}
                sx={{ mt: ["4px", "4px", "6px", "6px"] }}
              />
              <Text
                as="p"
                sx={{
                  ml: "8px",
                  fontSize: ["13px", "13px", "16px", "16px"],
                  lineHeight: ["18px", "18px", "24px", "24px"],
                  color: "landing.faq.faqItem.answer",
                }}
              >
                {point}
              </Text>
            </Box>
          ))}
        </Box>
      ) : null}
      {answerAfterPoints ? (
        <Text
          as="p"
          sx={{
            fontSize: ["13px", "13px", "16px", "16px"],
            lineHeight: ["18px", "18px", "24px", "24px"],
            color: "landing.faq.faqItem.answer",
            mt: "16px",
            display: open ? "block" : "none",
          }}
        >
          {answerAfterPoints}
        </Text>
      ) : null}
      <Box sx={{ height: "1px", bg: "#D0D7DE", my: "16px" }} />
    </Box>
  );
};

export default FAQItem;
