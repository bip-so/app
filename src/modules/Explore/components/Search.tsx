import { Autocomplete, TextInput } from "@primer/react";
import { SearchIcon } from "@primer/octicons-react";
function Search() {
  return (
    <TextInput
      leadingVisual={SearchIcon}
      placeholder="Search"
      sx={{
        borderWidth: 1,
        width: ["360px", "360px", "600px", "600px"],
        height: "40px",
        borderStyle: "solid",
        p: 2,
      }}
    />
  );
}

export default Search;
