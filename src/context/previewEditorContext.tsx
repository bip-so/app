import { createContext, useContext, useEffect, useState } from "react";

import { ChildrenProps } from "../commons/types";

export type PreviewEditorContextType = {
  previewEditorData: any;
  setPreviewEditorData: (data: any) => void;
};

const INITIAL_DATA: PreviewEditorContextType = {
  previewEditorData: null,
  setPreviewEditorData: (data: any) => null,
};

export const PreviewEditorContext =
  createContext<PreviewEditorContextType>(INITIAL_DATA);

export const PreviewEditorProvider = ({ children }: ChildrenProps) => {
  const { previewEditorData, setPreviewEditorData } = useProviderCanvas();
  return (
    <PreviewEditorContext.Provider
      value={{
        previewEditorData,
        setPreviewEditorData,
      }}
    >
      {children}
    </PreviewEditorContext.Provider>
  );
};

const useProviderCanvas = () => {
  const [previewEditorData, setPreviewEditorData] = useState<any>(null);

  return {
    previewEditorData,
    setPreviewEditorData,
  };
};

export const usePreviewEditor = () => {
  return useContext(PreviewEditorContext) as PreviewEditorContextType;
};
