import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProductImagePicker } from './ProductForm'

describe('ProductImagePicker', () => {
  beforeEach(() => {
    Object.defineProperties(URL, {
      createObjectURL: { configurable: true, value: vi.fn(() => 'blob:product-image') },
      revokeObjectURL: { configurable: true, value: vi.fn() },
    })
  })

  it('clears the previous valid image when the replacement is invalid', () => {
    const onFileChange = vi.fn()
    render(<ProductImagePicker id="product-image" onFileChange={onFileChange} />)
    const input = screen.getByLabelText('Chọn ảnh sản phẩm từ thiết bị')
    const validImage = new File(['image'], 'product.webp', { type: 'image/webp' })
    const invalidImage = new File(['document'], 'product.svg', { type: 'image/svg+xml' })

    fireEvent.change(input, { target: { files: [validImage] } })
    fireEvent.change(input, { target: { files: [invalidImage] } })

    expect(onFileChange).toHaveBeenNthCalledWith(1, validImage)
    expect(onFileChange).toHaveBeenLastCalledWith(null)
    expect(screen.getByRole('alert')).toHaveTextContent('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.')
  })
})
