import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RolesToolbar } from './RolesToolbar'

describe('RolesToolbar', () => {
  it('keeps the loading skeleton outside paragraph content', () => {
    const { container } = render(
      <RolesToolbar
        search=""
        filter="all"
        count={0}
        isLoading
        onSearchChange={vi.fn()}
        onFilterChange={vi.fn()}
      />
    )

    const skeleton = container.querySelector('[data-slot="skeleton"]')

    expect(skeleton).not.toBeNull()
    expect(skeleton?.parentElement?.tagName).toBe('DIV')
    expect(skeleton?.closest('p')).toBeNull()
  })
})
