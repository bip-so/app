import { createContext, useContext, useEffect, useState } from "react";

import { ChildrenProps } from "../commons/types";
import { BlockType, ReelType, ThreadType } from "../modules/BipEditor/types";
import { BranchMemberTypeEnum } from "../modules/Canvas/enums";
import {
  IBranchAccessToken,
  IBranchMember,
  ICanvasBranch,
  ICanvasRepo,
} from "../modules/Canvas/interfaces";
import { getLocalCanvasBlocks } from "../modules/Canvas/utils";

export type CanvasContextType = {
  isPublicView: boolean;
  setIsPublicView: (value: boolean) => void;

  repo: ICanvasRepo | null;
  setRepo: (repo: ICanvasRepo) => void;

  branch: ICanvasBranch | null;
  setBranch: (branch: ICanvasBranch) => void;

  branches: ICanvasBranch[];
  setBranches: (branches: ICanvasBranch[]) => void;

  blocks: any[];
  setBlocks: (blocks: any[]) => void;
  updateBlock: (block: BlockType) => void;
  getBlock: (blockUUID: string) => BlockType | null;

  threads: ThreadType[];
  setThreads: (threads: ThreadType[]) => void;

  resolvedThreads: ThreadType[];
  setResolvedThreads: (threads: ThreadType[]) => void;

  addThread: (thread: ThreadType) => void;
  updateThread: (thread: ThreadType) => void;
  removeThread: (thread: ThreadType) => void;

  removedThreadUUID: string;
  setRemovedThreadUUID: (uuid: string) => void;

  reels: ReelType[];
  setReels: (reels: ReelType[]) => void;
  addReel: (reel: ReelType) => void;
  updateReel: (reel: ReelType) => void;
  removeReel: (reel: ReelType) => void;

  members: IBranchMember[];
  setMembers: (members: IBranchMember[]) => void;
  updateMember: (member: IBranchMember) => void;
  removeMember: (member: IBranchMember) => void;

  branchAccessTokens: IBranchAccessToken[];
  setBranchAccessTokens: (members: IBranchAccessToken[]) => void;

  showDiffView: boolean;
  setShowDiffView: (newVal: boolean) => void;
  diffValues: any;
  setDiffValues: (newVal: boolean) => void;

  isSaving: boolean;
  setIsSaving: (newVal: boolean) => void;

  pendingSave: boolean;
  setPendingSave: (newVal: boolean) => void;

  lastSaved: Date | null;
  setLastSaved: (newVal: Date | null) => void;

  showAddComment: boolean;
  setShowAddComment: (value: boolean) => void;

  showPostToReel: boolean;
  setShowPostToReel: (value: boolean) => void;

  showNotFoundPage: boolean;
  setShowNotFoundPage: (value: boolean) => void;

  hasExistingRequest: boolean;
  setHasExistingRequest: (value: boolean) => void;

  isPrivate: boolean;
  setIsPrivate: (value: boolean) => void;

  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
};

const INITIAL_DATA: CanvasContextType = {
  isPublicView: false,
  setIsPublicView: (value: boolean) => null,

  repo: null,
  setRepo: (repo: ICanvasRepo) => null,

  branch: null,
  setBranch: (branch: ICanvasBranch) => null,

  branches: [],
  setBranches: (branch: ICanvasBranch[]) => null,

  blocks: [],
  setBlocks: (blocks: any[]) => null,
  updateBlock: (block: BlockType) => null,
  getBlock: (blockUUID: string) => null,

  threads: [],
  setThreads: (threads: ThreadType[]) => null,

  resolvedThreads: [],
  setResolvedThreads: (threads: ThreadType[]) => null,

  addThread: (thread: ThreadType) => null,
  updateThread: (thread: ThreadType) => null,
  removeThread: (thread: ThreadType) => null,

  removedThreadUUID: "",
  setRemovedThreadUUID: (uuid: string) => null,

  reels: [],
  setReels: (reels: ReelType[]) => null,
  addReel: (reel: ReelType) => null,
  updateReel: (reel: ReelType) => null,
  removeReel: (reel: ReelType) => null,

  members: [],
  setMembers: (members: IBranchMember[]) => null,
  updateMember: (member: IBranchMember) => null,
  removeMember: (member: IBranchMember) => null,

  branchAccessTokens: [],
  setBranchAccessTokens: (branchAccessTokens: IBranchAccessToken[]) => null,

  showDiffView: false,
  setShowDiffView: (newVal: boolean) => null,
  diffValues: [],
  setDiffValues: (newVal: boolean) => null,

  isSaving: false,
  setIsSaving: (newVal: boolean) => null,

  pendingSave: false,
  setPendingSave: (newVal: boolean) => null,

  lastSaved: null,
  setLastSaved: (newVal: Date | null) => null,

  showAddComment: false,
  setShowAddComment: (value: boolean) => null,

  showPostToReel: false,
  setShowPostToReel: (value: boolean) => null,

  showNotFoundPage: false,
  setShowNotFoundPage: (value: boolean) => null,

  hasExistingRequest: false,
  setHasExistingRequest: (value: boolean) => null,

  isPrivate: false,
  setIsPrivate: (value: boolean) => null,

  isLoading: false,
  setIsLoading: (value: boolean) => null,
};

