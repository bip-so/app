import { useContext, createContext, useState, useEffect } from "react";

import { ChildrenProps } from "../commons/types";
import { PermissionSchema } from "../modules/Permissions/types";

export type PermissionContextSchemaType = {
  studio: PermissionSchema;
  collection: PermissionSchema;
  canvas: PermissionSchema;
};

type PermissionContextType = {
  schema: PermissionContextSchemaType | null;
  savePermissionsSchema: (schema: PermissionContextSchemaType | null) => void;

  studioPermissions: any;

  inheritDialogOpen: boolean;
  setInheritDialogOpen: (value: boolean) => void;
};

export const PermissionContext = createContext<PermissionContextType | null>(
  null
);

export const PermissionProvider = ({ children }: ChildrenProps) => {
  const {
    schema,
    savePermissionsSchema,
    studioPermissions,
    inheritDialogOpen,
    setInheritDialogOpen,
  } = useProviderPermission();
  return (
    <PermissionContext.Provider
      value={{
        schema,
        savePermissionsSchema,
        studioPermissions,
        inheritDialogOpen,
        setInheritDialogOpen,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

const useProviderPermission = () => {
  const [schema, setSchema] = useState<PermissionContextSchemaType | null>(
    null
  );
  const [studioPermissions, setStudioPermissions] = useState<any>(null);
  const [inheritDialogOpen, setInheritDialogOpen] = useState<boolean>(false);

  const savePermissionsSchema = (schema: any) => {
    localStorage.setItem("permissionsSchema", JSON.stringify(schema));
    setSchema(schema);
  };

  useEffect(() => {
    const localPermissions = JSON.parse(
      window.localStorage.getItem("permissionsSchema") || "{}"
    );
    if (localPermissions) {
      setSchema(localPermissions);
    }
  }, []);

  return {
    schema,
    savePermissionsSchema,

    studioPermissions,

    inheritDialogOpen,
    setInheritDialogOpen,
  };
};

export const usePermissions = () => {
  return useContext(PermissionContext) as PermissionContextType;
};
