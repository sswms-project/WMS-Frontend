'use client'

import { useMemo, useState } from 'react'
import type { WarehouseStats } from '../../types'
import { WarehouseFilter, ALL_WAREHOUSES_VALUE } from './WarehouseFilter'
import { WarehouseStatsCard } from '../shared/WarehouseStatsCard'

interface WarehouseCapacitySectionProps {
  warehouses: WarehouseStats[]
}

export function WarehouseCapacitySection({ warehouses }: WarehouseCapacitySectionProps) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(ALL_WAREHOUSES_VALUE)

  const filteredWarehouses = useMemo(
    () =>
      selectedWarehouseId === ALL_WAREHOUSES_VALUE
        ? warehouses
        : warehouses.filter((warehouse) => warehouse.id === selectedWarehouseId),
    [warehouses, selectedWarehouseId]
  )

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-foreground text-lg font-semibold">Sức chứa kho</h2>
        <WarehouseFilter
          warehouses={warehouses}
          value={selectedWarehouseId}
          onChange={setSelectedWarehouseId}
        />
      </div>
      <div className="grid gap-4">
        {filteredWarehouses.map((warehouse) => (
          <WarehouseStatsCard key={warehouse.id} warehouse={warehouse} />
        ))}
      </div>
    </>
  )
}
