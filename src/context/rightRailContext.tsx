import { createContext, useContext, useEffect, useState } from "react";
import { FaHighlighter } from "react-icons/fa";
import { Editor } from "slate";
import { ReactEditor, useSlate } from "slate-react";
import { ChildrenProps } from "../commons/types";
import { COMMENT_THREAD_PREFIX } from "../modules/BipEditor/constants";
import { BlockType, ReelType, ThreadType } from "../modules/BipEditor/types";
import { useCanvas } from "./canvasContext";

export interface IRightRailItem {
  type: "thread" | "reactions" | "reel" | "add_comment" | "add_reel";
  blockUUID: string;
  // block: {
  //   id: number;
  // }; //BlockType;
  blockIndex: number;
  globalIndex: number;
  reel?: ReelType;
  top?: number;
  thread?: ThreadType;
}

type RightRailContextType = {
  addingItem: boolean;
  setAddingItem: (value: boolean) => void;
  addComment: (block: BlockType, selection) => void;
  cancelAdding: () => void;

  currentBlock: BlockType | null;
  setCurrentBlock: (block: BlockType | null) => void;

  items: IRightRailItem[];
  setItems: (items: IRightRailItem[]) => void;

  itemRefs: any[];
  setItemRefs: (itemRefs: any[]) => void;

  yTranslate: number;
  setYTranslate: (value: number) => void;

  firstBlockTopPosition: number | null;
  setFirstBlockTopPosition: (value: number) => void;

  selectedObjectId: string | null;
  setSelectedObjectId: (value: string) => void;

  pinned: boolean;
  setPinned: (value: boolean) => void;
};

const INITIAL_DATA: RightRailContextType = {
  addingItem: false,
  setAddingItem: () => null,
  addComment: (block: BlockType, selection) => null,
  cancelAdding: () => null,

  currentBlock: null,
  setCurrentBlock: (block: BlockType | null) => null,

  items: [],
  setItems: (items: IRightRailItem[]) => null,

  itemRefs: [],
  setItemRefs: (itemRefs: any[]) => null,

  yTranslate: 0,
  setYTranslate: (value: number) => null,

  firstBlockTopPosition: null,
  setFirstBlockTopPosition: (value: number) => null,
  selectedObjectId: null,
  setSelectedObjectId: (value: string) => null,

  pinned: false,
  setPinned: (value: boolean) => null,
};

export const RightRailContext =
  createContext<RightRailContextType>(INITIAL_DATA);

export const RightRailProvider = ({ children }: ChildrenProps) => {
  const {
    addingItem,
    setAddingItem,
    addComment,
    cancelAdding,

    addReel,

    currentBlock,
    setCurrentBlock,
    items,
    setItems,

    itemRefs,
    setItemRefs,

    yTranslate,
    setYTranslate,
    firstBlockTopPosition,
    setFirstBlockTopPosition,

    selectedObjectId,
    setSelectedObjectId,

    pinned,
    setPinned,
  } = useProviderRightRail();
  return (
    <RightRailContext.Provider
      value={{
        addingItem,
        setAddingItem,
        addComment,
        cancelAdding,

        addReel,

        currentBlock,
        setCurrentBlock,
        items,
        setItems,

        itemRefs,
        setItemRefs,

        yTranslate,
        setYTranslate,

        firstBlockTopPosition,
        setFirstBlockTopPosition,

        selectedObjectId,
        setSelectedObjectId,

        pinned,
        setPinned,
      }}
    >
      {children}
    </RightRailContext.Provider>
  );
};