export const CanvasContext = createContext<CanvasContextType>(INITIAL_DATA);

export const CanvasProvider = ({ children }: ChildrenProps) => {
  const {
    isPublicView,
    setIsPublicView,

    repo,
    setRepo,

    branch,
    setBranch,

    branches,
    setBranches,

    blocks,
    setBlocks,
    updateBlock,
    getBlock,

    threads,
    setThreads,

    resolvedThreads,
    setResolvedThreads,

    addThread,
    updateThread,
    removeThread,

    removedThreadUUID,
    setRemovedThreadUUID,

    reels,
    setReels,
    addReel,
    updateReel,
    removeReel,

    members,
    setMembers,
    updateMember,
    removeMember,

    branchAccessTokens,
    setBranchAccessTokens,

    showDiffView,
    setShowDiffView,
    diffValues,
    setDiffValues,

    isSaving,
    setIsSaving,

    pendingSave,
    setPendingSave,

    lastSaved,
    setLastSaved,

    showAddComment,
    setShowAddComment,

    showPostToReel,
    setShowPostToReel,

    languagePages,
    setLanguagePages,

    showNotFoundPage,
    setShowNotFoundPage,

    hasExistingRequest,
    setHasExistingRequest,

    isPrivate,
    setIsPrivate,

    isLoading,
    setIsLoading,
  } = useProviderCanvas();
  return (
    <CanvasContext.Provider
      value={{
        isPublicView,
        setIsPublicView,

        repo,
        setRepo,

        branch,
        setBranch,

        blocks,
        setBlocks,
        updateBlock,
        getBlock,

        branches,
        setBranches,

        threads,
        setThreads,

        resolvedThreads,
        setResolvedThreads,
        addThread,
        updateThread,
        removeThread,

        removedThreadUUID,
        setRemovedThreadUUID,

        reels,
        setReels,
        addReel,
        updateReel,
        removeReel,

        members,
        setMembers,
        updateMember,
        removeMember,

        branchAccessTokens,
        setBranchAccessTokens,

        showDiffView,
        setShowDiffView,
        diffValues,
        setDiffValues,

        isSaving,
        setIsSaving,

        pendingSave,
        setPendingSave,

        lastSaved,
        setLastSaved,

        showAddComment,
        setShowAddComment,

        showPostToReel,
        setShowPostToReel,

        languagePages,
        setLanguagePages,

        showNotFoundPage,
        setShowNotFoundPage,

        hasExistingRequest,
        setHasExistingRequest,

        isPrivate,
        setIsPrivate,

        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

const useProviderCanvas = () => {
  const [repo, setRepo] = useState<ICanvasRepo | null>(null);
  const [languagePages, setLanguagePages] = useState<ICanvasRepo[]>();
  const [branch, setBranch] = useState<ICanvasBranch | null>(null);
  const [showDiffView, setShowDiffView] = useState<boolean>(false);
  const [isPublicView, setIsPublicView] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [blocks, setBlocks] = useState<any[]>([]);
  const [threads, setThreads] = useState<ThreadType[]>([]);
  const [resolvedThreads, setResolvedThreads] = useState<ThreadType[]>([]);
  const [members, setMembers] = useState<IBranchMember[]>([]);
  const [branches, setBranches] = useState<ICanvasBranch[]>([]);
  const [reels, setReels] = useState<ReelType[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [diffValues, setDiffValues] = useState<any>([]);
  const [showAddComment, setShowAddComment] = useState<boolean>(false);
  const [showPostToReel, setShowPostToReel] = useState<boolean>(false);
  const [removedThreadUUID, setRemovedThreadUUID] = useState<string>("");

  const [showNotFoundPage, setShowNotFoundPage] = useState(false);

  const [branchAccessTokens, setBranchAccessTokens] = useState<
    IBranchAccessToken[]
  >([]);

  const [hasExistingRequest, setHasExistingRequest] = useState<boolean>(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);

  const updateMember = (member: IBranchMember) => {
    const updatedMemberIndex = members.findIndex((_member: IBranchMember) =>
      member.type === BranchMemberTypeEnum.Member
        ? member.memberId === _member.memberId
        : member.roleId === _member.roleId
    );

    let updatedMembers = [...members];
    updatedMembers[updatedMemberIndex] = member;
    setMembers(updatedMembers);
  };

  const removeMember = (member: IBranchMember) => {
    let updatedMembers = members.filter(
      (_member: IBranchMember) => member.id !== _member.id
    );
    setMembers(updatedMembers);
  };

  const addThread = (thread: ThreadType) => {
    setThreads([thread, ...threads]);
  };

  const removeThread = (thread: ThreadType) => {
    let updatedThreads = threads.filter(
      (_thread: ThreadType) => thread.id !== _thread.id
    );
    setThreads(updatedThreads);
    setRemovedThreadUUID(thread.uuid);
  };

  const addReel = (reel: ReelType) => {
    setReels([reel, ...reels]);
  };

  const removeReel = (reel: ReelType) => {
    let updatedReels = reels.filter((_reel: ReelType) => reel.id !== _reel.id);

    let reelBlock: BlockType = getBlock(reel.startBlockUUID);
    reelBlock = {
      ...reelBlock,
      reelCount: reelBlock.reelCount > 0 ? reelBlock.reelCount - 1 : 0,
    };
    updateBlock(reelBlock);
    setReels(updatedReels);
  };

  const getBlock = (blockUUID: string) =>
    blocks?.find((block) => block.uuid === blockUUID);

  const updateBlock = (block: BlockType) => {
    const updatedBlockIndex = blocks.findIndex(
      (_block: BlockType) => _block.uuid === block.uuid
    );
    if (updatedBlockIndex >= 0) {
      let updatedBlocks = [...blocks];
      updatedBlocks[updatedBlockIndex] = block;
      setBlocks(updatedBlocks);
    }
  };

  const updateThread = (thread: ThreadType) => {
    const updatedThreadIndex = threads.findIndex(
      (_thread: ThreadType) => _thread.id === thread.id
    );

    let updatedThreads = [...threads];
    updatedThreads[updatedThreadIndex] = thread;
    setThreads(updatedThreads);
  };

  const updateReel = (reel: ReelType) => {
    const updatedReelIndex = reels.findIndex(
      (_reel: ReelType) => _reel.id === reel.id
    );

    let updatedReels = [...reels];
    updatedReels[updatedReelIndex] = reel;
    setReels(updatedReels);
  };

  return {
    isPublicView,
    setIsPublicView,

    repo,
    setRepo,

    branch,
    members,

    branches,
    setBranches,

    blocks,
    setBlocks,
    updateBlock,
    getBlock,

    threads,
    setThreads,

    resolvedThreads,
    setResolvedThreads,

    addThread,
    updateThread,
    removeThread,

    removedThreadUUID,
    setRemovedThreadUUID,

    reels,
    setReels,
    addReel,
    updateReel,
    removeReel,

    setBranch,
    setMembers,
    updateMember,
    removeMember,

    branchAccessTokens,
    setBranchAccessTokens,

    showDiffView,
    setShowDiffView,
    diffValues,
    setDiffValues,

    isSaving,
    setIsSaving,

    pendingSave,
    setPendingSave,

    lastSaved,
    setLastSaved,

    showAddComment,
    setShowAddComment,

    showPostToReel,
    setShowPostToReel,

    languagePages,
    setLanguagePages,

    showNotFoundPage,
    setShowNotFoundPage,

    hasExistingRequest,
    setHasExistingRequest,

    isPrivate,
    setIsPrivate,

    isLoading,
    setIsLoading,
  };
};

export const useCanvas = () => {
  return useContext(CanvasContext) as CanvasContextType;
};
