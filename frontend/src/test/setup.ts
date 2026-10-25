import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from './server'

const storedValues = new Map<string, string>()
const browserStorage: Storage = {
  get length() {
    return storedValues.size
  },
  clear() {
    storedValues.clear()
  },
  getItem(key) {
    return storedValues.get(key) ?? null
  },
  key(index) {
    return [...storedValues.keys()][index] ?? null
  },
  removeItem(key) {
    storedValues.delete(key)
  },
  setItem(key, value) {
    storedValues.set(key, value)
  },
}

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: browserStorage,
})

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Suppress unhandled AbortSignal/AbortError rejections during test unmount/teardown
const isAbortError = (reason: unknown): boolean => {
  if (!reason) return false
  if (reason instanceof Error) {
    return (
      reason.name === 'AbortError' ||
      reason.message.includes('aborted') ||
      reason.message.includes('AbortSignal')
    )
  }
  const str = String(reason)
  return str.includes('AbortError') || str.includes('aborted') || str.includes('AbortSignal')
}

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (isAbortError(event.reason)) {
      event.preventDefault()
    }
  })
}

if (typeof process !== 'undefined' && typeof process.on === 'function') {
  process.on('unhandledRejection', (reason) => {
    if (isAbortError(reason)) {
      return
    }
  })
}

afterEach(() => {
  cleanup()
  server.resetHandlers()
  browserStorage.clear()
})

afterAll(() => server.close())

