import { useCallback, useEffect, useState } from 'react';
import { fetchSheet, subscribeToSync } from './api';

export function useSheetData(sheet) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    setError('');
    try {
      const { rows: data } = await fetchSheet(sheet);
      setRows(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, [sheet]);

  // Initial load on mount
  useEffect(() => {
    load(false);
  }, [load]);

  // Subscribe to app-wide sync events (Sync Now button, Add Customer, Issue Resolved, Background Poller)
  useEffect(() => {
    const unsubscribe = subscribeToSync(() => {
      load(true); // background refresh without flashing loading skeleton
    });
    return unsubscribe;
  }, [load]);

  return { rows, loading, error, reload: () => load(false) };
}