import { useEffect, useState } from "react";

const useDebounce = (value: any, timeout: number) => {
  let [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    let timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, timeout);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, timeout]);

  return debouncedValue;
};

export default useDebounce;
