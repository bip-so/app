import { NodeModel } from "@minoru/react-dnd-treeview";
import { createContext, useContext, useEffect, useState } from "react";
import { useToasts } from "react-toast-notifications";

import { ChildrenProps } from "../commons/types";
import { ICanvasBranch } from "../modules/Canvas/interfaces";
import CollectionService from "../modules/Collections/services";
import {
  CollectionDataType,
  CanvasDataType,
} from "../modules/Collections/types";
import { PermissionGroup } from "../modules/Permissions/types";
import { usePermissions } from "./permissionContext";

export type PageType = CollectionDataType | CanvasDataType | ICanvasBranch;

type PagesContextType = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  pages: PageType[];
  updatePages: (pages: PageType[]) => void;
  addNewPages: (pages: PageType[]) => void;
  updateCollection: (page: PageType) => void;
  deletePage: (collectionId: number) => void;
  addCollection: (newCollection: CollectionDataType) => void;
  getCollectionCanvases: (
    node: CollectionDataType,
    isPublicView: boolean
  ) => void;

  pagesLoaded: boolean;
  setPagesLoaded: (loading: boolean) => void;

  filteredPages: PageType[];
  setFilteredPages: (pages: PageType[]) => void;

  shouldFetchCollections: boolean;
  setShouldFetchCollections: (newValue: boolean) => void;

  openIds: number[];
  setOpenIds: (openIds: number[]) => void;

  // Drafts
  drafts: PageType[];
  setDrafts: (pages: PageType[]) => void;
  displayLanguage: string;
  setDisplayLanguage: (newLang: string) => void;
};

const INITIAL_VALUES = {
  loading: false,
  setLoading: () => null,
  pages: [],
  updatePages: () => null,
  addNewPages: () => null,
  updateCollection: () => null,
  addPage: () => null,
  addCollection: () => null,
  updatePage: () => null,
  deletePage: () => null,
  getCollectionCanvases: () => null,

  pagesLoaded: false,
  setPagesLoaded: () => null,

  filteredPages: [],
  setFilteredPages: () => null,

  shouldFetchCollections: false,
  setShouldFetchCollections: () => null,

  openIds: [],
  setOpenIds: () => null,

  // Drafts
  drafts: [],
  setDrafts: (pages: PageType[]) => null,
  displayLanguage: "en",
  setDisplayLanguage: (newLang: string) => null,
};

export const PagesContext = createContext<PagesContextType | null>(
  INITIAL_VALUES
);

export const PagesProvider = ({ children }: ChildrenProps) => {
  const {
    loading,
    setLoading,
    pages,
    updatePages,
    addNewPages,
    updateCollection,
    deletePage,
    addCollection,
    getCollectionCanvases,

    pagesLoaded,
    setPagesLoaded,

    filteredPages,
    setFilteredPages,

    shouldFetchCollections,
    setShouldFetchCollections,

    openIds,
    setOpenIds,

    drafts,
    setDrafts,

    displayLanguage,
    setDisplayLanguage,
  } = useProviderPages();

  return (
    <PagesContext.Provider
      value={{
        loading,
        setLoading,
        pages,
        addNewPages,
        updatePages,
        updateCollection,
        deletePage,
        addCollection,
        getCollectionCanvases,

        pagesLoaded,
        setPagesLoaded,

        filteredPages,
        setFilteredPages,

        shouldFetchCollections,
        setShouldFetchCollections,

        openIds,
        setOpenIds,

        drafts,
        setDrafts,

        displayLanguage,
        setDisplayLanguage,
      }}
    >
      {children}
    </PagesContext.Provider>
  );
};

