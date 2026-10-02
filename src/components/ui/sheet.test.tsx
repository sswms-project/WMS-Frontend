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
        'data-[state=open]:animate-in',
        `data-[side=${side}]:data-[state=open]:slide-in-from-${side}`,
        `data-[side=${side}]:data-[state=closed]:slide-out-to-${side}`,
        'animation-duration-300',
        'data-[state=closed]:animation-duration-180',
        'motion-reduce:animate-none'
      )
      expect(document.querySelector('[data-slot="sheet-overlay"]')).toHaveClass(
        'data-[state=open]:fade-in-0',
        'data-[state=closed]:fade-out-0',
        'motion-reduce:animate-none'
      )
    }
  )
})
