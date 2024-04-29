"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";

function getStorageValue<T>(key: string, defaultValue: T): T {
  // getting stored value
  if (typeof window == "undefined") {
    return defaultValue;
  }

  const saved = localStorage.getItem(key);
  if (saved === null) {
    return defaultValue;
  }

  return JSON.parse(saved) as T;
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(() => {
    return getStorageValue<T>(key, defaultValue);
  });

  useEffect(() => {
    // storing input name
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
