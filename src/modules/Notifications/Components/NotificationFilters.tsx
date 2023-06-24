import { Box, FilterList } from "@primer/react";

interface INotificationFiltersProps {
  filters: {
    unread: boolean;
    replies: boolean;
    requests: boolean;
    pr: boolean;
  };
  setFilters: (val: any) => void;
}

const NotificationFilters: React.FunctionComponent<
  INotificationFiltersProps
> = ({ filters, setFilters }) => {
  const selectedStyle = {
    color: "notifications.filters.selected.text",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "notifications.filters.selected.text",
    bg: "notifications.filters.selected.bg",
    padding: "2px 8px",
    fontSize: "12px",
    borderRadius: "100px",
    marginRight: "10px",
    ":hover": {
      bg: "notifications.filters.selected.bg",
    },
  };
  const unselectedStyle = {
    padding: "2px 8px",
    fontSize: "12px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: "100px",
    color: "notifications.filters.unSelected.text",
    bg: "notifications.filters.unSelected.bg",
    marginRight: "10px",
    ":hover": {
      bg: "notifications.filters.unSelected.bg",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "notifications.filters.unSelected.text",
    },
  };
  return (
    <Box
      sx={{
        paddingLeft: "15px",
        paddingTop: "10px",
        width: "94%",
        borderTop: "1px solid",
        borderColor: "notifications.filters.border",
        flexShrink: 0,
      }}
    >
      <FilterList sx={{ display: "flex" }}>
        <FilterList.Item
          sx={filters.unread ? selectedStyle : unselectedStyle}
          onClick={() => setFilters({ ...filters, unread: !filters.unread })}
        >
          Unread
        </FilterList.Item>
        <FilterList.Item
          sx={filters.replies ? selectedStyle : unselectedStyle}
          onClick={() => setFilters({ ...filters, replies: !filters.replies })}
        >
          Replies
        </FilterList.Item>
        <FilterList.Item
          sx={filters.requests ? selectedStyle : unselectedStyle}
          onClick={() =>
            setFilters({ ...filters, requests: !filters.requests })
          }
        >
          Requests
        </FilterList.Item>
        <FilterList.Item
          sx={filters.pr ? selectedStyle : unselectedStyle}
          onClick={() => setFilters({ ...filters, pr: !filters.pr })}
        >
          PR
        </FilterList.Item>
      </FilterList>
    </Box>
  );
};

export default NotificationFilters;
