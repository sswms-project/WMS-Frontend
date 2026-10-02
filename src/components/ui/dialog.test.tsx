import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './dialog'

describe('shared centered Dialog animation', () => {
  it('zooms from the center with fast Radix state animations and reduced-motion support', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Thêm mới</DialogTitle>
          <DialogDescription>Thông tin</DialogDescription>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByRole('dialog')).toHaveClass(
      'origin-center',
      'data-[state=open]:animate-in',
      'data-[state=open]:zoom-in-50',
      'data-[state=closed]:animate-out',
      'animation-duration-200',
      'data-[state=closed]:animation-duration-140',
      'motion-reduce:animate-none'
    )
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toHaveClass(
      'data-[state=open]:fade-in-0',
      'data-[state=closed]:fade-out-0',
      'motion-reduce:animate-none'
    )
  })
})
