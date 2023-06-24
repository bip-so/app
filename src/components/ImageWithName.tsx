import { Avatar, Box } from "@primer/react";
import React, { FC, useState } from "react";

interface ImageWithNameProps {
  src: string | undefined | null;
  name?: string;

  sx?: object;
  className?: any;
}

const ImageWithName: FC<ImageWithNameProps> = (props) => {
  const { src, name, sx, className } = props;
  const color = sx?.color ? sx?.color : "";
  const width = sx?.width ? sx?.width : "32px";
  const height = sx?.height ? sx?.height : "32px";

  const [error, setError] = useState(false);

  return src && !error ? (
    <Avatar
      sx={{
        width: width,
        height: height,
        ...(sx ? sx : {}),
      }}
      src={src}
      className={className}
      onError={() => {
        setError(true);
      }}
    />
  ) : (
    <Box
      className={className}
      sx={{ display: "flex", justifyContent: "center" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color ? color : "imageWithName.color",
          width: width,
          height: height,
          fontSize: parseInt(height.toString().replace("px", "")) / 2,
          border: "1px solid",
          borderColor: color ? color : "imageWithName.border",
          borderRadius: "50%",
          ...(sx ? sx : {}),
        }}
      >
        {name?.length ? name[0].toUpperCase() : "S"}
      </Box>
    </Box>
  );
};

export default ImageWithName;
