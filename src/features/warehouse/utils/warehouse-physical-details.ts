import type {
  WarehousePhysicalDetails,
  WarehousePhysicalDetailsResponse,
} from '../types/warehouse.types'

export const EMPTY_WAREHOUSE_PHYSICAL_DETAILS: WarehousePhysicalDetails = {
  storageCapacity: null,
  storageCapacityUnit: null,
  physicalLength: null,
  physicalLengthUnit: null,
  physicalWidth: null,
  physicalWidthUnit: null,
  physicalHeight: null,
  physicalHeightUnit: null,
}

export function getWarehousePhysicalDetails(
  value: WarehousePhysicalDetailsResponse
): WarehousePhysicalDetails {
  return {
    storageCapacity: value.storageCapacity ?? null,
    storageCapacityUnit: value.storageCapacityUnit ?? null,
    physicalLength: value.physicalLength ?? null,
    physicalLengthUnit: value.physicalLengthUnit ?? null,
    physicalWidth: value.physicalWidth ?? null,
    physicalWidthUnit: value.physicalWidthUnit ?? null,
    physicalHeight: value.physicalHeight ?? null,
    physicalHeightUnit: value.physicalHeightUnit ?? null,
  }
}
