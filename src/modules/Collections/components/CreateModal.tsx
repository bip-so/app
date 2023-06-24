import React, { FC, useEffect, useRef, useState } from "react";
import { Box, Text, FormControl, Button } from "@primer/react";
import { useForm } from "react-hook-form";
import { useToasts } from "react-toast-notifications";
import StyledTextInput from "../../../components/StyledTextInput";
import CollectionService from "../services";
import { usePages } from "../../../context/pagesContext";

const CreateModal = ({ closeHandler, type, onCreate }: any) => {
  const { addToast } = useToasts();
  const { register, handleSubmit, getValues, reset, formState } = useForm();
  const { updatePages, pages } = usePages();
  const { errors, isValid, isValidating } = formState;

  const onSubmit = (data: any) => {
    onCreate(data);
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
          sx={{
            marginBottom: "30px",
          }}
        >
          {`Create New ${type}`}
        </Text>

        <FormControl sx={{ mb: "16px" }}>
          <FormControl.Label>{type} Name</FormControl.Label>
          <StyledTextInput
            {...register("name", { required: "This is required." })}
            placeholder="Untitled"
            defaultValue={"Untitled"}
            emptyBoxHeight={"0px"}
          />
        </FormControl>
        <Box
          display={"flex"}
          justifyContent={"flex-end"}
          sx={{
            marginTop: "30px",
          }}
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
            Create
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default CreateModal;
