import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InputGroup, InputGroupInput } from './input-group'

describe('InputGroupInput', () => {
  it('does not render its own focus ring or offset inside the focused input group', () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Search warehouses" />
      </InputGroup>
    )

    expect(screen.getByRole('textbox', { name: 'Search warehouses' })).not.toHaveClass(
      'focus-visible:border-ring'
    )
    expect(screen.getByRole('textbox', { name: 'Search warehouses' })).not.toHaveClass(
      'focus-visible:ring-offset-1'
    )
  })
})
