import React, { FC, useEffect, useRef, useState } from "react";
import { Box, Text, FormControl, Button } from "@primer/react";
import { useForm } from "react-hook-form";
import { useToasts } from "react-toast-notifications";
import StyledTextInput from "../../../components/StyledTextInput";
import CollectionService from "../services";
import { usePages } from "../../../context/pagesContext";

const EditModal = ({ closeHandler, type, onEdit, node, title }: any) => {
  const { addToast } = useToasts();
  const { register, handleSubmit, getValues, reset, formState } = useForm();
  const { updatePages, pages } = usePages();
  const { errors, isValid, isValidating } = formState;

  const onSubmit = (data: any) => {
    onEdit(data);
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box>
        <Text
          as="h2"
          fontWeight={600}
          fontSize={"18px"}
          lineHeight={"20px"}
          color={"editModal.heading"}
          padding={"16px"}
        >
          {`${title} Name`}
        </Text>
        <hr />
        <FormControl sx={{ marginY: "16px", paddingX: "16px" }}>
          <StyledTextInput
            {...register("name", { required: "This is required." })}
            placeholder="Untitled"
            defaultValue={node.name}
            emptyBoxHeight={"0px"}
          />
        </FormControl>
        <Box
          display={"flex"}
          justifyContent={"flex-end"}
          padding={"0px 16px 16px 16px"}
        >
          <Button size={"medium"} type={"button"} onClick={closeHandler}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size={"medium"}
            type={"submit"}
            disabled={!isValid}
            sx={{
              ml: "16px",
              ":focus:not([disabled])": { boxShadow: "none" },
              border: "none",
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default EditModal;
