import { Spinner } from "@primer/react";
import { FC } from "react";

interface IBipLoaderProps {
  sx?: any;
}

const BipLoader: FC<IBipLoaderProps> = ({ sx, ...props }) => {
  return (
    <div className="w-full">
      <Spinner
        size="small"
        sx={{
          color: "success.fg",
          marginLeft: "auto",
          marginRight: "auto",
          my: "8px",
          ...(sx ? sx : {}),
        }}
      />
    </div>
  );
};

export default BipLoader;
