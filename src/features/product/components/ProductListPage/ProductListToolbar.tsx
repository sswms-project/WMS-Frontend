'use client'

import { RefreshCw, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface ProductListToolbarProps {
  readonly searchText: string
  readonly isFetching: boolean
  readonly onSearchChange: (value: string) => void
}

export function ProductListToolbar({
  searchText,
  isFetching,
  onSearchChange,
}: ProductListToolbarProps) {
  return (
    <div className="flex items-center gap-2 border-b px-3 py-2.5 sm:px-4">
      <div className="relative max-w-xs flex-1">
        <Search
          className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Tìm theo tên hoặc SKU..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-8 text-sm"
        />
      </div>
      {isFetching && (
        <RefreshCw className="text-muted-foreground size-4 animate-spin" aria-hidden="true" />
      )}
    </div>
  )
}
