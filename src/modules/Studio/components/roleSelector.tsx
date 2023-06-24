import { useState } from "react";
import { SelectPanel, IconButton } from "@primer/react";
import { PlusIcon } from "@primer/styled-octicons";
import { useStudio } from "../../../context/studioContext";
import { useUser } from "../../../context/userContext";
import { useToasts } from "react-toast-notifications";

interface IRoleSelectorProps {
  allRoles: any[];
  selectedRoles?: any[];
  open: boolean;
  setOpen: any;
  anchor?: any;
  deleteRole: any;
  addRole: any;
  selectedMember: any;
}

const RoleSelector = (props: IRoleSelectorProps) => {
  let {
    allRoles,
    selectedRoles = [],
    open,
    setOpen,
    anchor,
    deleteRole,
    addRole,
    selectedMember,
  } = props;

  const { currentStudio } = useStudio();
  const { user } = useUser();

  const isPersonalStudio = currentStudio?.id === user?.defaultStudioID;

  const addOrRemoveRole = (item) => {
    item.selected
      ? deleteRole(selectedMember.id, item.id)
      : addRole(selectedMember.id, item.id);
  };

  const items = allRoles.map((role) => {
    return {
      ...role,
      text: role.name,
      onAction: addOrRemoveRole,
      disabled:
        selectedMember?.user?.id === currentStudio?.createdById &&
        role.isSystem,
    };
  });
  const [filter, setFilter] = useState("");
  const filteredItems = items.filter((item) =>
    item.text.toLowerCase().includes(filter.toLowerCase())
  );

  const onSelectedChange = () => {};

  const selectedItems = items.filter((role) =>
    selectedRoles.find((x) => x.id === role.id)
  );

  return (
    <SelectPanel
      renderAnchor={({
        children,
        "aria-labelledby": ariaLabelledBy,
        ...anchorProps
      }) => {
        if (anchor) {
          return (
            <div
              {...anchorProps}
              style={{ display: "inline-flex", width: "100%" }}
            >
              {anchor}
            </div>
          );
        } else {
          return (
            !isPersonalStudio && (
              <IconButton
                {...anchorProps}
                icon={PlusIcon}
                variant="invisible"
                sx={{ color: "studioSettings.box3Styles.plusIcon" }}
                size="small"
              />
            )
          );
        }
      }}
      placeholderText="Search roles"
      open={open}
      onOpenChange={setOpen}
      items={filteredItems}
      selected={selectedItems}
      onSelectedChange={onSelectedChange}
      onFilterChange={setFilter}
      showItemDividers={false}
      overlayProps={{ width: "small", height: "small" }}
      textInputProps={{
        sx: {
          bg: "transparent",
          margin: "8px",
          border: "1px soild",
          borderColor: "styledTextInput.border",
        },
      }}
      sx={{
        bg: "studioSettings.box3",
      }}
    />
  );
};

export default RoleSelector;
