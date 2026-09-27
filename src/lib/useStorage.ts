import { useSyncExternalStore } from 'react'
import { storageRev, subscribeStorage } from './storage'

export function useStorageRev(): number {
  return useSyncExternalStore(subscribeStorage, storageRev, storageRev)
}
