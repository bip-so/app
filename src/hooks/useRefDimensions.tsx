import { useEffect, useMemo, useState } from "react";

const breakpoints = {
  sm: 544,
  md: 768,
  lg: 992,
  xl: 1200,
};

const useRefDimensions = (ref) => {
  const [dimensions, setDimensions] = useState({
    width: 1,
    height: 1,
  });

  const values = useMemo(() => {
    return {
      isXtraSmall: dimensions.width < breakpoints.sm,
      isSmall:
        dimensions.width >= breakpoints.sm && dimensions.width < breakpoints.md,
      isMedium:
        dimensions.width >= breakpoints.md && dimensions.width < breakpoints.lg,
      isLarge:
        dimensions.width >= breakpoints.lg && dimensions.width < breakpoints.xl,
      isXtraLarge: dimensions.width >= breakpoints.xl,
    };
  }, [dimensions]);

  const { isXtraSmall, isSmall, isMedium, isLarge, isXtraLarge } = values;

  const onResize = (element) => {
    const boundingRect = element.getBoundingClientRect();
    const { width, height } = boundingRect;
    setDimensions({ width: Math.round(width), height: Math.round(height) });
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries?.length) {
        const element = entries[0].target;
        onResize(element);
      }
    });
    if (ref?.current) {
      resizeObserver.observe(ref.current);
    }
    return () => resizeObserver.disconnect();
  }, [ref?.current]);

  return { isXtraSmall, isSmall, isMedium, isLarge, isXtraLarge, dimensions };
};

export default useRefDimensions;
