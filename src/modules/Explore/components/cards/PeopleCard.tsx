import { Box, Avatar, Text, Button, Label } from "@primer/react";
function PeopleCard(props) {
  return (
    <Box //default-card
      // display={"flex"}
      // flexDirection="column"
      // justifyContent={"center"}
      // alignItems="center"
      padding={"16px"}
      width={["360px", "360px", "600px", "600px"]}
      height={["144px", "144px", "152px", "152px"]}
      boxShadow="0px 1px 0px rgba(27, 31, 35, 0.04)"
      borderRadius="6px"
      borderWidth="1px"
      mt="30px"
      borderStyle="solid"
    >
      <Box //studio_desktop
        display={"flex"}
        flexDirection="column"
        alignItems={"flex-start"}
        padding="0px"
        width={["360px", "360px", "568px", "568px"]}
        height="120px"
        flex={"none"}
        order="0"
        alignSelf={"stretch"}
        flexGrow="0"
      >
        <Box //main
          display={"flex"}
          flexDirection="column"
          alignItems="flex-end"
          padding={"0px"}
          width={["360px", "360px", "568px", "568px"]}
          height={"120px"}
          flex="none"
          order={0}
          alignSelf="stretch"
          flexGrow={0}
        >
          <Box //upper
            display={"flex"}
            flexDirection="row"
            justifyContent={"space-between"}
            alignItems="flex-start"
            padding={"0px"}
            width={["360px", "360px", "560px", "560px"]}
            height={"70px"}
            flex="none"
            order={0}
            alignSelf="stretch"
            flexGrow={0}
          >
            <Box //frame22
              display={"flex"}
              flexDirection="row"
              alignItems={"flex-start"}
              padding="0px"
              width="277px"
              height={"70px"}
              flex="none"
              order={0}
              flexGrow="0"
            >
              <Avatar
                square
                size={64}
                src={
                  props.url || "https://bip.so/static/media/logo.842fade0.svg"
                }
              />
              <Box //Frame19
                display={"flex"}
                flexDirection="column"
                alignItems={"flex-start"}
                padding="0px"
                width="189px"
                height={"70px"}
                flex="none"
                order={1}
                flexGrow="0"
              >
                <Box //Frame17
                  display={"flex"}
                  flexDirection="column"
                  alignItems={"flex-start"}
                  padding="0px"
                  width="54px"
                  height={"40px"}
                  flex="none"
                  order={0}
                  flexGrow="0"
                  ml="16px"
                >
                  <Text
                    fontStyle={"normal"}
                    fontWeight={600}
                    fontSize="16px"
                    lineHeight={"24px"}
                    whiteSpace="nowrap"
                  >
                    {props.firstName + props.lastName || "Bip User"}
                  </Text>
                  <Text
                    fontStyle={"normal"}
                    fontWeight={400}
                    fontSize="14px"
                    lineHeight={"20px"}
                    mt={"5px"}
                  >
                    @{props.handle}
                  </Text>
                </Box>
                <Text //Workspace for communities
                  sx={{
                    width: "189px",
                    height: "14px",
                    flex: "none",
                    order: 1,
                    flexGrow: 0,
                    mt: "20px",
                    ml: "16px",
                  }}
                  fontStyle={"normal"}
                  fontWeight={400}
                  fontSize="14px"
                  lineHeight={"20px"}
                >
                  {props.bio}
                </Text>
              </Box>
            </Box>
            <Box //follow-button
            >
              <Button
                sx={{
                  marginLeft: ["-30px", "-30px", "00px", "00px"],
                  marginRight: ["300px", "200px", "00px", "00px"],
                  color: "text.green",
                  // display:'flex',
                  // flexDirection:'column',
                  // alignItems:'center',
                  // padding:0,
                  // width:'76px',
                  // height:'32px',
                  fontWeight: "600",
                  // border:'1px solid rgba(27, 31, 36, 0.15)',
                  // borderRadius : '6px',
                  // flex : 'none',
                  // flexGrow :'0'
                }}
              >
                Follow
              </Button>
            </Box>
          </Box>
          <Box //lower
            display={"flex"}
            flexDirection={"row"}
            justifyContent="space-between"
            alignItems={"center"}
            padding="0px 0px 0px 88px"
            width={["360px", "360px", "568px", "568px"]}
            height={"26px"}
            flex="none"
            order={1}
            alignSelf="stretch"
            flexGrow={0}
            mr="200px"
            mt="15px"
            ml="-10px"
          >
            <Box //followers
              display={"flex"}
              flexDirection={"row"}
              justifyContent="space-between"
              alignItems={"flex-start"}
              padding="2px"
              width="102px"
              height={"14px"}
              flex="none"
              marginLeft={["-80px", "-80px", "0px", "0px"]}
              order={0}
              flexGrow={0}
            >
              <Text
                fontStyle={"normal"}
                fontWeight={400}
                fontSize="14px"
                lineHeight={"20px"}
                sx={{
                  width: "34px",
                  height: "14px",
                  flex: "none",
                  order: 0,
                  flexGrow: 0,
                }}
              >
                1000
              </Text>
              <Text
                fontStyle={"normal"}
                fontWeight={400}
                fontSize="14px"
                lineHeight={"20px"}
                sx={{
                  color: "text.grayUltraLight",
                  width: "63px",
                  height: "14px",
                  flex: "none",
                  order: 1,
                  flexGrow: 0,
                }}
              >
                Followers
              </Text>
            </Box>
            <Box //followers
              display={"flex"}
              flexDirection={"row"}
              justifyContent="space-between"
              alignItems={"flex-start"}
              padding="2px"
              width="102px"
              height={"14px"}
              flex="none"
              marginRight={["140px", "140px", "250px", "250px"]}
              order={0}
              flexGrow={0}
            >
              <Text
                fontStyle={"normal"}
                fontWeight={400}
                fontSize="14px"
                lineHeight={"20px"}
                sx={{
                  width: "34px",
                  height: "14px",
                  flex: "none",
                  order: 0,
                  flexGrow: 0,
                }}
              >
                1000
              </Text>
              <Text
                fontStyle={"normal"}
                fontWeight={400}
                fontSize="14px"
                lineHeight={"20px"}
                sx={{
                  color: "text.grayUltraLight",
                  width: "63px",
                  height: "14px",
                  flex: "none",
                  order: 1,
                  flexGrow: 0,
                }}
              >
                Following
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default PeopleCard;