const useProviderRightRail = () => {
  const { threads, blocks, reels, getBlock } = useCanvas();
  const [addingItem, setAddingItem] = useState<boolean>(false);
  const [currentBlock, setCurrentBlock] = useState<BlockType | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState(null);

  const [items, setItems] = useState<IRightRailItem[]>([]);
  const [yTranslate, setYTranslate] = useState<number>(0); // Right rail anchor position
  const [itemRefs, setItemRefs] = useState([]);
  const [firstBlockTopPosition, setFirstBlockTopPosition] = useState<
    number | null
  >(null);

  const [pinned, setPinned] = useState(false);

  const findClosestBlock = (block: BlockType) =>
    blocks
      ?.filter(
        (blk: BlockType) =>
          blk.commentCount || blk.reelCount || blk.reactions?.length
      )
      ?.reduce(
        (acc, obj: BlockType) =>
          obj.rank - block.rank > 0 &&
          obj.rank - block.rank < acc.rank - block.rank
            ? obj
            : acc,
        { rank: 100000000, uuid: "not-found" }
      );

  // Finding position to place <CommentCard />
  const addComment = (block: BlockType, selection) => {
    let addItemIndex = 0;
    // if items present in right rail
    if (items.length > 0) {
      //block with items
      if (block.commentCount || block.reelCount || block.reactions?.length) {
        const itemIndex = items.findIndex(
          (item) => item.blockUUID === block?.uuid
        );
        addItemIndex = itemIndex;
      } else {
        //block without items find
        const closestBlock = findClosestBlock(block);
        const itemIndex = items.findIndex(
          (item: IRightRailItem) => item.blockUUID === closestBlock.uuid
        );
        if (itemIndex !== -1) {
          // first item of closestBlock, condition below for negative index check
          addItemIndex = itemIndex;
        } else {
          //last item of closestBlock
          addItemIndex = items.length;
        }
      }
    }
    // if (block.commentCount) {
    //   const addItemIndex = items.findIndex(
    //     (item) => item.blockId === currentBlock?.id
    //   );
    // } else {
    // }
    // block without threads
    const addCommentItem = {
      type: "add_comment",
      blockUUID: block.uuid,
      blockIndex: 0,
      objectId: "add-comment",
    };

    let tempItems = removeAddItem();

    tempItems.splice(addItemIndex, 0, addCommentItem);

    setAddingItem(true);
    setItems(tempItems);
  };
  const addReel = (block: BlockType, selection) => {
    let addItemIndex = 0;
    // if items present in right rail
    if (items.length > 0) {
      //block with items
      if (block.commentCount || block.reelCount || block.reactions?.length) {
        const itemIndex = items.findIndex(
          (item) => item.blockUUID === block?.uuid
        );
        addItemIndex = itemIndex;
      } else {
        //block without items find
        const closestBlock = findClosestBlock(block);
        const itemIndex = items.findIndex(
          (item: IRightRailItem) => item.blockUUID === closestBlock.uuid
        );
        if (itemIndex !== -1) {
          // first item of closestBlock, condition below for negative index check
          addItemIndex = itemIndex;
        } else {
          //last item of closestBlock
          addItemIndex = items.length;
        }
      }
    }
    // if (block.commentCount) {
    //   const addItemIndex = items.findIndex(
    //     (item) => item.blockId === currentBlock?.id
    //   );
    // } else {
    // }
    // block without threads
    const addReelItem = {
      type: "add_reel",
      blockUUID: block.uuid,
      blockIndex: 0,
      objectId: "add-reel",
    };

    let tempItems = removeAddItem();

    tempItems.splice(addItemIndex, 0, addReelItem);

    setAddingItem(true);
    setItems(tempItems);
  };

  //remove add_comment/add_reel items from right rail if already present
  const removeAddItem = () => {
    const existingCommentAddingItem = items.find((item) =>
      item.type.includes("add")
    );
    if (existingCommentAddingItem) {
      return [...items].filter((item) => !item.type.includes("add"));
    }
    return [...items];
  };

  const cancelAdding = (setData: boolean = true) => {
    const updatedItems = removeAddItem();
    setAddingItem(false);
    setCurrentBlock(null);
    if (setData) {
      setItems(updatedItems);
    } else {
      return updatedItems;
    }
  };

  useEffect(() => {
    let tempItems: IRightRailItem[] = [];
    blocks?.forEach((block: BlockType) => {
      // processing threads
      const blockThreads = threads
        .filter((thread: ThreadType) => thread?.startBlockUUID === block.uuid)
        .sort(
          (t1, t2) =>
            new Date(t2.createdAt).getTime() - new Date(t1.createdAt).getTime()
        )
        .map((thread: ThreadType, index: number) => {
          return {
            type: "thread",
            blockUUID: block.uuid,
            blockIndex: index,
            thread: thread,
            objectId: `thread-${thread.uuid}`,
          };
        });

      tempItems = [...tempItems, ...blockThreads];

      if (block.reelCount > 0) {
        // processing reels
        const blockReels = reels
          ?.filter((reel: ReelType) => reel.startBlockUUID === block.uuid)
          ?.sort(
            (r1: ReelType, r2: ReelType) =>
              new Date(r1.createdAt).getTime() -
              new Date(r2.createdAt).getTime()
          )
          ?.map((reel: ReelType, index: number) => {
            return {
              type: "reel",
              blockUUID: block.uuid,
              blockIndex: index,
              reel: reel,
              objectId: `reel-${reel.uuid}`,
            };
          });
        tempItems = [...tempItems, ...blockReels];
      }

      if (block.reactions?.length) {
        const reactionsItem: IRightRailItem = {
          type: "reactions",
          blockUUID: block.uuid,
          blockIndex: 0,
          objectId: `reactions-${block.uuid}`,
        };
        tempItems = [...tempItems, reactionsItem];
      }
    });

    tempItems = tempItems.map((blockItem, index) => {
      return { ...blockItem, globalIndex: index };
    });
    setItems(tempItems);
  }, [blocks, threads, reels]);

  // useEffect(() => {
  //   if (currentBlock && (currentBlock.commentCount > 0 || addingItem)) {
  //     // const itemsWithPosition = items.map((item) => {
  //     //   return {
  //     //     ...item,
  //     //     top: getTopPosition(item),
  //     //   };
  //     // });
  //     // setItems(itemsWithPosition);
  // const firstBlockItem = itemsWithPosition.find(
  //   (item) => item.block.id === currentBlock?.id
  // );
  //     //  TOP
  //     //  BPOS
  //     // console.log(currentBlock?.viewPortPosition?.top - firstBlockItem?.top!);
  //     // console.log(firstBlockItem?.top!, currentBlock?.viewPortPosition?.top);
  // setYTranslate(
  //   firstBlockItem?.top! - currentBlock?.viewPortPosition?.top - 80
  // );
  //   }
  // }, [currentBlock]);

  return {
    addingItem,
    setAddingItem,
    addComment,
    cancelAdding,

    addReel,

    currentBlock,
    setCurrentBlock,

    items,
    setItems,

    itemRefs,
    setItemRefs,

    yTranslate,
    setYTranslate,

    firstBlockTopPosition,
    setFirstBlockTopPosition,

    selectedObjectId,
    setSelectedObjectId,

    pinned,
    setPinned,
  };
};

export const useRightRail = () => {
  return useContext(RightRailContext) as RightRailContextType;
};
