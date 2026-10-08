'use client'

import { useCallback, useEffect, useRef } from 'react'

interface CodeSuggestionOptions {
  readonly active: boolean
  readonly sessionKey: string
  readonly suggestedCode?: string
  readonly isFetching: boolean
  readonly isError: boolean
  readonly getCurrentCode: () => string
  readonly applyCode: (code: string) => void
}

export function useCodeSuggestion({
  active,
  sessionKey,
  suggestedCode,
  isFetching,
  isError,
  getCurrentCode,
  applyCode,
}: CodeSuggestionOptions) {
  const editedSession = useRef<string | null>(null)
  const appliedSession = useRef<string | null>(null)
  const markEdited = useCallback(() => {
    editedSession.current = sessionKey
  }, [sessionKey])
  const resetSession = useCallback(() => {
    editedSession.current = null
    appliedSession.current = null
  }, [])

  useEffect(() => {
    if (
      !active ||
      !suggestedCode ||
      isFetching ||
      isError ||
      editedSession.current === sessionKey ||
      appliedSession.current === sessionKey ||
      getCurrentCode()
    )
      return

    // Track interaction independently from RHF dirty: clearing back to the default is still an edit.
    appliedSession.current = sessionKey
    applyCode(suggestedCode)
  }, [active, sessionKey, suggestedCode, isFetching, isError, getCurrentCode, applyCode])

  return { markEdited, resetSession }
}
