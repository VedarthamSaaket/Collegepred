'use client';

import { useState, useCallback } from 'react';

export function useSaved() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const toggleSave = useCallback(async (collegeId: string) => {
    if (loading.has(collegeId)) return;

    setLoading((prev) => new Set(prev).add(collegeId));

    try {
      if (savedIds.has(collegeId)) {
        const res = await fetch('/api/saved', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collegeId }),
        });
        if (res.ok) {
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(collegeId);
            return next;
          });
        }
      } else {
        const res = await fetch('/api/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collegeId }),
        });
        if (res.ok) {
          setSavedIds((prev) => new Set(prev).add(collegeId));
        }
      }
    } catch {
    } finally {
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(collegeId);
        return next;
      });
    }
  }, [savedIds, loading]);

  const isSaved = useCallback(
    (collegeId: string) => savedIds.has(collegeId),
    [savedIds]
  );

  const setInitialSaved = useCallback((ids: string[]) => {
    setSavedIds(new Set(ids));
  }, []);

  return {
    savedIds,
    toggleSave,
    isSaved,
    setInitialSaved,
    loading,
  };
}