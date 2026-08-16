import { create } from 'zustand'

interface WarehouseLayoutEditorState {
  dirtyWarehouseIds: ReadonlySet<string>
  setWarehouseDirty: (warehouseId: string, isDirty: boolean) => void
}

export const useWarehouseLayoutEditorStore = create<WarehouseLayoutEditorState>((set) => ({
  dirtyWarehouseIds: new Set<string>(),
  setWarehouseDirty: (warehouseId, isDirty) =>
    set((state) => {
      const dirtyWarehouseIds = new Set(state.dirtyWarehouseIds)
      if (isDirty) dirtyWarehouseIds.add(warehouseId)
      else dirtyWarehouseIds.delete(warehouseId)
      return { dirtyWarehouseIds }
    }),
}))
