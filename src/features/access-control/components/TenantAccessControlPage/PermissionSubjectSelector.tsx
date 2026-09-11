'use client'

import { useMemo, useState } from 'react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import type {
  TenantRolePolicy,
  TenantUserPermissionSubject,
} from '../../types/tenant-access-control.types'
import { getTenantRoleContent } from '../../utils/tenant-access-control'

interface PermissionSubjectSelectorProps {
  readonly roles: TenantRolePolicy[]
  readonly roleId: string
  readonly subjects: TenantUserPermissionSubject[]
  readonly selectedSubject?: TenantUserPermissionSubject
  readonly subjectId: string
  readonly searchText: string
  readonly loading: boolean
  readonly disabled?: boolean
  readonly page: number
  readonly pageSize: number
  readonly totalCount: number
  readonly onRoleChange: (roleId: string) => void
  readonly onSubjectChange: (userId: string) => void
  readonly onSearchChange: (value: string) => void
  readonly onPageChange: (page: number) => void
}

export function PermissionSubjectSelector({
  roles,
  roleId,
  subjects,
  selectedSubject,
  subjectId,
  searchText,
  loading,
  disabled,
  page,
  pageSize,
  totalCount,
  onRoleChange,
  onSubjectChange,
  onSearchChange,
  onPageChange,
}: PermissionSubjectSelectorProps) {
  const [rememberedSubject, setRememberedSubject] = useState(selectedSubject)
  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.userId, subject])),
    [subjects]
  )
  const resolvedSubject =
    subjectsById.get(subjectId) ??
    (selectedSubject?.userId === subjectId ? selectedSubject : undefined) ??
    (rememberedSubject?.userId === subjectId ? rememberedSubject : undefined)
  const labels = useMemo(() => {
    const result = new Map(
      subjects.map((subject) => [subject.userId, `${subject.fullName} · ${subject.email}`])
    )
    if (resolvedSubject && !result.has(resolvedSubject.userId)) {
      result.set(resolvedSubject.userId, `${resolvedSubject.fullName} · ${resolvedSubject.email}`)
    }
    return result
  }, [resolvedSubject, subjects])
  const allItems = useMemo(() => Array.from(labels.keys()), [labels])
  const filteredItems = useMemo(() => subjects.map((subject) => subject.userId), [subjects])
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="border-border bg-card shrink-0 rounded-md border p-3 sm:p-4">
      <FieldGroup className="gap-3 md:grid md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="personal-role-select">Vai trò nhân sự</FieldLabel>
          <Select value={roleId} onValueChange={onRoleChange} disabled={disabled}>
            <SelectTrigger id="personal-role-select" className="w-full">
              <SelectValue placeholder="Chọn vai trò…" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" sideOffset={4}>
              <SelectGroup>
                {roles.map((role) => (
                  <SelectItem key={role.roleId} value={role.roleId}>
                    {getTenantRoleContent(role.roleName).label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="permission-subject-search">Nhân sự cần phân quyền</FieldLabel>
          <Combobox
            items={allItems}
            filteredItems={filteredItems}
            value={subjectId || null}
            filter={null}
            itemToStringLabel={(userId: string) => labels.get(userId) ?? userId}
            onValueChange={(nextValue, details) => {
              const subject = nextValue ? subjectsById.get(nextValue) : undefined
              setRememberedSubject(subject)
              onSubjectChange(nextValue ?? '')
              if (details.reason === 'item-press' || details.reason === 'clear-press') {
                onSearchChange('')
              }
            }}
            onInputValueChange={(value, details) => {
              if (details.reason === 'input-change') onSearchChange(value)
            }}
          >
            <ComboboxInput
              id="permission-subject-search"
              name="permission-subject-search"
              className="w-full"
              placeholder="Tìm theo tên hoặc email…"
              autoComplete="off"
              spellCheck={false}
              disabled={disabled || !roleId}
              showClear={Boolean(subjectId)}
            />
            <ComboboxContent sideOffset={4} align="start">
              <ComboboxList>
                <ComboboxGroup>
                  {filteredItems.map((userId) => (
                    <ComboboxItem key={userId} value={userId}>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {subjectsById.get(userId)?.fullName}
                        </span>
                        <span className="text-muted-foreground block truncate">
                          {subjectsById.get(userId)?.email}
                        </span>
                      </span>
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
                <ComboboxEmpty>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner aria-hidden="true" /> Đang tìm nhân sự
                    </span>
                  ) : searchText.trim() ? (
                    'Không tìm thấy nhân sự phù hợp'
                  ) : (
                    'Không có nhân sự phù hợp'
                  )}
                </ComboboxEmpty>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>
      </FieldGroup>

      {totalCount > pageSize && (
        <div className="border-border mt-3 flex items-center justify-between gap-3 border-t pt-3">
          <p className="text-muted-foreground text-xs tabular-nums">
            Trang {page + 1}/{totalPages} · {totalCount} nhân sự
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || page === 0}
              onClick={() => onPageChange(page - 1)}
            >
              Trước
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || page + 1 >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
