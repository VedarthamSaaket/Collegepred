'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'compareSet';

export function useCompare() {
  const [compareSet, setCompareSet] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCompareSet(JSON.parse(stored));
      }
    } catch {
    }
    setInitialized(true);
  }, []);

  const persist = useCallback((ids: string[]) => {
    setCompareSet(ids);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
    }
  }, []);

  const addToCompare = useCallback((id: string) => {
    setCompareSet((prev) => {
      if (prev.length >= 3 || prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
      }
      return next;
    });
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setCompareSet((prev) => {
      const next = prev.filter((i) => i !== id);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
      }
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    persist([]);
  }, [persist]);

  const isInCompare = useCallback(
    (id: string) => compareSet.includes(id),
    [compareSet]
  );

  return {
    compareSet,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    initialized,
  };
}