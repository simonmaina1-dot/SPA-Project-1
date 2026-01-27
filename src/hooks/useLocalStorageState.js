import { useCallback, useEffect, useRef, useState } from "react";

export default function useLocalStorageState(key, initialValue) {
  const skipWriteRef = useRef(false);
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (skipWriteRef.current) {
      skipWriteRef.current = false;
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore write errors (private mode, storage disabled).
    }
  }, [key, value]);

  const reset = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore remove errors.
      }
    }

    skipWriteRef.current = true;
    setValue(initialValue);
  }, [initialValue, key]);

  return [value, setValue, reset];
}
