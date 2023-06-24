import { Avatar, Box, Button, Text } from "@primer/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CommentDiscussionIcon,
} from "@primer/styled-octicons";
import { StarFillIcon } from "@primer/octicons-react";
import React, { FC, useMemo, useState } from "react";
import { DEFAULT_USER_PLACEHOLDER } from "../../../commons/constants";
import { USER_FEEDBACKS } from "../../../core/feedbacks";
import CapterraIcon from "../../../icons/testimonials/CapterraIcon";
import { BIP_CAPTERRA_URL } from "../../../core/constants";
CapterraIcon;
interface TestimonialsProps {}

const Testimonials: FC<TestimonialsProps> = (props) => {
  const [selectedFeedback, setSelectedFeedback] = useState(USER_FEEDBACKS[0]);

  const currentIndex = useMemo(() => {
    return USER_FEEDBACKS.findIndex(
      (feed) => feed.name === selectedFeedback.name
    );
  }, [selectedFeedback]);

  const isFirst = useMemo(() => {
    return selectedFeedback.name === USER_FEEDBACKS[0].name;
  }, [selectedFeedback]);

  const isLast = useMemo(() => {
    return (
      selectedFeedback.name === USER_FEEDBACKS[USER_FEEDBACKS.length - 1].name
    );
  }, [selectedFeedback]);

  const RATINGS_LIST = [
    {
      text: "Content Management",
      rating: "5.0",
    },
    {
      text: "Document Management",
      rating: "5.0",
    },
    {
      text: (
        <p>
          Ease <br /> of access
        </p>
      ),
      rating: "4.9",
    },
  ];
  return (
    <Box
      className="w-full"
      sx={{
        bg: "landing.testimonials.bg",
      }}
    >
      <Box
        className="w-11/12 mx-auto"
        marginTop={["5rem", "5rem", "2rem", "2rem"]}
        marginBottom={[0, 0, "2rem", "2rem"]}
        sx={{
          position: "relative",
          overflow: "hidden",
          bg: "landing.testimonials.bg",
        }}
      >
        <Box
          sx={{
            display: "flex",
            height: ["820px", "820px", "700px", "700px"],
            alignItems: ["unset", "unset", "center", "center"],
            flexDirection: ["column", "column", "row", "row"],
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: ["unset", "unset", "35%", "35%"],
              mx: "80px",
              alignItems: ["center", "center", "flex-start", "flex-start"],
            }}
          >
            {/* <CommentDiscussionIcon
              color={"#484F58"}
              sx={{
                width: ["48px", "48px", "64px", "64px"],
                height: ["42px", "42px", "56px", "56px"],
                mt: ["83px", "83px", "0px", "0px"],
              }}
            /> */}
            <Text
              as="p"
              sx={{
                mt: "36px",
                fontSize: ["22px", "22px", "48px", "48px"],
                lineHeight: ["32px", "32px", "72px", "72px"],
                letterSpacing: "-0.008em",
                fontWeight: 600,
                color: "landing.testimonials.text",
                textAlign: ["center", "center", "start", "start"],
              }}
            >
              Users are happy they choose bip
            </Text>
            <Text
              as="p"
              className="text-gray-500"
              sx={{
                mt: ["8px", "8px", "16px", "16px"],
                fontSize: ["13px", "13px", "20px", "20px"],
                lineHeight: ["18px", "18px", "30px", "30px"],
                letterSpacing: "-0.008em",
                textAlign: ["center", "center", "start", "start"],
              }}
            >
              See what they are saying about us
            </Text>
            <Button
              variant="outline"
              leadingIcon={CommentDiscussionIcon}
              sx={{
                alignItems: "center",
                color: "landing.testimonials.text",
                bg: "landing.testimonials.btn.bg",
                mt: ["24px", "24px", "32px", "32px"],
                ":hover:not([disabled])": {
                  color: "landing.testimonials.text",
                  bg: "landing.testimonials.btn.bg",
                },
              }}
              onClick={() => {
                window.open("https://bip.so/bip.so/user-love-11733c");
              }}
            >
              See more testimonials
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              mx: ["auto", "auto", "unset", "unset"],
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bg: "#44B244",
                opacity: isFirst ? 0.5 : 1,
                width: ["32px", "32px", "64px", "64px"],
                height: ["32px", "32px", "64px", "64px"],
                borderRadius: "50%",
                mr: "32px",
                cursor: isFirst ? "default" : "pointer",
              }}
              onClick={() => {
                if (!isFirst) {
                  setSelectedFeedback(USER_FEEDBACKS[currentIndex - 1]);
                }
              }}
            >
              <ChevronLeftIcon color={"#fff"} />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: [
                    "20px",
                    "20px",
                    "48px 28px 24px 28px",
                    "48px 28px 24px 28px",
                  ],
                  width: ["200px", "310px", "320px", "320px"],
                  minHeight: ["262px", "262px", "364px", "364px"],
                  bg: "landing.testimonials.box.bg",
                  borderRadius: "8px",
                  borderTop: "4px solid #59CF59",
                }}
              >
                <Text
                  as="p"
                  sx={{
                    fontSize: ["13px", "13px", "16px", "16px"],
                    lineHeight: ["18px", "18px", "24px", "24px"],
                    color: "landing.testimonials.text",
                  }}
                >
                  {selectedFeedback.feedback}
                </Text>
                <Box sx={{ display: "flex", alignItems: "center", mt: "20px" }}>
                  <Avatar
                    src={selectedFeedback.avatarUrl || DEFAULT_USER_PLACEHOLDER}
                    size={48}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src = DEFAULT_USER_PLACEHOLDER;
                    }}
                  />
                  <Box sx={{ ml: "16px" }}>
                    <Text
                      as="p"
                      sx={{
                        fontWeight: 600,
                        fontSize: ["13px", "13px", "14px", "14px"],
                        lineHeight: ["18px", "18px", "20px", "20px"],
                        color: "landing.testimonials.text",
                      }}
                    >
                      {selectedFeedback.name}
                    </Text>
                    <Text
                      as="p"
                      sx={{
                        fontSize: ["13px", "13px", "14px", "14px"],
                        lineHeight: ["18px", "18px", "20px", "20px"],
                        color: "landing.testimonials.box.subText",
                      }}
                    >
                      {selectedFeedback.company}
                    </Text>
                  </Box>
                </Box>
              </Box>
              <Box
                display={"flex"}
                sx={{ gap: "6px", mt: ["24px", "24px", "48px", "48px"] }}
              >
                {USER_FEEDBACKS.map((item, index) => (
                  <Box
                    key={item.name}
                    sx={{
                      width: ["8px", "8px", "12px", "12px"],
                      height: ["8px", "8px", "12px", "12px"],
                      borderRadius: "50%",
                      cursor: currentIndex === index ? "default" : "pointer",
                      bg: currentIndex === index ? "landing.testimonials.box.subText" : "#DCE1E6",
                    }}
                    onClick={() => {
                      setSelectedFeedback(USER_FEEDBACKS[index]);
                    }}
                  />
                ))}
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bg: "#44B244",
                opacity: isLast ? 0.5 : 1,
                width: ["32px", "32px", "64px", "64px"],
                height: ["32px", "32px", "64px", "64px"],
                borderRadius: "50%",
                ml: "32px",
                cursor: isLast ? "default" : "pointer",
              }}
              onClick={() => {
                if (!isLast) {
                  setSelectedFeedback(USER_FEEDBACKS[currentIndex + 1]);
                }
              }}
            >
              <ChevronRightIcon color={"#fff"} />
            </Box>
          </Box>
        </Box>
        <hr className="w-11/12 mx-auto border-gray-300" />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // color: "#fff",
            width: "90%",
            marginX: "auto",
            marginTop: "60px",
            marginBottom: "92px",
            flexDirection: ["column", "column", "column", "row", "row"],
          }}
        >
          <Box
            sx={{
              display: "flex",
              flex: 1,
              alignItems: "flex-start",
              flexDirection: ["column", "column", "column", "row", "row"],
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginRight: "3rem",
                alignItems: "center",
              }}
            >
              <CapterraIcon />
              <Text
                sx={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  ml: "5px",
                  color: "landing.testimonials.text",
                }}
              >
                Capterra
              </Text>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "2",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  color: "landing.testimonials.text",
                }}
              >
                <Text>4.8 Ratings</Text>
                {/* <Box
                  sx={{
                    width: "2px",
                    marginX: "5px",
                    bg: "grey",
                  }}
                />
                <Text>18 Reviews</Text> */}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: "2",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {[...Array(5)].map((u, i) => (
                    <StarFillIcon fill="#DBAB09" key={i} />
                  ))}
                </Box>

                <a
                  href={BIP_CAPTERRA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    sx={{
                      bg: "landing.testimonials.btn.bg",
                      color: "landing.testimonials.btn.text",
                      // border: "1px solid",
                      // borderColor: "white",
                      boxShadow: "none",
                      marginTop: "2rem",
                      ":hover:not([disabled])": {
                        color: "landing.testimonials.btn.text",
                        bg: "landing.testimonials.btn.bg",
                      },
                    }}
                  >
                    See Ratings
                  </Button>
                </a>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
            }}
          >
            <Text
              as="h4"
              sx={{
                color: "landing.testimonials.text",
                fontWeight: "600",
                fontSize: "18px",
                marginY: "2rem",
                textAlign: ["center", "center", "center", "center", "left"],
              }}
            >
              Some of our ratings
            </Text>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: [
                  "center",
                  "center",
                  "center",
                  "center",
                  "flex-start",
                ],
                flexWrap: "wrap",
                gap: "5",
              }}
            >
              {RATINGS_LIST.map((rating, i) => (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    width: "150px",
                    textAlign: "center",
                    bg: "landing.testimonials.box.bg",
                    borderRadius: "8px",
                    height: "100px",
                  }}
                  key={i}
                >
                  <Box
                    sx={{
                      color: "landing.testimonials.text",
                    }}
                  >
                    <StarFillIcon fill={"#DBAB09"} /> {rating.rating}
                  </Box>
                  <Text
                    sx={{
                      color: "landing.testimonials.text",
                    }}
                  >
                    {rating.text}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Testimonials;
