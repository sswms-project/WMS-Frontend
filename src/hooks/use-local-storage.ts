import { useCallback, useSyncExternalStore } from 'react'

function getSnapshot<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : initial
  } catch {
    return initial
  }
}

const listeners = new Map<string, Set<() => void>>()

function emit(key: string) {
  listeners.get(key)?.forEach((fn) => fn())
}

export function useLocalStorage<T>(key: string, initial: T) {
  const store = useSyncExternalStore(
    useCallback(
      (cb) => {
        let set = listeners.get(key)
        if (!set) {
          set = new Set()
          listeners.set(key, set)
        }
        set.add(cb)
        return () => {
          set!.delete(cb)
          if (!set!.size) listeners.delete(key)
        }
      },
      [key]
    ),
    () => JSON.stringify(getSnapshot(key, initial)),
    () => JSON.stringify(initial)
  )

  const value: T = JSON.parse(store)

  const setValue = useCallback(
    (v: T | ((prev: T) => T)) => {
      const next = v instanceof Function ? v(getSnapshot(key, initial)) : v
      localStorage.setItem(key, JSON.stringify(next))
      emit(key)
    },
    [key, initial]
  )

  return [value, setValue] as const
}
