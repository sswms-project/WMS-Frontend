import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from './sheet'

describe('shared Sheet animation', () => {
  it.each(['right', 'left', 'top', 'bottom'] as const)(
    'animates the %s sheet using Radix state and respects reduced motion',
    (side) => {
      render(
        <Sheet open>
          <SheetContent side={side}>
            <SheetTitle>Form</SheetTitle>
            <SheetDescription>Test form</SheetDescription>
          </SheetContent>
        </Sheet>
      )
      const content = screen.getByRole('dialog')
      expect(content).toHaveAttribute('data-state', 'open')
      expect(content).toHaveClass(
        'data-open:animate-in',
        `data-[side=${side}]:data-open:slide-in-from-${side}-full`,
        `data-[side=${side}]:data-closed:slide-out-to-${side}-full`,
        'animation-duration-300',
        'data-closed:animation-duration-180',
        'motion-reduce:animate-none'
      )
      expect(document.querySelector('[data-slot="sheet-overlay"]')).toHaveClass(
        'data-open:fade-in-0',
        'data-closed:fade-out-0',
        'motion-reduce:animate-none'
      )
    }
  )
})
