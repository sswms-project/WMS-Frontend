import { logger } from '@/lib/logger'
import type { CreateWarehouseFormValues } from '../schemas/warehouse.schema'

const WAREHOUSE_CREATE_DRAFT_STORAGE_KEY = 'warehouse-create-draft:v1'

const emptyDraft = (): CreateWarehouseFormValues => ({
  warehouseCode: '',
  warehouseName: '',
  address: '',
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const getWarehouseCreateDraft = (): CreateWarehouseFormValues => {
  if (typeof window === 'undefined') return emptyDraft()

  try {
    const storedDraft = localStorage.getItem(WAREHOUSE_CREATE_DRAFT_STORAGE_KEY)
    if (!storedDraft) return emptyDraft()

    const parsedDraft: unknown = JSON.parse(storedDraft)
    if (!isRecord(parsedDraft)) return emptyDraft()

    return {
      warehouseCode: typeof parsedDraft.warehouseCode === 'string' ? parsedDraft.warehouseCode : '',
      warehouseName: typeof parsedDraft.warehouseName === 'string' ? parsedDraft.warehouseName : '',
      address: typeof parsedDraft.address === 'string' ? parsedDraft.address : '',
    }
  } catch (error) {
    logger.error('Unable to restore the warehouse draft.', error)
    return emptyDraft()
  }
}

export const saveWarehouseCreateDraft = (draft: CreateWarehouseFormValues): void => {
  if (typeof window === 'undefined') return

  try {
    if (Object.values(draft).every((value) => value.length === 0)) {
      localStorage.removeItem(WAREHOUSE_CREATE_DRAFT_STORAGE_KEY)
      return
    }

    localStorage.setItem(WAREHOUSE_CREATE_DRAFT_STORAGE_KEY, JSON.stringify(draft))
  } catch (error) {
    logger.error('Unable to save the warehouse draft.', error)
  }
}

export const clearWarehouseCreateDraft = (): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(WAREHOUSE_CREATE_DRAFT_STORAGE_KEY)
  } catch (error) {
    logger.error('Unable to clear the warehouse draft.', error)
  }
}
