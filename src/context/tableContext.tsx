import { createContext, useContext, useEffect, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

type TableContextType = {
  columnIndex: number | null;
  setColumnIndex: (val: number | null) => void;
  dropHoverOverColumnIndex: number | null;
  setDropHoverOverColumnIndex: (val: number | null) => void;
  draggingColumnIndex: number | null;
  setDraggingColumnIndex: (val: number | null) => void;
};

const INITIAL_DATA: TableContextType = {
  columnIndex: null,
  setColumnIndex: () => null,
  dropHoverOverColumnIndex: null,
  setDropHoverOverColumnIndex: () => null,
  draggingColumnIndex: null,
  setDraggingColumnIndex: () => null,
};

export const TableContext = createContext<TableContextType>(INITIAL_DATA);

export const TableProvider = ({ children }) => {
  const {
    columnIndex,
    setColumnIndex,
    dropHoverOverColumnIndex,
    setDropHoverOverColumnIndex,
    draggingColumnIndex,
    setDraggingColumnIndex,
  } = useProviderLayout();
  return (
    <TableContext.Provider
      value={{
        columnIndex,
        setColumnIndex,
        dropHoverOverColumnIndex,
        setDropHoverOverColumnIndex,
        draggingColumnIndex,
        setDraggingColumnIndex,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

const useProviderLayout = () => {
  const [columnIndex, setColumnIndex] = useState(null);
  const [dropHoverOverColumnIndex, setDropHoverOverColumnIndex] =
    useState(null);
  const [draggingColumnIndex, setDraggingColumnIndex] = useState(null);
  return {
    columnIndex,
    setColumnIndex,
    dropHoverOverColumnIndex,
    setDropHoverOverColumnIndex,
    draggingColumnIndex,
    setDraggingColumnIndex,
  };
};

export const useTable = () => {
  return useContext(TableContext);
};
