import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosClient } from '@/lib/axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import { productService } from './product.service'

vi.mock('@/lib/axios', () => ({
  axiosClient: {
    post: vi.fn(),
  },
}))

describe('productService.uploadProductImage', () => {
  beforeEach(() => {
    vi.mocked(axiosClient.post).mockResolvedValue({ data: { data: null } })
  })

  it('sends the image as multipart form data', async () => {
    const file = new File(['image'], 'product.webp', { type: 'image/webp' })

    await productService.uploadProductImage('product-id', file)

    expect(axiosClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.products.image('product-id'),
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    const formData = vi.mocked(axiosClient.post).mock.calls[0]?.[1]
    expect(formData).toBeInstanceOf(FormData)
    if (!(formData instanceof FormData)) throw new Error('Expected multipart form data')
    expect(formData.get('file')).toBe(file)
  })
})