const useProviderPages = () => {
  const [pages, setPages] = useState<PageType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagesLoaded, setPagesLoaded] = useState<boolean>(false);
  const [shouldFetchCollections, setShouldFetchCollections] = useState(false);
  const { schema } = usePermissions();
  const { addToast } = useToasts();

  const [filteredPages, setFilteredPages] = useState<PageType[]>([]);

  const [openIds, setOpenIds] = useState<number[]>([]);

  const [drafts, setDrafts] = useState<PageType[]>([]);
  const [displayLanguage, setDisplayLanguage] = useState("en");
  const updatePages = (newPages: PageType[]) => {
    if (!pagesLoaded) {
      setPagesLoaded(true);
    }
    setPages(newPages);
  };

  const addNewPages = (newPages: PageType[]) => {
    const tempPages = [...pages, ...newPages];
    const uniquePages = tempPages.filter(
      (value, index, self) => index === self.findIndex((t) => t.id === value.id)
    );

    setPages(uniquePages);
  };

  const updateCollection = (newPage: any) => {
    let tempPages = [...pages];
    tempPages = tempPages.map((el) => (el.id === newPage.id ? newPage : el));
    setPages(tempPages);
  };

  const deletePage = (id: number) => {
    let tempPages = [...pages];
    const pageToDelete = pages.find((page) => page.id === id);
    tempPages = pages.filter((page) => page.id !== id);
    if (pageToDelete?.parent) {
      const parentIndex = tempPages.findIndex(
        (page) => page.id === pageToDelete.parent
      );
      let newParent;
      if (tempPages[parentIndex].type === "COLLECTION") {
        newParent = {
          ...tempPages[parentIndex],
          computedRootCanvasCount:
            tempPages[parentIndex]?.computedRootCanvasCount - 1,
          computedAllCanvasCount:
            tempPages[parentIndex]?.computedAllCanvasCount - 1,
        };
      } else {
        newParent = {
          ...tempPages[parentIndex],
          subCanvasCount: tempPages[parentIndex]?.subCanvasCount - 1,
        };
      }

      tempPages[parentIndex] = newParent;
    }
    setPages(tempPages);
  };

  const addCollection = (newCollection: CollectionDataType) => {
    console.log({
      ...newCollection,
      parent: 0,
      type: "COLLECTION",
      permission: "pg_collection_moderate",
      permissionGroup: schema?.collection?.permissionGroups.find(
        (permissionGroup: PermissionGroup) =>
          permissionGroup.systemName === "pg_collection_moderate"
      ),
      droppable: true,
    });
    setPages([
      ...pages,
      {
        ...newCollection,
        parent: 0,
        type: "COLLECTION",
        permission: "pg_collection_moderate",
        permissionGroup: schema?.collection?.permissionGroups.find(
          (permissionGroup: PermissionGroup) =>
            permissionGroup.systemName === "pg_collection_moderate"
        ),
        droppable: true,
      },
    ]);
  };

  const getCollectionCanvases = async (
    node: CollectionDataType,
    isPublicView: boolean
  ) => {
    try {
      const resp = await CollectionService.getCanvasRepo(
        {
          parentCollectionID: node.id,
          parentCanvasRepositoryID: 0,
        },
        isPublicView
      );
      const canvases = resp.data.data;
      const pagesIds = pages.map((page) => page.id);
      const filteredCanvases = canvases.filter(
        (can: PageType) => !pagesIds.includes(can.id)
      );
      let tempPages = [...pages, ...filteredCanvases];
      const rootCanvasCount = tempPages.filter(
        (page) => page.collectionID && !page.parentCanvasRepositoryID
      ).length;
      tempPages = tempPages.map((el) =>
        el.id === node.id
          ? {
              ...node,
              computedRootCanvasCount: rootCanvasCount,
              areCanvasesFetched: true,
            }
          : el
      );
      updatePages(tempPages);
    } catch (err) {
      addToast("Something went wrong while fetching canvases.", {
        appearance: "error",
        autoDismiss: true,
      });
      console.log(err);
    }
  };

  // const addCanvasesToCollection = (
  //   canvases: CanvasDataType[],
  //   parentId: number,
  //   collectionId: number
  // ) => {
  //   canvases = canvases.map((canvas) => {
  //     return { ...canvases, parent: canvas.parentCanvasRepositoryId };
  //   });
  // };

  return {
    loading,
    setLoading,
    pages,
    updatePages,
    addNewPages,
    updateCollection,
    deletePage,
    addCollection,
    getCollectionCanvases,

    pagesLoaded,
    setPagesLoaded,

    filteredPages,
    setFilteredPages,

    shouldFetchCollections,
    setShouldFetchCollections,

    openIds,
    setOpenIds,

    drafts,
    setDrafts,

    displayLanguage,
    setDisplayLanguage,
  };
};

export const usePages = () => {
  return useContext(PagesContext) as PagesContextType;
};
