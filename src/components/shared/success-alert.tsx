'use client';

import { useCallback, useSyncExternalStore, useEffect } from 'react';
import { GlobalAlert } from './global-alert';

type SuccessAlertData = {
  id: string;
  message: string;
  badgeLabel?: string;
};

type SuccessAlertState = SuccessAlertData | null;

let currentSuccessData: SuccessAlertState = null;
const listeners: Set<() => void> = new Set();
let dismissTimer: NodeJS.Timeout | null = null;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

const getSnapshot = (): SuccessAlertState => {
  return currentSuccessData;
};

const getServerSnapshot = (): SuccessAlertState => {
  return null;
};

export function useSuccessAlert(
  storageKey: string,
  autoDismiss: boolean = false
) {
  const successData = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setSuccessAlert = useCallback(
    (message: string, badgeLabel: string = 'Éxitoso') => {
      const alertData: SuccessAlertData = {
        id: `${storageKey}_${Date.now()}`,
        message,
        badgeLabel,
      };

      localStorage.setItem(storageKey, JSON.stringify(alertData));
      currentSuccessData = alertData;

      if (autoDismiss) {
        if (dismissTimer) clearTimeout(dismissTimer);
        dismissTimer = setTimeout(() => {
          localStorage.removeItem(storageKey);
          currentSuccessData = null;
          notifyListeners();
        }, 5000);
      }

      notifyListeners();
    },
    [storageKey, autoDismiss]
  );

  const clearAlert = useCallback(() => {
    localStorage.removeItem(storageKey);
    currentSuccessData = null;
    if (dismissTimer) clearTimeout(dismissTimer);
    notifyListeners();
  }, [storageKey]);

  const initializeFromStorage = useCallback(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored && !currentSuccessData) {
      try {
        const data = JSON.parse(stored);
        currentSuccessData = data;

        if (autoDismiss) {
          if (dismissTimer) clearTimeout(dismissTimer);
          dismissTimer = setTimeout(() => {
            localStorage.removeItem(storageKey);
            currentSuccessData = null;
            notifyListeners();
          }, 5000);
        }

        notifyListeners();
      } catch (error) {
        console.error('Error parsing success alert data:', error);
      }
    }
  }, [storageKey, autoDismiss]);

  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  return {
    successData,
    setSuccessAlert,
    clearAlert,
    initializeFromStorage,
  };
}

export function SuccessAlert({
  successData,
  onClose,
}: {
  successData: SuccessAlertData | null;
  onClose: () => void;
}) {
  if (!successData) {
    return null;
  }

  return (
    <div className="mb-4">
      <GlobalAlert
        type="success"
        description={successData.message}
        badgeLabel={successData.badgeLabel}
        onClose={onClose}
      />
    </div>
  );
}
