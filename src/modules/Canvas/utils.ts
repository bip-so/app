import { BlockType } from "../BipEditor/types";

// canvasKeyFormat : `canvas-blocks-${branch?.id}`
export const getLocalCanvasKey = (branchId: number) =>
  `canvas-blocks-${branchId}`;

export const findLocalItems = (query: string) => {
  var i,
    results = [];
  for (i in localStorage) {
    if (localStorage.hasOwnProperty(i)) {
      if (i.match(query) || (!query && typeof i === "string")) {
        const value = JSON.parse(localStorage.getItem(i));
        results.push({ key: i, val: value });
      }
    }
  }
  return results;
};

export const getLeastUsedCanvas = () => {
  const localItems = findLocalItems("canvas");
  if (localItems?.length) {
    const filteredItems = localItems.filter((item) => !item.val.score);
    if (filteredItems?.length > 0) {
      return filteredItems[0];
    } else {
      return localItems.reduce(function (prev, curr) {
        return prev.val.score < curr.val.score ? prev : curr;
      });
    }
  }
};

export const deleteLeastUsedCanvas = () => {
  const canvasBlocksItem = getLeastUsedCanvas();
  localStorage.removeItem(canvasBlocksItem.key);
};

export const setLocalCanvasBlocks = (branchId: number, blocksData: any) => {
  const canvasKey = getLocalCanvasKey(branchId);
  try {
    const localBlocks = localStorage.getItem(canvasKey);
    if (localBlocks) {
      const parsedCanavas = JSON.parse(localBlocks);
      const updatedBlocks = {
        ...blocksData,
        score: parsedCanavas?.score ? parsedCanavas.score + 1 : 1,
      };
      localStorage.setItem(canvasKey, JSON.stringify(updatedBlocks));
    } else {
      localStorage.setItem(
        canvasKey,
        JSON.stringify({ ...blocksData, score: 1 })
      );
    }
  } catch (err) {
    if (err.name === "QuotaExceededError") {
      deleteLeastUsedCanvas();
      setLocalCanvasBlocks(branchId, blocksData);
    }
  }
};

export const getLocalCanvasBlocks = (branchId: number) => {
  const canvasKey = getLocalCanvasKey(branchId);
  const localCanvas = localStorage.getItem(canvasKey);
  if (localCanvas) {
    const parsedCanavas = JSON.parse(localCanvas);
    parsedCanavas.score = parsedCanavas?.score ? parsedCanavas.score + 1 : 1;
    localStorage.setItem(canvasKey, JSON.stringify(parsedCanavas));
    return parsedCanavas;
  }
  return null;
};

export const invalidateCanvasBlocks = (branchId?: number) => {
  if (branchId) {
    localStorage.removeItem(getLocalCanvasKey(branchId));
  }
};

// for later
export const updateCachedBlock = (
  branchId: number,
  updatedBlock: BlockType
) => {
  const localBlocksData = getLocalCanvasBlocks(branchId);
  if (localBlocksData) {
    let localBlocks = localBlocksData.blocks;
    const updatedBlockIndex = localBlocks?.find(
      (block: BlockType) => block.uuid === updatedBlock?.uuid
    );
    localBlocks[updatedBlockIndex] = updatedBlock;
    setLocalCanvasBlocks(branchId, localBlocks);
  }
};
