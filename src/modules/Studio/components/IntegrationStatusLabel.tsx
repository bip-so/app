import { Box, CircleOcticon, Label, StyledOcticon, Text } from "@primer/react";
import {
  CheckIcon,
  CircleIcon,
  CircleSlashIcon,
} from "@primer/styled-octicons";
import { FC } from "react";
import { IntegrationStatus } from "../../../core/enums";

interface IIntegrationStatusLabelProps {
  status: IntegrationStatus;
}

const IntegrationStatusLabel: FC<IIntegrationStatusLabelProps> = ({
  status,
}) => {
  return (
    <Label
      variant={
        status === IntegrationStatus.PENDING
          ? "severe"
          : status === IntegrationStatus.SUCCESS
          ? "success"
          : "danger"
      }
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box display="flex" alignItems="center">
        {/* <CircleOcticon
          icon={
            status === IntegrationStatus.PENDING
              ? CircleIcon
              : status === IntegrationStatus.SUCCESS
              ? CheckIcon
              : CircleSlashIcon
          }
          size={14}
        /> */}
        <Text
          sx={{
            fontSize: "10px",
          }}
        >
          {status === IntegrationStatus.PENDING ? "IN PROGRESS" : status}
        </Text>
      </Box>
    </Label>
  );
};

export default IntegrationStatusLabel;
