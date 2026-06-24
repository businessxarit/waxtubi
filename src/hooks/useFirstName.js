import { useState, useCallback } from "react";

const STORAGE_KEY = "waxtubi:firstName";

export function useFirstName() {
  const [firstName, setFirstNameState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || ""
  );

  const setFirstName = useCallback((name) => {
    const trimmed = name.trim();
    setFirstNameState(trimmed);
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { firstName, setFirstName };
}
