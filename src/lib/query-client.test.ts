import { describe, expect, it } from 'vitest'
import { queryClient } from './query-client'

describe('queryClient', () => {
  it('runs queries while offline so failures reach the error state', () => {
    expect(queryClient.getDefaultOptions().queries?.networkMode).toBe('always')
  })
})
