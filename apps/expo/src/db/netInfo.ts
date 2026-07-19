import { useState, useEffect, useCallback } from 'react';

let isOnlineValue = true;
const listeners = new Set<(isOnline: boolean) => void>();

function notifyListeners(newValue: boolean) {
  isOnlineValue = newValue;
  listeners.forEach((listener) => listener(newValue));
}

export async function checkNetwork(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

export async function startNetworkMonitoring(): Promise<void> {
  notifyListeners(await checkNetwork());

  setInterval(async () => {
    notifyListeners(await checkNetwork());
  }, 10000);
}

export function addNetworkListener(listener: (isOnline: boolean) => void): void {
  listeners.add(listener);
}

export function removeNetworkListener(listener: (isOnline: boolean) => void): void {
  listeners.delete(listener);
}

export function getNetworkStatus(): boolean {
  return isOnlineValue;
}

export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(isOnlineValue);

  useEffect(() => {
    addNetworkListener(setIsOnline);
    return () => removeNetworkListener(setIsOnline);
  }, []);

  return isOnline;
}
