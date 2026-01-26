import { useCallback, useEffect, useRef, useState } from "react";

export default function useLocalStorageState(key, initialValue) {
  const initialRef = useRef(
    typeof initialValue === "function" ? initialValue() : initialValue
  );

  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialRef.current;
    }

    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialRef.current;
    } catch {
      return initialRef.current;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore write errors (private mode, storage disabled).
    }
  }, [key, value]);

  const reset = useCallback(() => {
    setValue(initialRef.current);

    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore reset errors (private mode, storage disabled).
    }
  }, [key]);

  return [value, setValue, reset];
}
