import { useMediaQuery } from "react-responsive";

const useDeviceDimensions = () => {
  const isTabletOrMobile = useMediaQuery({
    query: "(max-width: 992px)",
  });

  const isLargeDevice = useMediaQuery({
    query: "(min-width: 1200px)",
  });

  return { isTabletOrMobile, isLargeDevice };
};

export default useDeviceDimensions;
